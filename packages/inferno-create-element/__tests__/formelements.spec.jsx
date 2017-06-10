
import { render, linkEvent } from 'inferno';
import Component from 'inferno-component';
import sinon from 'sinon';
import { triggerEvent } from 'inferno-utils';

describe('FormElements', () => {
	let container;

	beforeEach(function () {
		container = document.createElement('div');
		document.body.appendChild(container);
	});

	afterEach(() => {
		render(null, container);
		container.innerHTML = '';
		document.body.removeChild(container);
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
			expect(container.querySelector('input').value).toBe('1');
		});

		it('Should override changed value on next render', () => {
			render(<TextBox value={1}/>, container);
			let input = container.querySelector('input');
			expect(input.value).toBe('1');
			input.value = '2'; // Simulate user typing '2'
			expect(input.value).toBe('2');
			render(<TextBox value={3}/>, container);
			input = container.querySelector('input');
			expect(input.value).toBe('3');
		});

		it('Should override changed value on next render even when value is same as on prev render', () => {
			render(<TextBox value={1}/>, container);
			let input = container.querySelector('input');
			expect(input.value).toBe('1');
			input.value = '2'; // Simulate user typing '2'
			expect(input.value).toBe('2');
			render(<TextBox value={1}/>, container);
			input = container.querySelector('input');
			expect(input.value).toBe('1');
		});

		it('Controlled - oninput - Should have updated props in onInput callbacks', () => {
			class Example extends Component {
				constructor(props, context) {
					super(props, context);

					this._method = this._method.bind(this);
				}

				_method() {
					this.props.callback(this.props.value);
				}

				render() {
					return (
						<input type="text" oninput={this._method} value="test"/>
					);
				}
			}

			const spy = sinon.spy();

			render(<Example callback={spy} value={1}/>, container);

			let event = document.createEvent('Event');
			event.initEvent('input', true, true);
			container.firstChild.dispatchEvent(event, true);

			expect(spy.calledOnce).toBe(true);
			expect(spy.args[0][0]).toBe(1); // Verify initial props are correct

			// Then update component
			render(<Example callback={spy} value={2}/>, container);

			event = document.createEvent('Event');
			event.initEvent('input', true, true);
			container.firstChild.dispatchEvent(event, true);

			expect(spy.calledTwice).toBe(true);
			expect(spy.args[1][0]).toBe(2); // Verify props have changed
		});

		it('Controlled - onInput - Should have updated props in onInput callbacks', () => {
			class Example extends Component {
				constructor(props, context) {
					super(props, context);

					this._method = this._method.bind(this);
				}

				_method() {
					this.props.callback(this.props.value);
				}

				render() {
					return (
						<input type="text" onInput={this._method} value="test"/>
					);
				}
			}

			const spy = sinon.spy();

			render(<Example callback={spy} value={1}/>, container);

			let event = document.createEvent('Event');
			event.initEvent('input', true, true);
			container.firstChild.dispatchEvent(event, true);

			expect(spy.calledOnce).toBe(true);
			expect(spy.args[0][0]).toBe(1); // Verify initial props are correct

			// Then update component
			render(<Example callback={spy} value={2}/>, container);

			event = document.createEvent('Event');
			event.initEvent('input', true, true);
			container.firstChild.dispatchEvent(event, true);

			expect(spy.calledTwice).toBe(true);
			expect(spy.args[1][0]).toBe(2); // Verify props have changed
		});

		it('Controlled - onInput - Should have updated props in onInput callbacks in setState callback', () => {
			class Example extends Component {
				constructor(props, context) {
					super(props, context);

					this.state = {
						a: 0
					};

					this._method = this._method.bind(this);
				}

				test() {
					this.props.callback(this.props.value, this.state.a);
				}

				_method() {
					this.setState({
						a: this.props.value
					}, this.test);
				}

				render() {
					return (
						<input type="text" onInput={this._method} value="test"/>
					);
				}
			}

			const spy = sinon.spy();

			render(<Example callback={spy} value={1}/>, container);

			let event = document.createEvent('Event');
			event.initEvent('input', true, true);
			container.firstChild.dispatchEvent(event, true);

			expect(spy.calledOnce).toBe(true);
			expect(spy.args[0][0]).toBe(1); // Verify initial props are correct

			// Then update component
			render(<Example callback={spy} value={2}/>, container);

			event = document.createEvent('Event');
			event.initEvent('input', true, true);
			container.firstChild.dispatchEvent(event, true);

			expect(spy.calledTwice).toBe(true);
			expect(spy.args[1][0]).toBe(2); // Verify props have changed
			expect(spy.args[1][1]).toBe(2); // Verify state have changed
		});

		it('Controlled - onInput (linkEvent) - Should have updated props in onInput callbacks', () => {
			class Example extends Component {
				constructor(props, context) {
					super(props, context);

				}

				static _method(me) {
					me.props.callback(me.props.value);
				}

				render() {
					return (
						<input type="text" onInput={linkEvent(this, Example._method)} value="test"/>
					);
				}
			}

			const spy = sinon.spy();

			render(<Example callback={spy} value={1}/>, container);

			let event = document.createEvent('Event');
			event.initEvent('input', true, true);
			container.firstChild.dispatchEvent(event, true);

			expect(spy.calledOnce).toBe(true);
			expect(spy.args[0][0]).toBe(1); // Verify initial props are correct

			// Then update component
			render(<Example callback={spy} value={2}/>, container);

			event = document.createEvent('Event');
			event.initEvent('input', true, true);
			container.firstChild.dispatchEvent(event, true);

			expect(spy.calledTwice).toBe(true);
			expect(spy.args[1][0]).toBe(2); // Verify props have changed
		});

		it('NON Controlled - onInput (linkEvent) - Should have updated props in onInput callbacks', () => {
			class Example extends Component {
				constructor(props, context) {
					super(props, context);

				}

				static _method(me) {
					me.props.callback(me.props.value);
				}

				render() {
					return (
						<input type="text" onInput={linkEvent(this, Example._method)}/>
					);
				}
			}

			const spy = sinon.spy();

			render(<Example callback={spy} value={1}/>, container);

			let event = document.createEvent('Event');
			event.initEvent('input', true, true);
			container.firstChild.dispatchEvent(event, true);

			expect(spy.calledOnce).toBe(true);
			expect(spy.args[0][0]).toBe(1); // Verify initial props are correct

			// Then update component
			render(<Example callback={spy} value={2}/>, container);

			event = document.createEvent('Event');
			event.initEvent('input', true, true);
			container.firstChild.dispatchEvent(event, true);

			expect(spy.calledTwice).toBe(true);
			expect(spy.args[1][0]).toBe(2); // Verify props have changed
		});

		it('NON Controlled - onInput - Should have updated props in onInput callbacks', () => {
			class Example extends Component {
				constructor(props, context) {
					super(props, context);

					this._method = this._method.bind(this);
				}

				_method() {
					this.props.callback(this.props.value);
				}

				render() {
					return (
						<input type="text" onInput={this._method}/>
					);
				}
			}

			const spy = sinon.spy();

			render(<Example callback={spy} value={1}/>, container);

			let event = document.createEvent('Event');
			event.initEvent('input', true, true);
			container.firstChild.dispatchEvent(event, true);

			expect(spy.calledOnce).toBe(true);
			expect(spy.args[0][0]).toBe(1); // Verify initial props are correct

			// Then update component
			render(<Example callback={spy} value={2}/>, container);

			event = document.createEvent('Event');
			event.initEvent('input', true, true);
			container.firstChild.dispatchEvent(event, true);

			expect(spy.calledTwice).toBe(true);
			expect(spy.args[1][0]).toBe(2); // Verify props have changed
		});

		it('Controlled - onChange (linkEvent) - Should have updated props in onInput callbacks', () => {
			class Example extends Component {
				constructor(props, context) {
					super(props, context);

				}

				static _method(me) {
					me.props.callback(me.props.value);
				}

				render() {
					return (
						<input type="text" onChange={linkEvent(this, Example._method)} value="test"/>
					);
				}
			}

			const spy = sinon.spy();

			render(<Example callback={spy} value={1}/>, container);

			let event = document.createEvent('Event');
			event.initEvent('change', true, true);
			container.firstChild.dispatchEvent(event, true);

			expect(spy.calledOnce).toBe(true);
			expect(spy.args[0][0]).toBe(1); // Verify initial props are correct

			// Then update component
			render(<Example callback={spy} value={2}/>, container);

			event = document.createEvent('Event');
			event.initEvent('change', true, true);
			container.firstChild.dispatchEvent(event, true);

			expect(spy.calledTwice).toBe(true);
			expect(spy.args[1][0]).toBe(2); // Verify props have changed
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
			expect(container.querySelector('input').checked).toBe(true);
		});

		it('Should set checked on render #2', () => {
			render(<CheckBox checked={false}/>, container);
			expect(container.querySelector('input').checked).toBe(false);
		});

		it('Should set checked on render #3', () => {
			render(<CheckBox />, container);
			expect(container.querySelector('input').checked).toBe(false);
		});

		it('Should override changed value on next render', () => {
			render(<CheckBox checked={false}/>, container);
			let input = container.querySelector('input');
			expect(input.checked).toBe(false);
			input.checked = false; // Simulate user clicking checkbox twice
			render(<CheckBox checked={true}/>, container);
			input = container.querySelector('input');
			expect(input.checked).toBe(true);
		});

		it('Should override changed value on next render even when value is same as on prev render', () => {
			render(<CheckBox checked={false}/>, container);
			let input = container.querySelector('input');
			expect(input.checked).toBe(false);
			input.checked = true; // Simulate user clicking checkbox
			expect(input.checked).toBe(true);
			render(<CheckBox checked={false}/>, container);
			input = container.querySelector('input');
			expect(input.checked).toBe(false);
		});

		it('Should override changed value on next render even when value is same as on prev render #1', () => {
			render(<CheckBox checked={true}/>, container);
			let input = container.querySelector('input');
			expect(input.checked).toBe(true);
			input.checked = false; // Simulate user clicking checkbox
			expect(input.checked).toBe(false);
			render(<CheckBox checked={true}/>, container);
			input = container.querySelector('input');
			expect(input.checked).toBe(true);
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
				expect(selectList.childNodes[ 0 ].selected).toBe(false);
				expect(selectList.childNodes[ 1 ].selected).toBe(true);
				expect(selectList.childNodes[ 2 ].selected).toBe(false);
			});

			it('Should change value based on value property', () => {
				render(<SelectList value="B"/>, container);
				let selectList = container.querySelector('select');
				expect(selectList.childNodes[ 0 ].selected).toBe(false);
				expect(selectList.childNodes[ 1 ].selected).toBe(true);
				expect(selectList.childNodes[ 2 ].selected).toBe(false);

				render(<SelectList value="C"/>, container);
				selectList = container.querySelector('select');
				expect(selectList.childNodes[ 0 ].selected).toBe(false);
				expect(selectList.childNodes[ 1 ].selected).toBe(false);
				expect(selectList.childNodes[ 2 ].selected).toBe(true);
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
				expect(selectList.childNodes[ 0 ].selected).toBe(true);
				expect(selectList.childNodes[ 1 ].selected).toBe(false);
				expect(selectList.childNodes[ 2 ].selected).toBe(false);

				updater({ value: 'B' });
				setTimeout(() => {
					selectList = container.querySelector('select');
					expect(selectList.childNodes[ 0 ].selected).toBe(false);
					expect(selectList.childNodes[ 1 ].selected).toBe(true);
					expect(selectList.childNodes[ 2 ].selected).toBe(false);
					done();
				}, 10);
			});
		});

		describe('input range scu', () => {
			it('Should have correct value on initial render', () => {
				class TestInputRange extends Component {
					shouldComponentUpdate() {
						return false;
					}

					render() {
						return (
							<input
								name="test"
								type="range"
								min={50}
								max={500}
								step={5}
								defaultValue={260}/>
						);
					}
				}
				render(<TestInputRange />, container);

				expect(container.firstChild.value).toBe('260');
				expect(container.firstChild.defaultValue).toBe('260');
			});

			it('Should have defaultValue even when defaultValue is omitted, if value exists', () => {
				class TestInputRange extends Component {
					shouldComponentUpdate() {
						return false;
					}

					render() {
						return (
							<input
								name="test"
								type="range"
								min={50}
								max={500}
								step={5}
								value="110"/>
						);
					}
				}
				render(<TestInputRange />, container);

				expect(container.firstChild.value).toBe('110');
				expect(container.firstChild.defaultValue).toBe('110');
			});
		});

		describe('Non-controlled select element', () => {
			it('Should have 2nd option selected', () => {
				render((
					<select>
						<option value="a">a</option>
						<option selected={true} value="b">b</option>
					</select>
				), container);

				expect(container.firstChild.children[ 0 ].selected).toBe(false);
				expect(container.firstChild.children[ 1 ].selected).toBe(true);
			});

			it('should render specified default selected option', () => {
				render(<div>
					<select>
						<option value="a">a</option>
						<option selected={true} value="b">b</option>
					</select>
				</div>, container);

				expect(container.querySelector('select').children[ 0 ].selected).toEqual(false);
				expect(container.querySelector('select').children[ 1 ].selected).toEqual(true);
			});
		});

		describe('callbacks with FormElements', () => {
			it('Should call latest calback from props', () => {
				class CompA extends Component {

					constructor(props) {
						super(props);
						this.state = {
							orderedConfigs: [{ value: false }, { value: true }, { value: false }]
						};
					}

					handleClick(that, { targetConf, targetIndex }) {
						const newConfigs = that.state.orderedConfigs.map(
							(conf, index) => index === targetIndex
								? { value: !targetConf.value }
								: conf
						);

						this.setState({ orderedConfigs: newConfigs });
					}

					render(props) {
						return <CompB orderedConfigs={this.state.orderedConfigs}
													onClick={(...args) => this.handleClick(this, ...args)}/>;
					}
				}

				const CompB = function renderCompB(props) {
					return (<div>{
						props.orderedConfigs.map(
							(conf, index) => (
								<input
									type="checkbox"
									checked={conf.value}
									onClick={() => {
										props.onClick({ targetConf: conf, targetIndex: index });
									}}
								/>
							)
						)
					}</div>);

				};


				render(<CompA/>, container);

				expect(container.firstChild.firstChild.checked).toBe(false);
				// expect(container.querySelectorAll('input:checked').length).to.equal(1);


				let input = container.querySelector('input');
				input.click();

				expect(container.firstChild.firstChild.checked).toBe(true);
				// expect(container.querySelectorAll('input:checked').length).to.equal(2);

				input = container.querySelector('input');
				input.click();

				expect(container.firstChild.firstChild.checked).toBe(false);
				// expect(container.querySelectorAll('input:checked').length).to.equal(1);
			});

			it('Github - 1023 It should call recent callback from input', (done) => {
				class Foobar extends Component {
					constructor(props) {
						super(props);
						this.state = { error: null, value: props.value };
						this.handleChange = this.handleChange.bind(this);
					}

					handleChange(event) {
						this.setState({
							error: 'test ' + event.currentTarget.value
						});
						this.props.onChange(this.props.name, event.currentTarget.value);
					}

					render() {
						return (
							<div className='inputContainer' style={{ width: this.props.width ? this.props.width : '100%' }}>
								<div className='label'>{ this.props.label }&nbsp;</div>
								<input type={this.props.type} onChange={this.handleChange} value={this.props.value}/>
								<div className='hint'>{ this.props.hint }</div>
								{ this.state.error && (
									<div className='error'>
										{ this.state.error }
									</div>
								)}
							</div>
						);
					}
				}

				const obj = {
					func() {
					}
				};

				const spy = sinon.spy(obj.func);

				render(<Foobar onChange={spy}/>, container);
				const input = container.querySelector('input');

				input.value = 'foo';

				triggerEvent('change', input);

				expect(spy.calledOnce).toBe(true);
				expect(spy.args[ 0 ][ 1 ]).toBe('foo');

				input.value = 'bar';

				triggerEvent('change', input);

				expect(spy.calledTwice).toBe(true);
				expect(spy.args[ 1 ][ 1 ]).toBe('bar');

				done();
			});

			// TODO: This requires async events, Something we could add in v4
			// 	it('Github - 1023 It should call recent callback from input #2', (done) => {
			// 		class Foobar extends Component {
			// 			constructor(props) {
			// 				super(props);
			// 				this.state = { error: null, value: props.value };
			// 				this.handleChange = this.handleChange.bind(this);
			// 			}
			//
			// 			handleChange(event) {
			// 				this.setState({
			// 					error: 'test ' + event.currentTarget.value
			// 				});
			// 				this.props.onChange(this.props.name, event.currentTarget.value);
			// 			}
			//
			// 			render() {
			// 				return (
			// 					<div className='inputContainer' style={{ width: this.props.width ? this.props.width : '100%' }}>
			// 						<div className='label'>{ this.props.label }&nbsp;</div>
			// 						<input type={this.props.type} onChange={this.handleChange} value={this.props.value} />
			// 						<div className='hint'>{ this.props.hint }</div>
			// 						{ this.state.error && (
			// 							<div className='error'>
			// 								{ this.state.error }
			// 							</div>
			// 						)}
			// 					</div>
			// 				);
			// 			}
			// 		}
			//
			// 		const obj = {
			// 			func() {}
			// 		};
			//
			// 		const spy = sinon.spy(obj.func);
			//
			// 		render(<Foobar value="" onChange={spy} />, container);
			// 		const input = container.querySelector('input');
			//
			// 		input.value = 'foo';
			//
			// 		triggerEvent('change', input);
			//
			// 		expect(spy.calledOnce).to.equal(true);
			// 		expect(spy.args[0][1]).to.equal('foo');
			//
			// 		input.value = 'bar';
			//
			// 		triggerEvent('change', input);
			//
			// 		expect(spy.calledTwice).to.equal(true);
			// 		expect(spy.args[1][1]).to.equal('bar');
			//
			// 		done();
			// 	});
		});

		describe('Controlled inputs, checkbox', () => {
			it('Should keep unChecked if checked is false', () => {
				render(
					<label>
						<input type='checkbox' checked={false} name='test' value='test' /> test
					</label>,
					container
				);

				// Verify its not checked
				const input = container.querySelector('input');

				expect(input.checked).toBe(false);

				input.click();

				expect(input.checked).toBe(false);
			});

			it('Should be possible to control checkbox by props', () => {
				class ComponentTest extends Component {
					constructor(props) {
						super(props);
						this.state = { checked: false };
					}
					handleClick(event) {
						this.setState((state) => ({ checked: !state.checked }));
					}
					render() {
						return (
						<div>
							<button onClick={() => this.handleClick()} />
							<input type="checkbox" checked={this.state.checked} />
						</div>
						);
					}
				}

				render(<ComponentTest/>, container);

				expect(container.querySelectorAll('input').length).toBe(1);

				const input = container.querySelector('input');
				const button = container.querySelector('button');

				expect(input.checked).toBe(false);

				button.click();

				expect(input.checked).toBe(true);
			});

			it('Clicking checkbox should have value changed in callback, and reverted after it (unless no change in state)', () => {
				let changeToValue = true;

				class ComponentTest extends Component {
					constructor(props) {
						super(props);
						this.state = { checked: true };
					}
					handleClick(event) {
						expect(event.currentTarget.checked).toBe(false);

						this.setState((state) => ({ checked: changeToValue }));
					}
					render() {
						return (
						<div>
							<input onClick={(e) => this.handleClick(e)} type="checkbox" checked={this.state.checked} />
						</div>
						);
					}
				}

				render(<ComponentTest/>, container);

				expect(container.querySelectorAll('input').length).toBe(1);

				const input = container.querySelector('input');

				expect(input.checked).toBe(true);

				input.click();

				expect(input.checked).toBe(true);

				changeToValue = false;

				input.click();

				expect(input.checked).toBe(false);
			});

			/* Same test as above, but in opposite order */
			it('Clicking checkbox should have value changed in callback, and reverted after it (unless no change in state) #2', () => {
				let changeToValue = false;

				class ComponentTest extends Component {
					constructor(props) {
						super(props);
						this.state = { checked: false };
					}
					handleClick(event) {
						expect(event.currentTarget.checked).toBe(true);

						this.setState((state) => ({ checked: changeToValue }));
					}
					render() {
						return (
						<div>
							<input onClick={(e) => this.handleClick(e)} type="checkbox" checked={this.state.checked} />
						</div>
						);
					}
				}

				render(<ComponentTest/>, container);

				expect(container.querySelectorAll('input').length).toBe(1);

				const input = container.querySelector('input');

				expect(input.checked).toBe(false); // Initially false

				input.click(); // Inside event handler should be true

				expect(input.checked).toBe(false); // After render it should be false again

				changeToValue = true;

				input.click(); // Inside event handler should be true

				expect(input.checked).toBe(true); // Now it should be true because value was changed in state
			});
		});
	});
});
