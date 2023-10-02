import { FileView, Menu, Plugin, Point } from "obsidian";
import { pluginLoaded, pluginUnloaded } from "./model";
import {
	Canvas,
	CanvasEdge,
	CanvasNode,
	Size,
	WorkspaceWithCanvas,
} from "../shared/types";
import {
	canvasChanged,
	canvasLoaded,
	extendCanvas,
	onConnectionMenu,
	onCreationMenu,
	onEdgeMenu,
	onNodeInitialized,
	onNodeMenu,
	onSelectionMenu,
} from "src/entites/canvas";
import { hotkeys } from "src/shared/keyboard";

export class EnchantedCanvasPlugin extends Plugin {
	async onload() {
		console.log(`${EnchantedCanvasPlugin.name} loaded`);

		const interval = setInterval(() => {
			const canvasLeaf = this.app.workspace.getLeavesOfType("canvas")[0];
			if (canvasLeaf) {
				clearInterval(interval);

				const canvasView = canvasLeaf.view as FileView & {
					canvas: Canvas;
				};

				const canvas = canvasView.canvas;
				extendCanvas({ canvas, plugin: this });

				canvasLoaded({ canvas, file: canvasView.file! });
			}
		}, 1000);

		this.registerEvent(
			this.app.workspace.on("active-leaf-change", (leaf) => {
				if (leaf?.view.getViewType() === "canvas") {
					const canvasView = leaf.view as FileView;
					canvasChanged({ file: canvasView.file! });
				}
			})
		);

		const workspace = this.app.workspace as unknown as WorkspaceWithCanvas;

		this.registerEvent(
			workspace.on(
				"canvas:creation-menu",
				(menu: Menu, canvas: Canvas, pos: Point, size?: Size) => {
					onCreationMenu({ menu, canvas, pos, size });
				}
			)
		);

		this.registerEvent(
			workspace.on("canvas:node:initialize", (node: CanvasNode) => {
				onNodeInitialized({ node });
			})
		);

		this.registerEvent(
			workspace.on("canvas:selection-menu", (menu: Menu, canvas: any) => {
				onSelectionMenu({ menu, canvas });
				onCreationMenu({} as any);
			})
		);
		this.registerEvent(
			workspace.on("canvas:node-menu", (menu: Menu, node: any) => {
				onNodeMenu({ menu, node });
			})
		);
		this.registerEvent(
			workspace.on("canvas:edge-menu", (menu: Menu, edge: any) => {
				onEdgeMenu({ menu, edge });
			})
		);

		this.registerEvent(
			workspace.on(
				"canvas:node-connection-drop-menu",
				(menu: Menu, from: CanvasNode, edge: CanvasEdge) => {
					onConnectionMenu({ menu, from, edge });
				}
			)
		);

		hotkeys.register();

		pluginLoaded({ plugin: this });
	}

	async onunload() {
		console.log(`${EnchantedCanvasPlugin.name} unloaded`);
		hotkeys.unregister();
		pluginUnloaded();
	}
}
