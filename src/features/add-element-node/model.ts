import { attach, createEffect, sample } from "effector";
import { Menu } from "obsidian";
import { debug } from "patronum";
import {
	$canvas,
	canvasLoaded,
	onCreationMenu,
	onNodeInitialized,
	onNodeMenu,
} from "src/entites/canvas";
import { CanvasNode } from "src/shared/types";
export const addElementCreationMenuItemFx = createEffect(
	({ menu }: { menu: Menu }) => {
		menu.addItem((item) =>
			item
				.setTitle("Add element")
				.setSection("create")
				.onClick(() => {
					addElementNodeFx();
				})
		);
	}
);

export const addTurnIntoElementMenuItemFx = createEffect(
	({ node, menu }: { node: CanvasNode; menu: Menu }) => {
		const data = node.getData();

		menu.addItem((item) => {
			item.setTitle("Turn into shape").setSection("extra");
			const subMenu: Menu = (item as any).setSubmenu();
			subMenu
				.addItem((item) => {
					item.setTitle("Rect").onClick(() => {
						data.subType = "element";
						data.shape = "rect";
						node.setData(data);
						node.canvas.requestSave();

						node.nodeEl.classList.add("custom-node");
						node.nodeEl.addClass("custom-node-shape-1");
					});
					item.setChecked(node.unknownData.shape === "rect");
				})
				.addItem((item) => {
					item.setTitle("Circle").onClick(() => {
						data.subType = "element";
						data.shape = "circle";
						node.setData(data);
						node.canvas.requestSave();

						node.nodeEl.classList.add("custom-node");
						node.nodeEl.addClass("custom-node-shape-2");
					});
					item.setChecked(node.unknownData.shape === "circle");
				});
		});
	}
);

export const addSelectElementTypeMenuItemFx = createEffect(
	({ node, menu }: { node: CanvasNode; menu: Menu }) => {
		const data = node.getData();

		menu.addSeparator();
		menu.addItem((item) => {
			item.setTitle("Shape").setSection("extra");
			const subMenu: Menu = (item as any).setSubmenu();
			subMenu
				.addItem((item) => {
					item.setTitle("Rect").onClick(() => {
						data.shape = "rect";
						node.setData(data);
						node.canvas.requestSave();

						const prevShapeClasses = Array.from(
							node.nodeEl.classList
						).filter((cls) => cls.startsWith("custom-node-shape-"));
						node.nodeEl.classList.remove(...prevShapeClasses);
						node.nodeEl.addClass("custom-node-shape-1");
					});
					item.setChecked(node.unknownData.shape === "rect");
				})
				.addItem((item) => {
					item.setTitle("Circle").onClick(() => {
						data.shape = "circle";
						node.setData(data);
						node.canvas.requestSave();

						const prevShapeClasses = Array.from(
							node.nodeEl.classList
						).filter((cls) => cls.startsWith("custom-node-shape-"));
						node.nodeEl.classList.remove(...prevShapeClasses);
						node.nodeEl.addClass("custom-node-shape-2");
					});
					item.setChecked(node.unknownData.shape === "circle");
				})
				.addItem((item) => {
					item.setTitle("Card").onClick(() => {
						data.subType = undefined;
						data.shape = undefined;
						node.setData(data);
						node.canvas.requestSave();

						node.nodeEl.classList.remove("custom-node");
						const prevShapeClasses = Array.from(
							node.nodeEl.classList
						).filter((cls) => cls.startsWith("custom-node-shape-"));
						node.nodeEl.classList.remove(...prevShapeClasses);
					});
				});
		});
	}
);

export const addElementNodeFx = attach({
	source: { canvas: $canvas },
	effect: ({ canvas }) => {
		canvas = canvas!;

		const node = canvas.createTextNode({
			pos: canvas.pointer,
			text: "",
			size: { width: 200, height: 200 },
		});
		const data = node.getData();
		data.subType = "element";
		data.shape = "rect";
		node.setData(data);
		canvas.requestSave();
		return { node };
	},
});

export const setupCustomNodesFx = createEffect(
	({ nodes }: { nodes: CanvasNode[] }) => {
		for (const node of nodes) {
			node.nodeEl.classList.add("custom-node");
			if (node.unknownData.shape === "rect") {
				node.nodeEl.classList.add("custom-node-shape-1");
			} else if (node.unknownData.shape === "circle") {
				node.nodeEl.classList.add("custom-node-shape-2");
			}
		}
	}
);

sample({
	clock: onCreationMenu,
	target: addElementCreationMenuItemFx,
});
sample({
	clock: onNodeMenu,
	filter: ({ node }) => node.unknownData.subType === "element",
	target: addSelectElementTypeMenuItemFx,
});
sample({
	clock: onNodeMenu,
	filter: ({ node }) => node.unknownData.subType !== "element",
	target: addTurnIntoElementMenuItemFx,
});

sample({
	clock: [onNodeInitialized, addElementNodeFx.doneData],
	filter: ({ node }) => {
		return node.unknownData.subType === "element";
	},
	fn: ({ node }) => ({ nodes: [node] }),
	target: setupCustomNodesFx,
});
sample({
	clock: canvasLoaded,
	fn: ({ canvas }) => ({
		nodes: Array.from(canvas.nodes.values()).filter((node) => {
			return node.unknownData.subType === "element";
		}),
	}),
	target: setupCustomNodesFx,
});
