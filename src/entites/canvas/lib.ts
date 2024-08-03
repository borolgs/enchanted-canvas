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
	let zoomBreakpointProxy: any = null;

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
			if (prop === "zoomBreakpoint") {
            	return zoomBreakpointProxy ??= target[prop];
            }
			return Reflect.get(target, prop, receiver);
		},
		set(target, prop, value, receiver) {
			if (prop === "zoomBreakpoint") {
				zoomBreakpointProxy = value;
				return true;
			}
			return Reflect.set(target, prop, value, receiver);
		},
	});

	Object.setPrototypeOf(canvas, canvasPrototypeProxy);

	const nodeInteractionLayerPrototype = Object.getPrototypeOf(
		canvas.nodeInteractionLayer
	);

	if (!nodeInteractionLayerPrototype.__extended) {
		nodeInteractionLayerPrototype.__extended = true;

		nodeInteractionLayerPrototype.render = new Proxy(
			nodeInteractionLayerPrototype.render,
			{
				apply: (target, thisArg, argumentsList) => {
					plugin.app.workspace.trigger(
						"canvas:node-interaction-layer:render",
						thisArg
					);

					return Reflect.apply(target, thisArg, argumentsList);
				},
			}
		);

		nodeInteractionLayerPrototype.setTarget = new Proxy(
			nodeInteractionLayerPrototype.setTarget,
			{
				apply: (target, thisArg, argumentsList) => {
					plugin.app.workspace.trigger(
						"canvas:node-interaction-layer:set-target",
						argumentsList[0]
					);

					return Reflect.apply(target, thisArg, argumentsList);
				},
			}
		);
	}

	const menuPrototype = Object.getPrototypeOf(canvas.menu);

	if (!menuPrototype.__extended) {
		menuPrototype.__extended = true;

		menuPrototype.render = new Proxy(menuPrototype.render, {
			apply: (target, thisArg, argumentsList) => {
				Reflect.apply(target, thisArg, argumentsList);
				plugin.app.workspace.trigger("canvas:menu:render", thisArg);
				return;
			},
		});
	}

	const nodePrototype = getNodePrototype(canvas);

	if (!nodePrototype.__extended) {
		nodePrototype.__extended = true;

		nodePrototype.initialize = new Proxy(nodePrototype.initialize, {
			apply: (target, thisArg, argumentsList) => {
				plugin.app.workspace.trigger("canvas:node:initialize", thisArg);
				return Reflect.apply(target, thisArg, argumentsList);
			},
		});

		nodePrototype.render = new Proxy(nodePrototype.render, {
			apply: (target, thisArg, argumentsList) => {
				plugin.app.workspace.trigger("canvas:node:render", thisArg);
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
