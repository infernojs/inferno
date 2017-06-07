
import { createRenderer } from 'inferno';
import curry from 'lodash/curry';
import { map, reduce, scan } from 'most';
import { hold, sync } from 'most-subject';
import Type from 'union-type-es';

describe('Functional methods (JSX)', () => {
	let container;

	beforeEach(function () {
		container = document.createElement('div');
	});

	it('A basic example', (done) => {
		// Update
		// eslint-disable-next-line new-cap
		const Action = Type({ Increment: [], Decrement: [] });

		const update = (model, action) => Action.case({
			Increment: (_) => model + 1,
			Decrement: (_) => model - 1
		}, action);

		const actions$ = hold(1, sync());

		const emitAction = (action) => actions$.next(action);
		// eslint-disable-next-line new-cap
		const emitDecrement = (_) => emitAction(Action.Decrement());
		// eslint-disable-next-line new-cap
		const emitIncrement = (_) => emitAction(Action.Increment());

		// View
		const countStyle = {
			fontSize: '48px',
			fontFamily: 'monospace',
			width: '100%',
			textAlign: 'center'
		};

		// noinspection TypeScriptUnresolvedFunction
		const view = curry((actions, model) =>
			<div style={countStyle}>
				<button id="decrement" onClick={emitDecrement}>-</button>
				<div style={countStyle}>{model}</div>
				<button id="increment" onClick={emitIncrement}>+</button>
			</div>);

		// FRP
		const model$ = scan(update, 0, actions$);
		const vNodes$ = map(view(actions$), model$);

		// Logging
		// observe(state => console.log('model', state), model$) // eslint-disable-line fp/no-unused-expression

		const renderer = createRenderer();

		const runApp = () => reduce(renderer, container, vNodes$);

		runApp();
		setTimeout(() => {
			/*
			 <div style="font-size: 48px; font-family: monospace; width: 100%; text-align: center;">
			 <button id="decrement">-</button>
			 <div style="font-size: 48px; font-family: monospace; width: 100%; text-align: center;">0</div>
			 <button id="increment">+</button>
			 </div>
			 */
			const outerDiv = container.firstChild;

			expect(outerDiv.style.fontSize).to.eql('48px');
			expect(outerDiv.style.fontFamily).to.eql('monospace');
			expect(outerDiv.style.width).to.eql('100%');
			expect(outerDiv.style.textAlign).to.eql('center');
			expect(outerDiv.tagName).to.eql('DIV');

			const firstButton = outerDiv.childNodes[ 0 ];
			expect(firstButton.getAttribute('id')).to.eql('decrement');
			expect(firstButton.innerHTML).to.eql('-');

			const midDiv = outerDiv.childNodes[ 1 ];
			expect(midDiv.style.fontSize).to.eql('48px');
			expect(midDiv.style.fontFamily).to.eql('monospace');
			expect(midDiv.style.width).to.eql('100%');
			expect(midDiv.style.textAlign).to.eql('center');
			expect(midDiv.tagName).to.eql('DIV');
			expect(midDiv.innerHTML).to.eql('0');

			const secondButton = outerDiv.childNodes[ 2 ];
			expect(secondButton.getAttribute('id')).to.eql('increment');
			expect(secondButton.innerHTML).to.eql('+');
			done();
		}, 10);
	});
});
