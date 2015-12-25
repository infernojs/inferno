import isArray from '../../util/isArray';
import { getValueWithIndex, removeValueTree } from '../../core/variables';
import { updateKeyed, updateNonKeyed } from '../domMutate';
import { addDOMDynamicAttributes, updateDOMDynamicAttributes } from '../addAttributes';

export default function createNodeWithDynamicChild( templateNode, valueIndex, dynamicAttrs, domNamespace ) {
	let domNode;
	let keyedChildren = true;
	let childNodeList = [];
	const node = {
		create( item, treeLifecycle, context ) {
			domNode = templateNode.cloneNode( false );
			const value = getValueWithIndex( item, valueIndex );

			if ( value != null ) {
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
						} else if ( typeof childItem === 'string' || typeof childItem === 'number' ) {
							const textNode = document.createTextNode( childItem );
							domNode.appendChild( textNode );
							childNodeList.push( textNode );
							keyedChildren = false;
						}
					}
				} else if ( typeof value === 'object' ) {
					domNode.appendChild( value.domTree.create( value, treeLifecycle, context ) );
				} else if ( typeof value === 'string' || typeof value === 'number' ) {
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
				} else if ( nextValue == null ) {
					domNode.removeChild( domNode.firstChild );
				} else if ( isArray( nextValue ) ) {
					if ( isArray( lastValue ) ) {
						if ( keyedChildren ) {
							updateKeyed( nextValue, lastValue, domNode, null, treeLifecycle, context );
						} else {
							updateNonKeyed( nextValue, lastValue, childNodeList, domNode, null, treeLifecycle, context );
						}
					} else {
						//debugger;
					}
				} else if ( typeof nextValue === 'object' ) {
					const tree = nextValue.domTree;

					if ( tree != null ) {
						if ( lastValue.domTree !== null ) {
							tree.update( lastValue, nextValue, treeLifecycle, context );
						} else {
							// TODO implement
						}
					}
				} else if ( typeof nextValue === 'string' || typeof nextValue === 'number' ) {
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
