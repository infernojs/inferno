import isArray from '../../util/isArray';
import isVoid from '../../util/isVoid';
import isStringOrNumber from '../../util/isStringOrNumber';
import { getValueWithIndex, removeValueTree } from '../../core/variables';
import { updateKeyed, updateNonKeyed } from '../domMutate';
import { addDOMDynamicAttributes, updateDOMDynamicAttributes } from '../addAttributes';

export default function createNodeWithDynamicChild( templateNode, valueIndex, dynamicAttrs ) {
	let domNode;
	let keyedChildren = true;
	const childNodeList = [];
	const node = {
		overrideItem: null,
		create( item, treeLifecycle, context ) {
			domNode = templateNode.cloneNode( false );
			const value = getValueWithIndex( item, valueIndex );

			if ( !isVoid( value ) ) {
				if ( isArray( value ) ) {
					for ( let i = 0; i < value.length; i++ ) {
						const childItem = value[i];

						if ( typeof childItem === 'object' ) {
							const childNode = childItem.tree.dom.create( childItem, treeLifecycle, context );

							if ( childItem.key === undefined ) {
								keyedChildren = false;
							}
							childNodeList.push( childNode );
							domNode.appendChild( childNode );
						} else if ( isStringOrNumber( childItem ) ) {
							const textNode = document.createTextNode( childItem );

							domNode.appendChild( textNode );
							childNodeList.push( textNode );
							keyedChildren = false;
						}
					}
				} else if ( typeof value === 'object' ) {
					domNode.appendChild( value.tree.dom.create( value, treeLifecycle, context ) );
				} else if ( isStringOrNumber( value ) ) {
					domNode.textContent = value;
				}
			}
			if ( dynamicAttrs ) {
				addDOMDynamicAttributes( item, domNode, dynamicAttrs, null );
			}
			return domNode;
		},
		update( lastItem, nextItem, treeLifecycle, context ) {
			const nextValue = getValueWithIndex( nextItem, valueIndex );
			const lastValue = getValueWithIndex( lastItem, valueIndex );

			if ( nextValue !== lastValue ) {
				if ( typeof nextValue === 'string' ) {
					domNode.firstChild.nodeValue = nextValue;
				} else if ( isVoid( nextValue ) ) {
					const firstChild = domNode.firstChild;

					if ( firstChild ) {
						domNode.removeChild( domNode.firstChild );
					}
				} else if ( isArray( nextValue ) ) {
					if ( isArray( lastValue ) ) {
						if ( keyedChildren ) {
							updateKeyed( nextValue, lastValue, domNode, null, treeLifecycle, context );
						} else {
							updateNonKeyed( nextValue, lastValue, childNodeList, domNode, null, treeLifecycle, context );
						}
					} else {
						// debugger;
					}
				} else if ( typeof nextValue === 'object' ) {
					const tree = nextValue.tree;

					if ( !isVoid( tree ) ) {
						if ( lastValue.tree !== null ) {
							tree.dom.update( lastValue, nextValue, treeLifecycle, context );
						} else {
							// TODO implement
						}
					}
				} else if ( isStringOrNumber( nextValue ) ) {
					domNode.firstChild.nodeValue = nextValue;
				}
			}
			if ( dynamicAttrs ) {
				updateDOMDynamicAttributes( lastItem, nextItem, domNode, dynamicAttrs );
			}
		},
		remove( item, treeLifecycle ) {
			const value = getValueWithIndex( item, valueIndex );

			removeValueTree( value, treeLifecycle );
		}
	};

	return node;
}
