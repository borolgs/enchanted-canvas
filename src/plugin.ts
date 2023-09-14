import { Plugin } from "obsidian";

export class EnchantedCanvasPlugin extends Plugin {
	async onload() {
		console.log(`${EnchantedCanvasPlugin.name} loaded`);
	}

	async onunload() {
		console.log(`${EnchantedCanvasPlugin.name} unloaded`);
	}
}
