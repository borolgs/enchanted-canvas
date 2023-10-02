import { CanvasNode, Canvas } from "src/shared/types";

export function splitNodeByLines({
	node,
	canvas,
}: {
	node: CanvasNode;
	canvas: Canvas;
}) {
	const lines: string[] = node.getData().text.split("\n");
	if (lines.length < 2) {
		return;
	}
	node.moveAndResize({
		x: node.x,
		y: node.y,
		width: node.width,
		height: 50,
	});
	node.setText(lines.shift());

	let y = node.y + 60;
	for (const line of lines) {
		const lineNode: CanvasNode = canvas.createTextNode({
			pos: { x: node.x, y },
			text: line,
			size: { width: node.width, height: 50 },
		});

		lineNode.setColor(node.color);
		y += 60;
	}

	canvas!.requestSave();
}
