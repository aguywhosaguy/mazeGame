import Signal from "@rbxts/signal";

export const GeneratorSignal = new Signal<(seed: number) => void>();
export const CharacterAddedSignal = new Signal<(character: Model) => void>();
