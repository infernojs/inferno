/** @jsx t */
/* global describe it beforeEach afterEach */
import Inferno from '../src';
import { expect } from 'chai';
import t7 from '../examples/t7';
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
						Inferno.render(Inferno.createFragment('dominic', template), container);
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
							'<input disabled="disabled">'
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
							'<input disabled="">'
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
							'<input disabled="false">'
						);
					});
				});

				describe('should render dataset property - #1', () => {
					let template;

					beforeEach(() => {
						template = Inferno.createTemplate(t =>
							<input dataset={null}></input>
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


                 describe('should render dataset property - #2', () => {
					let template;
                    let dataS = { foo: 'bar', bar: 'oops' };
					beforeEach(() => {
						template = Inferno.createTemplate(t =>
							<div dataset={dataS}></div>
						);
						Inferno.render(Inferno.createFragment(null, template), container);
					});

					it('Initial render (creation)', () => {
						expect(
							container.innerHTML
						).to.equal(
							'<div data-foo="bar" data-bar="oops"></div>'
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

                /**
				 * Styles
				 */

				describe('should handle basic styles', () => {
					let template;

                    let styleRule = { width:200, height:200}

					beforeEach(() => {
						template = Inferno.createTemplate(t =>
							<div style={styleRule}></div>
						);
						Inferno.render(Inferno.createFragment(null, template), container);
					});

					it('Initial render (creation)', () => {

						expect(
							container.outerHTML
						).to.equal(
							'<div><div style="width: 200px; height: 200px;"></div></div>'
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

			describe('HTML attributes / properties', () => {

			describe('Booleans', () => {
				it('should render `checked` as a property (truthy)', () => {
					expect(DOMOperations('checked').toHtml('checked', true)).to.equal('checked="true"');
				});

				it('should render `checked` ( html5)', () => {
					expect(DOMOperations('checked').toHtml('checked', 'checked')).to.equal('checked="checked"');
				});

				it('should render `checked` (falsy)', () => {
					expect(DOMOperations('checked').toHtml('checked', false)).to.equal('checked="false"');
				});

				it('should render `download` attribute (falsy)', () => {
					expect(DOMOperations('download').toHtml('download', false)).to.equal('download="false"');
				});

				it('should render custom attribute', () => {
					expect(DOMOperations('fooBar').toHtml('fooBar', 'boo')).to.equal('fooBar="boo"');
				});

				it('should render "multiple" attribute - #1', () => {
					expect(DOMOperations('multiple').toHtml('multiple', 'true')).to.equal('multiple');
				});

				it('should render "multiple" attribute - #2', () => {
					expect(DOMOperations('multiple').toHtml('multiple', true)).to.equal('multiple');
				});

				it('should render "multiple" attribute - #3', () => {
					expect(DOMOperations('multiple').toHtml('multiple', false)).to.equal('');
				});

				it('should render "hidden" attribute', () => {
					expect(DOMOperations('download').toHtml('hidden', false)).to.equal('hidden="false"');
				});
				
				it('should render "mute" attribute', () => {
					expect(DOMOperations('mute').toHtml('mute', false)).to.equal('mute="false"');
				});
				
				it('should render "loop" attribute', () => {
					expect(DOMOperations('loop').toHtml('loop', true)).to.equal('loop="true"');
				});

			});
			
			describe('Custom attribute', () => {
				it('should render custom attributes - #1', () => {
					expect(DOMOperations('Inferno').toHtml('Inferno', true)).to.equal('Inferno="true"');
				});
				it('should render custom attributes - #2', () => {
					expect(DOMOperations('Inferno').toHtml('Inferno', 123)).to.equal('Inferno="123"');
				});
				it('should render custom attributes - #3', () => {
					expect(DOMOperations('Inferno').toHtml('Inferno', false)).to.equal('Inferno="false"');
				});
			});
			
			describe('HTML5 data-* attribute', () => {
				it('should render custom attributes', () => {
					expect(DOMOperations('data-foo').toHtml('data-foo', 'bar')).to.equal('data-foo="bar"');
				});
			});
			
			describe('xml / xlink namespace attributes', () => {
				it('should render namespace attributes', () => {
					expect(DOMOperations('xlink:href').toHtml('xlink:href', 'test.jpg')).to.equal('xlink:href="test.jpg"');
				});
				it('should render namespace attributes', () => {
					expect(DOMOperations('xml:id').toHtml('xml:id', 'inferno')).to.equal('xml:id="inferno"');
				});
			});

			describe('dataset property', () => {
				it('should render dataset property - #1', () => {
				let objL = { foo: 'bar', bar: 'oops' };
					expect(DOMOperations('dataset').toHtml('dataset', "")).to.equal('');
				});
				it('should render dataset property - #2', () => {
				let objL = { foo: 'bar', bar: 'oops' };
					expect(DOMOperations('dataset').toHtml('dataset', objL)).to.equal('data-foo="bar" data-bar="oops" ');
				});
			});
		});
			describe('CSS', () => {

				it('should create markup for simple styles', () => {
					expect(DOMOperations('style').toHtml('style', {
						backgroundColor: '#3b5998',
						display: 'none'
					})).to.equal(
						'style="background-color:#3b5998;display:none;"'
					);
				});

				// null, undefined etc. has to be done on a higher level of abstraction - not low-level
				it('should not ignore undefined styles', () => {
					expect(DOMOperations('style').toHtml('style', {
						backgroundColor: undefined,
						display: 'none'
					})).to.equal(
						'style="display:none;"'
					);
				});

				it('should not ignore null styles', () => {
					expect(DOMOperations('style').toHtml('style', {
						backgroundColor: null,
						display: 'none'
					})).to.equal(
						'style="display:none;"'
					);
				});

				it('should automatically append `px` to relevant styles', () => {
					expect(DOMOperations('style').toHtml('style', {
						left: 0,
						margin: 16,
						opacity: 0.5,
						padding: '4px'
					})).to.equal(
						'style="left:0;margin:16px;opacity:0.5;padding:4px;"'
					);
				});

				it('should create vendor-prefixed markup correctly', () => {
					expect(DOMOperations('style').toHtml('style', {
						msTransition: 'none',
						MozTransition: 'none'
					})).to.equal(
						'style="ms-transition:none;moz-transition:none;"'
					);
				});

				it('should trim values so `px` will be appended correctly', () => {
					expect(DOMOperations('style').toHtml('style', {
						margin: '16',
						opacity: 0.5,
						padding: '4'
					})).to.equal('style="margin:16px;opacity:0.5;padding:4px;"');
				});

			});
		});

		describe('DOMOperations.remove()', () => {

			it('should remove a custom attribute', () => {

				DOMOperations('Inferno').set(container, 'Inferno', 'Rocks!');
				DOMOperations('Inferno').remove(container, 'Inferno');
				expect(container.hasAttribute('Inferno')).to.be.false;
			});

			it('should remove a boolean attribute', () => {

				DOMOperations('checked').set(container, 'checked', true);
				DOMOperations('checked').remove(container, 'checked');
				expect(container.hasAttribute('checked')).to.be.false;
				expect(container.checked).to.be.undefined;
			});

			it('should not remove a "null" value attribute', () => {

				DOMOperations('checked').set(container, 'checked', null);
				DOMOperations('checked').remove(container, 'checked');
				expect(container.hasAttribute('checked')).to.be.false;
				expect(container.checked).to.be.undefined;
			});
		});
		
		describe('DOMOperations.set()', () => {

			it('should render `checked` as a property', () => {
				DOMOperations('checked').set(container, 'checked', true);
				expect(container.checked).to.be.true;
			});

			it('should support custom attributes', () => {
				DOMOperations('custom-attr').set(container, 'custom-attr', '123');
				expect(container.getAttribute('custom-attr')).to.equal('123');
			});

			it('shouldn\'t render null values', () => {
				DOMOperations('value').set(container, 'value', null);
				expect(container.value).to.be.null;
			});

			it('should set `title` attribute', () => {
				DOMOperations('title').set(container, 'title', 'dominic');
				expect(container.getAttribute('title')).to.equal('dominic');
			});

			it('should support HTML5 data-* attribute', () => {
				DOMOperations('data-foo').set(container, 'data-foo', 'bar');
				expect(container.getAttribute('data-foo')).to.equal('bar');
			});

			it('should support HTML5 data-* attribute', () => {
				DOMOperations('data-foo').set(container, 'data-foo', 'bar');
				expect(container.getAttribute('data-foo')).to.equal('bar');
			});

			it('should set "muted" boolean property ( truty) ', () => {
				DOMOperations('muted').set(container, 'muted', true);
				expect(container.muted).to.be.true;
			});

			it('should set "muted" boolean property (falsy) ', () => {
				DOMOperations('muted').set(container, 'muted', false);
				expect(container.muted).to.be.false;
			});
			// 'HTML5' should 'force' the value to be true
			it('should set "muted" boolean property (HTML5) ', () => {
				DOMOperations('muted').set(container, 'muted', 'true');
				expect(container.muted).to.be.true;
			});

			it('should not set "muted" boolean property as "muted muted"', () => {
				DOMOperations('muted').set(container, 'muted', 'muted');
				expect(container.muted).to.be.true;
			});

			it('should set "readOnly" boolean property ( truty) ', () => {
				DOMOperations('readOnly').set(container, 'readOnly', true);
				expect(container.readOnly).to.be.true;
			});

			it('should set "readOnly" boolean property (falsy) ', () => {
				DOMOperations('readOnly').set(container, 'readOnly', false);
				expect(container.readOnly).to.be.false;
			});

			it('should set "readOnly" boolean property (HTML5) ', () => {
				DOMOperations('readOnly').set(container, 'readOnly', 'true');
				expect(container.readOnly).to.be.true;
			});

			it('should not set "readOnly" boolean property as "readOnly readOnly"', () => {
				DOMOperations('readOnly').set(container, 'readOnly', 'readOnly');
				expect(container.readOnly).to.be.true;
			});

			it('should set numeric properties', () => {
				DOMOperations('start').set(container, 'start', 5);
				expect(container.getAttribute('start')).to.eql('5');

				DOMOperations('start').set(container, 'start', 0);
				expect(container.getAttribute('start')).to.eql('0');
			});

			it('should set negative numeric properties', () => {
				DOMOperations('start').set(container, 'start', -5);
				expect(container.getAttribute('start')).to.eql('-5');
			});

			it('should set numeric attribute "-0" to "0"', () => {
				DOMOperations('start').set(container, 'start', -0);
				expect(container.getAttribute('start')).to.eql('0');
			});

			it('should set className property', () => {
				DOMOperations('className').set(container, 'className', -0);
				expect(container.getAttribute('class')).to.eql('0');
			});

			it('should set dataset property - #1', () => {
				let objL = { foo: 'bar', bar: 'oops' };
				DOMOperations('dataset').set(container, 'dataset', objL);
				expect(container.dataset).to.eql(objL);
			});

			it('should set dataset property - #2', () => {
				let objL = { foo: 'bar', bar: 'oops' };
				DOMOperations('dataset').set(container, 'dataset', {});
				expect(container.dataset).to.eql({});
			});

			it('should set values as boolean properties', () => {
				DOMOperations('disabled').set(container, 'disabled', 'disabled');
				expect(container.getAttribute('disabled')).to.eql('disabled');

				DOMOperations('disabled').set(container, 'disabled', true);
				expect(container.getAttribute('disabled')).to.eql('');

				// shouldn't exist - it's an attribute
				DOMOperations('disabled').set(container, 'disabled', true);
				expect(container.disabled).to.be.undefined;
			});
		});
	});
});
