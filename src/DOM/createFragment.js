import { remove } from './domMutate';

export default function createDOMFragment( parentNode, nextNode ) {
	let lastItem;
	let treeSuccessListeners = [];
	const context = {};
	const treeLifecycle = {
		addTreeSuccessListener( listener ) {
			treeSuccessListeners.push( listener );
		},
		removeTreeSuccessListener( listener ) {
			for ( let i = 0; i < treeSuccessListeners.length; i++ ) {
				const treeSuccessListener = treeSuccessListeners[i];

				if ( treeSuccessListener === listener ) {
					treeSuccessListeners.splice( i, 1 );
					return;
				}
			}
		}
	};
	return {
		parentNode,
		render( nextItem ) {
			if ( nextItem ) {
				const tree = nextItem.tree;

				if ( tree ) {
					if ( lastItem ) {
						tree.dom.update( lastItem, nextItem, treeLifecycle, context );
					} else {
						if ( tree.dom) {
							const dom = tree.dom.create( nextItem, treeLifecycle, context );

							if ( nextNode ) {
								parentNode.insertBefore( dom, nextNode );
							} else if ( parentNode ) {
								parentNode.appendChild( dom );
							}
						}
					}
					if ( treeSuccessListeners.length > 0 ) {
						for ( let i = 0; i < treeSuccessListeners.length; i++ ) {
							treeSuccessListeners[i]();
						}
					}
					lastItem = nextItem;
				}
			}
		},
		remove() {
			if ( lastItem ) {
				const tree = lastItem.tree;

				if ( lastItem ) {
					tree.dom.remove( lastItem, treeLifecycle );
				}
				remove( lastItem, parentNode );
			}
			treeSuccessListeners = [];
		}
	};
}
