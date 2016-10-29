// import { expect } from 'chai';
// import { createRenderer } from './../rendering';
// import * as Inferno from '../../testUtils/inferno';
// Inferno; // suppress ts 'never used' error
//
// import {
// 	map,
// 	scan
// } from 'most';
// import { holdSubject } from 'most-subject';
// import fp from 'lodash/fp';
// import Type from 'union-type';
// // import { click } from '@most/dom-event'
//
// describe('Functional methods (JSX)', () => {
// 	let container;
//
// 	beforeEach(() => {
// 		container = document.createElement('div');
// 	});
//
// 	it('A basic example', done => {
// 		// Update
// 		const Action = Type({ Increment: [], Decrement: [] });
//
// 		const update = (model, action) => Action.case({
// 			Increment: _ => model + 1,
// 			Decrement: _ => model - 1
// 		}, action);
//
// 		const actions$ = holdSubject();
//
// 		const emitAction = action => actions$.next(action);
// 		const emitDecrement = _ => emitAction(Action.Decrement());
// 		const emitIncrement = _ => emitAction(Action.Increment());
//
// 		// View
// 		const countStyle = {
// 			fontSize: '48px',
// 			fontFamily: 'monospace',
// 			width: '100%',
// 			textAlign: 'center'
// 		};
//
// 		// noinspection TypeScriptUnresolvedFunction
// 		const view = fp.curry((actions, model) =>
// 			<div style={countStyle}>
// 				<button id='decrement' onClick={emitDecrement}>-</button>
// 				<div style={countStyle}>{model}</div>
// 				<button id='increment' onClick={emitIncrement}>+</button>
// 			</div>);
//
// 		// FRP
// 		const model$ = scan(update, 0, actions$);
// 		const vNodes$ = map(view(actions$), model$);
//
// 		// Logging
// 		// observe(state => console.log('model', state), model$) // eslint-disable-line fp/no-unused-expression
//
// 		const renderer = createRenderer();
//
// 		const runApp = () => scan(renderer, container, vNodes$).drain();
//
// 		runApp();
// 		setTimeout(() => {
// 			expect(container.innerHTML).to.equal(
// 				'<div style="font-size: 48px; font-family: monospace; width: 100%; text-align: center;"><button id="decrement">-</button><div style="font-size: 48px; font-family: monospace; width: 100%; text-align: center;">0</div><button id="increment">+</button></div>'
// 			);
// 			done();
// 		}, 10);
// 	});
// });
