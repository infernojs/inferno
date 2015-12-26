import isVoid from '../util/isVoid';
import isSVG from '../util/isSVG';
import template from './';
import eventMapping from '../shared/eventMapping';
import addListener from './events/addListener';
import removeListener from './events/removeListener';
import setValueForStyles from './setValueForStyles';
import { getValueWithIndex, getCorrectItemForValues } from '../core/variables';

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
			if ( isSVG ) {
			    domNode.setAttribute('class', attrVal);
			} else {
			   domNode.className = attrVal;
			}
		}
		return true;
	} else if ( attrName === 'ref' ) {
		attrVal.element = domNode;
		return true;
	}
	return false;
}

export function addDOMDynamicAttributes( item, domNode, dynamicAttrs, node ) {
	const valueItem = getCorrectItemForValues( node, item );
	let styleUpdates;

	if ( dynamicAttrs.index !== undefined ) {
		dynamicAttrs = getValueWithIndex( valueItem, dynamicAttrs.index );
		addDOMStaticAttributes( item, domNode, dynamicAttrs );
		return;
	}
	for ( const attrName in dynamicAttrs ) {
		if ( attrName != null ) {
			const attrVal = getValueWithIndex( valueItem, dynamicAttrs[attrName] );

			if ( attrVal !== undefined ) {
				if ( attrName === 'style' ) {
					styleUpdates = attrVal;
				} else {
					if ( fastPropSet( attrName, attrVal, domNode ) === false ) {
						if ( eventMapping[attrName] ) {
							addListener( item, domNode, eventMapping[attrName], attrVal );
						} else {
							template.setProperty( null, domNode, attrName, attrVal, true );
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

function set( domNode, attrName, nextAttrVal, nextItem ) {
	if ( fastPropSet( domNode, attrName, nextAttrVal ) === false ) {
		if ( eventMapping[attrName] ) {
			addListener( nextItem, domNode, eventMapping[attrName], nextAttrVal );
		} else {
			template.setProperty( null, domNode, attrName, nextAttrVal, true );
		}
	}
}

export function updateDOMDynamicAttributes( lastItem, nextItem, domNode, dynamicAttrs ) {
	if ( dynamicAttrs.index !== undefined ) {
		const nextDynamicAttrs = getValueWithIndex( nextItem, dynamicAttrs.index );

		addDOMStaticAttributes( nextItem, domNode, nextDynamicAttrs );
		return;
	}
	let styleUpdates;

	for ( const attrName in dynamicAttrs ) {
		if ( !dynamicAttrs.hasOwnProperty( attrName ) ) {
			continue;
		}

		const lastAttrVal = getValueWithIndex( lastItem, dynamicAttrs[attrName] );
		const nextAttrVal = getValueWithIndex( nextItem, dynamicAttrs[attrName] );

		if ( nextAttrVal !== undefined ) {
			if ( !lastAttrVal || ( isVoid( lastAttrVal ) ) ) { // Is this hit?
				if ( !isVoid( nextAttrVal ) ) {

					if ( attrName === 'style' ) {
						styleUpdates = nextAttrVal;
					} else {
						set( domNode, attrName, nextAttrVal, nextItem, styleUpdates );
					}

				}
			} else if ( isVoid( nextAttrVal ) ) {
				if ( attrName === 'style' ) {
					styleUpdates = null;
				} else {
					if ( eventMapping[attrName] ) { // Is this hit?
						removeListener( nextItem, domNode, eventMapping[attrName], nextAttrVal );
					} else {
						template.removeProperty( null, domNode, attrName, true );
					}
				}
			} else if ( lastAttrVal !== nextAttrVal ) {
				if ( attrName === 'style' ) {
					styleUpdates = nextAttrVal;
				} else {
					set( domNode, attrName, nextAttrVal, nextItem, styleUpdates );
				}
			}
		}
		if ( lastAttrVal !== undefined ) {
			if ( ( nextAttrVal === undefined
				|| !( attrName !== nextAttrVal ) ) && ( !isVoid( lastAttrVal ) ) ) {
				// remove attrs
				if ( eventMapping[attrName] ) {
					removeListener( nextItem, domNode, eventMapping[attrName], nextAttrVal );
				} else {
					template.removeProperty( null, domNode, attrName, true );
				}
			}
		}
	}

	if ( !isVoid( styleUpdates ) ) {
		setValueForStyles( domNode, domNode, styleUpdates );
	}
}
