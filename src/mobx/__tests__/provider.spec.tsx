import { observable } from 'mobx';
import { expect } from 'chai';

import Provider from '../Provider';
import connect from '../connect';
import { render } from './../../DOM/rendering';
import Component from './../../component/es2015';
import { createStaticVElement, createOptBlueprint, createVComponent, createOptVElement } from './../../core/shapes';
import { ChildrenTypes, ValueTypes, NodeTypes } from './../../core/constants';

const Inferno = {
	createOptVElement,
	createStaticVElement,
	createOptBlueprint,
	createVComponent,
	ChildrenTypes,
	ValueTypes,
	NodeTypes
};
Inferno; // suppress ts 'never used' error

describe.only('MobX Provider', () => {
	let container;
	let stores = observable({
		form: {
			text: ''
		}
	});

	beforeEach(() => {
		container = document.createElement('div');
		container.style.display = 'none';
		document.body.appendChild(container);
	});

	afterEach(() => {
		document.body.removeChild(container);
		render(null, container);
	});

	const Statefull = connect(['form'], class Statefull<P, S> extends Component<P, S> {
		render(props) {
			const update = () => props.form.text = 'Statefull';

			return <article>
				<a id="update" onClick={update}>update</a>
				<span>{props.form.text}</span>
			</article>;
		}
	});

	const Stateless = connect(props => {
		const update = () => stores.form.text = 'Stateless';

		return <article>
			<a id="update" onClick={update}>update</a>
			<span>{stores.form.text}</span>
		</article>;
	});

	const StatelessWithStores = connect(['form'], props => {
		const update = () => props.form.text = 'StatelessWithStores';

		return <article>
			<a id="update" onClick={update}>update</a>
			<span>{props.form.text}</span>
		</article>;
	});

	it('should render a component', () => {
		expect(() => render(<Provider form={stores.form}>
			<Statefull/>
		</Provider>, container)).to.not.throw(Error);
	});

	it('should update a statefull component', () => {
		render(<Provider form={stores.form}><Statefull/></Provider>, container);

		const link = container.querySelector('#update');
		link.click();

		expect(container.innerHTML).to.equal('<article><a id="update">update</a><span>Statefull</span></article>');
	});

	it('should update a stateless component', () => {
		render(<Provider form={stores.form}><Stateless/></Provider>, container);

		const link = container.querySelector('#update');
		link.click();

		expect(container.innerHTML).to.equal('<article><a id="update">update</a><span>Stateless</span></article>');
	});

	it('should update a stateless component with stores', () => {
		render(<Provider form={stores.form}><StatelessWithStores/></Provider>, container);

		const link = container.querySelector('#update');
		link.click();

		expect(container.innerHTML).to.equal('<article><a id="update">update</a><span>StatelessWithStores</span></article>');
	});

});
