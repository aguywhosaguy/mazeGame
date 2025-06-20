import { Service, OnStart } from "@flamework/core";
import { Players } from "@rbxts/services";
import { GeneratorSignal } from "server/signals";

@Service({})
export class TesterChatService implements OnStart {
	onStart() {
		Players.PlayerAdded.Connect((player: Player) => {
			player.Chatted.Connect((message: string) => {
				const splitMsg = message.split(":");
				if (splitMsg[0] === "/e generate") {
					let seed = tonumber(splitMsg[1]);
					if (!seed) {
						seed = 0;
					}
					GeneratorSignal.Fire(seed);
				}
			});
		});
	}
}
