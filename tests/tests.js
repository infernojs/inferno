/** @jsx t */
/* global describe it beforeEach afterEach */
import Inferno from '../src';
import { expect } from 'chai';
import t7 from '../examples/t7';
import { setAttribute } from '../src/template/DOMOperations';
import addAttributes from '../src/template/addAttributes';
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
							'<input download="false">'
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
							'<input href="/images/xxx.jpg" download="false">'
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
							'<input formnovalidate="true">'
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
							'<input seamless="true">'
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
<<<<<<< HEAD
						console.log( container.childNodes )
						expect(get(container.childNodes[0])).to.eql(['bar', 'foo']);
=======
						expect(get(container.firstChild).sort()).to.eql(['bar', 'foo']);
>>>>>>> origin/new-build
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

	describe('DOM operations', () => {
		var container;

		beforeEach(() => {
			container = document.createElement('div');
		});

		afterEach(() => {
			Inferno.clearDomElement(container);
			container = null;
		});
/*
		describe('.setAttribute()', () => {
			it('should render `checked` as a property', () => {
				setAttribute(container, 'checked', true);
				expect(container.getAttribute('checked')).to.equal('');
			});

			it('should support custom attributes', () => {
				setAttribute(container, 'custom-attr', 123);
				expect(container.getAttribute('custom-attr')).to.equal('123');

				setAttribute(container, 'foobar', 'simple');
				expect(container.getAttribute('foobar')).to.equal('simple');

			});

			it('shouldn\'t render null values', () => {
				setAttribute(container, 'value', null);
				expect(container.value).to.be.undefined;
			});

			it('should set `title` attribute', () => {
				setAttribute(container, 'title', 'dominic');
				expect(container.getAttribute('title')).to.equal('dominic');

			});

			it('should support HTML5 data-* attribute', () => {
				setAttribute(container, 'data-foo', 'bar');
				expect(container.getAttribute('data-foo')).to.equal('bar');

				setAttribute(container, 'foo-xyz', 'simple');
				expect(container.getAttribute('foo-xyz')).to.equal('simple');
			});
		});

		describe('.addProperties()', () => {
			it('should handle radio buttons as a property', () => {
				addAttributes(container, { type: 'radio', checked: true });
				expect(container.getAttribute('type')).to.eql('radio');
				expect(container.getAttribute('checked')).to.eql('');
			});
		});

		describe('.addAttributes()', () => {

			it('should handle radio buttons', () => {

				addAttributes(container, { type: 'radio', checked: true });
				expect(container.getAttribute('type')).to.eql('radio');
				expect(container.getAttribute('checked')).to.eql('');

			});

			it('should set the `title` attribute', () => {

				addAttributes(container, { title: 'FooBar' });
				expect(container.getAttribute('title')).to.eql('FooBar');

			});

			it('should set `disabled` boolean element property', () => {

				addAttributes(container, { type: 'checkbox' , disabled: true});
				expect(container.getAttribute('disabled')).to.eql('');
			});

			it('should not set `disabled` boolean element property', () => {

				addAttributes(container, { type: 'checkbox' , disabled: true});
				expect(container.getAttribute('disabled')).to.eql('');

			});

			it('should handle empty attributes', () => {
				addAttributes(container, {});
				expect(container.attrs).to.be.undefined;
			});

			it('should ignore a `undefined` attribute', () => {
				addAttributes(container, { 'class': undefined });
				expect(container.hasAttribute('class')).to.be.false;
			});

			it('should ignore a `undefined` value attribute', () => {
				addAttributes(container, { 'value': undefined });
				expect('value' in container).to.be.false;
				expect(container.hasAttribute('value')).to.be.false;

			});

			it('should set `selectedIndex` property as an attribute', () => {
				addAttributes(container, { type: 'option', selectedIndex: true });
				expect(container.getAttribute('type')).to.eql('option');

			});

			it('should set `selected` boolean attribute', () => {
				addAttributes(container, { type: 'radio', selected: true });
				expect(container.getAttribute('type')).to.eql('radio');
				expect(container.selected).to.be.true;

			});

			it('should set `selected` boolean attribute as selected', () => {
				addAttributes(container, { type: 'radio', selected: 'selected' });
				expect(container.getAttribute('type')).to.eql('radio');
				expect(container.selected).to.eql('selected');

			});

			it('should set `checked` boolean attribute', () => {

				addAttributes(container, { type: 'checkbox', checked: true });
				expect(container.getAttribute('type')).to.eql('checkbox');
				expect(container.getAttribute('checked')).to.eql('');

			});

			it('should set `checked` boolean attribute as checked', () => {
				addAttributes(container, { type: 'checkbox', checked: 'checked'});
				expect(container.getAttribute('type')).to.eql('checkbox');
				expect(container.getAttribute('checked')).to.eql('checked');

			});

			it('should set `disabled` boolean attribute as disabled', () => {

				addAttributes(container, { type: 'radio', disabled: 'disabled' });
				expect(container.getAttribute('type')).to.eql('radio');
				expect(container.getAttribute('disabled')).to.eql('disabled');

			});

			it('should set `open` attribute', () => {
				addAttributes(container, { open: 'open' });
				expect(container.open).to.eql('open');
			});

			it('should set `contenteditable` attribute', () => {
				addAttributes(container, { contenteditable: true });
				expect(container.getAttribute('contenteditable')).to.eql('true');

			});

			it('should set `maxlength` attribute', () => {
				addAttributes(container, { maxlength: '5' });
				expect(container.getAttribute('maxlength')).to.eql('5');

			});

			it('should set `aria-disabled` attribute', () => {
				addAttributes(container, { 'aria-disabled': true });
				expect(container.getAttribute('aria-disabled')).to.eql('true');
			});

			it('should not set `aria-disabled` attribute', () => {
				addAttributes(container, { 'aria-disabled': false });
				expect(container.getAttribute('aria-disabled')).to.eql('false');
			});

			it('should set `required` attribute', () => {
				addAttributes(container, { required: 'required' });
				expect(container.required).to.eql('required');

			});

			it('should set `required` attribute to false', () => {

				addAttributes(container, { required: false });
				expect(container.required).to.be.false;
			});

			it('should set `autofocus` attribute', () => {
				addAttributes(container, { autofocus: 'autofocus' });
				expect(container.getAttribute('autofocus')).to.eql('autofocus');

			});

			it('should set `autofocus` attribute to false', () => {

				addAttributes(container, { required: false });
				expect(container.getAttribute('autofocus')).to.be.null;
			});

			it('should unsert `multiple` attribute', () => {
				addAttributes(container, { multiple: undefined });
				expect(container.getAttribute('multiple')).to.be.null;
				expect(container.multiple).to.be.undefined;
			});

			it('should set the `name` attribute and treat it as a property', () => {
				addAttributes(container, { name: 'simple' });
				expect(container.name).to.eql('simple');

			});

			it('should set the `name` attribute to `false`', () => {
				addAttributes(container, { name: 'false' });
				expect(container.name).to.eql('false');

			});

			it('should unset the `name` attribute to `null`', () => {
				addAttributes(container, { name: null });
				expect(container.name).to.be.undefined;

			});

			it('should work with the id attribute', () => {
				addAttributes(container, { id: 'simple' });
				expect(container.id).to.eql('simple');

			});

			it('should create markup for boolean properties', () => {
				addAttributes(container, { checked: 'checked' });
				expect(container.getAttribute('checked')).to.eql('checked');

				addAttributes(container, { checked: 'checked' });
				expect(container.getAttribute('checked')).to.eql('checked');

				addAttributes(container, { checked: false });
				expect(container.getAttribute('checked')).to.eql('false');

				addAttributes(container, { scoped: true });
				expect(container.scoped).to.be.true;

			});

			it('should create markup for booleanish properties', () => {
				addAttributes(container, { download: 'simple' });
				expect(container.getAttribute('download')).to.eql('simple');

				addAttributes(container, { download: true });
				expect(container.getAttribute('download')).to.eql('');

				addAttributes(container, { download: 'true' });
				expect(container.getAttribute('download')).to.eql('true');

			});

			it('should handle numeric attributes', () => {

				addAttributes(container, { start: 5 });
				expect(container.getAttribute('start')).to.eql('5');

				addAttributes(container, { start: 0 });
				expect(container.getAttribute('start')).to.eql('0');

			});

			it('should handle numeric properties', () => {

				addAttributes(container, { size: 0 });
				expect(container.getAttribute('size')).to.eql('0');

				addAttributes(container, { size: 1 });
				expect(container.getAttribute('size')).to.eql('1');

			});

			// className should be '', not 'null' or null (which becomes 'null' in
			// some browsers)
			it('should set className to empty string instead of null', () => {
				addAttributes(container, { className: null });
				expect(container.className).to.eql('');
			});

			it('should set className property', () => {
				addAttributes(container, { className: 'Inferno Rocks!' });
				expect(container.className).to.eql('Inferno Rocks!');
			});


			it('should set `class` attribute', () => {
				addAttributes(container, { class: 'Inferno Rocks!' });
				expect(container.className).to.eql('Inferno Rocks!');
			});


			it('should set `class` attribute to empty string instead of null', () => {
				addAttributes(container, { class: null });
				expect(container.className).to.eql('');
			});


			it('should set `class` attribute to empty string instead of null', () => {
				addAttributes(container, { class: null });
				expect(container.className).to.eql('');
			});

			it('should support ARIA', () => {

				addAttributes(container, { 'aria-checked': true });
				expect(container.getAttribute('aria-checked')).to.eql('true');

			});

			it('should set `class` as an attribute', () => {
				addAttributes(container, { class: 'foo' });
				expect(container.getAttribute('class')).to.eql('foo');

			});

			it('should set multiple as an property', () => {
				addAttributes(container, { multiple: true });
				expect(container.multiple).to.eql(true);

			});

			// 'selectedIndex' should only be set as a 'property'
			it('should set `selectedIndex` property', () => {
				addAttributes(container, {type: 'option', selectedIndex: true });
				expect(container.getAttribute('type')).to.eql('option');
				expect(container.hasAttribute('selectedIndex')).to.be.false;
				expect(container.selectedIndex).to.be.true;

			});

			it('should set `id` property', () => {
				addAttributes(container, { id: '123' });
				expect(container.id).to.eql('123');

			});
			// 'autofocus' should only be set as a 'attribute'
			it('should unset `autofocus` property', () => {
				addAttributes(container, { autofocus: true });
				expect(container.getAttribute('autofocus')).to.eql('true');
				expect(container.autofocus).to.be.undefined;
			});

			it('should render namespace attributes', () => {
				addAttributes(container, { xmlns: 'http://www.w3.org/2000/svg', 'xlink:href': 'test.jpg' });
				expect(container.getAttribute('xmlns')).to.eql('http://www.w3.org/2000/svg');
			});

			it('should support `parametric:xmlns` attributes', () => {
				addAttributes(container, { 'parametric:xmlns': 'http://www.w3.org/2000/svg', 'xlink:href': 'test.jpg' });
				expect(container.getAttribute('parametric:xmlns')).to.eql('http://www.w3.org/2000/svg');
			});

			it('should support `parametric` attributes', () => {
				addAttributes(container, { 'parametric:r': 20, 'parametric:y': 10 });
				expect(container.getAttribute('parametric:r')).to.eql('20');
				expect(container.getAttribute('parametric:y')).to.eql('10');
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

		describe('.addAttributes()', () => {
			it('should create markup for simple styles', () => {
				addAttributes(container, { style: { width: '12px' } });
				expect(container.style.width).to.eql('12px');
			});

			it('should remove all properties if set to undefined', () => {
				addAttributes(container, { style: undefined});
				expect(container.style.width).to.eql('');
			});

			it('should set the `style` attribute using an object', () => {
				addAttributes(container, { style: { display: 'none' } });
				expect(container.style.display).to.eql('none');
			});

			it('should ignore null styles', () => {
				addAttributes(container, { style: { backgroundColor: null, display: 'none' }} );
				expect(container.style['background-color']).to.eql('');
				expect(container.style.display).to.eql('none');
			});

			it('should return null for no styles', () => {
				addAttributes(container, { style: { backgroundColor: null, display: null } });
				expect(container.style.cssText).to.eql('');
			});

			it('should trim values so `px` will be appended correctly', () => {
				addAttributes(container, { style: { margin: '16 ' } });
				expect(container.style.margin).to.eql('16px');
			});

			it('should handle a empty value', () => {
				addAttributes(container, { style: '' });
				expect(container.style.cssText).to.eql('');
			});

			it('should handle a empty object value', () => {
				addAttributes(container, { style: {} });
				expect(container.style.cssText).to.eql('');
			});

			it('should support number values', () => {
				addAttributes(container, { style: { width: 7 } });
				expect(container.style.width).to.eql('7px');
			});

			it('should add px suffix to some css properties', () => {
				addAttributes(container, { style: { width: 5 } });
				expect(container.style.width).to.eql('5px');
			});

			it('should handle `letterSpacing` CSS property (camelCase)', () => {
				addAttributes(container, { style: { 'letterSpacing': 5 } });
				expect(container.style.letterSpacing).to.eql('5px');
			});

			it('should handle `letterSpacing` CSS property (snakeCase)', () => {
				addAttributes(container, { style: { 'letter-spacing': 5 } });
				expect(container.style['letter-spacing']).to.eql('5px');
			});

			it('should set `display:block`', () => {
				addAttributes(container, { style: { 'display': 'block' } });
				expect(container.style.cssText).to.eql('display: block;');
			});

			it('should ignore null styles', () => {
				addAttributes(container, { style: { backgroundColor: null, display: 'none' } });
				expect(container.style.cssText).to.eql('display: none;');
			});

			it('should automatically append `px` to relevant styles', () => {
				addAttributes(container, {
					style: {
						left: 0,
						margin: 16,
						opacity: 0.5,
						padding: '4px'
					}
				});
				expect(container.style.cssText).to.eql('left: 0px; margin: 16px; opacity: 0.5; padding: 4px;');
			});
		});*/
	});
});
