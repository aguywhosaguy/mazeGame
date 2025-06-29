import { OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";
import { CollectionService, Players, TweenService, Workspace } from "@rbxts/services";
import { Context } from "@rbxts/gamejoy";
import { ContextOptions } from "@rbxts/gamejoy/out/Definitions/Types";
import { Events, Functions } from "client/network";
import { ResetFOVSignal } from "client/signals";
import { Tags } from "shared/tags";

interface Attributes {}

interface Char extends Model {
	Humanoid: Humanoid;
	HumanoidRootPart: Part;
	Torso: Part;
}

@Component({
	tag: "player",
})
export class PlayerComponent extends BaseComponent<Attributes, Char> implements OnStart {
	player: Player | undefined;
	context: Context<ContextOptions>;
	constructor() {
		super();
		this.player = Players.GetPlayerFromCharacter(this.instance);
		this.context = new Context({
			OnBefore: () => {
				return this.localCheck();
			},
		});
	}

	onStart() {
		if (!this.player) return;
		this.changeFOV(70, 0);
		this.connectCanCollide();
		Events.broadcastChase.connect((player: Player) => {
			if (Players.LocalPlayer !== player) return;
			this.changeFOV(120, 1);
		});
		ResetFOVSignal.Connect((player: Player) => {
			if (Players.LocalPlayer !== player) return;
			this.changeFOV(70, 1);
		});
	}

	localCheck(): boolean {
		return this.player === Players.LocalPlayer;
	}

	changeFOV(fov: number, time: number) {
		if (!this.localCheck()) return;
		const camera = Workspace.CurrentCamera;
		print(camera?.FieldOfView);
		if (camera) {
			TweenService.Create(camera, new TweenInfo(time, Enum.EasingStyle.Sine), { FieldOfView: fov }).Play();
		}
	}

	playSound(name: string, server: boolean = false) {
		const ping: Sound | undefined = this.instance.Torso.WaitForChild(name) as Sound;
		if (!ping) return;

		if (server) {
			Events.playSound.fire(ping);
		} else {
			ping.Play();
		}
	}

	stopSound(name: string, server: boolean = false) {
		const ping: Sound | undefined = this.instance.Torso.WaitForChild(name) as Sound;
		if (!ping) return;

		if (server) {
			Events.stopSound.fire(ping);
		} else {
			ping.Stop();
		}
	}

	connectCanCollide() {
		Functions.getWallCollide.invoke().then((cc: boolean) => this.canCollide(cc));
		Events.setWallCollide.connect((cc: boolean) => {
			this.canCollide(cc);
		});
	}

	canCollide(cc: boolean) {
		if (!this.localCheck()) return;
		for (const wall of CollectionService.GetTagged(Tags.Wall) as Array<Part>) {
			wall.CanCollide = cc;
		}
	}
}
