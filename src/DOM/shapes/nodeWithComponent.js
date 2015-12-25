/* eslint new-cap:0 */
import isVoid from '../../util/isVoid';
import { getValueWithIndex, getValueForProps, getCorrectItemForValues } from '../../core/variables';
import recreateNode from '../recreateNode';
import updateComponent from '../../core/updateComponent';

export default function createNodeWithComponent( componentIndex, props ) {
	let instance;
	let lastRender;
	let domNode;
	let currentItem;
	const node = {
		create( item, treeLifecycle, context ) {
			const valueItem = getCorrectItemForValues( node, item );
			const Component = getValueWithIndex( valueItem, componentIndex );

			currentItem = item;
			if ( isVoid( Component ) ) {
				domNode = document.createTextNode( '' );
				return domNode;
			} else if ( typeof Component === 'function' ) {
				// stateless component
				if ( !Component.prototype.render ) {
					const nextRender = Component( getValueForProps( props, valueItem ), context );

					nextRender.parent = item;
					domNode = nextRender.domTree.create( nextRender, treeLifecycle, context );
					lastRender = nextRender;
				} else {
					instance = new Component( getValueForProps( props, valueItem ) );
					instance.context = context;
					instance.componentWillMount();
					const nextRender = instance.render();
					const childContext = instance.getChildContext();

					if ( childContext ) {
						context = { ...context, ...childContext };
					}
					nextRender.parent = item;
					domNode = nextRender.domTree.create( nextRender, treeLifecycle, context );
					lastRender = nextRender;
					treeLifecycle.addTreeSuccessListener( instance.componentDidMount );
					instance.forceUpdate = () => {
						instance.context = context;
						const nextRender = instance.render();
						const childContext = instance.getChildContext();

						if ( childContext ) {
							context = { ...context, ...childContext };
						}
						nextRender.parent = currentItem;
						const newDomNode = nextRender.domTree.update( lastRender, nextRender, treeLifecycle, context );

						if ( newDomNode ) {
							domNode = newDomNode;
							lastRender.rootNode = domNode;
							lastRender = nextRender;
							return domNode;
						} else {
							lastRender = nextRender;
						}
					};
				}
			}
			return domNode;
		},
		update( lastItem, nextItem, treeLifecycle, context ) {
			const Component = getValueWithIndex( nextItem, componentIndex );

			currentItem = nextItem;
			if ( !Component ) {
				recreateNode( domNode, nextItem, node, treeLifecycle, context );
				lastRender.rootNode = domNode;
				return domNode;
			}
			if ( typeof Component === 'function' ) {
				// stateless component
				if ( !Component.prototype.render ) {
					const nextRender = Component( getValueForProps( props, nextItem ), context );

					nextRender.parent = currentItem;
					const newDomNode = nextRender.domTree.update( lastRender, nextRender, treeLifecycle, context );

					if ( newDomNode ) {
						domNode = newDomNode;
						lastRender.rootNode = domNode;
						lastRender = nextRender;
						return domNode;
					} else {
						lastRender = nextRender;
					}
				} else {
					if ( !instance || Component !== instance.constructor ) {
						recreateNode( domNode, nextItem, node, treeLifecycle, context );
						return domNode;
					}
					const prevProps = instance.props;
					const prevState = instance.state;
					const nextState = instance.state;
					const nextProps = getValueForProps( props, nextItem );

					return updateComponent( instance, prevState, nextState, prevProps, nextProps, instance.forceUpdate );
				}
			}
		},
		remove( item, treeLifecycle ) {
			if ( instance ) {
				lastRender.domTree.remove( lastRender, treeLifecycle );
				instance.componentWillUnmount();
			}
		}
	};

	return node;
}
