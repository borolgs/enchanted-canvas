import { Canvas, CanvasBBox } from "~/shared/types";

export function mergeTextNodes({ canvas }: { canvas: Canvas }) {
	const bbox: CanvasBBox = canvas.menu.selection.bbox;

	const x = bbox.minX;
	const y = bbox.minY;

	const selectedNodes = Array.from(canvas.selection);

	let topNodeIdx = -1;
	let minY = Infinity;
	let maxWidth = -Infinity;

	for (let i = 0; i < selectedNodes.length; i++) {
		const node = selectedNodes[i];
		if (node.y < minY) {
			minY = node.y;
			topNodeIdx = i;
		}
		if (node.width > maxWidth) {
			maxWidth = node.width;
		}
	}

	const topNode = selectedNodes.splice(topNodeIdx, 1)[0];

	let resultHeight = topNode.height;
	let resutText: string[] = [topNode.text];

	for (const node of selectedNodes) {
		resutText.push(node.text);
		resultHeight += node.height;

		// TODO: handle duplicates

		const fromEdges = canvas.edgeFrom.get(node);
		if (fromEdges) {
			for (const edge of fromEdges) {
				edge.update({ ...edge.from, node: topNode }, edge.to);
			}
		}

		const toEdges = canvas.edgeTo.get(node);
		if (toEdges) {
			for (const edge of toEdges) {
				edge.update(edge.from, { ...edge.to, node: topNode });
			}
		}

		canvas.removeNode(node);
	}

	topNode.moveAndResize({
		x,
		y,
		width: maxWidth,
		height: resultHeight,
	});
	topNode.setText(resutText.join("\n"));

	canvas.requestSave();
}
