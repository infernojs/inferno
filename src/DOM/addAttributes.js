import template from './';
import eventMapping from '../shared/eventMapping';
import addListener from './events/addListener';
import setValueForStyles from './setValueForStyles';
import { getValueWithIndex } from '../core/variables';
import isVoid from '../util/isVoid';
import isUndefined from '../util/isUndefined';

/**
 * Set HTML attributes on the template
 * @param{ HTMLElement } node
 * @param{ Object } attrs
 */
export function addDOMStaticAttributes( vNode, domNode, attrs ) {
	let styleUpdates;

	for ( const attrName in attrs ) {
		if ( attrs.hasOwnProperty( attrName ) ) {
			const attrVal = attrs[attrName];

			if ( attrVal ) {
				if ( attrName === 'style' ) {
					styleUpdates = attrVal;
				} else {
					template.setProperty( vNode, domNode, attrName, attrVal, false );
				}
			}
		}
	}

	if ( styleUpdates ) {
		setValueForStyles( vNode, domNode, styleUpdates );
	}
}

// A fast className setter as its the most common property to regularly change
function fastPropSet( attrName, attrVal, domNode ) {
	if ( attrName === 'class' || attrName === 'className' ) {
		if ( !isVoid( attrVal ) ) {
			domNode.className = attrVal;
		}
		return true;
	} else if ( attrName === 'ref' ) {
		attrVal.element = domNode;
		return true;
	}
	return false;
}

export function addDOMDynamicAttributes( item, domNode, dynamicAttrs ) {
	if ( !isUndefined( dynamicAttrs.index ) ) {
		dynamicAttrs = getValueWithIndex( item, dynamicAttrs.index );
		addDOMStaticAttributes( item, domNode, dynamicAttrs );
		return;
	}
	let styleUpdates;

	for ( const attrName in dynamicAttrs ) {
		if ( dynamicAttrs.hasOwnProperty( attrName ) ) {
			const attrVal = getValueWithIndex( item, dynamicAttrs[attrName] );

			if ( !isUndefined( attrVal ) ) {
				if ( attrName === 'style' ) {
					styleUpdates = attrVal;
				} else {
					if ( fastPropSet( attrName, attrVal, domNode ) === false ) {
						if ( eventMapping[attrName] ) {
							addListener( item, domNode, eventMapping[attrName], attrVal );
						} else {
							template.setProperty( item, domNode, attrName, attrVal, true );
						}
					}
				}
			}
		}
	}
	if ( styleUpdates ) {
		setValueForStyles( item, domNode, styleUpdates );
	}
}

export function updateDOMDynamicAttributes( lastItem, nextItem, domNode, dynamicAttrs ) {
	if ( !isUndefined( dynamicAttrs.index ) ) {
		const nextDynamicAttrs = getValueWithIndex( nextItem, dynamicAttrs.index );

		addDOMStaticAttributes( nextItem, domNode, nextDynamicAttrs );
		return;
	}
	let styleUpdates;

	for ( const attrName in dynamicAttrs ) {
		if ( dynamicAttrs.hasOwnProperty( attrName ) ) {
			const lastAttrVal = getValueWithIndex( lastItem, dynamicAttrs[attrName] );
			const nextAttrVal = getValueWithIndex( nextItem, dynamicAttrs[attrName] );

			if ( lastAttrVal !== nextAttrVal ) {
				if ( !isUndefined( nextAttrVal ) ) {
					if ( attrName === 'style' ) {
						styleUpdates = nextAttrVal;
					} else {
						if ( fastPropSet( attrName, nextAttrVal, domNode ) === false ) {
							if ( eventMapping[attrName] ) {
								addListener( nextItem, domNode, eventMapping[attrName], nextAttrVal );
							} else {
								template.setProperty( nextItem, domNode, attrName, nextAttrVal, true );
							}
						}
					}
				}
			}
		}
	}
	if ( styleUpdates ) {
		setValueForStyles( nextItem, domNode, styleUpdates );
	}
}
