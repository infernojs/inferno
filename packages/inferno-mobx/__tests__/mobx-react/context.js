import { render } from 'inferno';
import mobx from 'mobx';
import { observer, Provider } from './../../dist-es';
import { mounter, t } from './_util';
import createClass from 'inferno-create-class';

describe('observer based context', () => {
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

	// it('using observer to inject throws warning', () => {
	// 	const w = console.warn;
	// 	const warns = [];
	//
	// 	console.warn = msg => warns.push(msg);
	//
	// 	observer(['test'], createClass({
	// 		render: () => null
	// 	}));
	//
	// 	expect(warns.length).to.equal(1);
	// 	expect(warns[0]).to.equal('Mobx observer: Using observer to inject stores is deprecated since 4.0. Use `@inject("store1", "store2") @observer ComponentClass` or `inject("store1", "store2")(observer(componentClass))` instead of `@observer(["store1", "store2"]) ComponentClass`');
	//
	// 	console.warn = w;
	// });

	it('basic context', () => {
		const C = observer(['foo'], createClass({
			render() {
				return <div>context:{ this.props.foo }</div>;
			}
		}));
		const B = () => <C />;
		const A = () =>
      <Provider foo='bar'>
        <B />
      </Provider>;
		mount(<A />);
		expect(container.querySelector('div').innerHTML).to.equal('context:bar');
	});

	it('props override context', () => {
		const C = observer(['foo'], createClass({
			render() {
				return <div>context:{ this.props.foo }</div>;
			}
		}));
		const B = () => <C foo={42} />;
		const A = () =>
      <Provider foo='bar'>
        <B />
      </Provider>;
		mount(<A />);
		expect(container.querySelector('div').innerHTML).to.equal('context:42');
	});

	it('overriding stores is supported', () => {
		const C = observer([ 'foo', 'bar' ], createClass({
			render() {
				return <div>context:{ this.props.foo }{ this.props.bar }</div>;
			}
		}));
		const B = () => <C />;
		const A = () =>
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
      </Provider>;
		const wrapper = mount(<A />);
		expect(wrapper.find('span').text()).to.equal('context:bar1337');
		expect(wrapper.find('section').text()).to.equal('context:421337');
	});

	it('store should be available', () => {
		const C = observer(['foo'], createClass({
			render() {
				return <div>context:{ this.props.foo }</div>;
			}
		}));
		const B = () => <C />;
		const A = () =>
      <Provider baz={ 42 }>
        <B />
      </Provider>;
		expect(() => mount(<A />)).to.throw(Error);
	});

	it('store is not required if prop is available', () => {
		const C = observer(['foo'], createClass({
			render() {
				return <div>context:{ this.props.foo }</div>;
			}
		}));
		const B = () => <C foo='bar' />;
		const wrapper = mount(<B />);
		t.equal(wrapper.find('div').text(), 'context:bar');
		t.end();
	});

	it('warning is printed when changing stores', () => {
		let msg = null;
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
          <span>{ a.get() }</span>,
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

	it('warning is not printed when changing stores, but suppressed explicitly', () => {
		let msg = null;
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
          <span>{ a.get() }</span>,
          <Provider foo={ a.get() } suppressChangedStoreWarning >
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
		t.equal(msg, null);
		console.warn = baseWarn;
		t.end();
	});
});
