import Component from 'inferno-component';
import createClass from 'inferno-create-class';
import inject from './inject';
import makeReactive from './makeReactive';
import { throwError } from '../shared';

/**
 * Wraps a component and provides stores as props
 */
function connect (arg1: any, arg2 = null): any {
	if (typeof arg1 === 'string') {
		throwError('Store names should be provided as array');
	}

	if (Array.isArray(arg1)) {
		// component needs stores
		if (!arg2) {
			// invoked as decorator
			return (componentClass) => connect(arg1, componentClass);
		} else {
			// TODO: deprecate this invocation style
			return inject.apply(null, arg1)(connect(arg2));
		}
	}
	const componentClass = arg1;

	// Stateless function component:
	// If it is function but doesn't seem to be a Inferno class constructor,
	// wrap it to a Inferno class automatically
	if (typeof componentClass === 'function'
		&& (!componentClass.prototype || !componentClass.prototype.render)
		&& !componentClass.isReactClass
		&& !Component.isPrototypeOf(componentClass)
	) {
		const newClass = createClass({
			displayName: componentClass.displayName || componentClass.name,
			propTypes: componentClass.propTypes,
			contextTypes: componentClass.contextTypes,
			getDefaultProps: () => componentClass.defaultProps,
			render() {
				return componentClass.call(this, this.props, this.context);
			}
		});

		return connect(newClass);
	}

	if (!componentClass) {
		throwError('Please pass a valid component to "connect"');
	}

	componentClass.isMobXReactObserver = true;
	return makeReactive(componentClass);
}

export default connect;
