import isArray from '../../util/isArray';
import isVoid from '../../util/isVoid';
import isStringOrNumber from '../../util/isStringOrNumber';
import { isRecyclingEnabled, recycle } from '../recycling';
import { getValueWithIndex, removeValueTree } from '../../core/variables';
import { updateKeyed, updateNonKeyed } from '../domMutate';
import { addDOMDynamicAttributes, updateDOMDynamicAttributes } from '../addAttributes';
import recreateRootNode from '../recreateRootNode';

const recyclingEnabled = isRecyclingEnabled();

export default function createRootNodeWithDynamicChild( templateNode, valueIndex, dynamicAttrs ) {
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

						if ( typeof childItem === 'object' ) {
							const childNode = childItem.domTree.create( childItem, treeLifecycle, context );

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
					domNode.appendChild( value.domTree.create( value, treeLifecycle, context ) );
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
			if ( node !== lastItem.domTree ) {
				childNodeList = [];
				recreateRootNode( lastItem, nextItem, node, treeLifecycle, context );
				return;
			}
			const domNode = lastItem.rootNode;

			nextItem.rootNode = domNode;
			nextItem.id = lastItem.id;
			const nextValue = getValueWithIndex( nextItem, valueIndex );
			const lastValue = getValueWithIndex( lastItem, valueIndex );

			if ( nextValue !== lastValue ) {
				if ( typeof nextValue === 'string' ) {
					domNode.firstChild.nodeValue = nextValue;
				} else if ( isVoid( nextValue ) ) {
					if ( domNode !== null ) {
						const childNode = document.createTextNode( '' );
						const replaceNode = domNode.firstChild;

						if ( replaceNode ) {
							domNode.replaceChild( childNode, domNode.firstChild );
						} else {
							domNode.appendChild( childNode );
						}
					}
				} else if ( isArray( nextValue ) ) {
					if ( isArray( lastValue ) ) {
						if ( keyedChildren ) {
							updateKeyed( nextValue, lastValue, domNode, null, context );
						} else {
							updateNonKeyed( nextValue, lastValue, childNodeList, domNode, null, treeLifecycle, context );
						}
					} else {
						// do nothing for now!
					}
				} else if ( typeof nextValue === 'object' ) {
					const tree = nextValue.domTree;

					if ( !isVoid( tree ) ) {
						if ( !isVoid( lastValue ) ) {
							if ( !isVoid( lastValue.domTree ) ) {
								tree.update( lastValue, nextValue, treeLifecycle, context );
							} else {
								recreateRootNode( lastItem, nextItem, node, treeLifecycle, context );
								return;
							}
						} else {
							const childNode = tree.create( nextValue, treeLifecycle, context );

							domNode.replaceChild( childNode, domNode.firstChild );
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
