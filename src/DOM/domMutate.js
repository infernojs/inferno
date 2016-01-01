import isVoid from '../util/isVoid';
import { /* getValueWithIndex, */ getTypeFromValue, ValueTypes } from '../core/variables';
import isArray from '../util/isArray';
import isStringOrNumber from '../util/isStringOrNumber';
import { isRecyclingEnabled, pool } from './recycling';

const recyclingEnabled = isRecyclingEnabled();
const infernoBadTemplate = 'Inferno Error: A valid template node must be returned. You may have returned undefined, an array or some other invalid object.';

export function updateKeyed( items, oldItems, parentNode, parentNextNode, treeLifecycle, context ) {

	// This is all internals so no validation needed

	let stop = false;
	let startIndex = 0;
	let oldStartIndex = 0;
	const itemsLength = items.length;
	const oldItemsLength = oldItems.length;

	// TODO only if there are no other children
	if ( itemsLength === 0 && oldItemsLength >= 5 ) {
		if ( recyclingEnabled ) {
			for ( let i = 0; i < oldItemsLength; i++ ) {
				pool( oldItems[i] );
			}
		}
		parentNode.textContent = '';
		return;
	}

	let endIndex = itemsLength - 1;
	let oldEndIndex = oldItemsLength - 1;
	let startItem = itemsLength > 0 && items[startIndex];
	let oldStartItem = oldItemsLength > 0 && oldItems[oldStartIndex];
	let endItem;
	let oldEndItem;
	let nextNode;
	let oldItem;
	let item;

	// TODO don't read key too often
	outer: while ( !stop && startIndex <= endIndex && oldStartIndex <= oldEndIndex ) {
		stop = true;
		while ( startItem.key === oldStartItem.key ) {
			startItem.domTree.update( oldStartItem, startItem, treeLifecycle, context );
			startIndex++;
			oldStartIndex++;
			if ( startIndex > endIndex || oldStartIndex > oldEndIndex ) {
				break outer;
			} else {
				startItem = items[startIndex];
				oldStartItem = oldItems[oldStartIndex];
				stop = false;
			}
		}
		endItem = items[endIndex];
		oldEndItem = oldItems[oldEndIndex];
		while ( endItem.key === oldEndItem.key ) {
			endItem.domTree.update( oldEndItem, endItem, treeLifecycle, context );
			endIndex--;
			oldEndIndex--;
			if ( startIndex > endIndex || oldStartIndex > oldEndIndex ) {
				break outer;
			} else {
				endItem = items[endIndex];
				oldEndItem = oldItems[oldEndIndex];
				stop = false;
			}
		}
		while ( endItem.key === oldStartItem.key ) {
			nextNode = ( endIndex + 1 < itemsLength ) ? items[endIndex + 1].rootNode : parentNextNode;
			endItem.domTree.update( oldStartItem, endItem, treeLifecycle, context );
			insertOrAppend( parentNode, endItem.rootNode, nextNode );
			endIndex--;
			oldStartIndex++;
			if ( startIndex > endIndex || oldStartIndex > oldEndIndex ) {
				break outer;
			} else {
				endItem = items[endIndex];
				oldStartItem = oldItems[oldStartIndex];
				stop = false;
			}
		}
		while ( startItem.key === oldEndItem.key ) {
			nextNode = oldItems[oldStartIndex].rootNode;
			startItem.domTree.update( oldEndItem, startItem, treeLifecycle, context );
			insertOrAppend( parentNode, startItem.rootNode, nextNode );
			startIndex++;
			oldEndIndex--;
			if ( startIndex > endIndex || oldStartIndex > oldEndIndex ) {
				break outer;
			} else {
				startItem = items[startIndex];
				oldEndItem = oldItems[oldEndIndex];
				stop = false;
			}
		}
	}

	if ( oldStartIndex > oldEndIndex ) {
		if ( startIndex <= endIndex ) {
			nextNode = ( endIndex + 1 < itemsLength ) ? items[endIndex + 1].rootNode : parentNextNode;
			for ( ; startIndex <= endIndex; startIndex++ ) {
				item = items[startIndex];
				insertOrAppend( parentNode, item.domTree.create( item, treeLifecycle, context ), nextNode );
			}
		}
	} else if ( startIndex > endIndex ) {
		for ( ; oldStartIndex <= oldEndIndex; oldStartIndex++ ) {
			oldItem = oldItems[oldStartIndex];
			remove( oldItem, parentNode );
		}
	} else {
		const oldItemsMap = {};
		let oldNextItem = ( oldEndIndex + 1 < oldItemsLength ) ? oldItems[oldEndIndex + 1] : null;

		for ( let i = oldEndIndex; i >= oldStartIndex; i-- ) {
			oldItem = oldItems[i];
			oldItem.nextItem = oldNextItem;
			oldItemsMap[oldItem.key] = oldItem;
			oldNextItem = oldItem;
		}
		let nextItem = ( endIndex + 1 < itemsLength ) ? items[endIndex + 1] : null;

		for ( let i = endIndex; i >= startIndex; i-- ) {
			item = items[i];
			const key = item.key;

			oldItem = oldItemsMap[key];
			if ( oldItem ) {
				oldItemsMap[key] = null;
				oldNextItem = oldItem.nextItem;
				item.domTree.update( oldItem, item, treeLifecycle, context );

				/* eslint eqeqeq:0 */
				// TODO optimise
				if ( item.rootNode.nextSibling != ( nextItem && nextItem.rootNode ) ) {
					nextNode = ( nextItem && nextItem.rootNode ) || parentNextNode;
					insertOrAppend( parentNode, item.rootNode, nextNode );
				}
			} else {
				nextNode = ( nextItem && nextItem.rootNode ) || parentNextNode;
				insertOrAppend( parentNode, item.domTree.create( item, treeLifecycle, context ), nextNode );
			}
			nextItem = item;
		}
		for ( let i = oldStartIndex; i <= oldEndIndex; i++ ) {
			oldItem = oldItems[i];
			if ( oldItemsMap[oldItem.key] !== null ) {
				oldItem = oldItems[oldStartIndex];
				remove( item, parentNode );
			}
		}
	}
}

// TODO can we improve performance here?
export function updateNonKeyed( items, oldItems, domNodeList, parentNode, parentNextNode, treeLifecycle, context ) {

	let  itemsLength;
	// We can't calculate length of 0 in the cases either items or oldItems is 0.
	// In this cases we need workaround
	if ( items && oldItems ) {
		itemsLength = Math.max( items.length, oldItems.length );
	} else if ( items ) {
		itemsLength = items = itemsLength;
	} else if ( oldItems ) {
		itemsLength = oldItems = itemsLength;
	}

	for ( let i = 0; i < itemsLength; i++ ) {
		const item = items[i];
		const oldItem = oldItems[i];

		if ( item !== oldItem ) {
			if ( !isVoid( item ) ) {

				if ( !isVoid( oldItem ) ) {
					if ( isStringOrNumber( item ) ) {

						let domNode = domNodeList[i];

						if ( domNode ) {
							domNode.nodeValue = item;
						}

					} else if ( typeof item === 'object' ) {
						item.domTree.update( oldItem, item, treeLifecycle, context );
					}
				} else {
					if ( isStringOrNumber( item ) ) {
						const childNode = document.createTextNode( item );

						domNodeList[i] = childNode;
						insertOrAppend( parentNode, childNode, parentNextNode );
					}
				}
			} else {

				if ( domNodeList[i] ) {
					parentNode.removeChild( domNodeList[i] );
					domNodeList.splice( i, 1 );
				}
			}
		}
	}
}

export function insertOrAppend( parentNode, newNode, nextNode ) {

	let activeNode = document.activeElement;

	if ( nextNode ) {
		parentNode.insertBefore( newNode, nextNode );
	} else {
		parentNode.appendChild( newNode );
	}

	if (activeNode !== document.body && document.activeElement !== activeNode) {
		activeNode.focus();
	}
}

export function remove( item, parentNode ) {
	const rootNode = item.rootNode;

	// This shit will throw if empty, or empty array or empty object literal
	// TODO! Find a beter solution. I think this solution is slooow !!??

	if  ( isVoid( rootNode ) ||
		!( rootNode.nodeType) ) {
		return null;
	}

	if ( rootNode === parentNode ) {
		parentNode.innerHTML = '';
	} else {
		parentNode.removeChild( item.rootNode );
		if ( recyclingEnabled ) {
			pool( item );
		}
	}
}

export function createVirtualList( value, item, childNodeList, treeLifecycle, context ) {
	const domNode = document.createDocumentFragment();
	let keyedChildren = true;

	if ( value == null) {
		return;
	}

	for ( let i = 0; i < value.length; i++ ) {
		const childNode = value[i];
		const childType = getTypeFromValue( childNode );
		let childDomNode;

		switch ( childType ) {
			case ValueTypes.TEXT:
				childDomNode = document.createTextNode( childNode );
				childNodeList.push( childDomNode );
				domNode.appendChild( childDomNode );
				keyedChildren = false;
				break;
			case ValueTypes.TREE:
				keyedChildren = false;
				childDomNode = childNode.create( item, treeLifecycle, context );
				childNodeList.push( childDomNode );
				if ( childDomNode === undefined ) {
					throw Error('Inferno Error: Children must be provided as templates.');
				}
				domNode.appendChild( childDomNode );
				break;
			case ValueTypes.FRAGMENT:
				if ( childNode.key === undefined ) {
					keyedChildren = false;
				}
				childDomNode = childNode.domTree.create( childNode, treeLifecycle, context );
				childNodeList.push( childDomNode );
				domNode.appendChild( childDomNode );
				break;
			case ValueTypes.EMPTY_OBJECT:
				throw Error( infernoBadTemplate );
			case ValueTypes.FUNCTION:
				throw Error( infernoBadTemplate );
			case ValueTypes.ARRAY:
				throw Error( 'Inferno Error: Deep nested arrays are not supported as a valid template values - e.g. [[[1, 2, 3]]]. Only shallow nested arrays are supported - e.g. [[1, 2, 3]].' );
			default: break;
		}
	}
	return { domNode, keyedChildren };
}

export function updateVirtualList( lastValue, nextValue, childNodeList, domNode, nextDomNode, keyedChildren, treeLifecycle, context ) {
	if ( lastValue == null) {
		return null;
	}
	// NOTE: if someone switches from keyed to non-keyed, the node order won't be right...
	if ( isArray( lastValue ) ) {
		if ( keyedChildren ) {
			updateKeyed( nextValue, lastValue, domNode, nextDomNode, treeLifecycle, context );
		} else {
			updateNonKeyed( nextValue, lastValue, childNodeList, domNode, nextDomNode, treeLifecycle, context );
		}
	} else {
		// TODO
	}
}
