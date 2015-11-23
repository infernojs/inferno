export default function updateComponent(component, nextProps) {

	let prevProps = component.props;

	if(!nextProps.children) {
		nextProps.children = prevProps.children;
	}

	const prevState = component.state;

	if(prevProps !== nextProps) {
		component._blockSetState = true;
		component.componentWillReceiveProps(nextProps);
		component._blockSetState = false;

		const nextState = component.state;
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
