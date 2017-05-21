import { render } from 'inferno';
import createClass from 'inferno-create-class';
import mobx from 'mobx';
import { mounter, t } from './_util';
import { observer } from '../../dist-es';

describe('mobx-react port: MISC', () => {
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

	it('custom shouldComponentUpdate is not respected for observable changes (#50)', () => {
		let called = 0;
		const x = mobx.observable(3);
		const C = observer(createClass({
			render: () => <div>value:{ x.get() }</div>,
			shouldComponentUpdate: () => called++
		}));
		const wrapper = mount(<C />);
		t.equal(wrapper.find('div').text(), 'value:3');
		t.equal(called, 0);
		// TODO: ForceUpdate should not call shouldComponentUpdate...
		x.set(42);
		t.equal(wrapper.find('div').text(), 'value:42');
		t.equal(called, 0);
		t.end();
	});

	it('custom shouldComponentUpdate is not respected for observable changes (#50) - 2', () => {
		// TODO: shouldComponentUpdate is meaningless with observable props...., just show warning in component definition?
		let called = 0;
		const y = mobx.observable(5);
		const C = observer(createClass({
			render() {
				return <div>value:{ this.props.y }</div>;
			},
			shouldComponentUpdate(nextProps) {
				called++;
				return nextProps.y !== 42;
			}
		}));
		const B = observer(createClass({
			render: () =>
				<span>
        <C y={ y.get() } />
      </span>
		}));
		const wrapper = mount(<B />);
		t.equal(wrapper.find('div').text(), 'value:5');
		t.equal(called, 0);

		y.set(6);
		t.equal(wrapper.find('div').text(), 'value:6');
		t.equal(called, 1);

		y.set(42);
		// t.equal(wrapper.find('div').text(), 'value:6'); // not updated! TODO: fix
		t.equal(called, 2);

		y.set(7);
		t.equal(wrapper.find('div').text(), 'value:7');
		t.equal(called, 3);

		t.end();
	});

	it('issue mobx 405', () => {
		function ExampleState() {
			mobx.extendObservable(this, {
				name: 'test',
				get greetings() {
					return 'Hello my name is ' + this.name;
				}
			});
		}

		const ExampleView = observer(createClass({
			render() {
				return (
					<div>
						<input
							type='text'
							onChange={ e => this.props.exampleState.name = e.target.value }
							value={ this.props.exampleState.name } />
						<span>{ this.props.exampleState.greetings }</span>
					</div>
				);
			}
		}));

		const exampleState = new ExampleState();
		const wrapper = mount(<ExampleView exampleState={ exampleState } />);
		t.equal(wrapper.find('span').text(), 'Hello my name is test');

		t.end();
	});

	it('#85 Should handle state changing in constructors', function () {
		const testRoot = document.createElement('div');
		document.body.appendChild(testRoot);
		const a = mobx.observable(2);
		const Child = observer(createClass({
			displayName: 'Child',
			getInitialState() {
				a.set(3); // one shouldn't do this!
				return {};
			},
			render: () => <div>child:{ a.get() } - </div>
		}));
		const ParentWrapper = observer(function Parent() {
			return <span><Child />parent:{ a.get() }</span>;
		});
		render(<ParentWrapper />, testRoot);

		t.equal(testRoot.getElementsByTagName('span')[0].textContent, 'child:3 - parent:3');
		a.set(5);
		t.equal(testRoot.getElementsByTagName('span')[0].textContent, 'child:5 - parent:5');
		a.set(7);
		t.equal(testRoot.getElementsByTagName('span')[0].textContent, 'child:7 - parent:7');
		testRoot.parentNode.removeChild(testRoot);
		t.end();
	});
});
