import { Provider, connect } from '../../dist-es';
import { findRenderedVNodeWithType, renderIntoDocument } from 'inferno-test-utils';
import { spy, spyOn } from '../test-utils';

import Component from 'inferno-component';
import createElement from 'inferno-create-element';
import { createStore } from 'redux';
import { expect } from 'chai';

describe('redux', () => {
	describe('Provider', () => {
		class Child extends Component {
			render() {
				return createElement('div', {});
			}
		}

		it('should enforce a single child', () => {
			const store = createStore(() => ({}));

			expect(() => renderIntoDocument(
				createElement(Provider, { store },
					createElement('div', {}),
				),
			)).to.not.throw;

			expect(() => renderIntoDocument(
				createElement(Provider, { store }),
			)).to.throw(/Only one child/);

			expect(() => renderIntoDocument(
				createElement(Provider, { store },
					createElement('div', {}),
					createElement('div', {}),
				),
			)).to.throw(/Only one child/);
		});

		it('should add the store to the child context', () => {
			const store1 = createStore(() => ({}));
			const store2 = createStore(() => ({}));

			spyOn(console, 'error', (spy) => {
				const tree = renderIntoDocument(
					createElement(Provider, { store: store1 },
						createElement(Child, {}),
					),
				);
				expect(spy.callCount).to.eql(0, 'console.error should not have been called');

				const child = findRenderedVNodeWithType(tree, Child).children;
				expect(child.context.store).to.be.equal(store1);
			});

			spyOn(console, 'error', (spy) => {
				const tree = renderIntoDocument(
					createElement(Provider, { store: store1 },
						createElement(Provider, { store: store2 },
							createElement(Child, {})
						)
					)
				);

				expect(spy.callCount).to.eql(0, 'console.error should not have been called');

				const child = findRenderedVNodeWithType(tree, Child).children;
				expect(child.context.store).to.be.equal(store2);
			});
		});

		it('should warn once when receiving a new store in props', async () => {
			const store1 = createStore((state = 10) => state + 1);
			const store2 = createStore((state = 10) => state * 2);
			const store3 = createStore((state = 10) => state * state);

			class ProviderContainer extends Component {
				constructor() {
					super();
					this.state = { store: store1 };
				}

				render() {
					return (
						<Provider store={this.state.store}>
							<Child />
						</Provider>
					);
				}
			}

			const tree = renderIntoDocument(<ProviderContainer />);
			const container = findRenderedVNodeWithType(tree, ProviderContainer).children;
			const child = findRenderedVNodeWithType(tree, Child).children;
			expect(child.context.store.getState()).to.eql(11);

			await spyOn(console, 'error', async (spy) => {
				container.setState({ store: store2 });
				await tree.repaint();

				expect(child.context.store.getState()).to.eql(11);
				expect(spy.callCount).to.eql(1, 'console.error should have been called once');
				expect(spy.getCall(0).args[0]).to.eql('<Provider> does not support changing `store` on the fly.');
			});

			await spyOn(console, 'error', async (spy) => {
				container.setState({ store: store3 });
				await tree.repaint();

				expect(child.context.store.getState()).to.eql(11);
				expect(spy.callCount).to.eql(0, 'console.error should not have been called');
			});
		});

		it('should handle subscriptions correctly when there is nested Providers', () => {
			const reducer1 = (state = 2, action) => (action.type === 'INC' ? state + 1 : state);
			const reducer2 = (state = 5, action) => (action.type === 'INC' ? state + 2 : state);

			const innerStore = createStore(reducer1);
			innerStore.__store_name__ = 'innerStore'; // for debugging
			const innerMapStateToProps = spy(
				state => ({ count: state })
			);

			const Inner = connect(innerMapStateToProps)(
				class Inner extends Component {
					render() { return <div>{this.props.count}</div>; }
				}
			);

			const outerStore = createStore(reducer2);
			outerStore.__store_name__ = 'outerStore'; // for debugging
			const Outer = connect(state => ({ count: state }))(
				class Outer extends Component {
					render() { return <Provider store={innerStore}><Inner /></Provider>; }
				}
			);

			renderIntoDocument(<Provider store={outerStore}><Outer /></Provider>);
			expect(innerMapStateToProps.callCount).to.eql(1);

			innerStore.dispatch({ type: 'INC' });
			expect(innerMapStateToProps.callCount).to.eql(2);
		});

		it('should pass state consistently to mapState', async () => {
			const stringBuilder = (prev = '', action) =>
				action.type === 'APPEND'
					? prev + action.payload
					: prev;

			const store = createStore(stringBuilder);

			store.dispatch({ type: 'APPEND', payload: 'a' });
			let childMapStateInvokes = 0;

			const ChildContainer = connect((state, parentProps) => {
				childMapStateInvokes++;
				// The state from parent props should always be consistent with the current state
				expect(state).to.equal(parentProps.parentState);
				return {};
			})(
				class ChildContainer extends Component {
					render() {
						return <div />;
					}
				}
			);

			const Container = connect(state => ({ state }), null, null, { withRef: true })(
				class Container extends Component {
					emitChange() {
						store.dispatch({ type: 'APPEND', payload: 'b' });
					}

					render() {
						// NOTE: This should really be onClick not onclick. More bugs in inferno event delegation?
						return (
							<div>
								<button ref={btn => {this.button = btn;}} onClick={this.emitChange.bind(this)}>change</button>
								<ChildContainer parentState={this.props.state} />
							</div>
						);
					}
				}
			);

			const tree = renderIntoDocument(
				<Provider store={store}>
					<Container />
				</Provider>
			);

			expect(childMapStateInvokes).to.eql(1);

			// The store state stays consistent when setState calls are batched
			store.dispatch({ type: 'APPEND', payload: 'c' });
			await tree.repaint();
			expect(childMapStateInvokes).to.eql(2);

			// setState calls DOM handlers are batched
			const container = findRenderedVNodeWithType(tree, Container).children;
			const node = container.getWrappedInstance().button;
			node.click();
			await tree.repaint();
			expect(childMapStateInvokes).to.eql(3);

			// Provider uses unstable_batchedUpdates() under the hood
			store.dispatch({ type: 'APPEND', payload: 'd' });
			await tree.repaint();
			expect(childMapStateInvokes).to.eql(4);
		});
	});
});
