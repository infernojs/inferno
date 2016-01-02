import Inferno from '../../../../packages/inferno/src/';
import InfernoDOM from '../../../../packages/inferno-dom/src/';

// WHY would we need this??

import { addTreeConstructor } from '../../../../src/core/createTemplate';
import createDOMTree from '../../../../src/DOM/createTree';

addTreeConstructor( 'dom', createDOMTree );

describe( 'CSS Style properties (JSX)', () => {

	let container;

	beforeEach(() => {
		container = document.createElement('div');
	});

	afterEach(() => {
		InfernoDOM.render(null, container);
	});

	it('should set and remove dynamic styles', () => {

		const styles = {display: 'none', fontFamily: 'Arial', lineHeight: 1.2};

		InfernoDOM.render(<div style={styles} />, container);
		expect(container.firstChild.style.fontFamily).to.equal('Arial');
		expect(container.firstChild.style.lineHeight).to.equal('1.2');

		InfernoDOM.render(<div />, container);
		expect(container.firstChild.style.fontFamily).to.equal('');
		expect(container.firstChild.style.lineHeight).to.equal('');

	});

	it('should update styles if initially null', () => {

		let styles = null;
		InfernoDOM.render(<div style={styles} />, container);

		styles = {display: 'block'};

		InfernoDOM.render(<div style={styles} />, container);
		expect(container.firstChild.style.display).to.equal('block');
	});

	it('should update styles if updated to null multiple times', () => {
		var styles = null;

		InfernoDOM.render(<div style={styles} />, container);
		expect(container.firstChild.style.display).to.equal('');

		styles = {display: 'block'};

		InfernoDOM.render(<div style={styles} />, container);
		expect(container.firstChild.style.display).to.equal('block');

		InfernoDOM.render(<div style={null} />, container);
		expect(container.firstChild.style.display).to.equal('');

		InfernoDOM.render(<div style={styles} />, container);
		expect(container.firstChild.style.display).to.equal('block');

		InfernoDOM.render(<div style={null} />, container);
		expect(container.firstChild.style.display).to.equal('');
	});

	it('should update styles when `style` changes from null to object', () => {
		const styles = {color: 'red'};
		InfernoDOM.render(<div style={styles} />, container);
		InfernoDOM.render(<div />, container);
		InfernoDOM.render(<div style={styles} />, container);

		const stubStyle = container.firstChild.style;
		expect(stubStyle.color).to.equal('red');
	});

	it('should clear all the styles when removing `style`', () => {
		const styles = {display: 'none', color: 'red'};
		InfernoDOM.render(<div style={styles} />, container);

		const stubStyle = container.firstChild.style;

		InfernoDOM.render(<div />, container);
		expect(stubStyle.display).to.equal('none');
		expect(stubStyle.color).to.equal('red');
	});

} );