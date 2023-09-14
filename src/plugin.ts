import { Plugin } from "obsidian";

export class MyPlugin extends Plugin {
	async onload() {
		console.log(`${MyPlugin.name} loaded`);
	}

	async onunload() {
		console.log(`${MyPlugin.name} unloaded`);
	}
}
