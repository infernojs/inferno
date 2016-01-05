import ExecutionEnvironment from '../util/ExecutionEnvironment';
import Storage from '../util/storage';
import { createVariable } from './variables';
import scanTreeForDynamicNodes from './scanTreeForDynamicNodes';
import isVoid from '../util/isVoid';

let uniqueId = Date.now();
const treeConstructors = {};

function createId() {
	if ( ExecutionEnvironment.canUseSymbol ) {
		return Symbol();
	} else {
		return uniqueId++;
	}
}

export function addTreeConstructor(name, treeConstructor) {
	treeConstructors[ name ] = treeConstructor;
}

function applyTreeConstructors( schema, dynamicNodeMap ) {
	const tree = {};

	for ( let treeConstructor in treeConstructors ) {
		tree[ treeConstructor ] = treeConstructors[ treeConstructor ]( schema, true, dynamicNodeMap );
	}
	return tree;
}

export default function createTemplate( callback ) {

	if ( typeof callback === 'function' ) {
		let construct = callback.construct || null;

		if ( isVoid( construct ) ) {
			const callbackLength = callback.length;
			const callbackArguments = new Array( callbackLength );

			for ( let i = 0; i < callbackLength; i++ ) {
				callbackArguments[i] = createVariable( i );
			}
			const schema = callback( ...callbackArguments );
			const dynamicNodeMap = new Map() || new Storage();

			scanTreeForDynamicNodes( schema, dynamicNodeMap );
			const tree = applyTreeConstructors( schema, dynamicNodeMap );
			const key = schema.key;
			const keyIndex = key ? key.index : -1;

			switch ( callbackLength ) {
				case 0:
					construct = () => ( {
						parent: null,
						tree,
						id: createId(),
						key: null,
						nextItem: null,
						rootNode: null
					} );
					break;
				case 1:
					construct = ( v0 ) => {
						let key;

						if ( keyIndex === 0 ) {
							key = v0;
						}
						return {
							parent: null,
							tree,
							id: createId(),
							key,
							nextItem: null,
							rootNode: null,
							v0
						};
					};
					break;
				case 2:
					construct = ( v0, v1 ) => {
						let key;

						if ( keyIndex === 0 ) {
							key = v0;
						} else if ( keyIndex === 1 ) {
							key = v1;
						}
						return {
							parent: null,
							tree,
							id: createId(),
							key,
							nextItem: null,
							rootNode: null,
							v0,
							v1
						};
					};
					break;
				default:
					construct = ( v0, v1, ...values ) => {
						let key;

						if ( keyIndex === 0 ) {
							key = v0;
						} else if ( keyIndex === 1 ) {
							key = v1;
						} else if ( keyIndex > 1 ) {
							key = values[keyIndex];
						}
						return {
							parent: null,
							tree,
							id: createId(),
							key,
							nextItem: null,
							rootNode: null,
							v0,
							v1,
							values
						};
					};
					break;
			}
			if ( !isVoid( construct ) ) {
				callback.construct = construct;
			}
		}

		return construct;
	}
}
