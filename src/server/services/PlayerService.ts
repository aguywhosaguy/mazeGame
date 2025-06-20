import { Service, OnStart } from "@flamework/core";
import { CollectionService, Players, ServerStorage, StarterPlayer, Workspace } from "@rbxts/services";
import { Events } from "server/network";
import { CharacterAddedSignal } from "server/signals";

@Service({})
export class PlayerService implements OnStart {
	onStart() {
		Players.PlayerAdded.Connect((player: Player) => this.PlayerAdded(player));
		Events.setTag.connect((_: Player, player: Player, tag: string) => {
			for (const tag of player.GetTags()) {
				player.RemoveTag(tag);
			}
			player.AddTag(tag);
		});
	}
	PlayerAdded(player: Player) {
		player.AddTag("player");
		const walls: Array<Part> = CollectionService.GetTagged("wall") as Array<Part>;
		if (walls[0].BrickColor === new BrickColor("Really red")) {
			player.RemoveTag("player");
			player.AddTag("ghost");
		}
		player.CharacterAdded.Connect((character: Model) => {
			for (const tag of player.GetTags()) {
				character.AddTag(tag);
			}
			if (!character.HasTag("player")) player.AddTag("monster");
			if (character.HasTag("scary") && !character.HasTag("morphed"))
				this.morph(player, ServerStorage.Morphs.Monster);
			CharacterAddedSignal.Fire(character);
		});
	}
	morph(player: Player, morph: Model) {
		const character = player.Character;
		if (!character) return;
		const newMorph = morph.Clone();
		for (const tag of character.GetTags()) {
			newMorph.AddTag(tag);
		}
		newMorph.AddTag("morphed");
		newMorph.Name = character.Name;
		player.Character = newMorph;
		newMorph.Parent = Workspace;
		for (const cscript of StarterPlayer.StarterCharacterScripts.GetChildren()) {
			const cloned = cscript.Clone();
			if (cloned.Name === "walk") return;
			cloned.Parent = newMorph;
		}
		newMorph.WaitForChild("Flashlight").Destroy();
		const anchors = Workspace.Anchors.GetChildren() as Array<Part>;
		new Random().Shuffle(anchors);
		//newMorph.PivotTo(anchors[0].CFrame);
		newMorph.PivotTo(Workspace.FindFirstChildOfClass("SpawnLocation")?.CFrame || new CFrame());
		character.Destroy();
	}
}
