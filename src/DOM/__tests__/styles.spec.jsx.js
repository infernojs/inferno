import { render } from './../rendering';
import { createVTemplateFactory as createVTemplate, createVElement, createVComponent } from './../../core/shapes';
import { createTemplateReducers } from './../../DOM/templates';

const Inferno = {
	createVTemplate,
	createVElement,
	createVComponent
};
const InfernoDOM = {
	createTemplateReducers
};

function styleNode() {
	return createVTemplate(function (style) {
		return createVElement('div').style(style);
	}, InfernoDOM);
}

describe('CSS style properties (JSX)', () => {

	let container;

	beforeEach(() => {
		container = document.createElement('div');
	});

	afterEach(() => {
		container.innerHTML = '';
	});

	it('should set and remove dynamic styles', () => {

		const styles = { display: 'none', fontFamily: 'Arial', lineHeight: 1.2 };

		render(<div style={ styles } />, container);
		expect(container.firstChild.style.fontFamily).to.equal('Arial');
		expect(container.firstChild.style.lineHeight).to.equal('1.2');

		render(<div />, container);
		expect(container.firstChild.style.fontFamily).to.equal('');
		expect(container.firstChild.style.lineHeight).to.equal('');

	});

	it('should update styles if initially null', () => {

		let styles = null;
		render(<div style={ styles } />, container);

		styles = { display: 'block' };

		render(<div style={ styles } />, container);
		expect(container.firstChild.style.display).to.equal('block');
	});

	it('should update styles if updated to null multiple times', () => {
		let styles = null;

		render(<div style={ undefined } />, container);

		render(<div style={ styles } />, container);
		expect(container.firstChild.style.display).to.equal('');

		styles = { display: 'block' };

		render(<div style={ styles } />, container);
		expect(container.firstChild.style.display).to.equal('block');

		render(<div style={ null } />, container);
		expect(container.firstChild.style.display).to.equal('');

		render(<div style={ styles } />, container);
		expect(container.firstChild.style.display).to.equal('block');

		render(<div style={ null } />, container);
		expect(container.firstChild.style.display).to.equal('');
	});

	it('should update styles when `style` changes from null to object', () => {
		const styles = { color: 'red' };
		render(<div style={ 123 } />, container);
		render(<div style={ styles } />, container);
		render(<div />, container);
		render(<div style={ styles } />, container);

		const stubStyle = container.firstChild.style;
		expect(stubStyle.color).to.equal('red');
	});

	it('should support different unit types - em and mm', () => {
		const styles = { height: '200em', width: '20mm' };
		render(<div style={ styles } />, container);
		render(<div />, container);
		render(<div style={ styles } />, container);

		const stubStyle = container.firstChild.style;
		expect(stubStyle.height).to.equal('200em');
		expect(stubStyle.width).to.equal('20mm');
	});

	it('should clear all the styles when removing `style`', () => {
		const styles = { display: 'none', color: 'red' };
		render(<div style={ styles } />, container);

		const stubStyle = container.firstChild.style;
		expect(stubStyle.display).to.equal('none');
		expect(stubStyle.color).to.equal('red');
	});

	it('Should change styles', () => {
		const stylesOne = { color: 'red' };
		render(styleNode()(stylesOne), container);
		expect(container.firstChild.style.color).to.equal('red');

		const styles = { color: 'blue' };
		render(styleNode()(styles), container);
		expect(container.firstChild.style.color).to.equal('blue');

		const stylesTwo = { color: 'orange' };
		render(styleNode()(stylesTwo), container);
		expect(container.firstChild.style.color).to.equal('orange');

		const stylesThree = { color: 'orange' };
		render(styleNode()(stylesThree), container);
		expect(container.firstChild.style.color).to.equal('orange');
	});
});
