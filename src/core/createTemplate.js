import ExecutionEnvironment from '../util/ExecutionEnvironment';
import Storage from '../util/storage';
import { createVariable } from './variables';
import scanTreeForDynamicNodes from './scanTreeForDynamicNodes';
import isVoid from '../util/isVoid';

// Date.now() is the slowest thing on earth
// http://jsperf.com/math-random-vs-date-now-vs-new-date/4
let uniqueId = Date.now();

/*
 let UUID = (function() {
 var self = {};
 var lut = []; for (var i=0; i<256; i++) { lut[i] = (i<16?'0':'')+(i).toString(16); }
 self.generate = function() {
 var d0 = Math.random()*0xffffffff|0;
 var d1 = Math.random()*0xffffffff|0;
 var d2 = Math.random()*0xffffffff|0;
 var d3 = Math.random()*0xffffffff|0;
 return lut[d0&0xff]+lut[d0>>8&0xff]+lut[d0>>16&0xff]+lut[d0>>24&0xff]+'-'+
 lut[d1&0xff]+lut[d1>>8&0xff]+'-'+lut[d1>>16&0x0f|0x40]+lut[d1>>24&0xff]+'-'+
 lut[d2&0x3f|0x80]+lut[d2>>8&0xff]+'-'+lut[d2>>16&0xff]+lut[d2>>24&0xff]+
 lut[d3&0xff]+lut[d3>>8&0xff]+lut[d3>>16&0xff]+lut[d3>>24&0xff];
 }
 return self;
 })();
 let uniqueId = UUID.generate();
 */
const treeConstructors = {};
const validTreeNames = {
	dom: true,
	html: true
};

export function addTreeConstructor(name, treeConstructor) {
	treeConstructors[name] = treeConstructor;
}

function applyTreeConstructors(schema, dynamicNodeMap) {
	const tree = {};

	for (let treeConstructor in treeConstructors) {
		tree[treeConstructor] = treeConstructors[treeConstructor](schema, true, dynamicNodeMap);
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
						id: uniqueId++,
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
							id: uniqueId++,
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
							id: uniqueId++,
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
							id: uniqueId++,
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