import isVoid from '../util/isVoid';
import isSVG from '../util/isSVG';
import template from './';
import eventMapping from '../shared/eventMapping';
import addListener from './events/addListener';
import removeListener from './events/removeListener';

import { getValueWithIndex } from '../core/variables';

/**
 * Set HTML attributes on the template
 * @param{ HTMLElement } node
 * @param{ Object } attrs
 */
export function addDOMStaticAttributes( vNode, domNode, attrs ) {
	let styleUpdates;

	for ( const attrName in attrs ) {
		const attrVal = attrs[attrName];

		if ( attrVal ) {
			if ( attrName === 'style' ) {
				styleUpdates = attrVal;
			} else {
				template.setProperty( vNode, domNode, attrName, attrVal, false );
			}
		}
	}

	if ( styleUpdates ) {
		template.setCSS( vNode, domNode, styleUpdates );
	}
}

// A fast className setter as its the most common property to regularly change
function fastPropSet( attrName, attrVal, domNode ) {
	if ( attrName === 'class' || attrName === 'className' ) {
		if ( !isVoid( attrVal ) ) {
			if ( isSVG ) {
				domNode.setAttribute( 'class', attrVal );
			} else {
				domNode.className = attrVal;
			}
		}
		return true;
	} else if ( attrName === 'ref' ) {

		if ( process.env.NODE_ENV === 'development' ) {
			if ( isVoid( attrVal ) ) {
				throw ( 'Inferno Error: Inferno.createRef() can not be null or undefined' );
			}
		}

		attrVal.element = domNode;
		return true;
	}
	return false;
}

export function addDOMDynamicAttributes(item, domNode, dynamicAttrs, node) {
	let styleUpdates;

	if (dynamicAttrs.index !== undefined) {
		dynamicAttrs = getValueWithIndex(item, dynamicAttrs.index);
		addDOMStaticAttributes(item, domNode, dynamicAttrs);
		return;
	}
	for (const attrName in dynamicAttrs) {
		if (!isVoid( attrName)) {
			const attrVal = getValueWithIndex(item, dynamicAttrs[attrName]);

			if (attrVal !== undefined) {
				if (attrName === 'style') {
					styleUpdates = attrVal;
				} else {
					if (fastPropSet(attrName, attrVal, domNode) === false) {
						if (eventMapping[attrName]) {
							addListener(item, domNode, eventMapping[attrName], attrVal);
						} else {
							template.setProperty(null, domNode, attrName, attrVal, true);
						}
					}
				}
			}
		}
	}
	if (styleUpdates) {
		template.setCSS(item, domNode, styleUpdates);
	}
}

export function clearListeners (item, domNode, dynamicAttrs) {
	for (const attrName in dynamicAttrs) {
		const attrVal = getValueWithIndex(item, dynamicAttrs[attrName]);

		if (attrVal !== undefined && eventMapping[attrName]) {
			removeListener(item, domNode, eventMapping[attrName], attrVal);
		}
	}
}

/**
 * NOTE!! This function is probably the single most
 * critical path for performance optimization.
 */
export function updateDOMDynamicAttributes(lastItem, nextItem, domNode, dynamicAttrs) {
	if ( dynamicAttrs.index !== undefined ) {
		const nextDynamicAttrs = getValueWithIndex( nextItem, dynamicAttrs.index );

		if ( isVoid( nextDynamicAttrs ) ) {
			const lastDynamicAttrs = getValueWithIndex( lastItem, dynamicAttrs.index );

			for ( let attrName in lastDynamicAttrs ) {
				template.removeProperty( null, domNode, attrName, true );
			}
			return;
		}
		addDOMStaticAttributes( nextItem, domNode, nextDynamicAttrs );
		return;
	}

	/**
	 * TODO: Benchmark areas that can be improved with caching.
	 */
	let styleUpdates = {};
	let styleName;

	for ( const attrName in dynamicAttrs ) {

		const lastAttrVal = getValueWithIndex( lastItem, dynamicAttrs[attrName] );
		const nextAttrVal = getValueWithIndex( nextItem, dynamicAttrs[attrName] );

		if ( !isVoid( lastAttrVal ) ) {

			if ( isVoid( nextAttrVal ) ) {
				if ( attrName === 'style' ) {
					for ( styleName in lastAttrVal ) {
						if ( !nextAttrVal || !nextAttrVal[styleName] ) {
							styleUpdates[styleName] = '';
						}
					}
				} else if ( eventMapping[attrName] ) {
					removeListener( nextItem, domNode, eventMapping[attrName], nextAttrVal );
				} else {
					template.removeProperty( null, domNode, attrName, true );
				}

			} else if ( attrName === 'style' ) {

				// Unset styles on `lastAttrVal` but not on `nextAttrVal`.
				for ( styleName in lastAttrVal ) {
					if ( lastAttrVal[styleName] &&
						( !nextAttrVal || !nextAttrVal[styleName] ) ) {
						styleUpdates[styleName] = '';
					}
				}
				// Update styles that changed since `lastAttrVal`.
				for ( styleName in nextAttrVal ) {
					if ( !nextAttrVal[styleName] || lastAttrVal[styleName] !== nextAttrVal[ styleName ] ) {
						styleUpdates[styleName] = nextAttrVal[styleName];
					}
				}

			} else if ( lastAttrVal !== nextAttrVal ) {

				if ( fastPropSet( attrName, nextAttrVal, domNode ) === false ) {
					if ( eventMapping[attrName] ) {
						addListener( nextItem, domNode, eventMapping[attrName], nextAttrVal ); // TODO! Write tests for this!
					} else {
						template.setProperty( null, domNode, attrName, nextAttrVal, true );
					}
				}
			}
		} else if ( !isVoid( nextAttrVal ) ) {
			if ( attrName === 'style' ) {
				styleUpdates = nextAttrVal;
			} else {

				if ( fastPropSet( attrName, nextAttrVal, domNode ) === false ) {
					if ( eventMapping[attrName] ) {
						addListener( nextItem, domNode, eventMapping[attrName], nextAttrVal );
					} else {
						template.setProperty( null, domNode, attrName, nextAttrVal, true );
					}
				}
			}
		}
	}

	if ( styleUpdates ) {
		template.setCSS( domNode, domNode, styleUpdates );
	}
}
