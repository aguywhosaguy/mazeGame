import { OnStart } from "@flamework/core";
import { Component } from "@flamework/components";
import { CollectionService, Players, TweenService, Workspace } from "@rbxts/services";
import { Actions } from "@rbxts/gamejoy";
import { PlayerComponent } from "./PlayerComponent";
import { Events, Functions } from "client/network";
import { ResetFOVSignal } from "client/signals";

const { Action } = Actions;

const FLASH_LENGTH = 5;
const FLASH_FREQUENCY = 10;

const LIGHT_RANGE = 18;
const WALK_SPEED = 38;

const CUTSCENE_LENGTH = 3;
const CHASE_LENGTH = 12;
const CHASE_DISTANCE = 20;
const CHASE_SPEED = 60;

const CHASE_COOLDOWN = 10;
const E_COOLDOWN = 1;

@Component({
	tag: "scary",
})
export class ScaryComponent extends PlayerComponent implements OnStart {
	chased: Player | undefined;
	chasing: boolean = false;
	cooldownE: number = os.time();
	cooldownChase: number = os.time();
	chaseNum: number = 0;
	constructor() {
		super();
	}
	onStart() {
		this.connectCanCollide();

		this.player
			?.WaitForChild("Backpack")
			.GetChildren()
			.forEach((tool: Instance) => tool.Destroy());
		const light = new Instance("PointLight");
		light.Range = LIGHT_RANGE;
		light.Color = new Color3(255, 0, 0);
		light.Parent = this.instance.Torso;
		this.instance.Humanoid.WalkSpeed = WALK_SPEED;

		this.instance.Torso.Touched.Connect((part: BasePart) => this.onTouch(part));
		Events.broadcastChase.connect((player: Player, chaser: Player) => {
			if (chaser !== this.player) return;
			if (this.localCheck()) this.playSound("Siren", true);
			wait(CUTSCENE_LENGTH);
			this.chased = player;
			this.chasing = true;
			const currentChaseNum = this.chaseNum + 1;
			this.chaseNum += 1;
			wait(CHASE_LENGTH);
			if (this.chasing && this.chaseNum === currentChaseNum) this.stopChase(false);
		});

		if (Players.LocalPlayer !== this.player) return;

		const epress = new Action("E");
		this.context.Bind(epress, () => {
			if (os.time() - this.cooldownE >= E_COOLDOWN) {
				this.cooldownE = os.time();
				this.attemptChase();
			}
		});
		for (;;) {
			wait(FLASH_FREQUENCY);
			this.flash();
		}
	}

	onTouch(part: BasePart) {
		if (!this.chasing || !this.chased) return;
		const character = part.FindFirstAncestorOfClass("Model");
		if (!character || character.Name !== this.chased?.Character?.Name || !character.HasTag("player")) return;
		const humanoid = character.FindFirstChildOfClass("Humanoid");
		if (!humanoid) return;
		Events.setTag.fire(this.chased, "scary");

		humanoid.Health = 0;
		if (this.localCheck()) this.playSound("Jumpscare", true);
		this.stopChase();
	}

	flash() {
		const highlights = new Array<Highlight>();
		for (const character of CollectionService.GetTagged("player")) {
			if (character.ClassName !== "Model") continue;

			const torso = character.WaitForChild("Torso") as Part;

			if (!torso || torso.FindFirstChildOfClass("Highlight")) continue;

			const highlight = new Instance("Highlight", Workspace);
			highlight.FillColor = new Color3(255, 0, 0);
			highlight.Adornee = torso;
			highlight.OutlineTransparency = 1;
			highlight.FillTransparency = 0;
			highlights.push(highlight);

			TweenService.Create(highlight, new TweenInfo(FLASH_LENGTH, Enum.EasingStyle.Sine), {
				FillTransparency: 1,
			}).Play();
		}
		this.playSound("Ping");
		wait(FLASH_LENGTH);
		highlights.forEach((highlight: Highlight) => highlight.Destroy());
	}

	attemptChase() {
		if (this.chasing || os.time() - this.cooldownChase < CHASE_COOLDOWN) return;
		const camera = Workspace.CurrentCamera;
		const ray = Workspace.Raycast(
			this.instance.HumanoidRootPart.Position,
			camera?.CFrame.LookVector.mul(CHASE_DISTANCE) || this.instance.Torso.CFrame.LookVector.mul(CHASE_DISTANCE),
		);

		if (!ray) return;

		const character = ray.Instance.FindFirstAncestorOfClass("Model");
		const player = Players.GetPlayerFromCharacter(character);

		if (!character || !character.FindFirstChildOfClass("Humanoid") || !character.HasTag("player") || !player)
			return;

		Events.triggerChase.fire(player);
		this.cooldownChase = os.time();

		this.instance.Humanoid.WalkSpeed = 0;
		this.changeFOV(100, CUTSCENE_LENGTH);
		wait(CUTSCENE_LENGTH);
		this.instance.Humanoid.WalkSpeed = CHASE_SPEED;
		const torso: Part = character.WaitForChild("Torso") as Part;
		if (torso) {
			const highlight = new Instance("Highlight");
			highlight.Parent = torso;
			highlight.Adornee = torso;
		}
	}

	stopChase(dead: boolean = true) {
		this.instance.Humanoid.WalkSpeed = WALK_SPEED;
		this.chasing = false;
		this.chased?.Character?.FindFirstChildOfClass("Highlight")?.Destroy();
		this.stopSound("Siren");
		if (!dead && this.chased) ResetFOVSignal.Fire(this.chased);
		this.changeFOV(70, 1);
	}
}
