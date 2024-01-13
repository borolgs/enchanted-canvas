import { CanvasNode } from "~/shared/types";

export const SplitBy = [
	"line",
	"header",
	"h1",
	"h2",
	"h3",
	"h4",
	"h5",
	"h6",
] as const;
export type SplitBy = (typeof SplitBy)[number];
export type SplitOptions = { by: SplitBy };

export function splitNodeByLines({
	node,
	options,
}: {
	node: CanvasNode;
	options?: SplitOptions;
}) {
	options ??= { by: "line" };
	const canvas = node.canvas;
	const text: string = node.getData().text;
	let parts: string[] = [];

	if (options.by === "line") {
		parts = text.split("\n");
	} else if (options.by === "header") {
		parts = text.split(/(?=^#{1,6} .+$)/gm).filter(Boolean);
	} else if (options.by.startsWith("h")) {
		parts = text
			.split(new RegExp(`(?=^#{1,${Number(options.by[1])}} .+$)`, "gm"))
			.filter(Boolean);
	}

	if (parts.length < 2) {
		return;
	}

	let height = 50;
	if (options.by !== "line") {
		height = 250;
	}

	node.moveAndResize({
		x: node.x,
		y: node.y,
		width: node.width,
		height,
	});
	node.setText(parts.shift());

	let y = node.y + height + 10;
	for (const line of parts) {
		const lineNode: CanvasNode = canvas.createTextNode({
			pos: { x: node.x, y },
			text: line,
			size: { width: node.width, height },
			focus: false,
		});
		lineNode.setColor(node.color);
		y += height + 10;
	}

	canvas.requestSave();
}
