import { attach, createEffect, sample } from "effector";
import { Menu } from "obsidian";
import { $canvas, onSelectionMenu } from "src/entites/canvas";
import { Canvas, CanvasNode } from "src/shared/types";
import { mergeTextNodes } from "./lib";

export const addMergeMenuItemFx = createEffect(
	({ menu }: { menu: Menu; canvas: Canvas }) => {
		menu.addItem((item) =>
			item
				.setTitle("Merge")
				.setSection("extra")
				.onClick(() => {
					mergeNodesFx();
				})
		);
	}
);

export const mergeNodesFx = attach({
	source: { canvas: $canvas },
	effect: ({ canvas }) => {
		if (!canvas) return;
		mergeTextNodes({ canvas });
	},
});

sample({
	clock: onSelectionMenu,
	filter: ({ canvas }) => {
		const selected: Set<CanvasNode> = canvas.selection;
		for (const node of selected) {
			if (node.getData().type !== "text") {
				return false;
			}
		}
		return true;
	},
	target: addMergeMenuItemFx,
});
