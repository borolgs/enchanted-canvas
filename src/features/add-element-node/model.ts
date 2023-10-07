import { attach, createEffect, sample } from "effector";
import { Menu } from "obsidian";
import {
	$canvas,
	canvasLoaded,
	onCreationMenu,
	onNodeInitialized,
	onNodeMenu,
} from "~/entites/canvas";
import {
	addCustomNodeStyles,
	changeCustomNodeShape,
	getCustomNodeShape,
	isCustomNode,
	removeCustomNodeStyles,
	turnIntoCustomNode,
	turnIntoTextNode,
	updateCustomNodeStyles,
} from "~/entites/node";
import { CanvasNode } from "~/shared/types";
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
		menu.addItem((item) => {
			item.setTitle("Turn into shape").setSection("extra");
			const subMenu: Menu = (item as any).setSubmenu();
			subMenu
				.addItem((item) => {
					item.setTitle("Rect").onClick(() => {
						turnIntoCustomNode(node, "rect");
						node.canvas.requestSave();
						addCustomNodeStyles(node);
					});
					item.setChecked(getCustomNodeShape(node) === "rect");
				})
				.addItem((item) => {
					item.setTitle("Circle").onClick(() => {
						turnIntoCustomNode(node, "circle");
						node.canvas.requestSave();
						addCustomNodeStyles(node);
					});
					item.setChecked(getCustomNodeShape(node) === "circle");
				});
		});
	}
);

export const addSelectElementTypeMenuItemFx = createEffect(
	({ node, menu }: { node: CanvasNode; menu: Menu }) => {
		menu.addSeparator();
		menu.addItem((item) => {
			item.setTitle("Shape").setSection("extra");
			const subMenu: Menu = (item as any).setSubmenu();
			subMenu
				.addItem((item) => {
					item.setTitle("Rect").onClick(() => {
						changeCustomNodeShape(node, "rect");
						node.canvas.requestSave();
						updateCustomNodeStyles(node);
					});
					item.setChecked(getCustomNodeShape(node) === "rect");
				})
				.addItem((item) => {
					item.setTitle("Circle").onClick(() => {
						changeCustomNodeShape(node, "circle");
						node.canvas.requestSave();
						updateCustomNodeStyles(node);
					});
					item.setChecked(getCustomNodeShape(node) === "circle");
				})
				.addItem((item) => {
					item.setTitle("Card").onClick(() => {
						turnIntoTextNode(node);
						node.canvas.requestSave();
						removeCustomNodeStyles(node);
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
		turnIntoCustomNode(node);
		canvas.requestSave();
		return { node };
	},
});

export const setupCustomNodesFx = createEffect(
	({ nodes }: { nodes: CanvasNode[] }) => {
		for (const node of nodes) {
			addCustomNodeStyles(node);
		}
	}
);

sample({
	clock: onCreationMenu,
	target: addElementCreationMenuItemFx,
});
sample({
	clock: onNodeMenu,
	filter: ({ node }) => isCustomNode(node),
	target: addSelectElementTypeMenuItemFx,
});
sample({
	clock: onNodeMenu,
	filter: ({ node }) => !isCustomNode(node),
	target: addTurnIntoElementMenuItemFx,
});

sample({
	clock: [onNodeInitialized, addElementNodeFx.doneData],
	filter: ({ node }) => {
		return isCustomNode(node);
	},
	fn: ({ node }) => ({ nodes: [node] }),
	target: setupCustomNodesFx,
});
sample({
	clock: canvasLoaded,
	fn: ({ canvas }) => ({
		nodes: Array.from(canvas.nodes.values()).filter(isCustomNode),
	}),
	target: setupCustomNodesFx,
});

sample({
	clock: [addElementNodeFx.fail],
	fn: ({ error }) => {
		console.error(error);
	},
});
