import { recycle } from '../recycling';
import { addDOMDynamicAttributes, updateDOMDynamicAttributes } from '../addAttributes';
import recreateRootNode from '../recreateRootNode';

export default function createRootVoidNode( templateNode, dynamicAttrs, recyclingEnabled ) {
	const node = {
		pool: [],
		keyedPool: [],
		overrideItem: null,
		create( item ) {
			let domNode;

			if ( recyclingEnabled ) {
				domNode = recycle( node, item );
				if ( domNode ) {
					return domNode;
				}
			}
			domNode = templateNode.cloneNode( true );
			item.rootNode = domNode;
			if ( dynamicAttrs ) {
				addDOMDynamicAttributes( item, domNode, dynamicAttrs, node );
			}
			return domNode;
		},
		update: function update(lastItem, nextItem) {

			if (node !== lastItem.tree.dom) {
				recreateRootNode(lastItem, nextItem, node);
				return;
			}
			var domNode = lastItem.rootNode;

			// Dominic!
			// 3rd time fire the toggle, we got this output in the console.log
			// CONSOLE:

			/**
			 *  Object { show=true}
			 /inferno/ (line 70)
			 Object { show=true}
			 /inferno/ (line 70)
			 Object { tree={...},  rootNode=div,  parent=null,  more...}
			 * */

			// As you may notice. On the 3rd toggle, we got a 'tree'

			// Why are we not creating any tree down here???

			// I get the tree now
			const tree = lastItem && lastItem.tree;

			if ( tree ) {
				// Okay! We got he tree.
				// UPS! This isn't a tree, it's changed to a fragment
				// CONSOLE:

				/**
				 *  Object { show=true}
				 /inferno/ (line 70)
				 Object { dom={...}}
				 *
				 * */

				// Okay, so if we open that object, and look inside it, we will see this

				// CONSOLE

				/**
				 *
				 *

				 dom

				 Object { pool=[0],  keyedPool=[0],  overrideItem=null,  more...}
				 keyedPool

				 []
				 overrideItem

				 null
				 pool

				 []
				 create

				 create(item)
				 remove

				 remove()
				 update

				 update(lastItem, nextItem)
				 *
				 * */

			}

			// WHERE!! Is the tree? It's not there


			// Dominic! TODO!! Fix this, create a node, replace the ndoe and the toggle are back to normal
			// AND the error is gone

			nextItem.rootNode = domNode;
			nextItem.id = lastItem.id;
			nextItem.rootNode = lastItem.rootNode;
			if (dynamicAttrs) {
				updateDOMDynamicAttributes(lastItem, nextItem, domNode, dynamicAttrs);
			}
		},
		remove( /* lastItem */ ) {

		}
	};

	return node;
}
