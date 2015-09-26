/** @jsx t */
/* global describe it beforeEach afterEach */
import Inferno from '../src';
import { expect } from 'chai';
import t7 from '../examples/t7';
import attrOps from '../src/template/AttributeOps';
import unitlessCfg from '../src/template/cfg/unitlessCfg';
import extendUnitlessNumber from '../src/template/extendUnitlessNumber';
import get from './tools/get';

// expose t7 and Inferno globally
global.t7 = t7;
global.Inferno = Inferno;

describe('Inferno acceptance tests', () => {
	describe('Inferno.render()', () => {
      describe('SVG tests', () => {

			let container, template;

			beforeEach(() => {
				container = document.createElement('div');
			});

			afterEach(() => {
				Inferno.clearDomElement(container);
				container = null;
			});

                 describe('should respect SVG namespace', () => {
				
					it('Initial render (creation)', () => {

						template = Inferno.createTemplate((t, val1) =>
							<svg></svg>
						);
						Inferno.render(Inferno.createFragment(false, template), container);

                       expect( container.firstChild.tagName.toLowerCase() ).to.eql( "svg" );
                       expect( container.firstChild.namespaceURI ).to.eql( 'http://www.w3.org/2000/svg' );

						expect(
							container.innerHTML
						).to.equal(
							'<svg></svg>'
						);
					});
					
					it('Second render (update)', () => {

						template = Inferno.createTemplate((t, val1) =>
							<svg fontSize={200}></svg>
						);
						Inferno.render(Inferno.createFragment(false, template), container);

                       expect( container.firstChild.tagName.toLowerCase() ).to.eql( "svg" );
                       expect( container.firstChild.namespaceURI ).to.eql( 'http://www.w3.org/2000/svg' );
                       expect( container.firstChild.getAttribute( "fontSize" ) ).to.eql('200');
						expect(
							container.innerHTML
						).to.equal(
							'<svg fontSize="200"></svg>'
						);
					});
				 });
				 
				 describe('should respect SVG namespace and render SVG attributes', () => {
				
					it('Initial render (creation)', () => {

						template = Inferno.createTemplate((t, val1) =>
							<svg xmlns="http://www.w3.org/2000/svg" version="1.1" baseProfile="full" width="200" height="200"></svg>
						);
						Inferno.render(Inferno.createFragment(false, template), container);

                       expect( container.firstChild.tagName.toLowerCase() ).to.eql( "svg" );
                       expect( container.firstChild.namespaceURI ).to.eql( 'http://www.w3.org/2000/svg' );
                       expect( container.firstChild.getAttribute( "xmlns" ) ).to.eql( "http://www.w3.org/2000/svg" );
                       expect( container.firstChild.getAttribute( "version" ) ).to.eql( "1.1" );
                       expect( container.firstChild.getAttribute( "baseProfile" ) ).to.eql( "full" );
                       expect( container.firstChild.getAttribute( "width" ) ).to.eql( "200" );
					   
						expect(
							container.innerHTML
						).to.equal(
							'<svg xmlns="http://www.w3.org/2000/svg" version="1.1" baseProfile="full" width="200" height="200"></svg>'
						);
					});
					
					it('Second render (update)', () => {

						template = Inferno.createTemplate((t, val1) =>
							<svg width={200}></svg>
						);
						Inferno.render(Inferno.createFragment(false, template), container);

                       expect( container.firstChild.tagName.toLowerCase() ).to.eql( "svg" );
                       expect( container.firstChild.namespaceURI ).to.eql( 'http://www.w3.org/2000/svg' );
                       expect( container.firstChild.getAttribute( "width" ) ).to.eql('200');
						expect(
							container.innerHTML
						).to.equal(
							'<svg width="200"></svg>'
						);
					});
				});	
				
				 describe('should set "class" attribute', () => {
				
					it('Initial render (creation)', () => {

						template = Inferno.createTemplate((t, val1) =>
							<svg xmlns="http://www.w3.org/2000/svg" class="hello, world!"></svg>
						);
						Inferno.render(Inferno.createFragment(false, template), container);

                       expect( container.firstChild.tagName.toLowerCase() ).to.eql( "svg" );
                       expect( container.firstChild.namespaceURI ).to.eql( 'http://www.w3.org/2000/svg' );
                       expect( container.firstChild.getAttribute( "xmlns" ) ).to.eql( "http://www.w3.org/2000/svg" );
                       expect( container.firstChild.getAttribute( "class" ) ).to.eql( "hello, world!" );
					   
						expect(
							container.innerHTML
						).to.equal(
							'<svg xmlns="http://www.w3.org/2000/svg" class="hello, world!"></svg>'
						);
					});
					
					it('Second render (update)', () => {

						template = Inferno.createTemplate((t, val1) =>
							<svg height={200}></svg>
						);
						Inferno.render(Inferno.createFragment(false, template), container);

                       expect( container.firstChild.tagName.toLowerCase() ).to.eql( "svg" );
                       expect( container.firstChild.namespaceURI ).to.eql( 'http://www.w3.org/2000/svg' );
                       expect( container.firstChild.getAttribute( "height" ) ).to.eql('200');
						expect(
							container.innerHTML
						).to.equal(
							'<svg height="200"></svg>'
						);
					});
				});
				
				describe('should drive a advanced SVG circle with attributes', () => {
				
					it('Initial render (creation)', () => {

                       let style = {stroke:'#000099', fill:'#000099', fontSize:18};
						
						template = Inferno.createTemplate((t, val1) =>
							<svg>
                            <rect x="50" y="200" rx="5" ry="5" width="100" height="100" fill="#CCCCFF"/>
                            <text x="55" y="220" style={style}>Weeeee!</text>
                            <animateTransform attributeName="transform" type="rotate" values="0 150 100; 360 150 100" repeatCount="indefinite" begin="0s" dur="5s" />
                            </svg>
						);
						Inferno.render(Inferno.createFragment(false, template), container);

                       expect( container.firstChild.tagName.toLowerCase() ).to.eql( "svg" );
                       expect( container.firstChild.namespaceURI ).to.eql( 'http://www.w3.org/2000/svg' );
                       expect( container.firstChild.firstChild.getAttribute( "width" ) ).to.eql( '100' );
                       expect( container.firstChild.firstChild.getAttribute( "height" ) ).to.eql( '100' );
                       expect( container.firstChild.firstChild.getAttribute( "fill" ) ).to.eql( '#CCCCFF' );

						expect(
							container.innerHTML
						).to.equal(
							 '<svg><rect x="50" y="200" rx="5" ry="5" width="100" height="100" fill="#CCCCFF"></rect><text x="55" y="220" style="stroke: rgb(0, 0, 153); fill: rgb(0, 0, 153); font-size: 18px;">Weeeee!</text><animatetransform attributename="transform" type="rotate" values="0 150 100; 360 150 100" repeatcount="indefinite" begin="0s" dur="5s"></animatetransform></svg>'
						);
					});
					
					it('Second render (update)', () => {

						template = Inferno.createTemplate((t, val1) =>
							<svg height={200}></svg>
						);
						Inferno.render(Inferno.createFragment(false, template), container);

                       expect( container.firstChild.tagName.toLowerCase() ).to.eql( "svg" );
                       expect( container.firstChild.namespaceURI ).to.eql( 'http://www.w3.org/2000/svg' );
                       expect( container.firstChild.getAttribute( "height" ) ).to.eql('200');
						expect(
							container.innerHTML
						).to.equal(
							'<svg height="200"></svg>'
						);
					});
				});

				 describe('should set "className" property as a "class" attribute', () => {
				
					it('Initial render (creation)', () => {

						template = Inferno.createTemplate((t, val1) =>
							<svg xmlns="http://www.w3.org/2000/svg" className="hello, world!"></svg>
						);
						Inferno.render(Inferno.createFragment(false, template), container);

                       expect( container.firstChild.tagName.toLowerCase() ).to.eql( "svg" );
                       expect( container.firstChild.namespaceURI ).to.eql( 'http://www.w3.org/2000/svg' );
                       expect( container.firstChild.getAttribute( "xmlns" ) ).to.eql( "http://www.w3.org/2000/svg" );
                       expect( container.firstChild.getAttribute( "class" ) ).to.eql( "hello, world!" );
					   
						expect(
							container.innerHTML
						).to.equal(
							'<svg xmlns="http://www.w3.org/2000/svg" class="hello, world!"></svg>'
						);
					});
					
					it('Second render (update)', () => {

						template = Inferno.createTemplate((t, val1) =>
							<svg xmlns="http://www.w3.org/2000/svg" className={false}></svg>
						);
						Inferno.render(Inferno.createFragment(false, template), container);

                       expect( container.firstChild.tagName.toLowerCase() ).to.eql( "svg" );
                       expect( container.firstChild.namespaceURI ).to.eql( 'http://www.w3.org/2000/svg' );
                       expect( container.firstChild.getAttribute( "xmlns" ) ).to.eql( "http://www.w3.org/2000/svg" );
                       expect( container.firstChild.getAttribute( "class" ) ).to.eql('false');
						expect(
							container.innerHTML
						).to.equal(
							'<svg xmlns="http://www.w3.org/2000/svg" class="false"></svg>'
						);
					});
				});
					
				 describe('should set "viewBox" attribute', () => {
				
					it('Initial render (creation)', () => {

						template = Inferno.createTemplate((t, val1) =>
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 20"></svg>
						);
						Inferno.render(Inferno.createFragment(false, template), container);

                       expect( container.firstChild.tagName.toLowerCase() ).to.eql( "svg" );
                       expect( container.firstChild.namespaceURI ).to.eql( 'http://www.w3.org/2000/svg' );
                       expect( container.firstChild.getAttribute( "xmlns" ) ).to.eql( "http://www.w3.org/2000/svg" );
                       expect( container.firstChild.getAttribute( "viewBox" ) ).to.eql( '0 0 50 20' );
					   
						expect(
							container.innerHTML
						).to.equal(
							'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 20"></svg>'
						);
					});
					
					it('Second render (update)', () => {

						template = Inferno.createTemplate((t, val1) =>
							<svg x1={200} x2={10}></svg>
						);
						Inferno.render(Inferno.createFragment(false, template), container);

                       expect( container.firstChild.tagName.toLowerCase() ).to.eql( "svg" );
                       expect( container.firstChild.namespaceURI ).to.eql( 'http://www.w3.org/2000/svg' );
                       expect( container.firstChild.getAttribute( "x1" ) ).to.eql('200');
                       expect( container.firstChild.getAttribute( "x2" ) ).to.eql('10');
						expect(
							container.innerHTML
						).to.equal(
							'<svg x1="200" x2="10"></svg>'
						);
					});
				});	
				
				describe('should SVG element with children', () => {
				
					it('Initial render (creation)', () => {

						template = Inferno.createTemplate((t, val1) =>
							<svg width="100" height="200" viewBox="0 0 50 50" preserveAspectRatio="xMinYMin meet" style="border: 1px solid #cccccc;"><circle cx="25" cy="25" r="25" style="stroke: #000000; fill:none;"/></svg>
						);
						Inferno.render(Inferno.createFragment(false, template), container);

                       expect( container.firstChild.tagName.toLowerCase() ).to.eql( "svg" );
                       expect( container.firstChild.namespaceURI ).to.eql( 'http://www.w3.org/2000/svg' );
					   
						expect(
							container.innerHTML
						).to.equal(
							'<svg width="100" height="200" viewBox="0 0 50 50" preserveaspectratio="xMinYMin meet"></svg>'
						);
					});
					
					it('Second render (update)', () => {

						template = Inferno.createTemplate((t, val1) =>
							<svg width={200}></svg>
						);
						Inferno.render(Inferno.createFragment(false, template), container);

                       expect( container.firstChild.tagName.toLowerCase() ).to.eql( "svg" );
                       expect( container.firstChild.namespaceURI ).to.eql( 'http://www.w3.org/2000/svg' );
                       expect( container.firstChild.getAttribute( "width" ) ).to.eql('200');
						expect(
							container.innerHTML
						).to.equal(
							'<svg width="200"></svg>'
						);
					});
				});	

				describe('should set xlink namespace attribute (no-JSX)', () => {
				
					it('Initial render (creation)', () => {

						template = Inferno.createTemplate(t =>
							t('img',  { "xlink:href": "test.jpg" })
						);
						Inferno.render(Inferno.createFragment(null, template), container);

						expect(container.firstChild.getAttributeNS( "http://www.w3.org/1999/xlink", "href" ) ).to.eql( "test.jpg" );
						expect(
							container.innerHTML
						).to.equal(
							'<img xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="test.jpg">'
						);
					});
					
					it('Second render (update)', () => {

						template = Inferno.createTemplate((t, val1) =>
							<svg version={200}></svg>
						);
						Inferno.render(Inferno.createFragment(false, template), container);

                       expect( container.firstChild.tagName.toLowerCase() ).to.eql( "svg" );
                       expect( container.firstChild.namespaceURI ).to.eql( 'http://www.w3.org/2000/svg' );
                       expect( container.firstChild.getAttribute( "version" ) ).to.eql('200');
						expect(
							container.innerHTML
						).to.equal(
							'<svg version="200"></svg>'
						);
					});
				});	
	  });
	  
        describe('MathML tests', () => {

			let container, template;

			beforeEach(() => {
				container = document.createElement('div');
			});

			afterEach(() => {
				Inferno.clearDomElement(container);
				container = null;
			});

				describe('should respect default MathML namespace', () => {
				
					it('Initial render (creation)', () => {

						template = Inferno.createTemplate((t, val1) =>
							<math></math>
						);
		                
						Inferno.render(Inferno.createFragment(false, template), container);
						
                       expect( container.firstChild.tagName.toLowerCase() ).to.eql( 'math' );
                       expect( container.firstChild.namespaceURI ).to.eql( 'http://www.w3.org/1998/Math/MathML' );

						expect(
							container.innerHTML
						).to.equal(
							'<math></math>'
						);
					});
					// update fragment from 'mathML' namespace to 'SVG'
					it('Second render (update)', () => {

						template = Inferno.createTemplate((t, val1) =>
							<svg width={200}></svg>
						);
						Inferno.render(Inferno.createFragment(false, template), container);

                       expect( container.firstChild.tagName.toLowerCase() ).to.eql( "svg" );
                       expect( container.firstChild.namespaceURI ).to.eql( 'http://www.w3.org/2000/svg' );
                       expect( container.firstChild.getAttribute( "width" ) ).to.eql('200');
						expect(
							container.innerHTML
						).to.equal(
							'<svg width="200"></svg>'
						);
					});
				});	
			});
						
		describe('DOM elements tests', () => {
			let container;

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
						template = Inferno.createTemplate(createElement =>
							createElement('ul', null,
								createElement('li', null, `I'm a li-tag`),
								createElement('li', null, `I'm a li-tag`),
								createElement('li', null, `I'm a li-tag`)
							)
						);
						Inferno.render(Inferno.createFragment(null, template), container);
					});

					it('Initial render (creation)', () => {
						expect(
							container.innerHTML
						).to.equal(
							`<ul><li>I'm a li-tag</li><li>I'm a li-tag</li><li>I'm a li-tag</li></ul>`
						);
					});
				});

				describe('should render a basic example #3 (no JSX)', () => {
					let template;

					beforeEach(() => {
						template = Inferno.createTemplate(t =>
							t('ul', null,
								t('li', null, t('span', null, `I'm a li-tag`)),
								t('li', null, t('span', null, `I'm a li-tag`)),
								t('li', null, t('span', null, `I'm a li-tag`))
							)
						);
						Inferno.render(Inferno.createFragment(null, template), container);
					});

					it('Initial render (creation)', () => {
						expect(
							container.innerHTML
						).to.equal(
							`<ul><li>I'm a li-tag</li><li>I'm a li-tag</li><li>I'm a li-tag</li></ul>`
						);
					});
				});

				describe('should render "autoFocus" boolean attributes (no JSX)', () => {
					let template;

					beforeEach(() => {
						template = Inferno.createTemplate(t =>
							t('div', { autoFocus: 'true' })
						);
						Inferno.render(Inferno.createFragment(null, template), container);
					});

					it('Initial render (creation)', () => {

						expect(container.firstChild.getAttribute('autoFocus')).to.eql('');
						expect(
							container.innerHTML
						).to.equal(
							'<div autofocus=""></div>'
						);
					});
				});

				describe('should render "className" attribute (no JSX)', () => {
					let template;

					beforeEach(() => {
						template = Inferno.createTemplate(t =>
							t('div', { className: 'Dominic rocks!' })
						);
						Inferno.render(Inferno.createFragment(null, template), container);
					});

					it('Initial render (creation)', () => {
						expect(container.firstChild.getAttribute('class')).to.eql('Dominic rocks!');
						expect(
							container.innerHTML
						).to.equal(
							'<div class="Dominic rocks!"></div>'
						);
					});
				});


				describe('shouldn\'t render null value (no JSX)', () => {
					let template;

					beforeEach(() => {
						template = Inferno.createTemplate(t =>
							t('input', { value: null })
						);
						Inferno.render(Inferno.createFragment(null, template), container);
					});

					it('Initial render (creation)', () => {

						expect( container.value ).to.be.undefined;
						expect(
							container.innerHTML
						).to.equal(
							'<input>'
						);
					});
				});
			
				describe('should set values as properties by default (no JSX)', () => {
					let template;

					beforeEach(() => {
						template = Inferno.createTemplate(t =>
							t('input', { title: 'Tip!' })
						);
						Inferno.render(Inferno.createFragment(null, template), container);
					});

					it('Initial render (creation)', () => {
						expect(container.firstChild.getAttribute('title')).to.eql('Tip!');
						expect(
							container.innerHTML
						).to.equal(
							'<input title="Tip!">'
						);
					});
				});

				describe('should render value multiple attribute (no JSX)', () => {

					beforeEach(() => {
						let template = Inferno.createTemplate(t =>
							t('select', { multiple: true, value: 'foo' },
								t('option', { value: 'foo' }, `I'm a li-tag`),
								t('option', { value: 'bar' }, `I'm a li-tag`)
							)
						);

						Inferno.render(Inferno.createFragment(null, template), container);
					});

					it('Initial render (creation)', () => {

						expect(get(container.firstChild)).to.eql(['foo']);
						expect(
							container.innerHTML
						).to.equal(
							`<select multiple=""><option value="foo">I'm a li-tag</option><option value="bar">I'm a li-tag</option></select>`
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
							'<input download="true">'
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
							'<input download="true">'
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
                    
					// Ensure className={false} turns into string 'false' on update
					it('Second render (update)', () => {

						template = Inferno.createTemplate(t =>
							<input className={false}></input>
						);

						Inferno.render(Inferno.createFragment(null, template), container);

						expect(
							container.innerHTML
						).to.equal(
							'<input class="false">'
						);
					});
				});

				// Just to prove that we don't share the same issues as React - https://github.com/facebook/react/issues/4933
				describe('should properly render "className" property on a custom element', () => {
					let template;

					beforeEach(() => {
						template = Inferno.createTemplate(t =>
							<custom-elem  className="Hello, world!"></custom-elem>
						);
						Inferno.render(Inferno.createFragment(null, template), container);
					});

					it('Initial render (creation)', () => {
						expect(
							container.innerHTML
						).to.equal(
							'<custom-elem class="Hello, world!"></custom-elem>'
						);
					});

					it('Second render (update)', () => {

						template = Inferno.createTemplate(t =>
							<custom-elem  className="Hello, Inferno!"></custom-elem>
						);

						Inferno.render(Inferno.createFragment(null, template), container);
						expect(
							container.innerHTML
						).to.equal(
							'<custom-elem class="Hello, Inferno!"></custom-elem>'
						);
					});
				});

				describe('should properly render "width" and "height" attributes', () => {
					let template;

					beforeEach(() => {
						template = Inferno.createTemplate(t =>
							<img src="" alt="Smiley face" height={42} width={42}></img>
						);
						Inferno.render(Inferno.createFragment(null, template), container);
					});

					it('Initial render (creation)', () => {
						expect(
							container.innerHTML
						).to.equal(
							'<img src="" alt="Smiley face" height="42" width="42">'
						);
					});

					it('Second render (update)', () => {

						template = Inferno.createTemplate(t =>
							<img src="" alt="Smiley face" height={14} width={42}></img>
						);

						Inferno.render(Inferno.createFragment(null, template), container);
						expect(
							container.innerHTML
						).to.equal(
							'<img src="" alt="Smiley face" height="14" width="42">'
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

					it('Second render (update)', () => {

						template = Inferno.createTemplate(t =>
							<input checked="checked" disabled="disabled"></input>
						);

						Inferno.render(Inferno.createFragment(null, template), container);
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
							'<input disabled="true">'
						);
					});


					it('Second render (update)', () => {

						template = Inferno.createTemplate(t =>
							<input checked={false} disabled={true}></input>
						);

						Inferno.render(Inferno.createFragment(null, template), container);
						expect(
							container.innerHTML
						).to.equal(
							'<input disabled="true">'
						);
					});
				});

				describe('should not render overloaded boolean attribues (falsy)', () => {
					let template;

					beforeEach(() => {
						template = Inferno.createTemplate(t =>
							<div checked={false} disabled={false}></div>
						);
						Inferno.render(Inferno.createFragment(null, template), container);
					});

					it('Initial render (creation)', () => {
						expect(
							container.innerHTML
						).to.equal(
							'<div disabled="false"></div>'
						);
					});

					it('Second render (update)', () => {

						template = Inferno.createTemplate(t =>
							<span checked={false} disabled={false}></span>
						);

						Inferno.render(Inferno.createFragment(null, template), container);
						expect(
							container.innerHTML
						).to.equal(
							'<span disabled="false"></span>'
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
							'<input>'
						);
					});

					it('Second render (update)', () => {

						Inferno.render(Inferno.createFragment(null, template), container);
						expect(
							container.innerHTML
						).to.equal(
							'<input>'
						);
					});
				});

				describe('should render video / audio attributes', () => {
					let template;
					beforeEach(() => {
						template = Inferno.createTemplate(t =>
							<input type='file' multiple='multiple' capture='capture' accept='image/*'></input>
						);
						Inferno.render(Inferno.createFragment(null, template), container);
					});

					it('Initial render (creation)', () => {
						expect(
							container.innerHTML
						).to.equal(
							'<input type="file" multiple="" capture="capture" accept="image/*">'
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

					it('Second render (update)', () => {

						let dataS = { foo: 'bar', bar: 'oops' };

						template = Inferno.createTemplate(t =>
							<input dataset={dataS}></input>
						);

						Inferno.render(Inferno.createFragment(null, template), container);
						expect(
							container.innerHTML
						).to.equal(
							'<input data-foo="bar" data-bar="oops">'
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

					it('Second render (update)', () => {

						let dataS = { foo: 'bar', bar: 'oops' };

						template = Inferno.createTemplate(t =>
							<input dataset={dataS}></input>
						);

						Inferno.render(Inferno.createFragment(null, template), container);
						expect(
							container.innerHTML
						).to.equal(
							'<input data-foo="bar" data-bar="oops">'
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

					it('Second render (update)', () => {

						let dataS = { foo: 'bar', bar: 'oops' };

						template = Inferno.createTemplate(t =>
							<input dataset={dataS}></input>
						);

						Inferno.render(Inferno.createFragment(null, template), container);
						expect(
							container.innerHTML
						).to.equal(
							'<input data-foo="bar" data-bar="oops">'
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

					it('Second render (update)', () => {

						let dataS = { foo: 'bar', bar: 'oops' };

						template = Inferno.createTemplate(t =>
							<input dataset={dataS}></input>
						);

						Inferno.render(Inferno.createFragment(null, template), container);
						expect(
							container.innerHTML
						).to.equal(
							'<input data-foo="bar" data-bar="oops">'
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

					it('Second render (update)', () => {

						let dataS = { foo: 'bar', bar: 'oops' };

						template = Inferno.createTemplate(t =>
							<input dataset={dataS}></input>
						);

						Inferno.render(Inferno.createFragment(null, template), container);
						expect(
							container.innerHTML
						).to.equal(
							'<input data-foo="bar" data-bar="oops">'
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

					it('Second render (update)', () => {

						let dataS = { foo: 'bar', bar: 'oops' };

						template = Inferno.createTemplate(t =>
							<input dataset={dataS}></input>
						);

						Inferno.render(Inferno.createFragment(null, template), container);
						expect(
							container.innerHTML
						).to.equal(
							'<input data-foo="bar" data-bar="oops">'
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

					it('Second render (update)', () => {

						template = Inferno.createTemplate(t =>
							<input checked="checked" disabled="disabled"></input>
						);

						Inferno.render(Inferno.createFragment(null, template), container);
						expect(
							container.innerHTML
						).to.equal(
							'<input disabled="disabled">'
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
							'<input href="/images/xxx.jpg" download="">'
						);
					});

					it('Second render (update)', () => {

						let dataS = { foo: 'bar', bar: 'oops' };

						template = Inferno.createTemplate(t =>
							<input dataset={dataS}></input>
						);

						Inferno.render(Inferno.createFragment(null, template), container);
						expect(
							container.innerHTML
						).to.equal(
							'<input data-foo="bar" data-bar="oops">'
						);
					});

					it('Second render (update)', () => {

						template = Inferno.createTemplate(t =>
							<input checked="checked" disabled="disabled"></input>
						);

						Inferno.render(Inferno.createFragment(null, template), container);
						expect(
							container.innerHTML
						).to.equal(
							'<input disabled="disabled">'
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
							'<input allowfullscreen="false">'
						);
					});

					it('Second render (update)', () => {

						template = Inferno.createTemplate(t =>
							<input checked="checked" disabled="disabled"></input>
						);

						Inferno.render(Inferno.createFragment(null, template), container);
						expect(
							container.innerHTML
						).to.equal(
							'<input disabled="disabled">'
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
							'<input>'
						);
					});

					it('Second render (update)', () => {

						template = Inferno.createTemplate(t =>
							<input isMap={true}></input>
						);

						Inferno.render(Inferno.createFragment(null, template), container);
						expect(
							container.innerHTML
						).to.equal(
							'<input>'
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

					// Update to a property
					it('Second render (update)', () => {
						template = Inferno.createTemplate(t =>
							<input noValidate={ true }></input>
						);

						Inferno.render(Inferno.createFragment(null, template), container);
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

					it('Second render (update)', () => {

						let dataS = { foo: 'bar', bar: 'oops' };

						template = Inferno.createTemplate(t =>
							<input dataset={dataS}></input>
						);

						Inferno.render(Inferno.createFragment(null, template), container);
						expect(
							container.innerHTML
						).to.equal(
							'<input data-foo="bar" data-bar="oops">'
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

					it('Second render (update)', () => {

						template = Inferno.createTemplate(t =>
							<input disabled={true}></input>
						);

						Inferno.render(Inferno.createFragment(null, template), container);
						expect(
							container.innerHTML
						).to.equal(
							'<input disabled="true">'
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

					it('Second render (update)', () => {

						template = Inferno.createTemplate(t =>
							<input disabled={true}></input>
						);

						Inferno.render(Inferno.createFragment(null, template), container);
						expect(
							container.innerHTML
						).to.equal(
							'<input disabled="true">'
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

					it('Second render (update)', () => {

						template = Inferno.createTemplate(t =>
							<input disabled={true}></input>
						);

						Inferno.render(Inferno.createFragment(null, template), container);
						expect(
							container.innerHTML
						).to.equal(
							'<input disabled="true">'
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
							'<input hidden="true">'
						);
					});

					it('Second render (update)', () => {

						template = Inferno.createTemplate(t =>
							<input hidden="false"></input>
						);

						Inferno.render(Inferno.createFragment(null, template), container);
						expect(
							container.innerHTML
						).to.equal(
							'<input>'
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
							'<input hidden="false">'
						);
					});

					it('Second render (update)', () => {

						template = Inferno.createTemplate(t =>
							<input hidden="false"></input>
						);

						Inferno.render(Inferno.createFragment(null, template), container);
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
							'<input draggable="">'
						);
					});
					it('Second render (update)', () => {

						template = Inferno.createTemplate(t =>
							<input hidden="false"></input>
						);

						Inferno.render(Inferno.createFragment(null, template), container);
						expect(
							container.innerHTML
						).to.equal(
							'<input>'
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
					it('Second render (update)', () => {

						template = Inferno.createTemplate(t =>
							<input hidden="false"></input>
						);

						Inferno.render(Inferno.createFragment(null, template), container);
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
					it('Second render (update)', () => {

						template = Inferno.createTemplate(t =>
							<input hidden="false"></input>
						);

						Inferno.render(Inferno.createFragment(null, template), container);
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

					// Update to a property
					it('Second render (update)', () => {
						template = Inferno.createTemplate(t =>
							<input noValidate={true}></input>
						);

						Inferno.render(Inferno.createFragment(null, template), container);
						expect(
							container.innerHTML
						).to.equal(
							'<input>'
						);
					});
				});


				describe('should not render "seamless" boolean attributes if "null"', () => {
					let template;

					beforeEach(() => {
						template = Inferno.createTemplate(t =>
							<span seamless={null}></span>
						);
						Inferno.render(Inferno.createFragment(null, template), container);
					});

					it('Initial render (creation)', () => {
						// this is a property
						expect(
							container.innerHTML
						).to.equal(
							'<span></span>'
						);
					});

					// Update to a property
					it('Second render (update)', () => {
						template = Inferno.createTemplate(t =>
							<span noValidate={ true }></span>
						);

						Inferno.render(Inferno.createFragment(null, template), container);
						expect(
							container.innerHTML
						).to.equal(
							'<span></span>'
						);
					});
				});

				describe('should render "seamless" boolean attribute (thruty)', () => {
					let template;

					beforeEach(() => {
						template = Inferno.createTemplate(t =>
							<input seamless={ true }></input>
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

					// Update to a property
					it('Second render (update)', () => {
						template = Inferno.createTemplate(t =>
							<input type='checkbox' required={ true }></input>
						);

						Inferno.render(Inferno.createFragment(null, template), container);
						expect(
							container.innerHTML
						).to.equal(
							'<input type="checkbox" required="">'
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

					// Update to a property
					it('Second render (update)', () => {

						template = Inferno.createTemplate(t =>
							<input type='checkbox' disabled={ true }></input>
						);

						Inferno.render(Inferno.createFragment(null, template), container);
						expect(
							container.innerHTML
						).to.equal(
							'<input type="checkbox" disabled="true">'
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

					// Update to a property
					it('Second render (update)', () => {

						template = Inferno.createTemplate(t =>
							<input spellCheck={ true }></input>
						);

						Inferno.render(Inferno.createFragment(null, template), container);
						expect(
							container.innerHTML
						).to.equal(
							'<input>'
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
							'<input type="checkbox" disabled="true">'
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
							'<input disabled="false" type="checkbox">'
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
							'<input type="checkbox">'
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
							'<input type="checkbox" disabled="disabled">'
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

				describe('should not set "contentEditable" as a null value', () => {
					let template;

					beforeEach(() => {
						template = Inferno.createTemplate(t =>
							<div contentEditable={null}></div>
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

				describe('should set "contentEditable" property', () => {
					let template;

					beforeEach(() => {
						template = Inferno.createTemplate(t =>
							<div contentEditable={true}></div>
						);
						Inferno.render(Inferno.createFragment(null, template), container);
					});

					it('Initial render (creation)', () => {
						expect(
							container.innerHTML
						).to.equal(
							'<div contenteditable="true"></div>'
						);
					});
				});
				describe('should set "contentEditable" property', () => {
					let template;

					beforeEach(() => {
						template = Inferno.createTemplate(t =>
							<div contentEditable={false}></div>
						);
						Inferno.render(Inferno.createFragment(null, template), container);
					});

					it('Initial render (creation)', () => {
						expect(
							container.innerHTML
						).to.equal(
							'<div contenteditable="false"></div>'
						);
					});
				});

				describe('should not set "contentEditable" property as a null value', () => {
					let template;

					beforeEach(() => {
						template = Inferno.createTemplate(t =>
							<div contentEditable="contentEditable"></div>
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

				describe('should handle selectedIndex', () => {
					let template;

					beforeEach(() => {
						template = Inferno.createTemplate(t =>
							<select><option>AM</option><option>PM</option></select>
						);
						Inferno.render(Inferno.createFragment(null, template), container);
					});

					it('Initial render (creation)', () => {
						expect(get(container.firstChild)).to.eql('AM');
						expect(
							container.innerHTML
						).to.equal(
							'<select><option>AM</option><option>PM</option></select>'
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

					let styleRule = { width:200, height:200 };

					beforeEach(() => {
						template = Inferno.createTemplate(t =>
							<div style={styleRule}></div>
						);
						Inferno.render(Inferno.createFragment(null, template), container);
					});

					it('Initial render (creation)', () => {
						expect(
							container.innerHTML
						).to.equal(
							'<div style="width: 200px; height: 200px;"></div>'
						);
					});
				});

				describe('should update styles when "style" changes from null to object', () => {

                    let template,
                        styles = {color: 'red'};
					
					beforeEach(() => {
						template = Inferno.createTemplate(t =>
							<div style={null}></div>
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
					
					it('Second render (update)', () => {
						template = Inferno.createTemplate(t =>
							<div style={styles}></div>
						);
						Inferno.render(Inferno.createFragment(null, template), container);
						expect(
							container.innerHTML
						).to.equal(
							'<div style="color: red;"></div>'
						);
					});
					
				});

				describe('should ignore null styles', () => {
					let template;

					let styleRule = { backgroundColor: null, display: 'none' };

					beforeEach(() => {
						template = Inferno.createTemplate(t =>
							<div style={styleRule}></div>
						);
						Inferno.render(Inferno.createFragment(null, template), container);
					});

					it('Initial render (creation)', () => {
						expect(
							container.innerHTML
						).to.equal(
							'<div style="display: none;"></div>'
						);
					});
				});

				describe('should not set NaN value on styles', () => {
					let template;

					let styleRule = { 'font-size': parseFloat('zoo') } ;

					beforeEach(() => {
						template = Inferno.createTemplate(t =>
							<div style={styleRule}></div>
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

				describe('should trim values so `px` will be appended correctly', () => {
					let template;

					let styleRule = { margin: '16 ' };

					beforeEach(() => {
						template = Inferno.createTemplate(t =>
							<div style={styleRule}></div>
						);
						Inferno.render(Inferno.createFragment(null, template), container);
					});

					it('Initial render (creation)', () => {

						expect(
							container.innerHTML
						).to.equal(
							'<div style="margin: 16px;"></div>'
						);
					});
				});

				describe('should support number values', () => {
					let template;

					let styleRule = { width: 7 };

					beforeEach(() => {
						template = Inferno.createTemplate(t =>
							<div style={styleRule}></div>
						);
						Inferno.render(Inferno.createFragment(null, template), container);
					});

					it('Initial render (creation)', () => {

						expect(
							container.innerHTML
						).to.equal(
							'<div style="width: 7px;"></div>'
						);
					});
				});

				describe('should support refs', () => {
					let template;
					let divRef = Inferno.createRef();

					beforeEach(() => {
						template = Inferno.createTemplate((t, divRef) =>
							<div ref={ divRef }></div>
						);
						Inferno.render(Inferno.createFragment(divRef, template), container);
					});

					it('Initial render (creation)', () => {
						expect(
							divRef.element
						).to.equal(
							container.firstChild
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

					let test = container.innerHTML;
					let expected = '<div>Hello world</div>';

					expect(test).to.equal(expected);
				});

				it('should render attributes', () => {
					Inferno.render(
						t7`<div id="foo" className="bar"></div>`,
						container
					);

					let test = container.innerHTML;
					let expected = '<div id="foo" class="bar"></div>';

					expect(test).to.equal(expected);
				});

				it('should render boolean attributes', () => {
					Inferno.render(
						t7`<div checked="checked"></div>`,
						container
					);

					let test = container.innerHTML;
					let expected = '<div></div>';

					expect(container.firstChild.checked).to.eql('checked');
					expect(test).to.equal(expected);
				});

				it('should render a basic example with dynamic values', () => {
					let val1 = 'Inferno';
					let val2 = 'Owns';

					Inferno.render(
						t7`<div>Hello world - ${ val1 } ${ val2 }</div>`,
						container
					);

					let test = container.innerHTML;
					let expected = '<div>Hello world - Inferno Owns</div>';

					expect(test).to.equal(expected);
				});

				it('should render a basic example with dynamic values and props', () => {
					let val1 = 'Inferno';
					let val2 = 'Rocks';

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

					let test = container.innerHTML;
					let expected = '<input>';

					expect(test).to.equal(expected);
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

					let test = container.innerHTML;
					let expected = '<div>Hello world - Inferno Owns</div>';

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

					let test = container.innerHTML;
					let expected = '<div>Hello world</div>';

					expect(test).to.equal(expected);
				});

				it('should render a basic example with dynamic values', () => {
					let val1 = 'Inferno';
					let val2 = 'Owns';

					Inferno.render(
						t7`<div>Hello world - ${ val1 } ${ val2 }</div>`,
						container
					);

					let test = container.innerHTML;
					let expected = '<div>Hello world - Inferno Owns</div>';

					expect(test).to.equal(expected);
				});

				it('should render a basic example with dynamic values and props', () => {
					let val1 = 'Inferno';
					let val2 = 'Rocks';

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
			let container;

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

					let test = Inferno.renderToString(
						Inferno.createFragment(null, template)
					);

					let expected = '<div>Hello world</div>';

					expect(test).to.equal(expected);
				});

				it('should render a basic example with dynamic values', () => {
					let template = Inferno.createTemplate((t, val1, val2) =>
						<div>Hello world - { val1 } { val2 }</div>
					);

					let test = Inferno.renderToString(
						Inferno.createFragment(['Inferno', 'Owns'], template)
					);

					let expected = '<div>Hello world - Inferno Owns</div>';

					expect(test).to.equal(expected);
				});

				it('should render a basic example with dynamic values', () => {
					let template = Inferno.createTemplate(t =>
							<select multiple={true} value="bar">
								<option value="foo">foo</option>
								<option value="bar">bar</option>
							</select>
						);

					let test = Inferno.renderToString(
						Inferno.createFragment(null, template)
					);

					let expected = '<select multiple=""><option>foo</option><option>bar</option></select>';

					expect(test).to.equal(expected);
				});

				it('should render a basic example with dynamic values and props', () => {
					let template = Inferno.createTemplate((t, val1, val2) =>
						<div className='foo'>
							<span className='bar'>{ val1 }</span>
							<span className='yar'>{ val2 }</span>
						</div>
					);

					let test = Inferno.renderToString(
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
					let test = Inferno.renderToString(
						t7`<div>Hello world</div>`
					);

					let expected = '<div>Hello world</div>';

					expect(test).to.equal(expected);
				});

				it('should render a basic example with dynamic values', () => {
					let val1 = 'Inferno';
					let val2 = 'Owns';

					let test = Inferno.renderToString(
						t7`<div>Hello world - ${ val1 } ${ val2 }</div>`
					);

					let expected = '<div>Hello world - Inferno Owns</div>';

					expect(test).to.equal(expected);
				});

				it('should render a basic example with dynamic values and props', () => {
					let val1 = 'Inferno';
					let val2 = 'Rocks';

					let test = Inferno.renderToString(
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

					let test = Inferno.renderToString(
						Inferno.createFragment(null, template)
					);

					let expected = '<div>Hello world</div>';

					expect(test).to.equal(expected);
				});

				it('should render a basic example with dynamic values', () => {
					let template = Inferno.createTemplate((t, val1, val2) =>
						<div>Hello world - { val1 } { val2 }</div>
					);

					let test = Inferno.renderToString(
						Inferno.createFragment(['Inferno', 'Owns'], template)
					);

					let expected = '<div>Hello world - Inferno Owns</div>';

					expect(test).to.equal(expected);
				});

				it('should render a basic example with dynamic values and props', () => {
					let template = Inferno.createTemplate((t, val1, val2) =>
						<div className='foo'>
							<span className='bar'>{ val1 }</span>
							<span className='yar'>{ val2 }</span>
						</div>
					);

					let test = Inferno.renderToString(
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
				let test = Inferno.renderToString(
					t7`<div>Hello world</div>`
				);

				let expected = '<div>Hello world</div>';

				expect(test).to.equal(expected);
			});

			it('should render a basic example with dynamic values', () => {
				let val1 = 'Inferno';
				let val2 = 'Owns';

				let test = Inferno.renderToString(
					t7`<div>Hello world - ${ val1 } ${ val2 }</div>`
				);

				let expected = '<div>Hello world - Inferno Owns</div>';

				expect(test).to.equal(expected);
			});

			it('should render a basic example with dynamic values and props', () => {
				let val1 = 'Inferno';
				let val2 = 'Rocks';

				let test = Inferno.renderToString(
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
		let container;

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
		let container;

		beforeEach(() => {
			container = document.createElement('div');
		});

		afterEach(() => {
			Inferno.clearDomElement(container);
			container = null;
		});

		describe('attrOps.toHtml()', () => {

			describe('HTML attributes / properties', () => {

				describe('Booleans', () => {

					it('should not render unsafe custom attribute names', () => {
						expect(attrOps.toHtml('&/()', 'unsafeAttr!!')).to.equal('');
					});

					it('should render `checked` as a property (truthy)', () => {
						expect(attrOps.toHtml('checked', true)).to.equal('checked="true"');
					});

					it('should render `checked` ( html5)', () => {
						expect(attrOps.toHtml('checked', 'checked')).to.equal('checked="checked"');
					});

					it('should render `checked` (falsy)', () => {
						expect(attrOps.toHtml('checked', false)).to.equal('checked="false"');
					});

					it('should render `download` attribute (falsy)', () => {
						expect(attrOps.toHtml('download', false)).to.equal('download="false"');
					});

					it('should render custom attribute', () => {
						expect(attrOps.toHtml('fooBar', 'boo')).to.equal('fooBar="boo"');
					});

					it('should render "multiple" attribute - #1', () => {
						expect(attrOps.toHtml('multiple', 'true')).to.equal('multiple="true"');
					});

					it('should render "multiple" attribute - #2', () => {
						expect(attrOps.toHtml('multiple', true)).to.equal('multiple="true"');
					});

					it('should render "multiple" attribute - #3', () => {
						expect(attrOps.toHtml('multiple', false)).to.equal('multiple="false"');
					});

					it('should render "hidden" attribute', () => {
						expect(attrOps.toHtml('hidden', false)).to.equal('hidden="false"');
					});

					it('should render "mute" attribute', () => {
						expect(attrOps.toHtml('mute', false)).to.equal('mute="false"');
					});

					it('should render "loop" attribute', () => {
						expect(attrOps.toHtml('loop', true)).to.equal('loop="true"');
					});

				});

				describe('Custom attribute', () => {

					it('should render custom attributes - #1', () => {
						expect(attrOps.toHtml('Inferno', true)).to.equal('Inferno="true"');
					});

					it('should render custom attributes - #2', () => {
						expect(attrOps.toHtml('Inferno', 123)).to.equal('Inferno="123"');
					});

					it('should render custom attributes - #3', () => {
						expect(attrOps.toHtml('Inferno', false)).to.equal('Inferno="false"');
					});

					it('should not render unsafe custom attribute names', () => {
						expect(attrOps.toHtml('&/()', 'unsafeAttr!!')).to.equal('');
					});
				});

				describe('HTML5 data-* attribute', () => {
					it('should render custom attributes', () => {
						expect(attrOps.toHtml('data-foo', 'bar')).to.equal('data-foo="bar"');
					});
				});

				describe('height attribute', () => {
					it('should render height attributes', () => {
						expect(attrOps.toHtml('height', '70%')).to.equal('height="70%"');
					});
				});

				describe('width attribute', () => {
					it('should render height attributes', () => {
						expect(attrOps.toHtml('width', '70%')).to.equal('width="70%"');
					});
				});

				describe('xml / xlink namespace attributes', () => {
					it('should render namespace attributes', () => {
						expect(attrOps.toHtml('xlink:href', 'test.jpg')).to.equal('xlink:href="test.jpg"');
					});
					it('should render namespace attributes', () => {
						expect(attrOps.toHtml('xml:id', 'inferno')).to.equal('xml:id="inferno"');
					});
				});

				describe('dataset property', () => {
					it('should render dataset property - #1', () => {
						expect(attrOps.toHtml('dataset', '')).to.equal('');
					});
					it('should render dataset property - #2', () => {
						let objL = { foo: 'bar', bar: 'oops' };
						expect(attrOps.toHtml('dataset', objL)).to.equal('data-foo="bar" data-bar="oops" ');
					});
				});
				describe('preload property', () => {
					it('should render preload property - #1', () => {
						expect(attrOps.toHtml('preload', true)).to.equal('preload="true"');
					});
					it('should render preload property - #2', () => {
						expect(attrOps.toHtml('preload', false)).to.equal('preload="false"');
					});
					it('should render preload property - #3', () => {
						expect(attrOps.toHtml('preload', null)).to.equal('');
					});
				});
				describe('contentEditable property', () => {
					it('should render contentEditable property - #1', () => {
						expect(attrOps.toHtml('contentEditable', true)).to.equal('contentEditable="true"');
					});
					it('should render contentEditable property - #2', () => {
						expect(attrOps.toHtml('contentEditable', false)).to.equal('contentEditable="false"');
					});
					it('should render contentEditable property - #3', () => {
						expect(attrOps.toHtml('contentEditable', 'plaintext-only')).to.equal('contentEditable="plaintext-only"');
					});
					it('should render contentEditable property - #4', () => {
						expect(attrOps.toHtml('contentEditable', null)).to.equal('');
					});
				});

			});
			describe('CSS', () => {

				it('should create markup for simple styles', () => {
					expect(attrOps.toHtml('style', {
						backgroundColor: '#3b5998',
						display: 'none'
					})).to.equal(
						'style="background-color:#3b5998;display:none;"'
					);
				});

				// null, undefined etc. has to be done on a higher level of abstraction - not low-level
				it('should not ignore undefined styles', () => {
					expect(attrOps.toHtml('style', {
						backgroundColor: undefined,
						display: 'none'
					})).to.equal(
						'style="display:none;"'
					);
				});

				it('should not ignore null styles', () => {
					expect(attrOps.toHtml('style', {
						backgroundColor: null,
						display: 'none'
					})).to.equal(
						'style="display:none;"'
					);
				});

				it('should automatically append `px` to relevant styles', () => {
					expect(attrOps.toHtml('style', {
						left: 0,
						margin: 16,
						opacity: 0.5,
						padding: '4px'
					})).to.equal(
						'style="left:0;margin:16px;opacity:0.5;padding:4px;"'
					);
				});

				it('should create vendor-prefixed markup correctly', () => {
					expect(attrOps.toHtml('style', {
						msTransition: 'none',
						MozTransition: 'none'
					})).to.equal(
						'style="ms-transition:none;moz-transition:none;"'
					);
				});

				it('should trim values so `px` will be appended correctly', () => {
					expect(attrOps.toHtml('style', {
						margin: '16',
						opacity: 0.5,
						padding: '4'
					})).to.equal('style="margin:16px;opacity:0.5;padding:4px;"');
				});

			});
		});

		describe('attrOps.set()', () => {
			it('should render `checked` as a property', () => {
				attrOps.set(container, 'checked', true);
				expect(container.checked).to.be.true;
			});

			it('should support custom attributes', () => {
				attrOps.set(container, 'custom-attr', '123');
				expect(container.getAttribute('custom-attr')).to.equal('123');
			});

			it('shouldn\'t render null values', () => {
				attrOps.set(container, 'value', null);
				expect(container.value).to.be.null;
			});

			it('should set `title` attribute', () => {
				attrOps.set(container, 'title', 'dominic');
				expect(container.getAttribute('title')).to.equal('dominic');
			});

			it('should support HTML5 data-* attribute', () => {
				attrOps.set(container, 'data-foo', 'bar');
				expect(container.getAttribute('data-foo')).to.equal('bar');
			});

			it('should support HTML5 data-* attribute', () => {
				attrOps.set(container, 'data-foo', 'bar');
				expect(container.getAttribute('data-foo')).to.equal('bar');
			});

			it('should set "muted" boolean property ( truty) ', () => {
				attrOps.set(container, 'muted', true);
				expect(container.muted).to.be.true;
			});

			it('should set "muted" boolean property (falsy) ', () => {
				attrOps.set(container, 'muted', false);
				expect(container.muted).to.be.false;
			});

			it('should not set "muted" boolean property as "muted muted"', () => {
				attrOps.set(container, 'muted', 'muted');
				expect(container.muted).to.eql('muted');
			});

			it('should set "readOnly" boolean property ( truty) ', () => {
				attrOps.set(container, 'readOnly', true);
				expect(container.readOnly).to.be.true;
			});

			it('should set "readOnly" boolean property (falsy) ', () => {
				attrOps.set(container, 'readOnly', false);
				expect(container.readOnly).to.be.false;
			});

			it('should set "readOnly" boolean property (HTML5) ', () => {
				attrOps.set(container, 'readOnly', 'true');
				expect(container.readOnly).to.eql('true');
			});

			it('should not set "readOnly" boolean property as "readOnly readOnly"', () => {
				attrOps.set(container, 'readOnly', 'readOnly');
				expect(container.readOnly).to.eql('readOnly');
			});

			it('should set numeric properties', () => {
				attrOps.set(container, 'start', 5);
				expect(container.getAttribute('start')).to.eql('5');

				attrOps.set(container, 'start', 0);
				expect(container.getAttribute('start')).to.eql('0');
			});

			it('should set negative numeric properties', () => {
				attrOps.set(container, 'start', -5);
				expect(container.getAttribute('start')).to.eql('-5');
			});

			it('should set numeric attribute "-0" to "0"', () => {
				attrOps.set(container, 'start', -0);
				expect(container.getAttribute('start')).to.eql('0');
			});

			it('should set className property', () => {
				attrOps.set(container, 'className', -0);
				expect(container.getAttribute('class')).to.eql('0');
			});

			it('should set contextmenu property', () => {
				attrOps.set(container, 'contextmenu', 'namemenu');
				expect(container.getAttribute('contextmenu')).to.eql('namemenu');
			});

			it('should set height property', () => {
				attrOps.set(container, 'height', '70%');
				expect(container.getAttribute('height')).to.eql('70%');
			});

			it('should set width property', () => {
				attrOps.set(container, 'width', '70%');
				expect(container.getAttribute('width')).to.eql('70%');
			});

			it('should set dataset property - #1', () => {
				let objL = { foo: 'bar', bar: 'oops' };
				attrOps.set(container, 'dataset', objL);
				expect(container.dataset).to.eql(objL);
			});

			it('should set dataset property - #2', () => {
				attrOps.set(container, 'dataset', {});
				expect(container.dataset).to.eql({});
			});

			it('should set and camelize dataset property - #3', () => {
				let objL = { 'foo-bar': 'bar', bar: 'oops' };
				attrOps.set(container, 'dataset', objL);
				expect(container.dataset).to.eql({ fooBar: 'bar', bar: 'oops' });
			});

			it('should not set negative numbers on "size" attribute', () => {
				attrOps.set(container, 'size', -444);
				expect(container.getAttribute('size')).to.be.null;
			});

			it('should not set zerio as a number on "size" attribute', () => {
				attrOps.set(container, 'size', 0);
				expect(container.getAttribute('size')).to.be.null;
			});

			it('should not set positive numbers on "size" attribute', () => {
				attrOps.set(container, 'size', 444);
				expect(container.getAttribute('size')).to.eql('444');
			});

			it('should not set negative numbers on "cols" attribute', () => {
				attrOps.set(container, 'cols', -444);
				expect(container.getAttribute('cols')).to.be.null;
			});

			it('should not set zerio as a number on "cols" attribute', () => {
				attrOps.set(container, 'cols', 0);
				expect(container.getAttribute('cols')).to.be.null;
			});

			it('should not set positive numbers on "cols" attribute', () => {
				attrOps.set(container, 'cols', 444);
				expect(container.getAttribute('cols')).to.eql('444');
			});

			it('should not set negative numbers on "rows" attribute', () => {
				attrOps.set(container, 'rows', -444);
				expect(container.getAttribute('rows')).to.be.null;
			});

			it('should not set zerio as a number on "rows" attribute', () => {
				attrOps.set(container, 'rows', 0);
				expect(container.getAttribute('rows')).to.be.null;
			});

			it('should not set positive numbers on "rows" attribute', () => {
				attrOps.set(container, 'rows', 444);
				expect(container.getAttribute('rows')).to.eql('444');
			});

			it('should not set zerio as a number on "span" attribute', () => {
				attrOps.set(container, 'span', 0);
				expect(container.getAttribute('span')).to.be.null;
			});

			it('should set "contentEditable" property (falsy)', () => {
				attrOps.set(container, 'contentEditable', false);
				expect(container.getAttribute('contentEditable')).to.eql('false');
				expect(container.contentEditable).to.eql('false');
			});

			it('should set "contentEditable" property (truthy)', () => {
				attrOps.set(container, 'contentEditable', true);
				expect(container.getAttribute('contentEditable')).to.eql('true');
				expect(container.contentEditable).to.eql('true');
			});

			it('should set "contentEditable" property (inherit)', () => {
				attrOps.set(container, 'contentEditable', 'inherit');
				expect(container.getAttribute('contentEditable')).to.be.null;
				expect(container.contentEditable).to.eql('inherit');
			});

			it('should set "contentEditable" property (plaintext-only)', () => {
				attrOps.set(container, 'contentEditable', 'plaintext-only');
				expect(container.getAttribute('contentEditable')).to.eql('plaintext-only');
				expect(container.contentEditable).to.eql('plaintext-only');
			});

			it('should not set "contentEditable" as a null value', () => {
				attrOps.set(container, 'contentEditable', null);
				expect(container.getAttribute('contentEditable')).to.be.null;
				expect(container.contentEditable).to.eql('inherit');
			});

			it('should not set "contentEditable" as a null value', () => {
				attrOps.set(container, 'contentEditable', null);
				expect(container.getAttribute('contentEditable')).to.be.null;
				expect(container.contentEditable).to.eql('inherit');
			});

			it('should not set "contentEditable" as a undefined value', () => {
				attrOps.set(container, 'contentEditable', undefined);
				expect(container.getAttribute('contentEditable')).to.be.null;
				expect(container.contentEditable).to.eql('inherit');
			});

			it('should set "preload" property (falsy)', () => {
				attrOps.set(container, 'preload', false);
				expect(container.getAttribute('preload')).to.be.null;
				expect(container.preload).to.be.false;
			});

			it('should set "preload" property (truthy)', () => {
				attrOps.set(container, 'preload', true);
				expect(container.getAttribute('preload')).to.be.null;
				expect(container.preload).to.be.true;
			});

			it('should set "preload" property (metadata)', () => {
				attrOps.set(container, 'preload', 'metadata');
				expect(container.getAttribute('preload')).to.be.null;
				expect(container.preload).to.eql('metadata');
			});

			it('should set "preload" property (auto)', () => {
				attrOps.set(container, 'preload', 'auto');
				expect(container.getAttribute('preload')).to.be.null;
				expect(container.preload).to.eql('auto');
			});

			it('should not set "preload" as a null value', () => {
				attrOps.set(container, 'preload', null);
				expect(container.getAttribute('preload')).to.be.null;
				expect(container.preload).to.be.undefined;
			});

			it('should not set "preload" as a undefined value', () => {
				attrOps.set(container, 'preload', undefined);
				expect(container.getAttribute('preload')).to.be.null;
				expect(container.preload).to.be.undefined;
			});

			it('should set "autoPlay" property (truthy)', () => {
				attrOps.set(container, 'autoPlay', true);
				expect(container.getAttribute('autoPlay')).to.be.null;
				expect(container.autoPlay).to.be.true;
			});

			it('should set "autoPlay" property (falsy)', () => {
				attrOps.set(container, 'autoPlay', false);
				expect(container.getAttribute('autoPlay')).to.be.null;
				expect(container.autoPlay).to.be.false;
			});

			it('should set "media" property (truthy)', () => {
				attrOps.set(container, 'media', true);
				expect(container.getAttribute('media')).to.eql('true');
				expect(container.media).to.be.undefined;
			});

			it('should not set positive numbers on "span" attribute', () => {
				attrOps.set(container, 'span', 444);
				expect(container.getAttribute('span')).to.eql('444');
			});

			it('should set overloaded falsy value on attributes', () => {
				attrOps.set(container, 'target', false);
				expect(container.getAttribute('target')).to.eql('false');
			});

			it('should set overloaded truthy value on attributes', () => {
				attrOps.set(container, 'target', true);
				expect(container.getAttribute('target')).to.eql('true');
			});

			it('should not render unsafe custom attribute names', () => {
				attrOps.set(container, '&/()', 'unsafeAttr!!');
				expect(container.getAttribute('&/()')).to.be.null;
			});

			it('should set values as boolean properties', () => {
				attrOps.set(container, 'disabled', 'disabled');
				expect(container.getAttribute('disabled')).to.eql('disabled');

				attrOps.set(container, 'disabled', true);
				expect(container.getAttribute('disabled')).to.eql('true');

				// shouldn't exist - it's an attribute
				attrOps.set(container, 'disabled', true);
				expect(container.disabled).to.be.undefined;
			});
			describe('Audio / video attributes', () => {

				it('should render the volume attribute - 0.0', () => {
					attrOps.set(container, 'volume', 0.0);
					expect(container.getAttribute('volume')).to.eql('0');
				});

				it('should render the volume attribute - 0.4', () => {
					attrOps.set(container, 'volume', 0.04);
					expect(container.getAttribute('volume')).to.eql('0.04');
				});

				it('should render the volume attribute - 1', () => {
					attrOps.set(container, 'volume', 1);
					expect(container.getAttribute('volume')).to.eql('1');
				});

				it('should not render the volume attribute if larger then 1', () => {
					attrOps.set(container, 'volume', -3);
					expect(container.getAttribute('volume')).to.be.null;
				});

				it('should not render the volume attribute on negative numbers', () => {
					attrOps.set(container, 'volume', 3);
					expect(container.getAttribute('volume')).to.be.null;
				});

			});
		});
	});
});
