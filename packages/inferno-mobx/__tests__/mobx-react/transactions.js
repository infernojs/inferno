import { render } from 'inferno';
import createClass from 'inferno-create-class';
import { t, mounter } from './_util';
import mobx from 'mobx';
import mobxReact from '../../dist-es';

describe('mobx-react-port Transactions', () => {
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

	it('mobx issue 50', (done) => {
		const testRoot = document.createElement('div');
		document.body.appendChild(testRoot);
		const foo = {
			a: mobx.observable(true),
			b: mobx.observable(false),
			c: mobx.computed(function () {
				console.log('evaluate c');
				return foo.b.get();
			})
		};
		function flipStuff() {
			mobx.transaction(() => {
				foo.a.set(!foo.a.get());
				foo.b.set(!foo.b.get());
			});
		}
		let asText = '';
		let willReactCount = 0;
		mobx.autorun(() => asText = [ foo.a.get(), foo.b.get(), foo.c.get() ].join(':'));
		const Test = mobxReact.observer(createClass({
			componentWillReact: () => willReactCount++,
			render: () => <div id='x'>{ [ foo.a.get(), foo.b.get(), foo.c.get() ].join(',') }</div>
		}));
		// In 3 seconds, flip a and b. This will change c.
		setTimeout(flipStuff, 20);

		setTimeout(() => {
			t.equal(asText, 'false:true:true');
			t.equal(document.getElementById('x').innerText, 'false,true,true');
			t.equal(willReactCount, 1);
			testRoot.parentNode.removeChild(testRoot);
			done();
		}, 40);

		render(<Test />, testRoot);
	});

	it('React.render should respect transaction', (done) => {
		const testRoot = document.createElement('div');
		document.body.appendChild(testRoot);
		const a = mobx.observable(2);
		const loaded = mobx.observable(false);
		const valuesSeen = [];

		const Component = mobxReact.observer(() => {
			valuesSeen.push(a.get());
			if (loaded.get())
				{return <div>{ a.get() }</div>;}
			else
				{return <div>loading</div>;}
		});

		render(<Component />, testRoot);
		mobx.transaction(() => {
			a.set(3);
			a.set(4);
			loaded.set(true);
		});

		setTimeout(() => {
			t.equal(testRoot.textContent.replace(/\s+/g,''), '4');
			t.deepEqual(valuesSeen, [ 2, 4 ]);
			testRoot.parentNode.removeChild(testRoot);
			done();
		}, 40);
	});

	it('React.render in transaction should succeed', (done) => {
		const testRoot = document.createElement('div');
		document.body.appendChild(testRoot);
		const a = mobx.observable(2);
		const loaded = mobx.observable(false);
		const valuesSeen = [];
		const Component = mobxReact.observer(() => {
			valuesSeen.push(a.get());
			if (loaded.get())
				{return <div>{ a.get() }</div>;}
			else
				{return <div>loading</div>;}
		});

		mobx.transaction(() => {
			a.set(3);
			render(<Component />, testRoot);
			a.set(4);
			loaded.set(true);
		});

		setTimeout(() => {
			t.equal(testRoot.textContent.replace(/\s+/g,''), '4');
			t.deepEqual(valuesSeen, [ 3, 4 ]);
			testRoot.parentNode.removeChild(testRoot);
			done();
		}, 40);
	});
});
