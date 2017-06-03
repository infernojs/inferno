
import { render } from 'inferno';
import Component from 'inferno-component';
import mobx from 'mobx';
import { innerHTML } from 'inferno/test/utils';
import { observer, Provider } from '../dist-es';

describe('old - MobX Provider', () => {
	let container;

	beforeEach(function () {
		container = document.createElement('div');
		container.style.display = 'none';
		document.body.appendChild(container);
	});

	afterEach(function () {
		render(null, container);
		document.body.removeChild(container);
	});

	describe('updating state', () => {
		const stores = mobx.observable({
			store1: {
				data: 'one'
			},
			store2: {
				data: 'two'
			}
		});

		const Statefull = observer(['store1'], class extends Component {
			render({ store1 }) {
				// eslint-disable-next-line
				const update = () => store1.data = 'Statefull';

				return <article>
					<a id="update" onClick={update}>update</a>
					<span>{store1.data}</span>
				</article>;
			}
		});

		const Stateless = observer(() => {
			// eslint-disable-next-line
			const update = () => stores.store1.data = 'Stateless';

			return <article>
				<a id="update" onClick={update}>update</a>
				<span>{stores.store1.data}</span>
			</article>;
		});

		const StatelessWithStores = observer(['store1'], (props) => {
			// eslint-disable-next-line
			const update = () => props.store1.data = 'hello world';

			return <article>
				<a id="update" onClick={update}>update</a>
				<span>{props.store1.data}</span>
			</article>;
		});

		it('should render a component', () => {
			expect(() => render(<Provider store1={stores.store1}>
				<Statefull/>
			</Provider>, container)).to.not.throw(Error);
		});

		it('should update a statefull component', () => {
			render(<Provider store1={stores.store1}><Statefull/></Provider>, container);

			const link = container.querySelector('#update');
			link.click();

			expect(container.innerHTML).to.equal(innerHTML('<article><a id="update">update</a><span>Statefull</span></article>'));
		});

		it('should update a stateless component', () => {
			render(<Provider store1={stores.store1}><Stateless/></Provider>, container);

			const link = container.querySelector('#update');
			link.click();

			expect(container.innerHTML).to.equal(innerHTML('<article><a id="update">update</a><span>Stateless</span></article>'));
		});

		it('should update a stateless component with stores', () => {
			render(<Provider store1={stores.store1}><StatelessWithStores/></Provider>, container);

			const link = container.querySelector('#update');
			link.click();

			expect(container.innerHTML).to.equal(innerHTML('<article><a id="update">update</a><span>hello world</span></article>'));
		});
	});

	describe('providing/updating stores', () => {
		const stores = mobx.observable({
			store1: {
				data: 'one'
			},
			store2: {
				data: 'two'
			}
		});

		it('should inherit stores from parent', () => {
			const InheritComponent = observer([ 'store1', 'store2' ], (props) => {
				return <div>
					<span>{props.store1.data}</span>
					<span>{props.store2.data}</span>
				</div>;
			});

			render(<Provider store2={stores.store2}>
				<Provider store1={stores.store1}>
					<InheritComponent/>
				</Provider>
			</Provider>, container);

			expect(container.innerHTML).to.equal(innerHTML('<div><span>one</span><span>two</span></div>'));
		});
	});
});
