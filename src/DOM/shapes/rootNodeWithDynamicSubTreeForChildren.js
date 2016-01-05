import isArray from '../../util/isArray';
import isVoid from '../../util/isVoid';
import { isRecyclingEnabled, recycle } from '../recycling';
import { addDOMDynamicAttributes, updateDOMDynamicAttributes } from '../addAttributes';
import recreateRootNode from '../recreateRootNode';
import addShapeChildren from '../../shared/addShapeChildren';
import updateShapeChildren from '../../shared/updateShapeChildren';

const recyclingEnabled = isRecyclingEnabled();

export default function createRootNodeWithDynamicSubTreeForChildren( templateNode, subTreeForChildren, dynamicAttrs ) {
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

			addShapeChildren(domNode, subTreeForChildren, item, treeLifecycle, context );

			if ( dynamicAttrs ) {
				addDOMDynamicAttributes( item, domNode, dynamicAttrs, node );
			}
			item.rootNode = domNode;
			return domNode;
		},
		update( lastItem, nextItem, treeLifecycle, context ) {
			nextItem.id = lastItem.id;

			if ( node !== lastItem.tree.dom ) {
				const newDomNode = recreateRootNode( lastItem, nextItem, node, treeLifecycle, context );

				nextItem.rootNode = newDomNode;
				return newDomNode;
			}
			const domNode = lastItem.rootNode;

			nextItem.rootNode = domNode;

			updateShapeChildren(domNode, subTreeForChildren, lastItem, nextItem, treeLifecycle, context );

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
