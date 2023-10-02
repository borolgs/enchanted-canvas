import {
	attach,
	createEffect,
	createEvent,
	createStore,
	sample,
} from "effector";
import { Menu } from "obsidian";
import { CanvasNode, Canvas } from "src/shared/types";
import { $canvas, onNodeMenu, onSelectionMenu } from "src/entites/canvas";

const $color = createStore<string | null>(null);
const copyStyle = createEvent<{ color: string }>();

export const addCopyStyleMenuItemFx = createEffect(
	({ node, menu }: { node: CanvasNode; menu: Menu }) => {
		menu.addSeparator();
		menu.addItem((item) =>
			item
				.setTitle("Copy style")
				.setSection("extra")
				.onClick(() => {
					copyStyle({ color: node.color });
				})
		);
	}
);

export const addPasteStyleMenuItemFx = createEffect(
	({ menu }: { menu: Menu }) => {
		menu.addItem((item) =>
			item
				.setTitle("Paste style")
				.setSection("extra")
				.onClick(() => {
					pasteStyleFx();
				})
		);
	}
);

export const pasteStyleFx = attach({
	source: { canvas: $canvas, color: $color },
	effect: ({ canvas, color }) => {
		if (!canvas) return;

		for (const selectedNodes of canvas.selection) {
			selectedNodes.setColor(color ?? "");
		}

		canvas.requestSave();
	},
});

sample({
	clock: copyStyle,
	fn: ({ color }) => color,
	target: $color,
});
sample({
	clock: onNodeMenu,
	target: addCopyStyleMenuItemFx,
});
sample({
	clock: [onSelectionMenu, onNodeMenu],
	source: $color,
	filter: (color) => color !== null,
	fn: (_, args) => args,
	target: addPasteStyleMenuItemFx,
});
