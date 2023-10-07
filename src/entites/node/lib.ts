import { CanvasNode } from "~/shared/types";

export type CustomNodeShape = "rect" | "circle";

export function isTextNode(node: CanvasNode) {
	return node.getData().type === "text";
}

// Custom node helpers

export function turnIntoCustomNode(
	node: CanvasNode,
	shape: CustomNodeShape = "rect"
) {
	const data = node.getData();
	data.subType = "element";
	data.shape = shape;
	node.setData(data);
}

export function changeCustomNodeShape(
	node: CanvasNode,
	shape: CustomNodeShape
) {
	const data = node.getData();
	data.shape = shape;
	node.setData(data);
}

export function turnIntoTextNode(node: CanvasNode) {
	const data = node.getData();
	data.subType = undefined;
	data.shape = undefined;
	node.setData(data);
}

export function addCustomNodeStyles(node: CanvasNode) {
	const shape = getCustomNodeShape(node);
	if (!shape) return;
	node.nodeEl.classList.add("custom-node");
	node.nodeEl.classList.add(mapShapeToClass(shape));
}

export function removeCustomNodeStyles(node: CanvasNode) {
	node.nodeEl.classList.remove("custom-node");
	const prevShapeClasses = Array.from(node.nodeEl.classList).filter((cls) =>
		cls.startsWith("custom-node-shape-")
	);
	node.nodeEl.classList.remove(...prevShapeClasses);
}

export function updateCustomNodeStyles(node: CanvasNode) {
	const shape = getCustomNodeShape(node);
	if (!shape) return;
	const prevShapeClasses = Array.from(node.nodeEl.classList).filter((cls) =>
		cls.startsWith("custom-node-shape-")
	);
	node.nodeEl.classList.remove(...prevShapeClasses);
	node.nodeEl.addClass(mapShapeToClass(shape));
}

export function isCustomNode(node: CanvasNode) {
	return node.unknownData.subType === "element";
}

export function getCustomNodeShape(node: CanvasNode): CustomNodeShape | null {
	return node.unknownData.shape ?? null;
}

export function mapShapeToClass(shape: CustomNodeShape) {
	switch (shape) {
		case "rect":
			return "custom-node-shape-1";
		case "circle":
			return "custom-node-shape-2";
	}
}
