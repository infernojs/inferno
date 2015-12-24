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
	const fragment =	{
		parentNode,
		render( nextItem ) {
			if ( !nextItem ) {
				return;
			}
			const tree = nextItem.domTree;

			if ( !tree ) {
				throw Error( 'Inferno Error: A valid template node must be returned. You may have returned undefined, an array or some other invalid object.' );
			}

			if ( lastItem ) {
				tree.update( lastItem, nextItem, treeLifecycle, context );
			} else {
				const dom = tree.create( nextItem, treeLifecycle, context );

				if ( nextNode ) {
					parentNode.insertBefore( dom, nextNode );
				} else if ( parentNode ) {
					parentNode.appendChild( dom );
				}
			}
			if ( treeSuccessListeners.length > 0 ) {
				for ( let i = 0; i < treeSuccessListeners.length; i++ ) {
					treeSuccessListeners[i]();
				}
			}
			lastItem = nextItem;
			return fragment;
		},
		remove() {
			if ( lastItem ) {
				const tree = lastItem.domTree;

				tree.remove( lastItem, treeLifecycle );
			}
			remove( lastItem, parentNode );
			treeSuccessListeners = [];
			return fragment;
		}
	};

	return fragment;
}
