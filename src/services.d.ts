interface Workspace extends Instance {
	Anchors: Folder & {
		Anchor: Part;
	};
	Rooms: Folder;
}

interface ServerStorage extends Instance {
	Rooms: Folder & {
		Room: Model;
	};
	Morphs: Model & {
		Monster: Model & {
			Audio: Folder & {
				Jumpscare: Sound;
				Ping: Sound;
			};
		};
	};
}

interface StarterPlayer extends Instance {
	StarterPlayerScripts: StarterPlayerScripts;
	StarterCharacterScripts: StarterCharacterScripts;
}

interface Character extends Model {
	Humanoid: Humanoid;
	Torso: Part;
}
