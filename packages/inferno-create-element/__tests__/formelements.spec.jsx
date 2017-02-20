import { expect } from 'chai';
import { render } from 'inferno';
import Component from 'inferno-component';

describe('FormElements', () => {
	let container;

	beforeEach(function () {
		container = document.createElement('div');
	});

	describe('text input', () => {
		class TextBox extends Component {
			constructor(props) {
				super(props);
			}

			render() {
				return (
					<div>
						<input type="text" value={this.props.value}/>
					</div>
				);
			}
		}

		it('Should set value as text on render', () => {
			render(<TextBox value={1}/>, container);
			expect(container.querySelector('input').value).to.equal('1');
		});

		it('Should override changed value on next render', () => {
			render(<TextBox value={1}/>, container);
			let input = container.querySelector('input');
			expect(input.value).to.equal('1');
			input.value = '2'; // Simulate user typing '2'
			expect(input.value).to.equal('2');
			render(<TextBox value={3}/>, container);
			input = container.querySelector('input');
			expect(input.value).to.equal('3');
		});

		it('Should override changed value on next render even when value is same as on prev render', () => {
			render(<TextBox value={1}/>, container);
			let input = container.querySelector('input');
			expect(input.value).to.equal('1');
			input.value = '2'; // Simulate user typing '2'
			expect(input.value).to.equal('2');
			render(<TextBox value={1}/>, container);
			input = container.querySelector('input');
			expect(input.value).to.equal('1');
		});
	});

	describe('input type checkbox', () => {
		class CheckBox extends Component {
			constructor(props) {
				super(props);
			}

			render() {
				return (
					<div>
						<input type="checkbox" checked={this.props.checked}/>
					</div>
				);
			}
		}

		it('Should set checked on render', () => {
			render(<CheckBox checked={true}/>, container);
			expect(container.querySelector('input').checked).to.equal(true);
		});

		it('Should set checked on render #2', () => {
			render(<CheckBox checked={false}/>, container);
			expect(container.querySelector('input').checked).to.equal(false);
		});

		it('Should set checked on render #3', () => {
			render(<CheckBox />, container);
			expect(container.querySelector('input').checked).to.equal(false);
		});

		it('Should override changed value on next render', () => {
			render(<CheckBox checked={false}/>, container);
			let input = container.querySelector('input');
			expect(input.checked).to.equal(false);
			input.checked = false; // Simulate user clicking checkbox twice
			render(<CheckBox checked={true}/>, container);
			input = container.querySelector('input');
			expect(input.checked).to.equal(true);
		});

		it('Should override changed value on next render even when value is same as on prev render', () => {
			render(<CheckBox checked={false}/>, container);
			let input = container.querySelector('input');
			expect(input.checked).to.equal(false);
			input.checked = true; // Simulate user clicking checkbox
			expect(input.checked).to.equal(true);
			render(<CheckBox checked={false}/>, container);
			input = container.querySelector('input');
			expect(input.checked).to.equal(false);
		});

		it('Should override changed value on next render even when value is same as on prev render #1', () => {
			render(<CheckBox checked={true}/>, container);
			let input = container.querySelector('input');
			expect(input.checked).to.equal(true);
			input.checked = false; // Simulate user clicking checkbox
			expect(input.checked).to.equal(false);
			render(<CheckBox checked={true}/>, container);
			input = container.querySelector('input');
			expect(input.checked).to.equal(true);
		});
	});

	// https://facebook.github.io/react/docs/forms.html
	describe('React form spec', () => {
		describe('Controlled select list', () => {
			class SelectList extends Component {
				constructor(props) {
					super(props);
				}

				render() {
					return (
						<div>
							<select value={this.props.value}>
								<option value="A">A</option>
								<option value="B">B</option>
								<option value="C">C</option>
							</select>
						</div>
					);
				}
			}

			it('Should pre select option by value', () => {
				render(<SelectList value="B"/>, container);
				const selectList = container.querySelector('select');
				expect(selectList.childNodes[0].selected).to.equal(false);
				expect(selectList.childNodes[1].selected).to.equal(true);
				expect(selectList.childNodes[2].selected).to.equal(false);
			});

			it('Should change value based on value property', () => {
				render(<SelectList value="B"/>, container);
				let selectList = container.querySelector('select');
				expect(selectList.childNodes[0].selected).to.equal(false);
				expect(selectList.childNodes[1].selected).to.equal(true);
				expect(selectList.childNodes[2].selected).to.equal(false);

				render(<SelectList value="C"/>, container);
				selectList = container.querySelector('select');
				expect(selectList.childNodes[0].selected).to.equal(false);
				expect(selectList.childNodes[1].selected).to.equal(false);
				expect(selectList.childNodes[2].selected).to.equal(true);
			});
		});

		describe('Controlled select list updates', () => {
			let updater;

			class SelectList extends Component {
				constructor(props) {
					super(props);

					this.state = {
						value: 'A'
					};

					updater = (e) => {
						this.setState(e);
					};
				}

				buildOptionsDynamically() {
					return [
						<option value="A">A</option>,
						<option value="B">B</option>,
						<option value="C">C</option>
					];
				}

				render() {
					return (
						<div>
							<select value={this.state.value}>
								{this.buildOptionsDynamically()}
							</select>
						</div>
					);
				}
			}

			it('Should pre select option by value on update', (done) => {
				render(<SelectList />, container);
				let selectList = container.querySelector('select');
				expect(selectList.childNodes[0].selected).to.equal(true);
				expect(selectList.childNodes[1].selected).to.equal(false);
				expect(selectList.childNodes[2].selected).to.equal(false);

				updater({ value: 'B' });
				setTimeout(() => {
					selectList = container.querySelector('select');
					expect(selectList.childNodes[0].selected).to.equal(false);
					expect(selectList.childNodes[1].selected).to.equal(true);
					expect(selectList.childNodes[2].selected).to.equal(false);
					done();
				}, 10);
			});
		});
	});
});
