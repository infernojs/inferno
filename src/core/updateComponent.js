export default function updateComponent( component, prevState, nextState, prevProps, nextProps, renderCallback ) {
	if ( !nextProps.children ) {
		nextProps.children = prevProps.children;
	}

	if ( prevProps !== nextProps || prevState !== nextState ) {
		if ( prevProps !== nextProps ) {
			component._blockRender = true;
			component.componentWillReceiveProps( nextProps );
			component._blockRender = false;
		}
		const shouldUpdate = component.shouldComponentUpdate( nextProps, nextState );

		if ( shouldUpdate ) {
			component._blockSetState = true;
			component.componentWillUpdate( nextProps, nextState );
			component._blockSetState = false;
			component.props = nextProps;
			component.state = nextState;
			const newDomNode = renderCallback();

			component.componentDidUpdate( prevProps, prevState );
			return newDomNode;
		}
	}
}
