export const Tags = {
	Player: "player",
	Monster: "monster",
	Monsters: {
		Stalker: "stalker",
	},
	Ghost: "ghost",
	Morphed: "morphed",

	Wall: "wall",
} as const;

export type Tag = typeof Tags[keyof typeof Tags];
export type MonsterTag = typeof Tags.Monsters[keyof typeof Tags.Monsters];

export const monsters = ["stalker"];
