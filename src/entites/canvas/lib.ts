import { Plugin } from "obsidian";
import { Canvas } from "~/shared/types";

export function extendCanvas({
	canvas,
	plugin,
}: {
	canvas: Canvas;
	plugin: Plugin;
}) {
	if (canvas.__extended) {
		return canvas;
	}
	canvas.__extended = true;

	const canvasPrototype = Object.getPrototypeOf(canvas);

	let showCreationMenuProxy: any = null;

	const canvasPrototypeProxy = new Proxy(canvasPrototype, {
		get(target, prop, receiver) {
			if (prop === "showCreationMenu") {
				showCreationMenuProxy ??= new Proxy(target[prop], {
					apply: (target, thisArg, argumentsList) => {
						plugin.app.workspace.trigger(
							"canvas:creation-menu",
							argumentsList[0],
							canvas,
							argumentsList[1],
							argumentsList[2]
						);

						return Reflect.apply(target, thisArg, argumentsList);
					},
				});

				return showCreationMenuProxy;
			}
			return Reflect.get(target, prop, receiver);
		},
	});

	Object.setPrototypeOf(canvas, canvasPrototypeProxy);

	const nodePrototype = getNodePrototype(canvas);

	if (!nodePrototype.__extended) {
		nodePrototype.__extended = true;

		nodePrototype.initialize = new Proxy(nodePrototype.initialize, {
			apply: (target, thisArg, argumentsList) => {
				plugin.app.workspace.trigger("canvas:node:initialize", thisArg);
				return Reflect.apply(target, thisArg, argumentsList);
			},
		});
	}
}

export function getNodePrototype(canvas: Canvas) {
	let isTempNode = false;
	let node = canvas.nodes.values().next().value;
	if (!node) {
		isTempNode = true;
		canvas.createTextNode({ pos: { x: 0, y: 0 } });
		node = canvas.nodes.values().next().value;
	}
	const nodePrototype = Object.getPrototypeOf(node);

	if (isTempNode) {
		canvas.removeNode(node);
		canvas.requestSave();
	}

	return nodePrototype;
}
