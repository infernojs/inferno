import { observable } from 'mobx';
import { expect } from 'chai';
import Provider from '../Provider';
import connect from '../connect';
import Component from 'inferno-component';
import Inferno, { render } from 'inferno';
Inferno; // suppress ts 'never used' error

describe('MobX Provider', () => {
	let container;

	beforeEach(() => {
		container = document.createElement('div') as HTMLElement;
		container.style.display = 'none';
		document.body.appendChild(container);
	});

	afterEach(() => {
		document.body.removeChild(container);
		render(null, container);
	});

	describe('updating state', () => {
		let stores: any = observable({
			store1: {
				data: 'one'
			},
			store2: {
				data: 'two'
			}
		});

		const Statefull = connect(['store1'], class extends Component<any, any> {
			render({ store1 }) {
				const update = () => store1.data = 'Statefull';

				return <article>
					<a id="update" onClick={update}>update</a>
					<span>{store1.data}</span>
				</article>;
			}
		});

		const Stateless = connect(() => {
			const update = () => stores.store1.data = 'Stateless';

			return <article>
				<a id="update" onClick={update}>update</a>
				<span>{stores.store1.data}</span>
			</article>;
		});

		const StatelessWithStores = connect(['store1'], props => {
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

			const link = container.querySelector('#update') as HTMLElement;
			link.click();

			expect(container.innerHTML).to.equal('<article><a id="update">update</a><span>Statefull</span></article>');
		});

		it('should update a stateless component', () => {
			render(<Provider store1={stores.store1}><Stateless/></Provider>, container);

			const link = container.querySelector('#update') as HTMLElement;
			link.click();

			expect(container.innerHTML).to.equal('<article><a id="update">update</a><span>Stateless</span></article>');
		});

		it('should update a stateless component with stores', () => {
			render(<Provider store1={stores.store1}><StatelessWithStores/></Provider>, container);

			const link = container.querySelector('#update') as HTMLElement;
			link.click();

			expect(container.innerHTML).to.equal('<article><a id="update">update</a><span>hello world</span></article>');
		});
	});

	describe('providing/updating stores', () => {
		let stores: any = observable({
			store1: {
				data: 'one'
			},
			store2: {
				data: 'two'
			}
		});

		it('should inherit stores from parent', () => {
			const InheritComponent = connect(['store1', 'store2'], props => {
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

			expect(container.innerHTML).to.equal('<div><span>one</span><span>two</span></div>');
		});

		// TODO: UNFINISHED
		// Commented out as travisCI does not honor skip syntax with all browsers
		/*
		it.skip('should warn if stores change', () => {

			const TestComponent = connect(['store1'], class extends Component<any, any> {
				componentDidMount() {
					stores = observable({
						newStore: 'newStore'
					});
				}
				render({ store1 }) {
					return <div>{store1.data}</div>;
				}
			});

			render(<Provider store1={stores.store1}>
				<TestComponent/>
			</Provider>, container);

			expect(container.innerHTML).to.equal('<div>one</div>');
		});
		*/
	});
});
