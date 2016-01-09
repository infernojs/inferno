/* eslint new-cap:0 */
import isVoid from '../../util/isVoid';
import { recycle } from '../recycling';
import { getValueWithIndex, getValueForProps } from '../../core/variables';
import recreateRootNode from '../recreateRootNode';
import updateComponent from '../../component/updateComponent';

export default function createRootNodeWithComponent( componentIndex, props, recyclingEnabled ) {
	let currentItem;
	let statelessRender;
	const node = {
		instance: null,
		pool: [],
		keyedPool: [],
		overrideItem: null,
		create( item, treeLifecycle, context ) {
			let instance = node.instance;
			let domNode;
			let toUseItem = item;

			if ( node.overrideItem !== null ) {
				toUseItem = node.overrideItem;
			}
			if ( recyclingEnabled ) {
				domNode = recycle( node, item, treeLifecycle, context );
				if ( domNode ) {
					return domNode;
				}
			}
			const Component = getValueWithIndex( toUseItem, componentIndex );

			currentItem = item;
			if ( isVoid( Component ) ) {
				// bad component, make a text node
				domNode = document.createTextNode( '' );
				item.rootNode = domNode;
				node.instance = null;
				return domNode;
			} else if ( typeof Component === 'function' ) {
				// stateless component
				if ( !Component.prototype.render ) {
					const nextRender = Component( getValueForProps( props, toUseItem ), context );

					nextRender.parent = item;
					domNode = nextRender.tree.dom.create( nextRender, treeLifecycle, context );
					statelessRender = nextRender;
					item.rootNode = domNode;
				} else {
					instance = node.instance = new Component( getValueForProps( props, toUseItem ) );
					instance.context = context;
					instance.componentWillMount();
					const nextRender = instance.render();
					const childContext = instance.getChildContext();
					let fragmentFirstChild;

					if ( childContext ) {
						context = { ...context, ...childContext };
					}
					nextRender.parent = item;
					domNode = nextRender.tree.dom.create( nextRender, treeLifecycle, context );
					item.rootNode = domNode;
					instance._lastRender = nextRender;

					if ( domNode instanceof DocumentFragment ) {
						fragmentFirstChild = domNode.childNodes[0];
					}
					treeLifecycle.addTreeSuccessListener( () => {
						if ( fragmentFirstChild ) {
							domNode = fragmentFirstChild.parentNode;
							item.rootNode = domNode;
						}
						instance.componentDidMount();
					} );
					instance.forceUpdate = () => {
						instance.context = context;
						const nextRender = instance.render.call( instance );
						const childContext = instance.getChildContext();

						if ( childContext ) {
							context = { ...context, ...childContext };
						}
						nextRender.parent = currentItem;
						nextRender.tree.dom.update( instance._lastRender, nextRender, treeLifecycle, context );
						currentItem.rootNode = nextRender.rootNode;
						instance._lastRender = nextRender;
					};
				}
			}
			return domNode;
		},
		update( lastItem, nextItem, treeLifecycle, context ) {
			const Component = getValueWithIndex( nextItem, componentIndex );
			let instance = node.instance;

			nextItem.id = lastItem.id;
			currentItem = nextItem;
			if ( !Component ) {
				recreateRootNode( lastItem, nextItem, node, treeLifecycle, context );
				return;
			}
			if ( typeof Component === 'function' ) {
				if ( !Component.prototype.render ) {
					const nextRender = Component( getValueForProps( props, nextItem ), context );

					nextRender.parent = currentItem;
					if ( !isVoid( statelessRender ) ) {
						const newDomNode = nextRender.tree.dom.update(statelessRender || node.instance._lastRender, nextRender, treeLifecycle, context);

						if ( newDomNode ) {
							if ( nextRender.rootNode.parentNode ) {
								nextRender.rootNode.parentNode.replaceChild( newDomNode, nextRender.rootNode );
							} else {
								lastItem.rootNode.parentNode.replaceChild( newDomNode, lastItem.rootNode );
							}
							currentItem.rootNode = newDomNode;
						} else {
							const newDomNode = nextRender.tree.dom.create( statelessRender, treeLifecycle, context );

							if ( newDomNode ) {
								if ( nextRender.rootNode.parentNode ) {
									nextRender.rootNode.parentNode.replaceChild(newDomNode, nextRender.rootNode );
								} else {
									lastItem.rootNode.parentNode.replaceChild(newDomNode, lastItem.rootNode );
								}
								currentItem.rootNode = newDomNode;
							} else {
								currentItem.rootNode = nextRender.rootNode;
							}
						}
					} else {
						recreateRootNode( lastItem, nextItem, node, treeLifecycle, context );
						return;
					}

					statelessRender = nextRender;
				} else {

					if ( !instance || node !== lastItem.tree.dom || Component !== instance.constructor ) {
						recreateRootNode( lastItem, nextItem, node, treeLifecycle, context );
						return;
					}
					const domNode = lastItem.rootNode;
					const prevProps = instance.props;
					const prevState = instance.state;
					const nextState = instance.state;
					const nextProps = getValueForProps( props, nextItem );

					nextItem.rootNode = domNode;
					updateComponent( instance, prevState, nextState, prevProps, nextProps, instance.forceUpdate );
				}
			}
		},
		remove( item, treeLifecycle ) {
			let instance = node.instance;

			if ( instance ) {
				instance._lastRender.tree.dom.remove( instance._lastRender, treeLifecycle );
				instance.componentWillUnmount();
				node.instance = null;
			}
		}
	};

	return node;
}
