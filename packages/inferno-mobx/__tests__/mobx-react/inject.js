import { render } from 'inferno';
import { default as InfernoComponent } from 'inferno-component';
import { mounter, t } from './_util';
import mobx, { action, observable, computed } from 'mobx';
import { observer, inject, Provider } from '../../dist-es';
import createClass from 'inferno-create-class';

describe('react-mobx port: inject based context', () => {
	let container = null,
		mount = null;

	beforeEach(function () {
		container = document.createElement('div');
		container.style.display = 'none';
		mount = mounter.bind(container);
		document.body.appendChild(container);
	});

	afterEach(function () {
		render(null, container);
		document.body.removeChild(container);
	});

	it('basic context', () => {
		const C = inject('foo')(observer(createClass({
			render() {
				return <div>context:{ this.props.foo }</div>;
			}
		})));
		const B = () => <C />;
		const A = () =>
			<Provider foo='bar'>
				<B />
			</Provider>;
		const wrapper = mount(<A />);
		t.equal(wrapper.find('div').text(), 'context:bar');
		t.end();
	});

	it('props override context', () => {
		const C = inject('foo')(createClass({
			render() {
				return <div>context:{ this.props.foo }</div>;
			}
		}));
		const B = () => <C foo={ 42 } />;
		const A = createClass({
			render: () =>
				<Provider foo='bar'>
					<B />
				</Provider>
		});
		const wrapper = mount(<A />);
		t.equal(wrapper.find('div').text(), 'context:42');
		t.end();
	});

	it('overriding stores is supported', () => {
		const C = inject('foo', 'bar')(observer(createClass({
			render() {
				return <div>context:{ this.props.foo }{ this.props.bar }</div>;
			}
		})));
		const B = () => <C />;
		const A = createClass({
			render: () =>
				<Provider foo='bar' bar={1337}>
					<div>
						<span>
							<B />
						</span>
						<section>
							<Provider foo={42}>
								<B />
							</Provider>
						</section>
					</div>
				</Provider>
		});
		const wrapper = mount(<A />);
		t.equal(wrapper.find('span').text(), 'context:bar1337');
		t.equal(wrapper.find('section').text(), 'context:421337');
		t.end();
	});

	it('store should be available', () => {
		const C = inject('foo')(observer(createClass({
			render() {
				return <div>context:{ this.props.foo }</div>;
			}
		})));
		const B = () => <C />;
		const A = createClass({
			render: () =>
				<Provider baz={42}>
					<B />
				</Provider>
		});
		t.throws(() => mount(<A />), /Store 'foo' is not available! Make sure it is provided by some Provider/);
		t.end();
	});

	it('store is not required if prop is available', () => {
		const C = inject('foo')(observer(createClass({
			render() {
				return <div>context:{ this.props.foo }</div>;
			}
		})));
		const B = () => <C foo='bar'/>;
		const wrapper = mount(<B />);
		t.equal(wrapper.find('div').text(), 'context:bar');
		t.end();
	});

	it('inject merges (and overrides) props', () => {
		// t.plan(1);
		const C = inject(() => ({ a: 1 }))(observer(createClass({
			render() {
				t.deepEqual(this.props, { a: 1, b: 2 });
				return null;
			}
		})));
		const B = () => <C a={ 2 } b={ 2 } />;
		mount(<B />);
	});

	it('warning is printed when changing stores', () => {
		let msg;
		const baseWarn = console.warn;
		console.warn = m => msg = m;
		const a = mobx.observable(3);
		const C = observer(['foo'], createClass({
			render() {
				return <div>context:{ this.props.foo }</div>;
			}
		}));
		const B = observer(createClass({
			render: () => <C />
		}));
		const A = observer(createClass({
			render: () =>
				<section>
					<span>
						{ a.get() }
					</span>
					<Provider foo={ a.get() }>
						<B />
					</Provider>
				</section>
		}));
		const wrapper = mount(<A />);

		t.equal(wrapper.find('span').text(), '3');
		t.equal(wrapper.find('div').text(), 'context:3');

		a.set(42);

		t.equal(wrapper.find('span').text(), '42');
		t.equal(wrapper.find('div').text(), 'context:3');

		t.equal(msg, 'MobX Provider: Provided store "foo" has changed. Please avoid replacing stores as the change might not propagate to all children');
		console.warn = baseWarn;
		t.end();
	});

	it('custom storesToProps', () => {
		const C = inject((stores, props, context) => {
			t.deepEqual(context, { mobxStores: { foo: 'bar' } });
			t.deepEqual(stores, { foo: 'bar' });
			t.deepEqual(props, { baz: 42 });
			return {
				zoom: stores.foo,
				baz: props.baz * 2
			};
		})(observer(createClass({
			render() {
				return <div>context:{ this.props.zoom }{ this.props.baz }</div>;
			}
		})));
		const B = createClass({
			render: () => <C baz={ 42 } />
		});
		const A = () =>
			<Provider foo='bar'>
				<B />
			</Provider>;
		const wrapper = mount(<A/>);
		t.equal(wrapper.find('div').text(), 'context:bar84');
		t.end();
	});

	it('support static hoisting, wrappedComponent and wrappedInstance', () => {
		const B = createClass({
			render() {
				this.testField = 1;
				return null;
			}
			// propTypes: {
			// 	x: PropTypes.object
			// }
		});
		B.bla = 17;
		B.bla2 = {};
		const C = inject('booh')(B);

		t.equal(C.wrappedComponent, B);
		t.equal(B.bla, 17);
		t.equal(C.bla, 17);
		t.equal(C.bla2, B.bla2);
		// t.deepEqual(Object.keys(C.wrappedComponent.propTypes), ['x']);

		const injector = render(<C booh={ 42 } />, container);
		t.equal(injector.wrappedInstance.testField, 1);
		t.end();
	});

	it('warning is printed when attaching contextTypes to HOC', () => {
		// const msg = [];
		// const baseWarn = console.warn;
		// console.warn = m => msg.push(m);
		const C = inject(['foo'])(createClass({
			displayName: 'C',
			render() {
				return <div>context:{ this.props.foo }</div>;
			}
		}));
		// C.propTypes = {};
		C.defaultProps = {};
		// C.contextTypes = {};

		const B = () => <C />;
		const A = () =>
			<Provider foo='bar'>
				<B />
			</Provider>;
		mount(<A />);
		// t.equal(msg.length, 1);
		// t.equal(msg[0], 'Mobx Injector: you are trying to attach `contextTypes` on an component decorated with `inject` (or `observer`) HOC. Please specify the contextTypes on the wrapped component instead. It is accessible through the `wrappedComponent`');
		// console.warn = baseWarn;
		t.end();
	});

	it('propTypes and defaultProps are forwarded', () => {
		const msg = [];
		const baseError = console.error;
		// console.error = m => msg.push(m);

		const C = inject(['foo'])(createClass({
			displayName: 'C',
			render() {
				t.equal(this.props.y, 3);
				t.equal(this.props.x, undefined);
				return null;
			}
		}));
		// C.propTypes = {
		// 	x: PropTypes.func.isRequired,
		// 	z: PropTypes.string.isRequired
		// };
		// C.wrappedComponent.propTypes = {
		// 	a: PropTypes.func.isRequired
		// };
		C.defaultProps = {
			y: 3
		};
		const B = () => <C z='test' />;
		const A = () =>
			<Provider foo='bar'>
				<B />
			</Provider>;
		mount(<A />);
		// t.equal(msg.length, 2);
		// t.equal(msg[0].split('\n')[0], 'Warning: Failed prop type: The prop `x` is marked as required in `inject-C-with-foo`, but its value is `undefined`.');
		// t.equal(msg[1].split('\n')[0], 'Warning: Failed prop type: The prop `a` is marked as required in `C`, but its value is `undefined`.');
		// console.error = baseError;
		t.end();
	});

	it('warning is not printed when attaching propTypes to injected component', () => {
		// let msg = [];
		// const baseWarn = console.warn;
		// console.warn = m => msg = m;

		const C = inject(['foo'])(createClass({
			displayName: 'C',
			render: () => <div>context:{ this.props.foo }</div>
		}));
		// C.propTypes = {};
		//
		// t.equal(msg.length, 0);
		// console.warn = baseWarn;
		t.end();
	});

	it('warning is not printed when attaching propTypes to wrappedComponent', () => {
		// let msg = [];
		// const baseWarn = console.warn;
		// console.warn = m => msg = m;
		const C = inject(['foo'])(createClass({
			displayName: 'C',
			render: () => <div>context:{ this.props.foo }</div>
		}));
		// C.wrappedComponent.propTypes = {};

		// t.equal(msg.length, 0);
		// console.warn = baseWarn;
		t.end();
	});

	it('using a custom injector is reactive', () => {
		const user = mobx.observable({ name: 'Noa' });
		const mapper = stores => ({ name: stores.user.name });
		const DisplayName = props => <h1>{ props.name }</h1>;
		const User = inject(mapper)(DisplayName);
		const App = () =>
			<Provider user={ user }>
				<User />
			</Provider>;
		const wrapper = mount(<App />);

		t.equal(wrapper.find('h1').text(), 'Noa');

		user.name = 'Veria';
		t.equal(wrapper.find('h1').text(), 'Veria');
		t.end();
	});

	it('using a custom injector is not too reactive', (done) => {
		const testRoot = document.createElement('div');
		document.body.appendChild(testRoot);

		let listRender = 0;
		let itemRender = 0;
		let injectRender = 0;

		function connect() {
			return (component) => inject.apply(this, arguments)(observer(component));
		}

		class State {
			@observable highlighted = null;
			isHighlighted(item) {
				return this.highlighted === item;
			}

			@action highlight = (item) => {
				this.highlighted = item;
			}
		}

		const items = observable([
			{ title: 'ItemA' },
			{ title: 'ItemB' },
			{ title: 'ItemC' },
			{ title: 'ItemD' },
			{ title: 'ItemE' },
			{ title: 'ItemF' }
		]);

		const state = new State();

		class ListComponent extends InfernoComponent {

			render() {
				listRender++;
				const { items } = this.props;

				return <ul>{
					items.map((item) => <ItemComponent key={item.title} item={item}/>)
				}</ul>;
			}
		}

		@connect(({ state }, { item }) => {
			injectRender++;
			if (injectRender > 6) {
								// debugger;
			}
			return ({
								// Using
								// highlighted: expr(() => state.isHighlighted(item)) // seems to fix the problem
				highlighted: state.isHighlighted(item),
				highlight: state.highlight
			});
		})
		class ItemComponent extends InfernoComponent {
			highlight = () => {
				const { item, highlight } = this.props;
				highlight(item);
			}

			render() {
				itemRender++;
				const { highlighted, item } = this.props;
				return <li className={'hl_' + item.title} onClick={this.highlight}>{ item.title } { highlighted ? '(highlighted)' : '' } </li>;
			}
		}
		render(
			<Provider state={state}>
				<ListComponent items={items}/>
			</Provider>,
			testRoot, () => {
				t.equal(listRender, 1);
				t.equal(injectRender, 6);
				t.equal(itemRender, 6);

				testRoot.querySelectorAll('.hl_ItemB').forEach(e => e.click());

				setTimeout(() => {
					t.equal(listRender, 1);
					t.equal(injectRender, 12); // ideally, 7
					t.equal(itemRender, 7);

					testRoot.querySelectorAll('.hl_ItemF').forEach(e => e.click());
					setTimeout(() => {
						t.equal(listRender, 1);
						t.equal(injectRender, 18); // ideally, 9
						t.equal(itemRender, 9);

						testRoot.parentNode.removeChild(testRoot);
						done();
					}, 20);
				}, 20);
			}
		);
	});

	t.end();
});
