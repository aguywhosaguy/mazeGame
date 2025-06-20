import { Service, OnStart } from "@flamework/core";
import { CharacterAddedSignal } from "server/signals";
import { Players, Workspace } from "@rbxts/services";
import { Events } from "server/network";

@Service({})
export class DefaultCharacterService implements OnStart {
	onStart() {
		CharacterAddedSignal.Connect((character: Model) => this.CharacterAdded(character));
		Events.playSound.connect((_: Player, sound: Sound) => sound.Play());
		Events.stopSound.connect((_: Player, sound: Sound) => sound.Stop());
	}
	CharacterAdded(character: Model) {
		const player = Players.GetPlayerFromCharacter(character);
		const humanoid: Humanoid | undefined = character.FindFirstChildOfClass("Humanoid");
		if (!humanoid || !player) return;
	}
}
