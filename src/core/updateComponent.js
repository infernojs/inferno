export default function updateComponent(component, nextProps, nextState = component.state) {
	const prevProps = component.props;
	const prevState = component.state;

	if(!nextProps.children) {
		nextProps.children = prevProps.children;
	}

	if(prevProps !== nextProps || prevState !== nextState) {
		if(prevProps !== nextProps) {
			component._blockSetState = true;
			component.componentWillReceiveProps(nextProps);
			component._blockSetState = false;
		}
		const shouldUpdate = component.shouldComponentUpdate(nextProps, nextState);

		if(shouldUpdate) {
			component._deferSetState = true;
			component.componentWillUpdate(nextProps, nextState);
			component._deferSetState = false;
			component.props = nextProps;
			component.state = nextState;
			component.forceUpdate();
			component.componentDidUpdate(prevProps, prevState);
		}
	}
}
