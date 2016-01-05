import isArray from '../../util/isArray';
import isVoid from '../../util/isVoid';
import addShapeChildren from '../../shared/addShapeChildren';
import { addDOMDynamicAttributes, updateDOMDynamicAttributes } from '../addAttributes';
import recreateNode from '../recreateNode';

export default function createNodeWithDynamicSubTreeForChildren( templateNode, subTreeForChildren, dynamicAttrs ) {
	const domNodeMap = {};
	const node = {
		overrideItem: null,
		create( item, treeLifecycle, context ) {
			const domNode = templateNode.cloneNode( false );

			addShapeChildren(domNode, subTreeForChildren, item, treeLifecycle, context );

			if ( dynamicAttrs ) {
				addDOMDynamicAttributes( item, domNode, dynamicAttrs, null );
			}
			domNodeMap[item.id] = domNode;
			return domNode;
		},
		update( lastItem, nextItem, treeLifecycle, context ) {
			const domNode = domNodeMap[lastItem.id];

			if ( node !== lastItem.tree.dom ) {
				recreateNode( domNode, nextItem, node, treeLifecycle,context );
				return domNode;
			}
			if ( !isVoid( subTreeForChildren ) ) {
				if ( isArray( subTreeForChildren ) ) {
					for ( let i = 0; i < subTreeForChildren.length; i++ ) {
						const subTree = subTreeForChildren[i];

						subTree.update( lastItem, nextItem, treeLifecycle, context );
					}
				} else if ( typeof subTreeForChildren === 'object' ) {
					const newDomNode = subTreeForChildren.update( lastItem, nextItem, treeLifecycle, context );

					if ( newDomNode ) {
						const replaceNode = domNode.firstChild;

						if ( replaceNode ) {
							domNode.replaceChild( newDomNode, replaceNode );
						} else {
							domNode.appendChild( newDomNode );
						}
					}
				}
			}
			if ( dynamicAttrs ) {
				updateDOMDynamicAttributes( lastItem, nextItem, domNode, dynamicAttrs );
			}
		},
		remove( item, treeLifecycle ) {
			if ( !isVoid( subTreeForChildren ) ) {
				if ( isArray( subTreeForChildren ) ) {
					for ( let i = 0; i < subTreeForChildren.length; i++ ) {
						const subTree = subTreeForChildren[i];

						subTree.remove( item, treeLifecycle );
					}
				} else if ( typeof subTreeForChildren === 'object' ) {
					subTreeForChildren.remove( item, treeLifecycle );
				}
			}
		}
	};

	return node;
}
