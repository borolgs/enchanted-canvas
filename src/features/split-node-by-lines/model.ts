import { attach, createEffect, sample } from "effector";
import { $canvas, onNodeMenu } from "~/entites/canvas";
import { splitNodeByLines } from "./lib";
import { Menu } from "obsidian";
import { CanvasNode } from "~/shared/types";

export const addSplitMenuFx = createEffect(
	function addSplitNodeByLinesMenuItem({
		node,
		menu,
	}: {
		node: CanvasNode;
		menu: Menu;
	}) {
		menu.addSeparator();
		menu.addItem((item) =>
			item
				.setTitle("Split by lines")
				.setSection("extra")
				.onClick(() => {
					splitNodeByLinesFx({ node });
				})
		);
	}
);
export const splitNodeByLinesFx = attach({
	source: $canvas,
	mapParams: ({ node }: any, canvas: any) => ({ node, canvas }),
	effect: createEffect(splitNodeByLines),
});

sample({
	clock: onNodeMenu,
	filter: ({ node }) => node.getData().type === "text",
	target: addSplitMenuFx,
});
