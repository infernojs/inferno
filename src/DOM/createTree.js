import isVoid from '../util/isVoid';
import isSVGElement from '../util/isSVGElement';
import createRootNodeWithDynamicText from './shapes/rootNodeWithDynamicText';
import createNodeWithDynamicText from './shapes/nodeWithDynamicText';
import createRootNodeWithStaticChild from './shapes/rootNodeWithStaticChild';
import createNodeWithStaticChild from './shapes/nodeWithStaticChild';
import createRootNodeWithDynamicChild from './shapes/rootNodeWithDynamicChild';
import createNodeWithDynamicChild from './shapes/nodeWithDynamicChild';
import createRootNodeWithDynamicSubTreeForChildren from './shapes/rootNodeWithDynamicSubTreeForChildren';
import createNodeWithDynamicSubTreeForChildren from './shapes/nodeWithDynamicSubTreeForChildren';
import createRootStaticNode from './shapes/rootStaticNode';
import createStaticNode from './shapes/staticNode';
import createRootDynamicNode from './shapes/rootDynamicNode';
import createDynamicNode from './shapes/dynamicNode';
import createRootVoidNode from './shapes/rootVoidNode';
import createVoidNode from './shapes/voidNode';
import createRootNodeWithComponent from './shapes/rootNodeWithComponent';
import createNodeWithComponent from './shapes/nodeWithComponent';
import createRootDynamicTextNode from './shapes/rootDynamicTextNode';
import createDynamicTextNode from './shapes/dynamicTextNode';

import {
	ObjectTypes
}
	from '../core/variables';
import isArray from '../util/isArray';
import {
	addDOMStaticAttributes
}
	from './addAttributes';

const invalidTemplateError = 'Inferno Error: A valid template node must be returned. You may have returned undefined, an array or some other invalid object.';

function createStaticAttributes( node, domNode, excludeAttrs ) {
	const attrs = node.attrs;

	if ( !isVoid( attrs ) ) {
		if ( excludeAttrs ) {
			const newAttrs = { ...attrs };

			for ( const attr in excludeAttrs ) {
				if ( newAttrs[attr] ) {
					delete newAttrs[attr];
				}
			}
			addDOMStaticAttributes( node, domNode, newAttrs );
		} else {
			addDOMStaticAttributes( node, domNode, attrs );
		}
	}
}

function createStaticTreeChildren( children, parentNode, domNamespace ) {
	if ( isArray( children ) ) {
		for ( let i = 0; i < children.length; i++ ) {
			const childItem = children[i];

			if ( typeof childItem === 'string' || typeof childItem === 'number' ) {
				const textNode = document.createTextNode( childItem );

				parentNode.appendChild( textNode );
			} else {
				createStaticTreeNode( childItem, parentNode, domNamespace );
			}
		}
	} else {
		if ( typeof children === 'string' || typeof children === 'number' ) {
			parentNode.textContent = children;
		} else {
			createStaticTreeNode( children, parentNode, domNamespace );
		}
	}
}

function createStaticTreeNode( node, parentNode, domNamespace ) {
	let staticNode;

	if ( isVoid( node ) ) {
		return null;
	}
	if ( typeof node === 'string' || typeof node === 'number' ) {
		staticNode = document.createTextNode( node );
	} else {
		const tag = node.tag;

		if ( tag ) {
			const is = node.attrs && node.attrs.is || null;

			if ( domNamespace === undefined ) {

				if ( node.attrs && node.attrs.xmlns ) {
					domNamespace = node.attrs.xmlns;
				} else {
					switch ( tag ) {
						case 'svg':
							domNamespace = 'http://www.w3.org/2000/svg';
							break;
						case 'math':
							domNamespace = 'http://www.w3.org/1998/Math/MathML';
							break;
						default:
							// Edge case. In case a namespace element are wrapped inside a non-namespace element, it will inherit wrong namespace.
							// E.g. <div><svg><svg></div> - will not work
							if ( parentNode !== null ) {
								if ( tag === 'svg' && parentNode.namespaceURI !== 'http://www.w3.org/2000/svg' ) { // only used by static children
									domNamespace = 'http://www.w3.org/2000/svg';
								}
							} else if ( isSVGElement( tag ) ) { // only used by dynamic children
								domNamespace = 'http://www.w3.org/2000/svg';
							}
					}
				}
			}

			if ( domNamespace ) {
				if ( is ) {
					staticNode = document.createElementNS( domNamespace, tag, is );
				} else {
					staticNode = document.createElementNS( domNamespace, tag );
				}
			} else {
				if ( is ) {
					staticNode = document.createElement( tag, is );
				} else {
					staticNode = document.createElement( tag );
				}
			}
			const text = node.text;
			const children = node.children;

			if ( !isVoid( text ) ) {
				if ( !isVoid( children ) ) {
					throw Error( invalidTemplateError );
				}
				if ( typeof text !== 'string' && typeof text !== 'number' ) {
					throw Error( 'Inferno Error: Template nodes with TEXT must only have a StringLiteral or NumericLiteral as a value, this is intended for low-level optimisation purposes.' );
				}
				staticNode.textContent = text;
			} else {
				if ( !isVoid( children ) ) {
					createStaticTreeChildren( children, staticNode, domNamespace );
				}
			}
			createStaticAttributes( node, staticNode );
		} else if ( node.text ) {
			staticNode = document.createTextNode( node.text );
		}
	}
	if ( staticNode === undefined ) {
		throw Error( invalidTemplateError );
	}
	if ( parentNode === null ) {
		return staticNode;
	} else {
		parentNode.appendChild( staticNode );
	}
}

export default function createDOMTree( schema, isRoot, dynamicNodeMap, domNamespace ) {

	const dynamicFlags = dynamicNodeMap.get( schema );
	let node;
	let templateNode;

	if ( isVoid( schema ) ) {
		throw Error( invalidTemplateError );
	}
	if ( isArray( schema ) ) {
		throw Error( invalidTemplateError );
	}
	if ( !dynamicFlags ) {
		templateNode = createStaticTreeNode( schema, null, domNamespace, schema );

		if ( !templateNode ) {
			throw Error( invalidTemplateError );
		}

		if ( isRoot ) {
			node = createRootStaticNode( templateNode );
		} else {
			node = createStaticNode( templateNode );
		}
	} else {
		if ( dynamicFlags.NODE === true ) {
			if ( isRoot ) {
				node = createRootDynamicNode( schema.index, domNamespace );
			} else {
				node = createDynamicNode( schema.index, domNamespace );
			}
		} else {
			const tag = schema.tag;
			const text = schema.text;

			if ( tag ) {
				if ( tag.type === ObjectTypes.VARIABLE ) {
					const lastAttrs = schema.attrs;
					const attrs = { ...lastAttrs };
					const children = null;

					if ( schema.children ) {
						if ( isArray( schema.children ) && schema.children.length > 1 ) {
							attrs.children = [];
							for ( let i = 0; i < schema.children.length; i++ ) {
								const childNode = schema.children[i];

								attrs.children.push( createDOMTree( childNode, false, dynamicNodeMap, domNamespace ) );
							}
						} else {
							if ( isArray( schema.children ) && schema.children.length === 1 ) {
								attrs.children = createDOMTree( schema.children[0], false, dynamicNodeMap, domNamespace );
							} else {
								attrs.children = createDOMTree( schema.children, false, dynamicNodeMap, domNamespace );
							}
						}
					}
					if ( isRoot ) {
						return createRootNodeWithComponent( tag.index, attrs, children, domNamespace );
					} else {
						return createNodeWithComponent( tag.index, attrs, children, domNamespace );
					}
				}

				const is = schema.attrs && schema.attrs.is;

				if ( domNamespace === undefined ) {

					if ( schema.attrs && schema.attrs.xmlns ) {
						domNamespace = schema.attrs.xmlns;
					} else {

						switch ( tag ) {
							case 'svg':
								domNamespace = 'http://www.w3.org/2000/svg';
								break;
							case 'math':
								domNamespace = 'http://www.w3.org/1998/Math/MathML';
								break;
						}
					}
				}
				if ( domNamespace ) {
					if ( is ) {
						templateNode = document.createElementNS( domNamespace, tag, is );
					} else {
						templateNode = document.createElementNS( domNamespace, tag );
					}
				} else {
					if ( is ) {
						templateNode = document.createElement( tag, is );
					} else {
						templateNode = document.createElement( tag );
					}
				}
				const attrs = schema.attrs;
				let dynamicAttrs = null;

				if ( !isVoid( attrs ) ) {
					if ( dynamicFlags.ATTRS === true ) {
						dynamicAttrs = attrs;
					} else if ( dynamicFlags.ATTRS !== false ) {
						dynamicAttrs = dynamicFlags.ATTRS;
						createStaticAttributes( schema, templateNode, dynamicAttrs );
					} else {
						createStaticAttributes( schema, templateNode );
					}
				}
				const children = schema.children;

				if ( !isVoid( text ) ) {
					if ( !isVoid( children ) ) {
						throw Error( 'Inferno Error: Template nodes cannot contain both TEXT and a CHILDREN properties, they must only use one or the other.' );
					}
					if ( dynamicFlags.TEXT === true ) {
						if ( isRoot ) {
							node = createRootNodeWithDynamicText( templateNode, text.index, dynamicAttrs );
						} else {
							node = createNodeWithDynamicText( templateNode, text.index, dynamicAttrs );
						}
					} else {
						if ( typeof text === 'string' || typeof text === 'number' ) {
							templateNode.textContent = text;
						} else {
							throw Error( 'Inferno Error: Template nodes with TEXT must only have a StringLiteral or NumericLiteral as a value, this is intended for low-level optimisation purposes.' );
						}
						if ( isRoot ) {
							node = createRootNodeWithStaticChild( templateNode, dynamicAttrs );
						} else {
							node = createNodeWithStaticChild( templateNode, dynamicAttrs );
						}
					}
				} else {
					if ( !isVoid( children ) ) {
						if ( children.type === ObjectTypes.VARIABLE ) {
							if ( isRoot ) {
								node = createRootNodeWithDynamicChild(
									templateNode, children.index, dynamicAttrs, domNamespace );
							} else {
								node = createNodeWithDynamicChild(
									templateNode, children.index, dynamicAttrs, domNamespace );
							}
						} else if ( dynamicFlags.CHILDREN === true ) {
							let subTreeForChildren = [];

							if ( isArray( children ) ) {
								for ( let i = 0; i < children.length; i++ ) {
									const childItem = children[i];

									subTreeForChildren.push( createDOMTree( childItem, false, dynamicNodeMap, domNamespace ) );
								}
							} else if ( typeof children === 'object' ) {
								subTreeForChildren = createDOMTree( children, false, dynamicNodeMap, domNamespace );
							}
							if ( isRoot ) {
								node = createRootNodeWithDynamicSubTreeForChildren(
									templateNode, subTreeForChildren, dynamicAttrs, domNamespace );
							} else {
								node = createNodeWithDynamicSubTreeForChildren(
									templateNode, subTreeForChildren, dynamicAttrs, domNamespace );
							}
						} else if ( typeof children === 'string' || typeof children === 'number' ) {
							templateNode.textContent = children;
							if ( isRoot ) {
								node = createRootNodeWithStaticChild( templateNode, dynamicAttrs );
							} else {
								node = createNodeWithStaticChild( templateNode, dynamicAttrs );
							}
						} else {
							const childNodeDynamicFlags = dynamicNodeMap.get( children );

							if ( !childNodeDynamicFlags ) {
								createStaticTreeChildren( children, templateNode, domNamespace );

								if ( isRoot ) {
									node = createRootNodeWithStaticChild( templateNode, dynamicAttrs );
								} else {
									node = createNodeWithStaticChild( templateNode, dynamicAttrs );
								}
							}
						}
					} else {
						if ( isRoot ) {
							node = createRootVoidNode( templateNode, dynamicAttrs );
						} else {
							node = createVoidNode( templateNode, dynamicAttrs );
						}
					}
				}
			} else if ( text ) {
				templateNode = document.createTextNode( '' );
				if ( isRoot ) {
					node = createRootDynamicTextNode( templateNode, text.index );
				} else {
					node = createDynamicTextNode( templateNode, text.index );
				}
			}
		}
	}
	return node;
}
