"use strict";

import removeFragments from "./removeFragments";
import removeFragment from "./removeFragment";
import attachFragmentList from "./attachFragmentList";
import attachFragment from "./attachFragment";
import updateFragment from "./updateFragment";
import moveFragment from "./moveFragment";

export default function updateFragmentList( context, oldList, list, parentDom, component, outerNextFragment ) {
    let oldListLength = oldList.length;
    let listLength = list.length;

    if ( listLength === 0 ) {
        removeFragments( context, parentDom, oldList, 0, oldListLength );
        return;
    } else if ( oldListLength === 0 ) {
        attachFragmentList( context, list, parentDom, component );
        return;
    }

    let oldEndIndex = oldListLength - 1;
    let endIndex = listLength - 1;
    let oldStartIndex = 0, startIndex = 0;
    let successful = true;
    let nextItem;
    let oldItem, item;

    outer: while ( successful && oldStartIndex <= oldEndIndex && startIndex <= endIndex ) {
        let oldStartItem, oldEndItem, startItem, endItem;

        successful = false;
        oldStartItem = oldList[oldStartIndex];
        startItem = list[startIndex];
        while ( oldStartItem.key === startItem.key ) {
            updateFragment( context, oldStartItem, startItem, parentDom, component );
            oldStartIndex++; startIndex++;
            if ( oldStartIndex > oldEndIndex || startIndex > endIndex ) {
                break outer;
            }
            oldStartItem = oldList[oldStartIndex];
            startItem = list[startIndex];
            successful = true;
        }
        oldEndItem = oldList[oldEndIndex];
        endItem = list[endIndex];
        while ( oldEndItem.key === endItem.key ) {
            updateFragment( context, oldEndItem, endItem, parentDom, component );
            oldEndIndex--; endIndex--;
            if ( oldStartIndex > oldEndIndex || startIndex > endIndex ) {
                break outer;
            }
            oldEndItem = oldList[oldEndIndex];
            endItem = list[endIndex];
            successful = true;
        }
        while ( oldStartItem.key === endItem.key ) {
            nextItem = ( endIndex + 1 < listLength ) ? list[endIndex + 1] : outerNextFragment;
            updateFragment( context, oldStartItem, endItem, parentDom, component );
            moveFragment( parentDom, endItem, nextItem )
            oldStartIndex++; endIndex--;
            if ( oldStartIndex > oldEndIndex || startIndex > endIndex ) {
                break outer;
            }
            oldStartItem = oldList[oldStartIndex];
            endItem = list[endIndex];
            successful = true;
        }
        while ( oldEndItem.key === startItem.key ) {
            nextItem = ( oldStartIndex < oldListLength ) ? oldList[oldStartIndex] : outerNextFragment;
            updateFragment( context, oldEndItem, startItem, parentDom, component );
            moveFragment( parentDom, startItem, nextItem )
            oldEndIndex--; startIndex++;
            if ( oldStartIndex > oldEndIndex || startIndex > endIndex ) {
                break outer;
            }
            oldEndItem = oldList[oldEndIndex];
            startItem = list[startIndex];
            successful = true;
        }
    }
    if ( oldStartIndex > oldEndIndex ) {
        nextItem = ( endIndex + 1 < listLength ) ? list[endIndex + 1] : outerNextFragment;
        for (let i = startIndex; i <= endIndex; i++ ) {
            item = list[i];
            attachFragment( context, item, parentDom, component, nextItem );
        }
    } else if ( startIndex > endIndex ) {
        removeFragments( context, parentDom, oldList, oldStartIndex, oldEndIndex + 1 );
    } else {
        let oldNextItem = ( oldEndIndex + 1 >= oldListLength ? null : oldList[oldEndIndex + 1] );
        let oldListMap = {};

        for (let i = oldEndIndex; i >= oldStartIndex; i-- ) {
            oldItem = oldList[i];
            oldItem.next = oldNextItem;
            oldListMap[oldItem.key] = oldItem;
            oldNextItem = oldItem;
        }
        nextItem = ( endIndex + 1 < listLength ) ? list[endIndex + 1] : outerNextFragment;
        for (let i = endIndex; i >= startIndex; i-- ) {
            item = list[i];
            var key = item.key;
            oldItem = oldListMap[key];
            if ( oldItem ) {
                oldListMap[key] = null;
                oldNextItem = oldItem.next;
                updateFragment( context, oldItem, item, parentDom, component );
                if ( parentDom.nextSibling != ( nextItem && nextItem.dom ) ) {
                    moveFragment( parentDom, item, nextItem );
                }
            } else {
                attachFragment( context, item, parentDom, component, nextItem );
            }
            nextItem = item;
        }
        for (let i = oldStartIndex; i <= oldEndIndex; i++ ) {
            oldItem = oldList[i];
            if ( oldListMap[oldItem.key] !== null ) {
                removeFragment( context, parentDom, oldItem );
            }
        }
    }
};
