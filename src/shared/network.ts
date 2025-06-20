import { Networking } from "@flamework/networking";

interface ClientToServerEvents {
	triggerChase(player: Player): void;
	setTag(player: Player, tag: string): void;
	playSound(sound: Sound): void;
	stopSound(sound: Sound): void;
}

interface ServerToClientEvents {
	broadcastChase(player: Player, chaser: Player): void;
	setWallCollide(CanCollide: boolean): void;
}

interface ClientToServerFunctions {
	getWallCollide(): boolean;
}

interface ServerToClientFunctions {}

export const GlobalEvents = Networking.createEvent<ClientToServerEvents, ServerToClientEvents>();
export const GlobalFunctions = Networking.createFunction<ClientToServerFunctions, ServerToClientFunctions>();
