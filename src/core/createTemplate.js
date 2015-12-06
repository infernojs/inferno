import createTree from './createTree';
import { createVariable } from './variables';

// TODO question? do we do this twice, once for DOM - Inferno.render and once for strings - Inferno.renderToString? and
// then do we store both?

export default function createTemplate(callback) {
	let construct = callback.construct;

	if (!construct) {
		const callbackLength = callback.length;
		const callbackArguments = new Array(callbackLength);
		for (let i = 0; i < callbackLength; i++) {
			callbackArguments[i] = createVariable(i);
		}
		const schema = callback.apply(undefined, callbackArguments);
		// TODO, the third param is isDOM
		const tree = createTree(schema, true, true);
		const key = schema.key;
		const keyIndex = key ? key.index : -1;
		const hasComponents = false;

		switch (callbackLength) {
			case 0:
				construct = () => ({
					tree,
					key: null,
					nextItem: null,
					rootNode: null
				});
				break;
			case 1:
				if(!hasComponents) {
					construct = (v0) => {
						let key;
						if (keyIndex === 0) {
							key = v0;
						}
						return {
							tree,
							key,
							nextItem: null,
							rootNode: null,
							v0
						};
					};
				}
				break;
			case 2:
				if(!hasComponents) {
					construct = (v0, v1) => {
						let key;
						if (keyIndex === 0) {
							key = v0;
						} else if (keyIndex === 1) {
							key = v1;
						}
						return {
							tree,
							key,
							nextItem: null,
							rootNode: null,
							v0,
							v1
						};
					};
				}
				break;
			default:
				if(!hasComponents) {
					construct = (...vArray) => {
						const key = vArray[keyIndex];
						return {
							tree,
							key,
							nextItem: null,
							rootNode: null,
							values
						};
					};
				}
				break;
		}
		callback.construct = construct;
	}
	return construct;
}