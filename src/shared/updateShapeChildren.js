import isVoid from '../util/isVoid';
import isArray from '../util/isArray';

export default function addShapeChildren(domNode, subTreeForChildren, lastItem, nextItem, treeLifecycle, context ) {
	if ( !isVoid( subTreeForChildren ) ) {
		if ( isArray( subTreeForChildren ) ) {
			for ( let i = 0; i < subTreeForChildren.length; i++ ) {
				const subTree = subTreeForChildren[i];

				subTree.update( lastItem, nextItem, treeLifecycle, context );
			}
		} else if ( typeof subTreeForChildren === 'object' ) {
			subTreeForChildren.update( lastItem, nextItem, treeLifecycle, context );
		}
	}
}