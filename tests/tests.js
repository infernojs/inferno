/** @jsx t */
/* global describe it beforeEach afterEach */
import Inferno from '../src';
import { expect } from 'chai';
import t7 from '../examples/t7';
import { setAttribute } from '../src/template/DOMOperations';
import addAttributes from '../src/template/addAttributes';
import DOMOperations from '../src/template/DOMOperations';
import unitlessCfg from '../src/template/cfg/unitlessCfg';
import extendUnitlessNumber from '../src/template/extendUnitlessNumber';
import get from './tools/get';

// expose t7 and Inferno globally
global.t7 = t7;
global.Inferno = Inferno;

describe('Inferno acceptance tests', () => {
	describe('Inferno.render()', () => {
		describe('DOM elements tests', () => {
			var container;

			beforeEach(() => {
				container = document.createElement('div');
			});

			afterEach(() => {
				Inferno.clearDomElement(container);
				container = null;
			});

			describe('using the Inferno functional API', () => {
				describe('should render a basic example', () => {
					let template;

					beforeEach(() => {
						template = Inferno.createTemplate(t => <div>Hello world</div>);
						Inferno.render(Inferno.createFragment(null, template), container);
					});

					it('Initial render (creation)', () => {
						expect(
							container.innerHTML
						).to.equal(
							'<div>Hello world</div>'
						);
					});

					it('Second render (update)', () => {
						Inferno.render(Inferno.createFragment(null, template), container);
						expect(
							container.innerHTML
						).to.equal(
							'<div>Hello world</div>'
						);
					});
				});

				describe('should render a basic example #2 (no JSX)', () => {
					let template;

					beforeEach(() => {
						template = Inferno.createTemplate(t =>
							<ul>
								<li>Im a li-tag</li>
								<li>Im a li-tag</li>
								<li>Im a li-tag</li>
							</ul>
						);
						Inferno.render(Inferno.createFragment(null, template), container);
					});

					it('Initial render (creation)', () => {
						expect(
							container.innerHTML
						).to.equal(
							`<ul><li>Im a li-tag</li><li>Im a li-tag</li><li>Im a li-tag</li></ul>`
						);
					});
				});

				describe('should render a basic example with dynamic values', () => {
					let template;

					beforeEach(() => {
						template = Inferno.createTemplate((t, val1, val2) =>
							<div>Hello world - { val1 } { val2 }</div>
						);
						Inferno.render(Inferno.createFragment(['Inferno', 'Owns'], template), container);
					});

					it('Initial render (creation)', () => {
						expect(
							container.innerHTML
						).to.equal(
							'<div>Hello world - Inferno Owns</div>'
						);
					});

					it('Second render (update)', () => {
						Inferno.render(Inferno.createFragment(['Test', 'Works!'], template), container);
						expect(
							container.innerHTML
						).to.equal(
							'<div>Hello world - Test Works!</div>'
						);
					});
				});

				describe('should render a basic example with dynamic values and props', () => {
					let template;

					beforeEach(() => {
						template = Inferno.createTemplate((t, val1, val2) =>
							<div className='foo'>
								<span className='bar'>{ val1 }</span>
								<span className='yar'>{ val2 }</span>
							</div>
						);
						Inferno.render(Inferno.createFragment(['Inferno', 'Rocks'], template), container);
					});

					it('Initial render (creation)', () => {
						expect(
							container.innerHTML
						).to.equal(
							`<div class="foo"><span class="bar">Inferno</span><span class="yar">Rocks</span></div>`
						);
					});

					it('Second render (update)', () => {
						Inferno.render(Inferno.createFragment(['Rocks', 'Inferno'], template), container);
						expect(
							container.innerHTML
						).to.equal(
							`<div class="foo"><span class="bar">Rocks</span><span class="yar">Inferno</span></div>`
						);
					});
				});

				describe('should properly render input download attribute', () => {
					let template;

					beforeEach(() => {
						template = Inferno.createTemplate((t, val1) =>
							<input download={ val1 }></input>
						);
						Inferno.render(Inferno.createFragment(false, template), container);
					});

					it('Initial render (creation)', () => {
						expect(
							container.innerHTML
						).to.equal(
							'<input>'
						);
					});

					it('Second render (update)', () => {
						Inferno.render(Inferno.createFragment(true, template), container);
						expect(
							container.innerHTML
						).to.equal(
							'<input download="">'
						);
					});
				});

				describe('should properly render input download attribute (HTML5)', () => {
					let template;

					beforeEach(() => {
						template = Inferno.createTemplate((t, val1) =>
							<input download={ val1 }></input>
						);
						Inferno.render(Inferno.createFragment("dominic", template), container);
					});

					it('Initial render (creation)', () => {
						expect(
							container.innerHTML
						).to.equal(
							'<input download="dominic">'
						);
					});

					it('Second render (update)', () => {
						Inferno.render(Inferno.createFragment(true, template), container);
						expect(
							container.innerHTML
						).to.equal(
							'<input download="">'
						);
					});
				});

				describe('should properly render "className" property', () => {
					let template;

					beforeEach(() => {
						template = Inferno.createTemplate(t =>
							<input className="Hello, world!"></input>
						);
						Inferno.render(Inferno.createFragment(null, template), container);
					});

					it('Initial render (creation)', () => {
						expect(
							container.innerHTML
						).to.equal(
							'<input class="Hello, world!">'
						);
					});
				});


				describe('should properly render boolean attribues (html5)', () => {
					let template;

					beforeEach(() => {
						template = Inferno.createTemplate(t =>
							<input checked="checked" disabled="disabled"></input>
						);
						Inferno.render(Inferno.createFragment(null, template), container);
					});

					it('Initial render (creation)', () => {
						expect(
							container.innerHTML
						).to.equal(
							'<input checked="checked" disabled="disabled">'
						);
					});
				});

				describe('should properly render boolean attribues (truthy)', () => {
					let template;

					beforeEach(() => {
						template = Inferno.createTemplate(t =>
							<input checked={true} disabled={true}></input>
						);
						Inferno.render(Inferno.createFragment(null, template), container);
					});

					it('Initial render (creation)', () => {
						expect(
							container.innerHTML
						).to.equal(
							'<input checked="" disabled="">'
						);
					});
				});

				describe('should not render overloaded boolean attribues (falsy)', () => {
					let template;

					beforeEach(() => {
						template = Inferno.createTemplate(t =>
							<input checked={false} disabled={false}></input>
						);
						Inferno.render(Inferno.createFragment(null, template), container);
					});

					it('Initial render (creation)', () => {
						expect(
							container.innerHTML
						).to.equal(
							'<input>'
						);
					});
				});

				describe('should properly render boolean attribues (falsy)', () => {
					let template;

					beforeEach(() => {
						template = Inferno.createTemplate(t =>
							<input checked="false" disabled="false"></input>
						);
						Inferno.render(Inferno.createFragment(null, template), container);
					});

					it('Initial render (creation)', () => {
						expect(
							container.innerHTML
						).to.equal(
							'<input checked="false" disabled="false">'
						);
					});
				});

				describe('shouldn\'t render undefined value', () => {
					let template;

					beforeEach(() => {
						template = Inferno.createTemplate(t =>
							<input checked={undefined}></input>
						);
						Inferno.render(Inferno.createFragment(null, template), container);
					});

					it('Initial render (creation)', () => {
						expect(
							container.innerHTML
						).to.equal(
							'<input>'
						);
					});
				});


				describe('shouldn\'t render undefined value', () => {
					let template;

					beforeEach(() => {
						template = Inferno.createTemplate(t =>
							<div className={undefined}></div>
						);
						Inferno.render(Inferno.createFragment(null, template), container);
					});

					it('Initial render (creation)', () => {
						expect(
							container.innerHTML
						).to.equal(
							'<div></div>'
						);
					});
				});

				describe('should be rendered as custom attribute', () => {
					let template;

					beforeEach(() => {
						template = Inferno.createTemplate(t =>
							<div custom-attr={123}></div>
						);
						Inferno.render(Inferno.createFragment(null, template), container);
					});

					it('Initial render (creation)', () => {
						expect(
							container.innerHTML
						).to.equal(
							'<div custom-attr="123"></div>'
						);
					});
				});

				describe('should not render null properties', () => {
					let template;

					beforeEach(() => {
						template = Inferno.createTemplate(t =>
							<web-component className={null} id={null}></web-component>
						);
						Inferno.render(Inferno.createFragment(null, template), container);
					});

					it('Initial render (creation)', () => {
						expect(
							container.innerHTML
						).to.equal(
							'<web-component></web-component>'
						);
					});
				});

				describe('should properly render "id" property', () => {
					let template;

					beforeEach(() => {
						template = Inferno.createTemplate(t =>
							<web-component id={123}></web-component>
						);
						Inferno.render(Inferno.createFragment(null, template), container);
					});

					it('Initial render (creation)', () => {
						expect(
							container.innerHTML
						).to.equal(
							'<web-component id="123"></web-component>'
						);
					});
				});

				describe('should render overloaded boolean as a number value', () => {
					let template;

					beforeEach(() => {
						template = Inferno.createTemplate(t =>
							<input download={0}></input>
						);
						Inferno.render(Inferno.createFragment(null, template), container);
					});

					it('Initial render (creation)', () => {
						expect(
							container.innerHTML
						).to.equal(
							'<input download="0">'
						);
					});
				});

				describe('should render download with boolean false value', () => {
					let template;

					beforeEach(() => {
						template = Inferno.createTemplate(t =>
							<input href="/images/xxx.jpg" download={false}></input>
						);
						Inferno.render(Inferno.createFragment(null, template), container);
					});

					it('Initial render (creation)', () => {
						expect(
							container.innerHTML
						).to.equal(
							'<input href="/images/xxx.jpg">'
						);
					});
				});

				describe('should render download with boolean null value', () => {
					let template;

					beforeEach(() => {
						template = Inferno.createTemplate(t =>
							<input href="/images/xxx.jpg" download={null}></input>
						);
						Inferno.render(Inferno.createFragment(null, template), container);
					});

					it('Initial render (creation)', () => {
						expect(
							container.innerHTML
						).to.equal(
							'<input href="/images/xxx.jpg">'
						);
					});
				});

				describe('should render "overloaded" boolean properties', () => {
					let template;

					beforeEach(() => {
						template = Inferno.createTemplate(t =>
							<input href="/images/xxx.jpg" download="true"></input>
						);
						Inferno.render(Inferno.createFragment(null, template), container);
					});

					it('Initial render (creation)', () => {
						expect(
							container.innerHTML
						).to.equal(
							'<input href="/images/xxx.jpg" download="true">'
						);
					});
				});

				describe('should not render overloaded "allowFullScreen" boolean attributes', () => {
					let template;

					beforeEach(() => {
						template = Inferno.createTemplate(t =>
							<input allowFullScreen={false}></input>
						);
						Inferno.render(Inferno.createFragment(null, template), container);
					});

					it('Initial render (creation)', () => {
						expect(
							container.innerHTML
						).to.equal(
							'<input>'
						);
					});
				});

				describe('should render "allowFullScreen" boolean attributes', () => {
					let template;

					beforeEach(() => {
						template = Inferno.createTemplate(t =>
							<input allowFullScreen="false"></input>
						);
						Inferno.render(Inferno.createFragment(null, template), container);
					});

					it('Initial render (creation)', () => {
						expect(
							container.innerHTML
						).to.equal(
							'<input allowfullscreen="false">'
						);
					});
				});

				describe('should not render "scoped" boolean attributes as "null"', () => {
					let template;

					beforeEach(() => {
						template = Inferno.createTemplate(t =>
							<input scoped={null}></input>
						);
						Inferno.render(Inferno.createFragment(null, template), container);
					});

					it('Initial render (creation)', () => {
						expect(
							container.innerHTML
						).to.equal(
							'<input>'
						);
					});
				});

				// "muted" is a property
				describe('should not render "muted" boolean attributes (falsy)', () => {
					let template;

					beforeEach(() => {
						template = Inferno.createTemplate(t =>
							<input muted={false}></input>
						);
						Inferno.render(Inferno.createFragment(null, template), container);
					});

					it('Initial render (creation)', () => {
                        // this is a property
						expect(container.firstChild.muted).to.be.false;
						expect(
							container.innerHTML
						).to.equal(
							'<input>'
						);
					});
				});

				// "muted" is a property
				describe('should not render "muted" boolean attributes (truthy)', () => {
					let template;

					beforeEach(() => {
						template = Inferno.createTemplate(t =>
							<input muted={true}></input>
						);
						Inferno.render(Inferno.createFragment(null, template), container);
					});

					it('Initial render (creation)', () => {
                        // this is a property
						expect(container.firstChild.muted).to.be.true;
						expect(
							container.innerHTML
						).to.equal(
							'<input>'
						);
					});
				});


				describe('should render "required" boolean attribute (truthy)', () => {
					let template;

					beforeEach(() => {
						template = Inferno.createTemplate(t =>
							<input required={true}></input>
						);
						Inferno.render(Inferno.createFragment(null, template), container);
					});

					it('Initial render (creation)', () => {
                        // this is a property

						expect(
							container.innerHTML
						).to.equal(
							'<input required="">'
						);
					});
				});

				// 'required' is a property and should not be set if a falsy value
				describe('should render "required" boolean attribute (falsy)', () => {
					let template;

					beforeEach(() => {
						template = Inferno.createTemplate(t =>
							<input required={false}></input>
						);
						Inferno.render(Inferno.createFragment(null, template), container);
					});

					it('Initial render (creation)', () => {
                        // this is a property
						expect(
							container.innerHTML
						).to.equal(
							'<input>'
						);
					});
				});


				describe('should render "hidden" boolean attribute (truthy)', () => {
					let template;

					beforeEach(() => {
						template = Inferno.createTemplate(t =>
							<input hidden={true}></input>
						);
						Inferno.render(Inferno.createFragment(null, template), container);
					});

					it('Initial render (creation)', () => {
                        // this is a property
						expect(
							container.innerHTML
						).to.equal(
							'<input hidden="">'
						);
					});
				});

				describe('should render "hidden" boolean attribute (falsy)', () => {
					let template;

					beforeEach(() => {
						template = Inferno.createTemplate(t =>
							<input hidden={false}></input>
						);
						Inferno.render(Inferno.createFragment(null, template), container);
					});

					it('Initial render (creation)', () => {
                        // this is a property

						expect(
							container.innerHTML
						).to.equal(
							'<input>'
						);
					});
				});

				describe('should render "draggable" boolean attribute (truthy)', () => {
					let template;

					beforeEach(() => {
						template = Inferno.createTemplate(t =>
							<input draggable="true"></input>
						);
						Inferno.render(Inferno.createFragment(null, template), container);
					});

					it('Initial render (creation)', () => {
                        // this is a property

						expect(
							container.innerHTML
						).to.equal(
							'<input draggable="true">'
						);
					});
				});

				describe('should not render "hidden" boolean attributes if "null"', () => {
					let template;

					beforeEach(() => {
						template = Inferno.createTemplate(t =>
							<input hidden={null}></input>
						);
						Inferno.render(Inferno.createFragment(null, template), container);
					});

					it('Initial render (creation)', () => {
                        // this is a property

						expect(
							container.innerHTML
						).to.equal(
							'<input>'
						);
					});
				});

				describe('should not render "formNoValidate" boolean attributes if "null"', () => {
					let template;

					beforeEach(() => {
						template = Inferno.createTemplate(t =>
							<input formNoValidate={null}></input>
						);
						Inferno.render(Inferno.createFragment(null, template), container);
					});

					it('Initial render (creation)', () => {
                        // this is a property

						expect(
							container.innerHTML
						).to.equal(
							'<input>'
						);
					});
				});

				describe('should render `formNoValidate` boolean attribute (thruty)', () => {
					let template;

					beforeEach(() => {
						template = Inferno.createTemplate(t =>
							<input formNoValidate={ true }></input>
						);
						Inferno.render(Inferno.createFragment(null, template), container);
					});

					it('Initial render (creation)', () => {
                        // this is a property
						expect(
							container.innerHTML
						).to.equal(
							'<input formnovalidate="">'
						);
					});
				});


				describe('should not render "seamless" boolean attributes if "null"', () => {
					let template;

					beforeEach(() => {
						template = Inferno.createTemplate(t =>
							<input seamless={null}></input>
						);
						Inferno.render(Inferno.createFragment(null, template), container);
					});

					it('Initial render (creation)', () => {
                        // this is a property
						expect(
							container.innerHTML
						).to.equal(
							'<input>'
						);
					});
				});

				describe('should render "seamless" boolean attribute (thruty)', () => {
					let template;

					beforeEach(() => {
						template = Inferno.createTemplate(t =>
							<input seamless={true}></input>
						);
						Inferno.render(Inferno.createFragment(null, template), container);
					});

					it('Initial render (creation)', () => {
                        // this is a property

						expect(
							container.innerHTML
						).to.equal(
							'<input seamless="">'
						);
					});
				});

				describe('should properly render "className" property', () => {
					let template;

					beforeEach(() => {
						template = Inferno.createTemplate(t =>
							<input className="Hello, world!"></input>
						);
						Inferno.render(Inferno.createFragment(null, template), container);
					});

					it('Initial render (creation)', () => {
						expect(
							container.innerHTML
						).to.equal(
							'<input class="Hello, world!">'
						);
					});
				});

				describe('should properly render numeric properties', () => {
					let template;

					beforeEach(() => {
						template = Inferno.createTemplate(t =>
							<input start="5"></input>
						);
						Inferno.render(Inferno.createFragment(null, template), container);
					});

					it('Initial render (creation)', () => {
						expect(
							container.innerHTML
						).to.equal(
							'<input start="5">'
						);
					});
				});

				describe('should properly render "disabled" boolean property', () => {
					let template;

					beforeEach(() => {
						template = Inferno.createTemplate(t =>
							<input type='checkbox' disabled={true}></input>
						);
						Inferno.render(Inferno.createFragment(null, template), container);
					});

					it('Initial render (creation)', () => {
						expect(
							container.innerHTML
						).to.equal(
							'<input type="checkbox" value="" disabled="">'
						);
					});
				});

				describe('should not render overloaded falsy boolean properties', () => {
					let template;

					beforeEach(() => {
						template = Inferno.createTemplate(t =>
							<input disabled={false} type='checkbox'></input>
						);
						Inferno.render(Inferno.createFragment(null, template), container);
					});

					it('Initial render (creation)', () => {
						expect(
							container.innerHTML
						).to.equal(
							'<input type="checkbox" value="">'
						);
					});
				});

				describe('should not render overloaded falsy boolean properties', () => {
					let template;

					beforeEach(() => {
						template = Inferno.createTemplate(t =>
							<input disabled="false" type='checkbox'></input>
						);
						Inferno.render(Inferno.createFragment(null, template), container);
					});

					it('Initial render (creation)', () => {
						expect(
							container.innerHTML
						).to.equal(
							'<input disabled="false" type="checkbox" value="">'
						);
					});
				});

				describe('should render disabled boolean property as "disabled"', () => {
					let template;

					beforeEach(() => {
						template = Inferno.createTemplate(t =>
							<input type='checkbox' disabled='disabled'></input>
						);
						Inferno.render(Inferno.createFragment(null, template), container);
					});

					it('Initial render (creation)', () => {
						expect(
							container.innerHTML
						).to.equal(
							'<input type="checkbox" value="" disabled="disabled">'
						);
					});
				});

				describe('should properly handle custom properties on web components', () => {
					let template;

					beforeEach(() => {
						template = Inferno.createTemplate(t =>
							<div dominic="cool"></div>
						);
						Inferno.render(Inferno.createFragment(null, template), container);
					});

					it('Initial render (creation)', () => {
						expect(
							container.innerHTML
						).to.equal(
							'<div dominic="cool"></div>'
						);
					});
				});

				describe('should properly handle "aria-label" attribute', () => {
					let template;

					beforeEach(() => {
						template = Inferno.createTemplate(t =>
							<div aria-label="false"></div>
						);
						Inferno.render(Inferno.createFragment(null, template), container);
					});

					it('Initial render (creation)', () => {
						expect(
							container.innerHTML
						).to.equal(
							'<div aria-label="false"></div>'
						);
					});
				});

				describe('should properly handle custom properties', () => {
					let template;

					beforeEach(() => {
						template = Inferno.createTemplate(t =>
							<div awesomeness="5"></div>
						);
						Inferno.render(Inferno.createFragment(null, template), container);
					});

					it('Initial render (creation)', () => {
						expect(
							container.innerHTML
						).to.equal(
							'<div awesomeness="5"></div>'
						);
					});
				});

				describe('should properly handle the "title" attribute', () => {
					let template;

					beforeEach(() => {
						template = Inferno.createTemplate(t =>
							<div title="Inferno"></div>
						);

						Inferno.render(Inferno.createFragment(null, template), container);
					});

					it('Initial render (creation)', () => {
						expect(
							container.innerHTML
						).to.equal(
							'<div title="Inferno"></div>'
						);
					});
				});

				describe('should properly set className to empty string instead of null', () => {
					let template;

					beforeEach(() => {
						template = Inferno.createTemplate(t =>
							<div className=""></div>
						);
						Inferno.render(Inferno.createFragment(null, template), container);
					});

					it('Initial render (creation)', () => {
						expect(
							container.innerHTML
						).to.equal(
							'<div class=""></div>'
						);
					});
				});
/*
				describe('should handle selectedIndex', () => {
					let template;

					beforeEach(() => {
						template = Inferno.createTemplate(t =>
							<select selectedIndex="-1"><option>a2</option><option>a3</option></select>
						);
						Inferno.render(Inferno.createFragment(null, template), container);
					});

					it('Initial render (creation)', () => {
						expect(
							container.innerHTML
						).to.equal(
							'<select><option>a2</option><option>a3</option></select>'
						);
					});
				});
*/
				describe('should populate the value attribute on select', () => {
					let template;

					beforeEach(() => {
						template = Inferno.createTemplate(t =>
							<select multiple={true} value="bar">
								<option value="foo">foo</option>
								<option value="bar">bar</option>
							</select>
						);
						Inferno.render(Inferno.createFragment(null, template), container);
					});

					it('Initial render (creation)', () => {
						expect(get(container.firstChild)).to.eql(['bar']);
						expect(
							container.innerHTML
						).to.equal(
							'<select multiple=""><option>foo</option><option>bar</option></select>'
						);
					});
				});

				describe('should populate the `value` attribute on select multiple', () => {
					let template;

					beforeEach(() => {
						template = Inferno.createTemplate((t, val1, val2) =>
							<select multiple='mutiple' value={['foo', 'bar']}>
								<option value='bar'>{ val1 }</option>
								<option value='foo'>{ val2 }</option>
							</select>
						);
						Inferno.render(Inferno.createFragment(['bar', 'foo'], template), container);
					});

					it('Initial render (creation)', () => {

						expect(container.firstChild.options[1].selected).to.be.true;
						expect(get(container.firstChild).sort()).to.eql(['bar', 'foo']);
						expect(
							container.innerHTML
						).to.equal(
							`<select multiple=""><option>bar</option><option>foo</option></select>`
						);
					});

					it('Second render (update)', () => {
						Inferno.render(Inferno.createFragment(['Rocks', 'Inferno'], template), container);
						expect(
							container.innerHTML
						).to.equal(
							`<select multiple=""><option>Rocks</option><option>Inferno</option></select>`
						);
					});
				});

				describe('should populate the `value` attribute on select multiple using groups', () => {
					let template;

					beforeEach(() => {
						template = Inferno.createTemplate((t, val1, val2) =>
							<select multiple='mutiple' value={['foo', 'bar']}>
								<optgroup label='foo-group'>
									<option value='bar'>{ val1 }</option>
								</optgroup>
								<optgroup label='bar-group'>
									<option value='foo'>{ val2 }</option>
								</optgroup>
							</select>
						);
						Inferno.render(Inferno.createFragment(['bar', 'foo'], template), container);
					});

					it('Initial render (creation)', () => {

						expect(
							container.innerHTML
						).to.equal(
							`<select multiple=""><optgroup label="foo-group"></optgroup><optgroup label="bar-group"></optgroup></select>`
						);
					});

					it('Second render (update)', () => {
						Inferno.render(Inferno.createFragment(['Rocks', 'Inferno'], template), container);
						expect(
							container.innerHTML
						).to.equal(
							`<select multiple=""><optgroup label="foo-group"></optgroup><optgroup label="bar-group"></optgroup></select>`
						);
					});
				});

				describe('should render a basic component', () => {
					class TestComponent extends Inferno.Component {
						render() {
							return Inferno.createFragment(null, t =>
								<span>Hello world!</span>
							);
						}
					}
					let template;

					beforeEach(() => {
						template = Inferno.createTemplate((t, Component) =>
							<div className='foo'>
								<Component />
							</div>
						);
						Inferno.render(Inferno.createFragment(TestComponent, template), container);
					});

					it('Initial render (creation)', () => {
						expect(
							container.innerHTML
						).to.equal(
							`<div class="foo"><span>Hello world!</span></div>`
						);
					});
				});

				describe('should render a basic component #2', () => {
					class TestComponent extends Inferno.Component {
						render() {
							return Inferno.createFragment(null, t =>
								<span>Hello world!</span>
							);
						}
					}
					let template;

					beforeEach(() => {
						template = Inferno.createTemplate((t, Component) =>
							<div className='foo'>
								<span>Foo!</span>
								<Component />
							</div>
						);
						Inferno.render(Inferno.createFragment(TestComponent, template), container);
					});

					it('Initial render (creation)', () => {
						expect(
							container.innerHTML
						).to.equal(
							`<div class="foo"><span>Foo!</span><span>Hello world!</span></div>`
						);
					});
				});

				describe('should render a basic component #3', () => {
					class TestComponent extends Inferno.Component {
						render() {
							return Inferno.createFragment(this.props.test, (t, val1) =>
								<span>Hello world! { val1 } are belong to us</span>
							);
						}
					}
					let template;

					beforeEach(() => {
						template = Inferno.createTemplate((t, Component, val1) =>
							<div className='foo'>
								<span>Foo!</span>
								<Component test={ val1 } />
							</div>
						);
						Inferno.render(Inferno.createFragment([TestComponent, 'All your base'], template), container);
					});

					it('Initial render (creation)', () => {
						expect(
							container.innerHTML
						).to.equal(
							`<div class="foo"><span>Foo!</span><span>Hello world! All your base are belong to us</span></div>`
						);
					});
				});
			});

			describe('using the Inferno t7 template API', () => {
				beforeEach(() => {
					t7.setOutput(t7.Outputs.Inferno);
				});

				it('should render a basic example', () => {
					Inferno.render(
						t7`<div>Hello world</div>`,
						container
					);

					var test = container.innerHTML;
					var expected = '<div>Hello world</div>';

					expect(test).to.equal(expected);
				});

				it('should render a basic example with dynamic values', () => {
					var val1 = 'Inferno';
					var val2 = 'Owns';

					Inferno.render(
						t7`<div>Hello world - ${ val1 } ${ val2 }</div>`,
						container
					);

					var test = container.innerHTML;
					var expected = '<div>Hello world - Inferno Owns</div>';

					expect(test).to.equal(expected);
				});

				it('should render a basic example with dynamic values and props', () => {
					var val1 = 'Inferno';
					var val2 = 'Rocks';

					Inferno.render(
						t7`<div class='foo'><span class='bar'>${ val1 }</span><span class='yar'>${ val2 }</span></div>`,
						container
					);

					expect(
						container.innerHTML
					).to.equal(
						`<div class="foo"><span class="bar">Inferno</span><span class="yar">Rocks</span></div>`
					);
				});

				it('should properly render input download attribute', () => {
					Inferno.render(
						t7`<input download=${ false } />`,
						container
					);

					var test = container.innerHTML;
					var expected = '<input>';

					expect(test).to.equal(expected);
				});
			});
		});

		describe('Virtual elements tests', () => {
			var container;

			beforeEach(() => {
				container = Inferno.template.createElement('div', null, true);
			});

			afterEach(() => {
				container = null;
			});

			describe('using the Inferno functional API', () => {
				it('should render a basic example', () => {
					var template = Inferno.createTemplate(t => <div>Hello world</div>);

					Inferno.render(Inferno.createFragment(null, template), container);

					expect(
						container.innerHTML
					).to.equal(
						'<div>Hello world</div>'
					);
				});

				it('should render a basic example with dynamic values', () => {
					let template = Inferno.createTemplate((t, val1, val2) =>
						<div>Hello world - { val1 } { val2 }</div>
					);

					Inferno.render(
						Inferno.createFragment(['Inferno', 'Owns'], template),
						container
					);

					var test = container.innerHTML;
					var expected = '<div>Hello world - Inferno Owns</div>';

					expect(test).to.equal(expected);
				});

				it('should render a basic example with dynamic values and props', () => {
					let template = Inferno.createTemplate((t, val1, val2) =>
						<div className='foo'>
							<span className='bar'>{ val1 }</span>
								<span className='yar'>{ val2 }</span>
								</div>
					);

					Inferno.render(
						Inferno.createFragment(['Inferno', 'Rocks'], template),
						container
					);

					expect(
						container.innerHTML
					).to.equal(
						`<div class="foo"><span class="bar">Inferno</span><span class="yar">Rocks</span></div>`
					);
				});
			});

			describe('using the Inferno t7 template API', () => {
				beforeEach(() => {
					t7.setOutput(t7.Outputs.Inferno);
				});

				it('should render a basic example', () => {
					Inferno.render(
						t7`<div>Hello world</div>`,
						container
					);

					var test = container.innerHTML;
					var expected = '<div>Hello world</div>';

					expect(test).to.equal(expected);
				});

				it('should render a basic example with dynamic values', () => {
					var val1 = 'Inferno';
					var val2 = 'Owns';

					Inferno.render(
						t7`<div>Hello world - ${ val1 } ${ val2 }</div>`,
						container
					);

					var test = container.innerHTML;
					var expected = '<div>Hello world - Inferno Owns</div>';

					expect(test).to.equal(expected);
				});

				it('should render a basic example with dynamic values and props', () => {
					var val1 = 'Inferno';
					var val2 = 'Rocks';

					Inferno.render(
						t7`<div class='foo'><span class='bar'>${ val1 }</span><span class='yar'>${ val2 }</span></div>`,
						container
					);

					expect(
						container.innerHTML
					).to.equal(
						`<div class="foo"><span class="bar">Inferno</span><span class="yar">Rocks</span></div>`
					);
				});
			});
		});
	});

	describe('Inferno.renderToString()', () => {
		describe('DOM elements tests', () => {
			var container;

			beforeEach(() => {
				container = document.createElement('div');
			});

			afterEach(() => {
				Inferno.clearDomElement(container);
				container = null;
			});

			describe('using the Inferno functional API', () => {
				it('should render a basic example', () => {
					let template = Inferno.createTemplate(t => <div>Hello world</div>);

					var test = Inferno.renderToString(
						Inferno.createFragment(null, template)
					);

					var expected = '<div>Hello world</div>';

					expect(test).to.equal(expected);
				});

				it('should render a basic example with dynamic values', () => {
					let template = Inferno.createTemplate((t, val1, val2) =>
						<div>Hello world - { val1 } { val2 }</div>
					);

					var test = Inferno.renderToString(
						Inferno.createFragment(['Inferno', 'Owns'], template)
					);

					var expected = '<div>Hello world - Inferno Owns</div>';

					expect(test).to.equal(expected);
				});

				it('should render a basic example with dynamic values and props', () => {
					let template = Inferno.createTemplate((t, val1, val2) =>
						<div className='foo'>
							<span className='bar'>{ val1 }</span>
							<span className='yar'>{ val2 }</span>
						</div>
					);

					var test = Inferno.renderToString(
						Inferno.createFragment(['Inferno', 'Rocks'], template)
					);

					expect(
						test
					).to.equal(
						`<div class="foo"><span class="bar">Inferno</span><span class="yar">Rocks</span></div>`
					);
				});
			});

			describe('using the Inferno t7 template API', () => {
				beforeEach(() => {
					t7.setOutput(t7.Outputs.Inferno);
				});

				it('should render a basic example', () => {
					var test = Inferno.renderToString(
						t7`<div>Hello world</div>`
					);

					var expected = '<div>Hello world</div>';

					expect(test).to.equal(expected);
				});

				it('should render a basic example with dynamic values', () => {
					var val1 = 'Inferno';
					var val2 = 'Owns';

					var test = Inferno.renderToString(
						t7`<div>Hello world - ${ val1 } ${ val2 }</div>`
					);

					var expected = '<div>Hello world - Inferno Owns</div>';

					expect(test).to.equal(expected);
				});

				it('should render a basic example with dynamic values and props', () => {
					var val1 = 'Inferno';
					var val2 = 'Rocks';

					var test = Inferno.renderToString(
						t7`<div class='foo'><span class='bar'>${ val1 }</span><span class='yar'>${ val2 }</span></div>`
					);

					expect(
						test
					).to.equal(
						`<div class="foo"><span class="bar">Inferno</span><span class="yar">Rocks</span></div>`
					);
				});
			});
		});

		describe('Virtual elements tests', () => {
			let container;

			beforeEach(() => {
				container = Inferno.template.createElement('div', null, true);
			});

			afterEach(() => {
				container = null;
			});

			describe('using the Inferno functional API', () => {
				it('should render a basic example', () => {
					let template = Inferno.createTemplate(t => <div>Hello world</div>);

					var test = Inferno.renderToString(
						Inferno.createFragment(null, template)
					);

					var expected = '<div>Hello world</div>';

					expect(test).to.equal(expected);
				});

				it('should render a basic example with dynamic values', () => {
					let template = Inferno.createTemplate((t, val1, val2) =>
						<div>Hello world - { val1 } { val2 }</div>
					);

					var test = Inferno.renderToString(
						Inferno.createFragment(['Inferno', 'Owns'], template)
					);

					var expected = '<div>Hello world - Inferno Owns</div>';

					expect(test).to.equal(expected);
				});

				it('should render a basic example with dynamic values and props', () => {
					let template = Inferno.createTemplate((t, val1, val2) =>
						<div className='foo'>
							<span className='bar'>{ val1 }</span>
							<span className='yar'>{ val2 }</span>
						</div>
					);

					var test = Inferno.renderToString(
						Inferno.createFragment(['Inferno', 'Rocks'], template)
					);

					expect(
						test
					).to.equal(
						`<div class="foo"><span class="bar">Inferno</span><span class="yar">Rocks</span></div>`
					);
				});
			});
		});

		describe('using the Inferno t7 template API', () => {
			beforeEach(() => {
				t7.setOutput(t7.Outputs.Inferno);
			});

			it('should render a basic example', () => {
				var test = Inferno.renderToString(
					t7`<div>Hello world</div>`
				);

				var expected = '<div>Hello world</div>';

				expect(test).to.equal(expected);
			});

			it('should render a basic example with dynamic values', () => {
				var val1 = 'Inferno';
				var val2 = 'Owns';

				var test = Inferno.renderToString(
					t7`<div>Hello world - ${ val1 } ${ val2 }</div>`
				);

				var expected = '<div>Hello world - Inferno Owns</div>';

				expect(test).to.equal(expected);
			});

			it('should render a basic example with dynamic values and props', () => {
				var val1 = 'Inferno';
				var val2 = 'Rocks';

				var test = Inferno.renderToString(
					t7`<div class='foo'><span class='bar'>${ val1 }</span><span class='yar'>${ val2 }</span></div>`
				);

				expect(
					test
				).to.equal(
					`<div class="foo"><span class="bar">Inferno</span><span class="yar">Rocks</span></div>`
				);
			});
		});
	});
	
	describe('CSS operations', () => {
		var container;

		beforeEach(() => {
			container = document.createElement('div');
		});

		afterEach(() => {
			Inferno.clearDomElement(container);
			container = null;
		});

		describe('unitlessCfg', () => {
			it('should generate browser prefixes for unitless numbers`', () => {
				expect(unitlessCfg.lineClamp).to.be.true;
				expect(unitlessCfg.WebkitLineClamp).to.be.true;
				expect(unitlessCfg.msFlexGrow).to.be.true;
				expect(unitlessCfg.MozFlexGrow).to.be.true;
				expect(unitlessCfg.msGridRow).to.be.true;
				expect(unitlessCfg.msGridColumn).to.be.true;
			});
		});

		describe('.extendUnitlessNumber()', () => {
			it('should extend unitless numbers', () => {
				extendUnitlessNumber({ 'foo': true, 'bar': true});
				expect(unitlessCfg.foo).to.be.true;
				expect(unitlessCfg.bar).to.be.true;
			});
		});
	});

	describe('DOM operations', () => {
		var container;

		beforeEach(() => {
			container = document.createElement('div');
		});

		afterEach(() => {
			Inferno.clearDomElement(container);
			container = null;
		});

		describe('DOMOperations.toHtml()', () => { 
		
			it('should render `checked` as a property (truthy)', () => {
				expect(DOMOperations().toHtml("checked", true)).to.equal('checked="true"');
			});

			it('should render `checked` ( html5)', () => {
				expect(DOMOperations().toHtml("checked", 'checked')).to.equal('checked="checked"');
			});

			it('should render `checked` (falsy)', () => {
				expect(DOMOperations().toHtml("checked", false)).to.equal('checked="false"');
			});

			it('should render `download` attribute (falsy)', () => {
				expect(DOMOperations().toHtml("download", false)).to.equal('download="false"');
			});

			it('should render custom attribute', () => {
				expect(DOMOperations().toHtml("fooBar", "boo")).to.equal('fooBar="boo"');
			});

			it('should render "multiple" attribute', () => {
				expect(DOMOperations().toHtml("multiple", "true")).to.equal('multiple="true"');
			});

		});
  	 
	 describe('DOMOperations.set()', () => {  
	 
	        it('should render `checked` as a property', () => {
				DOMOperations('checked').set(container, 'checked', true);
				expect(container.getAttribute('checked')).to.equal('');
			});

	        it('should support custom attributes', () => {
				DOMOperations('checked').set(container, 'custom-attr', '123');
				expect(container.getAttribute('custom-attr')).to.equal('123');
			});

	        it('shouldn\'t render null values', () => {
				DOMOperations('checked').set(container, 'value', null);
				expect(container.value).to.be.undefined;
			});

	        it('should set `title` attribute', () => {
				DOMOperations('checked').set(container, 'title', 'dominic');
				expect(container.getAttribute('title')).to.equal('dominic');
			});

	        it('should support HTML5 data-* attribute', () => {
				DOMOperations('checked').set(container, 'data-foo', 'bar');
				expect(container.getAttribute('data-foo')).to.equal('bar');
			});
	 });

	});
});
