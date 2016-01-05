import isVoid from '../util/isVoid';
import isArray from '../util/isArray';

export default function addShapeChildren(domNode, subTreeForChildren, item, treeLifecycle, context ) {

	if ( !isVoid( subTreeForChildren ) ) {
		if ( isArray( subTreeForChildren ) ) {
			for ( let i = 0; i < subTreeForChildren.length; i++ ) {
				const subTree = subTreeForChildren[i];
				const childNode = subTree.create( item, treeLifecycle, context );

				domNode.appendChild( childNode );
			}
		} else if ( typeof subTreeForChildren === 'object' ) {
			domNode.appendChild( subTreeForChildren.create( item, treeLifecycle, context ) );
		}
	}
}