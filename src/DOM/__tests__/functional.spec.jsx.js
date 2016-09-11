import { createRenderer } from './../rendering';
import Component from './../../component/es2015';
import {
	createStaticVElement,
	createOptBlueprint,
	createVComponent,
	ChildrenTypes,
	ValueTypes,
	NodeTypes
} from './../../core/shapes';
import {
  // observe,
  fromEvent,
  map,
  scan
} from 'most';
import { holdSubject } from 'most-subject';
// import { click } from '@most/dom-event'
import fp from 'lodash/fp';
import Type from 'union-type';

const Inferno = {
	createStaticVElement,
	createOptBlueprint,
	createVComponent,
	ChildrenTypes,
	ValueTypes,
	NodeTypes
};

describe('Functional methods (JSX)', () => {
	let container;

	beforeEach(() => {
		container = document.createElement('div');
	});

	it('A basic example', done => {
		// Update
		const Action = Type({ Increment: [], Decrement: [] })

		const update = (model, action) => Action.case({
			Increment: _ => model + 1,
			Decrement: _ => model - 1
		}, action);

		const actions$ = holdSubject();

		const emitAction = action => actions$.next(action);
		const emitDecrement = _ => emitAction(Action.Decrement());
		const emitIncrement = _ => emitAction(Action.Increment());

		// View
		const countStyle = {
			fontSize: '48px',
			fontFamily: 'monospace',
			width: '100%',
			textAlign: 'center'
		};

		const view = fp.curry((actions$, model) =>
			<div style={countStyle}>
				<button id='decrement' onClick={emitDecrement}>-</button>
				<div style={countStyle}>{model}</div>
				<button id='increment' onClick={emitIncrement}>+</button>
			</div>);

		// FRP
		const model$ = scan(update, 0, actions$);
		const vNodes$ = map(view(actions$), model$);

		// Logging
		// observe(state => console.log('model', state), model$) // eslint-disable-line fp/no-unused-expression

		const onReady =
			f => fromEvent('DOMContentLoaded', window).take(1).observe(x => f());

		const renderer = createRenderer();

		const runApp =
			_ => scan(renderer, container, vNodes$).drain();

		runApp();
		setTimeout(() => {
			expect(container.innerHTML).to.equal(
				'<div style="font-size: 48px; font-family: monospace; width: 100%; text-align: center;"><button id="decrement">-</button><div style="font-size: 48px; font-family: monospace; width: 100%; text-align: center;">0</div><button id="increment">+</button></div>'
			);
			done();
		}, 10);
	});
});