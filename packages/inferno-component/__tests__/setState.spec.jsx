import { expect } from 'chai';
import { render } from 'inferno';
import Component from '../dist-es';

describe('setState', () => {
	let container;

	beforeEach(function () {
		container = document.createElement('div');
	});

	afterEach(function () {
		container.innerHTML = '';
	});

	it('callback should be fired after state has changed', (done) => {

		class TestComponent extends Component {
			constructor(props) {
				super(props);
				this.state = {
					value: props.value
				};
				this.checkSetState = this.checkSetState.bind(this);
			}

			checkSetState() {
				const value = this.state.value;
				expect(value).to.equal('__NEWVALUE__');
				setTimeout(function () {
					done();
				}, 100);
			}

			componentWillReceiveProps(nextProps) {
				this.setState(
					{
						value: nextProps.value
					},
					this.checkSetState
				);
			}

			render() {
				return null;
			}
		}

		class BaseComp extends Component {
			state = {
				value: '__OLDVALUE__'
			};

			componentDidMount() {
				this.setState({
					value: '__NEWVALUE__'
				});
			}

			render() {
				const value = this.state.value;
				return <TestComponent value={value}/>;
			}
		}

		render(<BaseComp />, container);
	});

	it('Should not fail if componentDidUpdate is not defined', (done) => {

		class TestComponent extends Component {
			constructor(props) {
				super(props);
				this.state = {
					value: props.value
				};
				this.checkSetState = this.checkSetState.bind(this);
			}

			checkSetState() {
				const value = this.state.value;
				expect(value).to.equal('__NEWVALUE__');
				setTimeout(function () {
					done();
				}, 100);
			}

			componentWillReceiveProps(nextProps) {
				this.setState(
					{
						value: nextProps.value
					},
					this.checkSetState
				);
			}

			render() {
				return null;
			}
		}

		class BaseComp extends Component {
			state = {
				value: '__OLDVALUE__'
			};

			componentDidMount() {
				this.setState({
					value: '__NEWVALUE__'
				});
			}

			render() {
				const value = this.state.value;
				return <TestComponent value={value}/>;
			}
		}

		render(<BaseComp />, container);
	});


	// Should work as Per react: https://jsfiddle.net/f12u8xzb/
	// React does not get stuck
	it('Should not get stuck in infinite loop #1', (done) => {
		let doSomething;

		class Parent extends Component {
			constructor(props, context) {
				super(props, context);

				this.state = {
					active: false,
					foo: 'b'
				};

				this._setBar = this._setBar.bind(this);
				doSomething = this._setActive = this._setActive.bind(this);
			}

			_setBar() {
				this.setState({
					foo: 'bar'
				});
			}

			_setActive() {
				this.setState({
					active: true
				});
			}

			render() {
				return (
					<div>
						<div>{this.state.foo}</div>
						{
							this.state.active ? (
								<Child foo={this.state.foo} callback={this._setBar}/>
							) : <Child foo={this.state.foo} callback={this._setActive}/>
						}
					</div>
				);
			}
		}

		class Child extends Component {
			constructor(props, context) {
				super(props, context);
			}

			componentWillUpdate(nextProps) {
				if (nextProps.foo !== 'bar') {
					this.props.callback();
				}
			}

			render() {
				return (
					<div>
						<div>{this.props.foo}</div>
					</div>
				);
			}
		}

		render(<Parent />, container);
		doSomething();

		setTimeout(function () {
			done();
		}, 45);
	});

	// Render should work as per React
	// https://jsfiddle.net/qb4ootgm/
	it('Should not fail during rendering', (done) => {
		let doSomething;

		class Parent extends Component {
			constructor(props, context) {
				super(props, context);

				this.state = {
					active: false,
					foo: 'b'
				};

				this._setBar = this._setBar.bind(this);
				doSomething = this._setActive = this._setActive.bind(this);
			}

			_setBar() {
				this.setState({
					foo: 'bar'
				});
			}

			_setActive() {
				this.setState({
					active: true
				});
			}

			render() {
				return (
					<div>
						<div>{this.state.foo}</div>
						<Child foo={this.state.foo} callback={this._setBar}/>
						<Child foo={this.state.foo} callback={this._setBar}/>
						<Child foo={this.state.foo} callback={this._setBar}/>
					</div>
				);
			}
		}

		class Child extends Component {
			constructor(props, context) {
				super(props, context);
			}

			componentWillReceiveProps(nextProps) {
				if (nextProps.foo !== 'bar') {
					this.setState({
						foo: 'bbaarr'
					});

					this.props.callback();
				}
			}

			render() {
				return (
					<div>
						<div>{this.props.foo}</div>
					</div>
				);
			}
		}

		render(<Parent />, container);
		doSomething();

		setTimeout(function () {
			done();
		}, 45);
	});

	it('Should not fail during rendering #2', (done) => {
		let doSomething;

		class Parent extends Component {
			constructor(props, context) {
				super(props, context);

				this.state = {
					active: false,
					foo: 'b'
				};

				this._setBar = this._setBar.bind(this);
				doSomething = this._setActive = this._setActive.bind(this);
			}

			_setBar() {
				this.setState({
					foo: 'bar'
				});
			}

			_setActive() {
				this.setState({
					active: true
				});
			}

			render() {
				return (
					<div>
						<Child foo={this.state.foo} callback={this._setActive}/>
						<ChildBar foo={this.state.foo} onComponentWillMount={this._setBar}/>
						<ChildBar foo={this.state.foo}/>
					</div>
				);
			}
		}

		function ChildBar({ foo }) {
			return (
				<div>
					{foo}
				</div>
			);
		}

		class Child extends Component {
			constructor(props, context) {
				super(props, context);
			}

			componentWillReceiveProps(nextProps) {
				if (nextProps.foo !== 'bar') {
					this.setState({
						foo: 'bbaarr'
					});

					this.props.callback();
				}
			}

			render() {
				return (
					<div>
						<div>{this.props.foo}</div>
					</div>
				);
			}
		}

		render(<Parent />, container);
		doSomething();

		setTimeout(function () {
			done();
		}, 45);
	});

	it('Should have new state in render when changing state during componentWillReceiveProps', (done) => {
		let changeFoo;

		class Parent extends Component {
			constructor(props, context) {
				super(props, context);

				this.state = {
					foo: 'bar'
				};

				changeFoo = this.changeFoo.bind(this);
			}

			changeFoo() {
				this.setState({
					foo: 'bar2'
				});
			}

			render() {
				return (
					<div>
						<Child foo={this.state.foo} />
					</div>
				);
			}
		}

		class Child extends Component {
			constructor(props, context) {
				super(props, context);

				this.state = {
					foo: props.foo
				};
			}

			callback() {
				expect(container.firstChild.firstChild.innerHTML).to.equal('bar2');
				done();
			}

			componentWillReceiveProps(nextProps) {
				if (nextProps.foo !== this.state.foo) {
					this.setState({
						foo: nextProps.foo
					}, this.callback);
				}
			}

			render() {
				return (
					<div>{this.state.foo}</div>
				);
			}
		}

		render(<Parent />, container);

		expect(container.firstChild.firstChild.innerHTML).to.equal('bar');

		changeFoo();
	});

	it('Should have new state in render when changing state during componentWillMount and render only once', () => {
		let changeFoo;
		const spy = sinon.spy();

		class Parent extends Component {
			constructor(props, context) {
				super(props, context);

				this.state = {
					foo: 'bar'
				};
			}

			render() {
				return (
					<div>
						<Child foo={this.state.foo} />
					</div>
				);
			}
		}

		let renderCount = 0;
		class Child extends Component {
			constructor(props, context) {
				super(props, context);

				this.state = {
					foo: props.foo
				};
			}

			componentWillMount() {
				this.setState({
					foo: '1'
				}, spy);
				this.setState({
					foo: '2'
				}, spy);

				this.setState({
					foo: '3'
				}, spy);

				this.setState({
					foo: '3'
				}, spy);

				this.setState({
					foo: '4'
				}, spy);
			}

			render() {
				renderCount++;
				return (
					<div>{this.state.foo}</div>
				);
			}
		}

		render(<Parent />, container);

		expect(container.firstChild.firstChild.innerHTML).to.equal('4');
		expect(spy.callCount).to.equal(5);
		expect(renderCount).to.equal(1);
	});

	// Should work as Per react: https://jsfiddle.net/f12u8xzb/
	// React does not get stuck
	it('Should not get stuck in infinite loop #1 sync', (done) => {
		let doSomething;

		class Parent extends Component {
			constructor(props, context) {
				super(props, context);

				this.state = {
					active: false,
					foo: 'b'
				};

				this._setBar = this._setBar.bind(this);
				doSomething = this._setActive = this._setActive.bind(this);
			}

			_setBar() {
				this.setStateSync({
					foo: 'bar'
				});
			}

			_setActive() {
				this.setStateSync({
					active: true
				});
			}

			render() {
				return (
					<div>
						<div>{this.state.foo}</div>
						{
							this.state.active ? (
								<Child foo={this.state.foo} callback={this._setBar}/>
							) : <Child foo={this.state.foo} callback={this._setActive}/>
						}
					</div>
				);
			}
		}

		class Child extends Component {
			constructor(props, context) {
				super(props, context);
			}

			componentWillUpdate(nextProps) {
				if (nextProps.foo !== 'bar') {
					this.props.callback();
				}
			}

			render() {
				return (
					<div>
						<div>{this.props.foo}</div>
					</div>
				);
			}
		}

		render(<Parent />, container);
		doSomething();

		setTimeout(function () {
			done();
		}, 45);
	});

	// Render should work as per React
	// https://jsfiddle.net/qb4ootgm/
	it('Should not fail during rendering sync', (done) => {
		let doSomething;

		class Parent extends Component {
			constructor(props, context) {
				super(props, context);

				this.state = {
					active: false,
					foo: 'b'
				};

				this._setBar = this._setBar.bind(this);
				doSomething = this._setActive = this._setActive.bind(this);
			}

			_setBar() {
				this.setStateSync({
					foo: 'bar'
				});
			}

			_setActive() {
				this.setStateSync({
					active: true
				});
			}

			render() {
				return (
					<div>
						<div>{this.state.foo}</div>
						<Child foo={this.state.foo} callback={this._setBar}/>
						<Child foo={this.state.foo} callback={this._setBar}/>
						<Child foo={this.state.foo} callback={this._setBar}/>
					</div>
				);
			}
		}

		class Child extends Component {
			constructor(props, context) {
				super(props, context);
			}

			componentWillReceiveProps(nextProps) {
				if (nextProps.foo !== 'bar') {
					this.setStateSync({
						foo: 'bbaarr'
					});

					this.props.callback();
				}
			}

			render() {
				return (
					<div>
						<div>{this.props.foo}</div>
					</div>
				);
			}
		}

		render(<Parent />, container);
		doSomething();

		setTimeout(function () {
			done();
		}, 45);
	});
});
