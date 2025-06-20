import { OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";
import { PlayerComponent } from "./PlayerComponent";

interface Attributes {}

const GHOST_WALKSPEED = 60;

@Component({
	tag: "ghost",
})
export class GhostComponent extends PlayerComponent implements OnStart {
	constructor() {
		super();
	}
	onStart() {
		this.connectCanCollide();

		this.instance.Humanoid.WalkSpeed = GHOST_WALKSPEED;
		for (const child of this.instance.GetChildren()) {
			if (child.ClassName === "Part" && child.Name !== "HumanoidRootPart") {
				(child as Part).Transparency = 0.8;
			}
		}
	}
}
