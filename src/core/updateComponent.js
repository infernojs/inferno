export default function updateComponent(component, nextProps) {
	const prevProps = component.props;
	const prevState = component.state;

	if(prevProps !== nextProps) {
		if(component._staticOpts) {
			nextProps = {
				...nextProps,
				children: component._staticOpts.staticChildren,
				...component._staticOpts.staticProps
			}
		}

		// TODO disable setState causing forceUpdates
		component.componentWillReceiveProps(nextProps);
		// TODO enable setState causing forceUpdates
		const nextState = component.state;
		const shouldUpdate = component.shouldComponentUpdate(nextProps, nextState);

		if(shouldUpdate) {
			// TODO disable setState
			component.componentWillUpdate(nextProps, nextState);
			// TODO enable setState
			component.props = nextProps;
			component.state = nextState;
			component.forceUpdate();
			component.componentDidUpdate(prevProps, prevState);
		}
	}
}
