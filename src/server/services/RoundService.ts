import { Service, OnStart } from "@flamework/core";
import { CollectionService, Players } from "@rbxts/services";
import { Events, Functions } from "server/network";
import { GeneratorSignal } from "server/signals";

export const States = {
	Closed: 0,
	PlayersOnly: 1,
	MonstersOnly: 2,
} as const;

type WallState = typeof States[keyof typeof States];

@Service({})
export class RoundService implements OnStart {
	walls: Array<Part>;

	intermission: boolean = false;
	headStart: boolean = false;
	started: boolean = false;

	intermissionTime: number = 0;
	headStartTime: number = 0;
	roundStartTime: number = 0;

	constructor() {
		this.walls = CollectionService.GetTagged("wall") as Array<Part>;
	}
	onStart() {
		Functions.getWallCollide.setCallback((player: Player) => this.getWalls(player));
		wait(10);
		this.roundStart();
	}
	setWalls(state: WallState) {
		if (state === 0) {
			for (const wall of this.walls) {
				wall.Material = Enum.Material.Concrete;
				wall.Transparency = 0;
				wall.BrickColor = new BrickColor("Medium stone grey");
			}
			Events.setWallCollide.broadcast(true);
		} else if (state === 1) {
			for (const wall of this.walls) {
				wall.Material = Enum.Material.ForceField;
				wall.Transparency = 0.5;
				wall.BrickColor = new BrickColor("Light green (Mint)");
			}
			Events.setWallCollide.except(CollectionService.GetTagged("monster") as Array<Player>, false);
		} else if (state === 2) {
			for (const wall of this.walls) {
				wall.Material = Enum.Material.ForceField;
				wall.Transparency = 0.5;
				wall.BrickColor = new BrickColor("Really red");
			}
			Events.setWallCollide.broadcast(true);
			Events.setWallCollide.except(CollectionService.GetTagged("player") as Array<Player>, false);
		}
	}
	getWalls(player: Player) {
		return (
			(player.HasTag("monster") && this.headStart) ||
			(player.HasTag("player") && !this.headStart) ||
			!this.started ||
			player.HasTag("ghost")
		);
	}
	roundStart() {
		if (this.started) return;
		print("START");
		this.started = true;
		this.headStart = true;
		this.headStartTime = os.time();
		this.setWalls(States.Closed);
		GeneratorSignal.Fire(0);
		const players = Players.GetChildren() as Array<Player>;
		new Random().Shuffle(players);
		players[0].AddTag("scary");
		players[0].RemoveTag("player");
		const humanoid = players[0].Character?.FindFirstChildOfClass("Humanoid");
		if (humanoid) humanoid.Health = 0;
		this.setWalls(States.PlayersOnly);
		wait(5);

		this.setWalls(States.PlayersOnly);
		wait(30);
		this.headStart = false;
		this.roundStartTime = os.time();
		const roundStartTime = this.roundStartTime;

		this.setWalls(States.MonstersOnly);
		wait(60 * 5);
		if (this.started && roundStartTime === this.roundStartTime) {
			this.roundEnd();
		}
	}
	roundEnd() {}
}
