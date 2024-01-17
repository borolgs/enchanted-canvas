import { attach, createEffect, sample } from "effector";
import { Menu } from "obsidian";
import { $canvas, initCanvasMenu, onSelectionMenu } from "~/entites/canvas";
import { Canvas } from "~/shared/types";
import { mergeTextNodes } from "./lib";
import { isCustomNode, isTextNode } from "~/entites/node";

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

export const addMergeMenuItemToCanvasFx = createEffect(() => {
	const menuEl = document.querySelector("div.canvas-menu")!;

	const button = document.createElement("button");
	button.classList.add("clickable-icon");

	button.onclick = (e) => {
		mergeNodesFx();
	};

	// TODO!
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon lucide-combine"><rect width="8" height="8" x="2" y="2" rx="2"/><path d="M14 2c1.1 0 2 .9 2 2v4c0 1.1-.9 2-2 2"/><path d="M20 2c1.1 0 2 .9 2 2v4c0 1.1-.9 2-2 2"/><path d="M10 18H5c-1.7 0-3-1.3-3-3v-1"/><polyline points="7 21 10 18 7 15"/><rect width="8" height="8" x="14" y="14" rx="2"/></svg>`;
	button.innerHTML = svg;

	menuEl.append(button);
});

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
		return filterNodesToMerge(canvas);
	},
	target: addMergeMenuItemFx,
});

sample({
	clock: initCanvasMenu,
	source: { canvas: $canvas },
	filter: ({ canvas }) => {
		return filterNodesToMerge(canvas);
	},
	target: addMergeMenuItemToCanvasFx,
});

mergeNodesFx.fail.watch(({ error }) => {
	console.error(error);
});

function filterNodesToMerge(canvas: Canvas | null) {
	if (!canvas) {
		return false;
	}
	if (canvas.selection?.size < 2) {
		return false;
	}
	for (const node of canvas.selection) {
		if (!isTextNode(node) || isCustomNode(node)) {
			return false;
		}
	}
	return true;
}
