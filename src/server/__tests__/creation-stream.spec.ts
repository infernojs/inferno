import { streamAsStaticMarkup } from '../renderToString.stream';
import createClass from 'inferno-create-class';
import createElement from 'inferno-create-element';
import { expect } from 'chai';
import concatStream from 'concat-stream-es6';

describe('SSR Root Creation Streams - (non-JSX)', () => {
	let container;

	beforeEach(() => {
		container = document.createElement('div') as HTMLElement;
		container.style.display = 'none';
		document.body.appendChild(container);
	});

	afterEach(() => {
		document.body.removeChild(container);
	});

	it('should throw with invalid children', () => {
		const test = (value) => createElement('a', null, true);

		return streamPromise(test('foo')).catch((err) => {
			expect(err.toString()).to.equal('Error: invalid component');
		});
	});

	it('should use getChildContext', () => {
		const TestComponent = createClass({
			getChildContext() {
				return { hello: 'world' };
			},
			render() {
				return createElement('a', null, this.context.hello);
			}
		});
		return streamPromise(createElement(TestComponent, null)).then(function (output) {
			expect(output).to.equal('<a data-infernoroot>world</a>');
		});
	});

});

function streamPromise(dom) {
	return new Promise(function (res, rej) {
		streamAsStaticMarkup(dom)
		.on('error', rej)
		.pipe(concatStream(function (buffer) {
			res(buffer.toString('utf-8'));
		}));
	});
}
