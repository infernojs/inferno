import createDOMTree from '../DOM/createTree';
import createHTMLStringTree from '../htmlString/createHTMLStringTree';
import { createVariable } from './variables';
import scanTreeForDynamicNodes from './scanTreeForDynamicNodes';

export default function createTemplate( callback ) {
	let construct = callback.construct;

	if ( !construct ) {
		const callbackLength = callback.length;
		const callbackArguments = new Array( callbackLength );

		for ( let i = 0; i < callbackLength; i++ ) {
			callbackArguments[i] = createVariable( i );
		}

		const schema = callback( ...callbackArguments );
		const dynamicNodeMap = new Map();

		scanTreeForDynamicNodes( schema, dynamicNodeMap );

		const domTree = createDOMTree( schema, true, dynamicNodeMap );
		const htmlStringTree = createHTMLStringTree( schema, true, dynamicNodeMap );
		const key = schema.key;
		const keyIndex = key ? key.index : -1;

		switch ( callbackLength ) {
			case 0:
				construct = () => ( {
					parent: null,
					domTree,
					htmlStringTree,
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
						domTree,
						htmlStringTree,
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
						domTree,
						htmlStringTree,
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
						domTree,
						htmlStringTree,
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
		callback.construct = construct;
	}
	return construct;
}
