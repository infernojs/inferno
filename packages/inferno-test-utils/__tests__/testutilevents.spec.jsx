
import Component from 'inferno-component';
import { spy } from 'sinon';
import { findRenderedVNodeWithType, renderIntoDocument } from '../dist-es';

describe('TestUtils events', () => {
	it('Should work with Synthetic events', () => {
		const testObj = {
			clicker: () => {
			}
		};

		const sinonSpy = spy(testObj, 'clicker');

		class FooBar extends Component {
			render() {
				return (
					<div onClick={testObj.clicker}>
						Test
					</div>
				);
			}
		}
		const tree = renderIntoDocument(<FooBar />);

		const vnode = findRenderedVNodeWithType(tree, 'div');
		vnode.dom.click();

		expect(sinonSpy.callCount).to.eql(1);
	});

	it('Should work with native events', () => {
		const testObj = {
			clicker: () => {
			}
		};

		const sinonSpy = spy(testObj, 'clicker');

		class FooBar extends Component {
			render() {
				return (
					<div onclick={testObj.clicker}>
						Test
					</div>
				);
			}
		}
		const tree = renderIntoDocument(<FooBar />);

		const vnode = findRenderedVNodeWithType(tree, 'div');
		vnode.dom.click();

		expect(sinonSpy.callCount).to.eql(1);
	});
});
