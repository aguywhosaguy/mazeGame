import { Service, OnStart } from "@flamework/core";
import { ServerStorage, Workspace } from "@rbxts/services";
import { GeneratorSignal } from "server/signals";

@Service({})
export class GeneratorService implements OnStart {
	onStart() {
		this.generate(0);
		GeneratorSignal.Connect((seed: number) => this.generate(seed));
	}

	generate(seed: number) {
		if (seed === 0) {
			seed = math.random(2_147_483_647);
		}

		print(seed);
		const random = new Random(seed);
		const rooms = ServerStorage.Rooms.GetChildren();

		Workspace.Rooms.GetChildren().forEach((room: Instance) => {
			room.Destroy();
		});

		Workspace.Anchors.GetChildren().forEach((anchor: Instance) => {
			random.Shuffle(rooms);
			const room = rooms[0].Clone() as Model;
			room.PivotTo((anchor as Part).CFrame);
			room.Parent = Workspace.Rooms;
		});
	}
}
