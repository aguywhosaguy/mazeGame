import { Service, OnStart } from "@flamework/core";
import { Events } from "server/network";

@Service({})
export class ChaseService implements OnStart {
	onStart() {
		Events.triggerChase.connect((chaser: Player, player: Player) => {
			Events.broadcastChase.broadcast(player, chaser);
		});
	}
}
