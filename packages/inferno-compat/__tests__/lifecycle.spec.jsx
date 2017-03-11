import { expect } from 'chai';
import { render } from 'inferno';
import { spy } from 'sinon';
import { innerHTML } from 'inferno/test/utils';
import { createElement, Component } from '../dist-es';

describe('Inferno-compat LifeCycle', () => {
	let container;

	beforeEach(function () {
		container = document.createElement('div');
		document.body.appendChild(container);
	});

	afterEach(function () {
		render(null, container);
		container.innerHTML = '';
		document.body.removeChild(container);
	});

	describe('Order of Es6 Lifecycle with string refs and refs', () => {
		it('Should go as per React (minus doubles)', () => {
			// We spy console log to verify order of callbacks
			// React implementation: https://jsfiddle.net/zg7ay23g/
			const consoleSpy = spy(console, 'log');

			class Hello2 extends Component {
				componentWillMount() {
					console.log('Will mount sub');
				}
				componentDidMount() {
					console.log('Did mount sub', this.refs['S2a'] ? 'stringRef' : null);
				}
				componentWillUpdate() {
					console.log('Will update sub', this.refs['S2a'] ? 'stringRef' : null);
				}
				componentDidUpdate() {
					console.log('Did update sub', this.refs['S2a'] ? 'stringRef' : null);
				}

				render() {
					return (
						createElement('div', { ref: (node) =>{console.log('S1', node, this.refs['S2a'] ? 'stringRef' : null);} }, [
							createElement('div', { ref: 'S2a' }),
							createElement('div', { ref: (node) =>{console.log('S2b', node, this.refs['S2a'] ? 'stringRef' : null);} })
						])
					);
				}
			}

			class Hello extends Component {
				componentWillMount() {
					console.log('Will mount');
				}
				componentDidMount() {
					console.log('Did mount', this.refs['3a'] ? 'stringRef' : null);
				}
				componentWillUpdate() {
					console.log('Will update', this.refs['3a'] ? 'stringRef' : null);
				}
				componentDidUpdate() {
					console.log('Did update', this.refs['3a'] ? 'stringRef' : null);
				}

				render() {
					return (
						createElement('div', { ref: (node) =>{console.log('1', node, this.refs['3a'] ? 'stringRef' : null);} }, [
							createElement('div', { ref: (node) =>{console.log('2a', node, this.refs['3a'] ? 'stringRef' : null);} }, [
								createElement(Hello2, {}, null),
								createElement('div', { ref: '3a' }, [
									createElement('div', { ref: (node) =>{console.log('4a', node, this.refs['3a'] ? 'stringRef' : null);} }),
									createElement('div', { ref: (node) =>{console.log('4b', node, this.refs['3a'] ? 'stringRef' : null);} })
								]),
								createElement('div', { ref: (node) =>{console.log('3b', node, this.refs['3a'] ? 'stringRef' : null);} })
							]),
							createElement('div', { ref: (node) =>{console.log('2b', node, this.refs['3a'] ? 'stringRef' : null);} }, null)
						])
					);
				}
			}

			render(createElement(Hello, { name: 'Inferno' }, null), container);

			console.log('UPDATE');

			render(createElement(Hello, { name: 'Better Lifecycle' }, null), container);

			console.log('REMOVAL');

			render(
				<div></div>,
				container
			);

			// Assert console log
			// TODO: WIP - This needs verification
			// const array = consoleSpy.getCalls();
			// expect(array[0].args).to.eql(['Will mount']);
			// expect(array[1].args).to.eql(['3b', 'stringRef']);
			// expect(array[2].args).to.eql(['2a', 'stringRef']);
			// expect(array[3].args).to.eql(['2b', 'stringRef']);
			// expect(array[4].args).to.eql(['1', 'stringRef']);
			// expect(array[5].args).to.eql(['Did mount', 'stringRef']);
			// expect(array[6].args).to.eql(['UPDATE']);
			// expect(array[7].args).to.eql(['Will update', 'stringRef']);
			// expect(array[8].args).to.eql(['1', 'stringRef']);
			// expect(array[9].args).to.eql(['2a', 'stringRef']);
			// expect(array[10].args).to.eql(['3b', 'stringRef']);
			// expect(array[11].args).to.eql(['2b', 'stringRef']);
			// expect(array[12].args).to.eql(['Did update', 'stringRef']);
			// expect(array[13].args).to.eql(['REMOVAL']);
			// expect(array[14].args).to.eql(['1', 'stringRef']);
			// expect(array[15].args).to.eql(['2a', 'stringRef']);
			// expect(array[16].args).to.eql(['3b', null]);
			// expect(array[17].args).to.eql(['2b', null]);
		});
	});
});
