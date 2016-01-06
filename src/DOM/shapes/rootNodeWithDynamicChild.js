import isArray from '../../util/isArray';
import isVoid from '../../util/isVoid';
import updateAndAppendDynamicChildren from '../../shared/updateAndAppendDynamicChildren';
import appendText from '../../util/appendText';
import removeChild from '../../core/removeChild';
import replaceChild from '../../core/replaceChild';
import isStringOrNumber from '../../util/isStringOrNumber';
import { recycle } from '../recycling';
import { getValueWithIndex, removeValueTree } from '../../core/variables';
import { updateKeyed, updateNonKeyed } from '../domMutate';
import { addDOMDynamicAttributes, updateDOMDynamicAttributes } from '../addAttributes';
import recreateRootNode from '../recreateRootNode';

export default function createRootNodeWithDynamicChild( templateNode, valueIndex, dynamicAttrs, recyclingEnabled ) {
	let keyedChildren = true;
	let childNodeList = [];
	const node = {
		pool: [],
		keyedPool: [],
		overrideItem: null,
		create( item, treeLifecycle, context ) {
			let domNode;

			if ( recyclingEnabled ) {
				domNode = recycle( node, item, treeLifecycle, context );
				if ( domNode ) {
					return domNode;
				}
			}
			domNode = templateNode.cloneNode( false );
			const value = getValueWithIndex( item, valueIndex );

			if ( !isVoid( value ) ) {
				if ( isArray( value ) ) {
					for ( let i = 0; i < value.length; i++ ) {
						const childItem = value[i];
						// catches edge case where we e.g. have [null, null, null] as a starting point
						if ( !isVoid( childItem ) && typeof childItem === 'object' ) {

							const tree = childItem && childItem.tree;

							if ( tree ) {
								const childNode = childItem.tree.dom.create( childItem, treeLifecycle, context);

								if ( childItem.key === undefined ) {
									keyedChildren = false;
								}
								childNodeList.push( childNode );
								domNode.appendChild( childNode );
							}
						} else if ( isStringOrNumber( childItem ) ) {
							const textNode = document.createTextNode( childItem );

							domNode.appendChild( textNode );
							childNodeList.push( textNode );
							keyedChildren = false;
						}
					}
				} else if ( typeof value === 'object' ) {
					const tree = value && value.tree;

					if ( tree ) {
						domNode.appendChild( value.tree.dom.create( value, treeLifecycle, context ) );
					}

				} else if ( isStringOrNumber( value ) ) {
					domNode.textContent = value;
				}
			}
			if ( dynamicAttrs ) {
				addDOMDynamicAttributes( item, domNode, dynamicAttrs, node );
			}
			item.rootNode = domNode;
			return domNode;
		},
		update( lastItem, nextItem, treeLifecycle, context ) {

			if ( node !== lastItem.tree.dom ) {
				childNodeList = [];
				recreateRootNode( lastItem, nextItem, node, treeLifecycle, context );
				return;
			}
			const domNode = lastItem.rootNode;

			nextItem.rootNode = domNode;
			nextItem.id = lastItem.id;
			const nextValue = getValueWithIndex( nextItem, valueIndex );
			const lastValue = getValueWithIndex( lastItem, valueIndex );

			if ( nextValue && isVoid( lastValue ) ) {

				if ( typeof nextValue === 'object' ) {

					if ( isArray( nextValue ) ) {
						updateAndAppendDynamicChildren( domNode, nextValue );
					} else {
						recreateRootNode( lastItem, nextItem, node, treeLifecycle, context );
					}

				} else {
					domNode.appendChild( document.createTextNode( nextValue ) );
				}
			} else 	if ( lastValue && isVoid( nextValue ) ) {

				if ( isArray( lastValue ) ) {

					for ( let i = 0; i < lastValue.length; i++ ) {

						if ( !isVoid( domNode.childNodes[i] ) ) {
							domNode.removeChild( domNode.childNodes[i] )
						} else {
							removeChild(domNode);
						}
					}
				} else {
					removeChild(domNode);
				}
			} else if ( nextValue !== lastValue ) {
				if ( typeof nextValue === 'string' ) {
					appendText( domNode, nextValue );
				} else if ( isVoid( nextValue ) ) {
					if ( domNode !== null ) {
					replaceChild( domNode, document.createTextNode( '' ) );
					}
					// if we update from undefined, we will have an array with zero length.
					// If we check if it's an array, it will throw 'x' is undefined.
				} else if ( nextValue.length !== 0 && isArray( nextValue ) ) {
					if ( lastValue && isArray( lastValue ) ) {
						if ( keyedChildren ) {
							updateKeyed( nextValue, lastValue, domNode, null, context );
						} else {
							updateNonKeyed( nextValue, lastValue, childNodeList, domNode, null, treeLifecycle, context );
						}
					} else {
						updateNonKeyed( nextValue, [], childNodeList, domNode, null, treeLifecycle, context );
					}
				} else if ( typeof nextValue === 'object' ) {
					// Sometimes 'nextValue' can be an empty array or nothing at all, then it will
					// throw ': nextValue.tree is undefined'.
					const tree = nextValue && nextValue.tree;
					if ( !isVoid( tree ) ) {
						if ( !isVoid( lastValue ) ) {
							// If we update from 'null', there will be no 'tree', and the code will throw.
							const tree = lastValue && lastValue.tree;

							if ( !isVoid( tree ) ) {
								tree.dom.update( lastValue, nextValue, treeLifecycle, context );
							} else {
								recreateRootNode( lastItem, nextItem, node, treeLifecycle, context );
							}
						} else {
							replaceChild( domNode, tree.dom.create( nextValue, treeLifecycle, context ) );
						}
					} else {
						// Edge case! If we update from e.g object literal - {} - from a existing value, the
						// value will not be unset
						removeChild( domNode );
					}
				} else if ( isStringOrNumber( nextValue ) ) {
					appendText( domNode, nextValue );
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
