import Inferno from '../../../../src';
import waits from '../../../tools/waits';
import Observable from 'zen-observable';
import compareInnerHTML from '../../../tools/compareInnerHTML';

global.Observable = Observable;

describe( 'DOM component tests (no-jsx)', () => {

	let container;

	beforeEach( () => {
		container = document.createElement( 'div' );
	} );

	afterEach( () => {
		Inferno.render( null, container );
	} );

	const { createElement } = Inferno.TemplateFactory;

	class BasicComponent1 extends Inferno.Component {
		render() {
			const template = Inferno.createTemplate( ( name, title ) =>
				createElement( 'div', { className: 'basic' },
					createElement( 'span', { className: name }, 'The title is ', title )
				)
			);

			return template( this.props.name, this.props.title );
		}
	}

	describe( 'should render a basic component', () => {
		let template;

		beforeEach( () => {
			template = Inferno.createTemplate( ( Component, title ) =>
				createElement( 'div', null,
					createElement( Component, { title: title, name: 'basic-render' } )
				)
			);
		} );

		it( 'Initial render (creation)', () => {
			Inferno.render( template( BasicComponent1, 'abc' ), container);

			expect(
				container.innerHTML
			).to.equal(
				'<div><div class="basic"><span class="basic-render">The title is abc</span></div></div>'
			);

			Inferno.render( template( BasicComponent1, 'abc' ), container);
			expect(
				container.innerHTML
			).to.equal(
				'<div><div class="basic"><span class="basic-render">The title is abc</span></div></div>'
			);

			Inferno.render( template( BasicComponent1, null ), container);

			expect(
				container.innerHTML
			).to.equal(
				'<div><div class="basic"><span class="basic-render">The title is </span></div></div>'
			);

			Inferno.render( template( null, null ), container );

			expect(
				container.innerHTML
			).to.equal(
				'<div></div>'
			);

		} );

		it( 'Second render (update)', () => {
			Inferno.render( template( BasicComponent1, '123' ), container);
			expect(
				container.innerHTML
			).to.equal(
				'<div><div class="basic"><span class="basic-render">The title is 123</span></div></div>'
			);


			Inferno.render( template( BasicComponent1, '1234' ), container);
			expect(
				container.innerHTML
			).to.equal(
				'<div><div class="basic"><span class="basic-render">The title is 1234</span></div></div>'
			);

			Inferno.render( template( BasicComponent1, 1234), container);
			expect(
				container.innerHTML
			).to.equal(
				'<div><div class="basic"><span class="basic-render">The title is 1234</span></div></div>'
			);

			Inferno.render( template( null, '1234' ), container);
			expect(
				container.innerHTML
			).to.equal(
				'<div></div>'
			);

			Inferno.render( template( null, null), container);
			expect(
				container.innerHTML
			).to.equal(
				'<div></div>'
			);

			Inferno.render( template( null, undefined), container);
			expect(
				container.innerHTML
			).to.equal(
				'<div></div>'
			);

			Inferno.render( template( undefined, undefined), container);
			expect(
				container.innerHTML
			).to.equal(
				'<div></div>'
			);

			Inferno.render( template( undefined), container);
			expect(
				container.innerHTML
			).to.equal(
				'<div></div>'
			);

			Inferno.render( template( ), container);
			expect(
				container.innerHTML
			).to.equal(
				'<div></div>'
			);

		} );
	} );

	function BasicStatelessComponent1( { name, title } ) {
		const template = Inferno.createTemplate( ( name, title ) =>
				createElement( 'div', { className: 'basic' },
					createElement( 'span', { className: name }, 'The title is ', title)
				)
		);

		return template( name, title );
	}

	describe( 'should render a basic stateless component', () => {
		let template;

		beforeEach(() => {
			template = Inferno.createTemplate((Component, title) =>
					createElement( 'div', null,
						createElement(Component, { title: title, name: 'basic-render' } )
					)
			);
		} );

		it( 'Initial render (creation)', () => {

			Inferno.render( template( BasicStatelessComponent1, 'abc' ), container);

			expect(
				container.innerHTML
			).to.equal(
				'<div><div class="basic"><span class="basic-render">The title is abc</span></div></div>'
			);

			// Render from stateless to normal component
			Inferno.render( template( BasicComponent1, 'abc' ), container);
			expect(
				container.innerHTML
			).to.equal(
				'<div><div class="basic"><span class="basic-render">The title is abc</span></div></div>'
			);

			Inferno.render( template( BasicStatelessComponent1, 'abcd' ), container);
			expect(
				container.innerHTML
			).to.equal(
				'<div><div class="basic"><span class="basic-render">The title is abcd</span></div></div>'
			);

			const text = Inferno.createTemplate( function () {
				return { text: '123abc' };
			} );
			const text1 = Inferno.createTemplate( function () {
				return { tag: 'span', children: { text: '123abc' } };
			} );

			expect(
				() => Inferno.render( template( BasicStatelessComponent1, text), container)
			).to.throw;
			expect(
				() => Inferno.render( template( BasicStatelessComponent1, text1), container)
			).to.throw;

			Inferno.render( template( BasicStatelessComponent1), container);
			expect(
				container.innerHTML
			).to.equal(
				'<div><div class="basic"><span class="basic-render">The title is </span></div></div>'
			);

			Inferno.render( template( undefined), container);
			expect(
				container.innerHTML
			).to.equal(
				'<div></div>'
			);

			Inferno.render( template( BasicStatelessComponent1), container);
			expect(
				container.innerHTML
			).to.equal(
				'<div><div class="basic"><span class="basic-render">The title is </span></div></div>'
			);

			Inferno.render( template(  '123', null), container);
			expect(
				container.innerHTML
			).to.equal(
				'<div><div class="basic"><span class="basic-render">The title is </span></div></div>'
			);

			Inferno.render( template( null, null), container);
			expect(
				container.innerHTML
			).to.equal(
				'<div></div>'
			);

			Inferno.render( template( ), container);
			expect(
				container.innerHTML
			).to.equal(
				'<div></div>'
			);

		} );

		it( 'Second render (update)', () => {
			Inferno.render( template( BasicStatelessComponent1, '123' ), container );
			expect(
				container.innerHTML
			).to.equal(
				'<div><div class="basic"><span class="basic-render">The title is 123</span></div></div>'
			);

			expect(
				() => Inferno.createTemplate( () => ( { tag: 'span', children: { text: null } } ) )
			).to.throw;

			Inferno.render( template( BasicStatelessComponent1, 123 ), container );
			expect(
				container.innerHTML
			).to.equal(
				'<div><div class="basic"><span class="basic-render">The title is 123</span></div></div>'
			);

			const text1 = Inferno.createTemplate( function () {
				return { tag: 'span', children: { text: '123abc' } };
			} );

			expect(
				() => Inferno.render( template( BasicStatelessComponent1, text1 ), container )
			).to.throw;
			Inferno.render( template( null, '123' ), container);
			expect(
				container.innerHTML
			).to.equal(
				'<div></div>'
			);
		} );
		it( 'Third render (update)', () => {
			expect(
				() => Inferno.createTemplate(() => { return { tag: 'span', children: { text: null } };
				} )
			).to.throw;

			expect(
				() => Inferno.createTemplate(() => { return { tag: 'span', children: { text: null } };
				} )
			).to.throw;
						} );
		it( 'Fourth render (update)', () => {
			const text1 = Inferno.createTemplate(() => {
				return {
					tag: 'span',
					text: null
				};
			} );

			expect(
				() => Inferno.render( template( BasicStatelessComponent1, text1), container)
			).to.throw;
						} );
		it( 'Fifth render (update)', () => {
									const text1 = Inferno.createTemplate(() => {
						return {
							tag: 'span'
				};
			} );

									expect(
				() => Inferno.render( template( BasicStatelessComponent1, text1), container)
			).to.throw;
						} );
	} );

	//describe( 'should render a basic stateless component with a render stream', () => {
		// let template;
		// const listeners = [];
	//
		// function addEventListener(callback) {
		//	listeners.push(callback);
		// }
		// function removeEventListener(callback) {
		//	const index = listeners.indexOf(callback);
	//
		//	if (index > -1) {
		//		listeners.splice(index, 1);
		//	}
		// }
		// function trigger(data) {
		//	listeners.forEach(listener => listener(data));
		// }
	//
		// function BasicStatelessComponentWithStreamingRender( {name} ) {
		//	const template = Inferno.createTemplate((name, title) =>
		//		createElement("div", {className: "basic"},
		//			createElement("span", {className: name}, "The title is ", title)
		//		)
		//	);
	//
		//	return new Observable(observer => {
		//		const handler = title => observer.next( template( name, title));
	//
		//		addEventListener(handler);
		//		return () => {
		//			removeEventListener(handler);
		//		};
		//	} );
		// }
	//
		// it( 'Initial render and update', () => {
		//	const template = Inferno.createTemplate((Component) =>
		//			createElement( 'div', null,
		//				createElement(Component, {name: "basic-render"} )
		//			)
		//	);
		//	Inferno.render( template( BasicStatelessComponentWithStreamingRender), container);
	//
		//	expect(
		//		container.innerHTML
		//	).to.equal(
		//		'<div></div>'
		//	);
	//
		//	trigger( 'streaming data!' );
		//	expect(
		//		container.innerHTML
		//	).to.equal(
		//		'<div><div class="basic"><span class="basic-render">The title is streaming data!</span></div></div>'
		//	);
	//
		//	trigger( 'streaming data #2!' );
		//	expect(
		//		container.innerHTML
		//	).to.equal(
		//		'<div><div class="basic"><span class="basic-render">The title is streaming data #2!</span></div></div>'
		//	);
	//
		//	Inferno.render( template( BasicStatelessComponentWithStreamingRender), container);
	//
		//	expect(
		//		container.innerHTML
		//	).to.equal(
		//		'<div></div>'
		//	);
	//
		// } );
	//} );

	class BasicComponent1b extends Inferno.Component {
		render() {
			const template = Inferno.createTemplate( ( isChecked, title ) =>
				createElement( 'div', { className: 'basic' },
					createElement( 'label', {},
						createElement( 'input', { type: 'checkbox', checked: isChecked } ),
						'The title is ',
						title
					)
				)
			);

			return template( this.props.isChecked, this.props.title );
		}
	}

	describe( 'should render a basic component with inputs', () => {
		let template;

		beforeEach(() => {
			template = Inferno.createTemplate((Component, title, isChecked) =>
				createElement( 'div', null,
					createElement(Component, { title, isChecked } )
				)
			);
		} );

		it( 'Initial render (creation)', () => {
			Inferno.render( template( BasicComponent1b, 'abc', true), container);

			expect(
				container.innerHTML
			).to.equal(
				'<div><div class="basic"><label><input type="checkbox">The title is abc</label></div></div>'
			);
			expect(
				container.querySelector( 'input' ).checked
			).to.equal(
				true
			);


			Inferno.render( template( BasicComponent1b, 'abc', true), container);

			expect(
				container.innerHTML
			).to.equal(
				'<div><div class="basic"><label><input type="checkbox">The title is abc</label></div></div>'
			);
			expect(
				container.querySelector( 'input' ).checked
			).to.equal(
				true
			);

			Inferno.render( template( BasicComponent1b, 'abc', 'true' ), container);

			expect(
				container.innerHTML
			).to.equal(
				'<div><div class="basic"><label><input type="checkbox">The title is abc</label></div></div>'
			);
			expect(
				container.querySelector( 'input' ).checked
			).to.equal(
				true
			);

			Inferno.render( template( BasicComponent1b, 'abc', 'false' ), container);

			expect(
				container.innerHTML
			).to.equal(
				'<div><div class="basic"><label><input type="checkbox">The title is abc</label></div></div>'
			);
			expect(
				container.querySelector( 'input' ).checked
			).to.equal(
				false
			);

		} );
		it( 'Second render (update)', () => {
			Inferno.render( template( BasicComponent1b, '123', false), container);
			expect(
				container.innerHTML
			).to.equal(
				'<div><div class="basic"><label><input type="checkbox">The title is 123</label></div></div>'
			);
			expect(
				container.querySelector( 'input' ).checked
			).to.equal(
				false
			);


			Inferno.render( template( BasicComponent1b, null, false), container);
			expect(
				container.innerHTML
			).to.equal(
				'<div><div class="basic"><label><input type="checkbox">The title is </label></div></div>'
			);
			expect(
				container.querySelector( 'input' ).checked
			).to.equal(
				false
			);

			Inferno.render( template( BasicComponent1b, null, null), container);
			expect(
				container.innerHTML
			).to.equal(
				'<div><div class="basic"><label><input type="checkbox">The title is </label></div></div>'
			);
			expect(
				container.querySelector( 'input' ).checked
			).to.equal(
				false
			);

		} );
		it( 'Third render (update)', () => {
			Inferno.render( template( BasicComponent1b, '123', true), container);
			expect(
				container.innerHTML
			).to.equal(
				'<div><div class="basic"><label><input type="checkbox">The title is 123</label></div></div>'
			);
			expect(
				container.querySelector( 'input' ).checked
			).to.equal(
				true
			);
		} );
	} );

	class BasicComponent1c extends Inferno.Component {
		render() {
			const template = Inferno.createTemplate((isEnabled, title, type) =>
				createElement( 'div', { className: 'basic' },
					createElement( 'label', {},
						createElement( 'input', { type, enabled: isEnabled } ),
						'The title is ',
						title
					)
				)
			);
			return template(this.props.isEnabled, this.props.title, this.props.type);
		}
	}

	describe( 'should render a basic component with inputs #2', () => {
		let template;

		beforeEach(() => {
			template = Inferno.createTemplate((Component, title, isEnabled) =>
					createElement( 'div', null,
						createElement(Component, { title, isEnabled, type: 'password' } )
					)
			);
		} );

		it( 'Initial render (creation)', () => {
			Inferno.render( template( BasicComponent1c, 'abc', true), container);

			expect(
				container.innerHTML
			).to.equal(
				'<div><div class="basic"><label><input type="password" enabled="enabled">The title is abc</label></div></div>'
			);
			Inferno.render( template( BasicComponent1c, null, true), container);

			expect(
				container.innerHTML
			).to.equal(
				'<div><div class="basic"><label><input type="password" enabled="enabled">The title is </label></div></div>'
			);

			// Render into a different component
									Inferno.render( template( BasicComponent1b, 'abc', true), container);
			expect(
				container.innerHTML
			).to.equal(
				'<div><div class="basic"><label><input type="checkbox">The title is abc</label></div></div>'
			);
			//will never be true is we aren't setting isChecked on props as the template we're using isn't for this component
			expect(
				container.querySelector( 'input' ).checked
			).to.equal(
				false
			);

			Inferno.render( template( null, null, true), container);
			expect(
				container.innerHTML
			).to.equal(
				'<div></div>'
			);

			Inferno.render( template( null, null, null), container);

			expect(
				container.innerHTML
			).to.equal(
				'<div></div>'
			);

			Inferno.render( template( undefined, undefined, undefined), container);

			expect(
				container.innerHTML
			).to.equal(
				'<div></div>'
			);

			template = Inferno.createTemplate((child1, child2, child3) =>
					createElement( 'div', null,
						child1, child2, child3
					)
			);

			Inferno.render( template(  ' ', '', '' ), container);
			expect(
				container.innerHTML
			).to.equal(
				'<div> </div>'
			);

			Inferno.render( template(  ' ', ' ', '' ), container);
			expect(
				container.innerHTML
			).to.equal(
				'<div>  </div>'
			);

			Inferno.render( template(  ' ', ' ', ' ' ), container);
			expect(
				container.innerHTML
			).to.equal(
				'<div>   </div>'
			);

			Inferno.render( template(  ' ', 'abc', ' ' ), container);
			expect(
				container.innerHTML
			).to.equal(
				'<div> abc </div>'
			);
		} );
		it( 'Second render (update)', () => {
			Inferno.render( template( BasicComponent1c, '123', false), container);
			expect(
				container.innerHTML
			).to.equal(
				'<div><div class="basic"><label><input type="password">The title is 123</label></div></div>'
			);
			Inferno.render( template( BasicComponent1c, '123', false), container);
			expect(
				container.innerHTML
			).to.equal(
				'<div><div class="basic"><label><input type="password">The title is 123</label></div></div>'
			);

			Inferno.render( template( BasicComponent1c, '123  ', false), container);
			expect(
				container.innerHTML
			).to.equal(
				'<div><div class="basic"><label><input type="password">The title is 123  </label></div></div>'
			);

			Inferno.render( template( BasicComponent1c, '  123  ', false), container);
			expect(
				container.innerHTML
			).to.equal(
				'<div><div class="basic"><label><input type="password">The title is   123  </label></div></div>'
			);

			Inferno.render( template( BasicComponent1c, 123, false), container);
			expect(
				container.innerHTML
			).to.equal(
				'<div><div class="basic"><label><input type="password">The title is 123</label></div></div>'
			);

			Inferno.render( template( BasicComponent1c, ' ', false), container);
			expect(
				container.innerHTML
			).to.equal(
				'<div><div class="basic"><label><input type="password">The title is  </label></div></div>'
			);

		} );
	} );

	class BasicComponent1d extends Inferno.Component {
		render() {
			const template = Inferno.createTemplate((isDisabled, title) =>
				createElement( 'div', { className: 'basic' },
					createElement( 'label', {},
						createElement( 'input', { type: 'password', disabled: isDisabled } ),
						'The title is ',
						title
					)
				)
			);
			return template(this.props.isDisabled, this.props.title);
		}
	}

	describe( 'should render a basic component with inputs #3', () => {
		let template;

		beforeEach(() => {
			template = Inferno.createTemplate((Component, title, isDisabled) =>
				createElement( 'div', null,
					createElement(Component, { title, isDisabled } )
				)
			);
		} );

		it( 'Initial render (creation)', () => {

			Inferno.render( template( BasicComponent1d, 'abc', true), container);

			compareInnerHTML( '<div><div class="basic"><label><input type="password" disabled="">The title is abc</label></div></div>', container );
			expect(
				container.querySelector( 'input' ).disabled
			).to.equal(
				true
			);

			Inferno.render( template( BasicComponent1d, 'abc', 'abc' ), container);

			compareInnerHTML( '<div><div class="basic"><label><input type="password" disabled="">The title is abc</label></div></div>', container );

			expect(
				container.querySelector( 'input' ).disabled
			).to.equal(
				true
			);

			Inferno.render( template( BasicComponent1d, 'abc', true), container);
			compareInnerHTML( '<div><div class="basic"><label><input type="password" disabled="">The title is abc</label></div></div>', container );
			expect(
				container.querySelector( 'input' ).disabled
			).to.equal(
				true
			);

		} );
		it( 'Second render (update)', () => {
			Inferno.render( template( BasicComponent1d, '123', false), container);
			expect(
				container.innerHTML
			).to.equal(
				'<div><div class="basic"><label><input type="password">The title is 123</label></div></div>'
			);
			expect(
				container.querySelector( 'input' ).disabled
			).to.equal(
				false
			);

			Inferno.render( template( BasicComponent1d, '123', true), container);
			expect(
				container.innerHTML
			).to.equal(
				'<div><div class="basic"><label><input type="password" disabled="">The title is 123</label></div></div>'
			);
			expect(
				container.querySelector( 'input' ).disabled
			).to.equal(
				true
			);

			Inferno.render( template( BasicComponent1d, ' ', false), container);
			expect(
				container.innerHTML
			).to.equal(
				'<div><div class="basic"><label><input type="password">The title is  </label></div></div>'
			);
			expect(
				container.querySelector( 'input' ).disabled
			).to.equal(
				false
			);

		} );
	} );

	describe( 'should render a basic component and remove property if null #1', () => {
		let template;

		beforeEach(() => {
			template = Inferno.createTemplate((Component, title, name) =>
				createElement( 'div', null,
					createElement(Component, { title, name } )
				)
			);
		} );

		it( 'Initial render (creation)', () => {
			Inferno.render( template( BasicComponent1, 'abc', 'basic-render' ), container);

			expect(
				container.innerHTML
			).to.equal(
				'<div><div class="basic"><span class="basic-render">The title is abc</span></div></div>'
			);

			Inferno.render( template( BasicComponent1, null, null), container);

			expect(
				container.innerHTML
			).to.equal(
				'<div><div class="basic"><span>The title is </span></div></div>'
			);

			Inferno.render( template( null, null, null), container);

			expect(
				container.innerHTML
			).to.equal(
				'<div></div>'
			);

			Inferno.render( template( undefined, undefined, undefined), container);

			expect(
				container.innerHTML
			).to.equal(
				'<div></div>'
			);

			Inferno.render( template( undefined, null, undefined), container);

			expect(
				container.innerHTML
			).to.equal(
				'<div></div>'
			);

			Inferno.render( template( null, undefined, null), container);

			expect(
				container.innerHTML
			).to.equal(
				'<div></div>'
			);

			Inferno.render( template( BasicComponent1, '你好，世界！', null), container);
			expect(
				container.innerHTML
			).to.equal( '<div><div class="basic"><span>The title is 你好，世界！</span></div></div>'
			);
			Inferno.render( template( BasicComponent1, '123', null), container);
			expect(
				container.innerHTML
			).to.equal( '<div><div class="basic"><span>The title is 123</span></div></div>'
			);
			Inferno.render( template( BasicComponent1, 123, null), container);
			expect(
				container.innerHTML
			).to.equal( '<div><div class="basic"><span>The title is 123</span></div></div>'
			);
		} );
		it( 'Second render (update)', () => {
			Inferno.render( template( BasicComponent1, '你好，世界！', null), container);
			expect(
				container.innerHTML
			).to.equal( '<div><div class="basic"><span>The title is 你好，世界！</span></div></div>'
			);
			Inferno.render( template( BasicComponent1, '123', null), container);
			expect(
				container.innerHTML
			).to.equal( '<div><div class="basic"><span>The title is 123</span></div></div>'
			);
			Inferno.render( template( BasicComponent1, 123, null), container);
			expect(
				container.innerHTML
			).to.equal( '<div><div class="basic"><span>The title is 123</span></div></div>'
			);
		} );
	} );

	describe( 'should render a basic component and remove property if null #2', () => {
		let template;

		beforeEach(() => {
			template = Inferno.createTemplate((Component, title, name) =>
				createElement( 'div', null,
					createElement(Component, { title, name } )
				)
			);
			Inferno.render( template( BasicComponent1, 'abc', null), container);
		} );

		it( 'Initial render (creation)', () => {
			expect(
				container.innerHTML
			).to.equal(
				'<div><div class="basic"><span>The title is abc</span></div></div>'
			);
		} );
		it( 'Second render (update)', () => {
			Inferno.render( template( BasicComponent1, '123', 'basic-update' ), container);
			expect(
				container.innerHTML
			).to.equal(
				'<div><div class="basic"><span class="basic-update">The title is 123</span></div></div>'
			);

			Inferno.render( template( BasicComponent1, null, null), container);
			expect(
				container.innerHTML
			).to.equal(
				'<div><div class="basic"><span>The title is </span></div></div>'
			);

		} );
	} );

	describe( 'should render a basic root component', () => {
		let template;

		beforeEach(() => {
			template = Inferno.createTemplate((Component, title, name) =>
				createElement(Component, { title, name } )
			);
		} );

		it( 'Initial render (creation)', () => {
			Inferno.render( template( BasicComponent1, 'abc', 'basic-render' ), container);

			expect(
				container.innerHTML
			).to.equal(
				'<div class="basic"><span class="basic-render">The title is abc</span></div>'
			);
			Inferno.render( template( BasicComponent1, 'abc', 'basic-render' ), container);

			expect(
				container.innerHTML
			).to.equal(
				'<div class="basic"><span class="basic-render">The title is abc</span></div>'
			);

			Inferno.render( template( BasicComponent1, 'abc', 3333), container);

			expect(
				container.innerHTML
			).to.equal(
				'<div class="basic"><span class="3333">The title is abc</span></div>'
			);

			Inferno.render( template( BasicComponent1, 'abc', {} ), container);

			expect(
				container.innerHTML
			).to.equal(
				'<div class="basic"><span class="[object Object]">The title is abc</span></div>'
			);

			Inferno.render( template( null, 'abc', 'basic-render' ), container);

			expect(
				container.innerHTML
			).to.equal(
				''
			);

			Inferno.render( template( null, null, null), container);

			expect(
				container.innerHTML
			).to.equal(
				''
			);

		} );
		it( 'Second render (update)', () => {
			Inferno.render( template( BasicComponent1, '123', 'basic-update' ), container);
			expect(
				container.innerHTML
			).to.equal(
				'<div class="basic"><span class="basic-update">The title is 123</span></div>'
			);
			Inferno.render( template( BasicComponent1, '1234', 'basic-update' ), container);
			expect(
				container.innerHTML
			).to.equal(
				'<div class="basic"><span class="basic-update">The title is 1234</span></div>'
			);

		} );
	} );

	describe( 'should render a basic root stateless component', () => {
		let template;

		beforeEach(() => {
			template = Inferno.createTemplate((Component, title, name) =>
					createElement(Component, { title, name } )
			);
		} );

		it( 'Initial render (creation)', () => {
			Inferno.render( template( BasicStatelessComponent1, 'abc', 'basic-render' ), container);
			expect(
				container.innerHTML
			).to.equal(
				'<div class="basic"><span class="basic-render">The title is abc</span></div>'
			);

			Inferno.render( template( null, 'abc', 'basic-render' ), container);
			expect(
				container.innerHTML
			).to.equal(
				''
			);

			Inferno.render( template( BasicStatelessComponent1, 'abc', 'basic-render ' ), container);
			expect(
				container.innerHTML
			).to.equal(
				'<div class="basic"><span class="basic-render ">The title is abc</span></div>'
			);

			Inferno.render( template( BasicStatelessComponent1, 'abc', ' basic-render' ), container);
			expect(
				container.innerHTML
			).to.equal(
				'<div class="basic"><span class=" basic-render">The title is abc</span></div>'
			);

			Inferno.render( template( BasicStatelessComponent1, 'abc', ' basic-render ' ), container);
			expect(
				container.innerHTML
			).to.equal(
				'<div class="basic"><span class=" basic-render ">The title is abc</span></div>'
			);

			Inferno.render( template( BasicStatelessComponent1, ' abc ', ' basic-render ' ), container);
			expect(
				container.innerHTML
			).to.equal(
				'<div class="basic"><span class=" basic-render ">The title is  abc </span></div>'
			);

			Inferno.render( template( BasicStatelessComponent1, '123', 'basic-update' ), container);
			expect(
				container.innerHTML
			).to.equal(
				'<div class="basic"><span class="basic-update">The title is 123</span></div>'
			);

			Inferno.render( template( BasicStatelessComponent1, '123', 'basic-update' ), container);
			expect(
				container.innerHTML
			).to.equal(
				'<div class="basic"><span class="basic-update">The title is 123</span></div>'
			);
		} );
		it( 'Second render (update)', () => {
			Inferno.render( template( BasicStatelessComponent1, '123', 'basic-update' ), container);
			expect(
				container.innerHTML
			).to.equal(
				'<div class="basic"><span class="basic-update">The title is 123</span></div>'
			);

			Inferno.render( template( BasicStatelessComponent1, null, null), container);
			expect(
				container.innerHTML
			).to.equal(
				'<div class="basic"><span>The title is </span></div>'
			);

		} );

		it( 'Third render (update)', () => {

			const text1 = Inferno.createTemplate(() => {
				return {
					tag: 'span',
					text: null
				};
			} );

			expect(
				() => Inferno.render( template( BasicStatelessComponent1, text1), container)
			).to.throw;
		} );

		it( 'Fourth render (update)', () => {
			const text1 = Inferno.createTemplate(() => {
				return {
					tag: 'span'
				};
			} );

			expect(
				() => Inferno.render( template( BasicStatelessComponent1, text1), container)
			).to.throw;
		} );


	} );

	class BasicComponent2 extends Inferno.Component {
		render() {
			const template = Inferno.createTemplate((name, title, children) =>
				createElement( 'div', { className: 'basic' },
					createElement( 'span', { className: name }, 'The title is ', title),
					children
				)
			);

			return template(this.props.name, this.props.title, this.props.children);
		}
	}

	describe( 'should render a basic component with children', () => {
		let template;

		beforeEach(() => {
			template = Inferno.createTemplate((Component, title, name) =>
				createElement( 'div', null,
					createElement(Component, { title, name },
						createElement( 'span', null, 'I\'m a child' )
					)
				)
			);
		} );

		it( 'Initial render (creation)', () => {
			Inferno.render( template( BasicComponent2, 'abc', 'basic-render' ), container);

			expect(
				container.innerHTML
			).to.equal(
				'<div><div class="basic"><span class="basic-render">The title is abc</span><span>I\'m a child</span></div></div>'
			);
			Inferno.render( template( BasicComponent2, 'abc', 'basic-render' ), container);

			expect(
				container.innerHTML
			).to.equal(
				'<div><div class="basic"><span class="basic-render">The title is abc</span><span>I\'m a child</span></div></div>'
			);
		} );
		it( 'Second render (update)', () => {
			Inferno.render(
				template(BasicComponent2, '123', 'basic-update' ), container
			);
			expect(
				container.innerHTML
			).to.equal(
				'<div><div class="basic"><span class="basic-update">The title is 123</span><span>I\'m a child</span></div></div>'
			);
		} );
		it( 'Third render (update)', () => {
			template = Inferno.createTemplate((Component, title, name) =>
				createElement( 'div', null,
					createElement(Component, { title, name },
						createElement( 'span', null, 'The title is definitely ', title)
					)
				)
			);

			Inferno.render(
				template(BasicComponent2, '12345', 'basic-update' ), container
			);
			expect(
				container.innerHTML
			).to.equal(
				'<div><div class="basic"><span class="basic-update">The title is 12345</span><span>The title is definitely 12345</span></div></div>'
			);
		} );
	} );

	class BasicComponent2b extends Inferno.Component {
		render() {
			const template = Inferno.createTemplate((children) =>
				createElement( 'div', null,
					createElement( 'span', null, 'component!' ),
					createElement( 'div', null, children)
				)
			);
			return template(this.props.children);
		}
	}

	class BasicComponent2c extends Inferno.Component {
		render() {
			const template = Inferno.createTemplate((children) =>
					createElement( 'div', null,
						createElement( 'span', null, 'other component!' ),
						createElement( 'div', null, children)
					)
			);
			return template(this.props.children);
		}
	}

	describe( 'should render a basic component with component children', () => {
		let template;

		beforeEach(() => {
			template = Inferno.createTemplate((Component1, Component2, Component3) =>
				createElement(Component1, null,
					createElement(Component2, null,
						createElement(Component3, null)
					)
				)
			);
		} );

		it( 'Initial render (creation)', () => {
			Inferno.render( template( BasicComponent2b, BasicComponent2b, BasicComponent2b), container);

			expect(
				container.innerHTML
			).to.equal(
				'<div><span>component!</span><div><div><span>component!</span><div><div><span>component!</span><div></div></div></div></div></div></div>'
			);

			// Should only remove the on in the middle, or I'm wrong?
			// -- You're wrong, the 3rd component is a child of the 2nd component, so if the 2nd is null, the 3rd will never be rendered
			Inferno.render( template( BasicComponent2b, null, BasicComponent2b), container);

			expect(
				container.innerHTML
			).to.equal(
				'<div><span>component!</span><div></div></div>'
			);

			Inferno.render( template( BasicComponent2b, null, null), container);
			expect(
				container.innerHTML
			).to.equal(
				'<div><span>component!</span><div></div></div>'
			);

			Inferno.render( template( BasicComponent2b, BasicComponent2b, BasicComponent2b), container);

			expect(
				container.innerHTML
			).to.equal(
				'<div><span>component!</span><div><div><span>component!</span><div><div><span>component!</span><div></div></div></div></div></div></div>'
			);

			Inferno.render( template( null, null, null), container);
			expect(
				container.innerHTML
			).to.equal(
				''
			);

			//it doesn't pass in the correct props, so this is a bad test really as 123 and basic-update will never pass through
			Inferno.render( template( BasicStatelessComponent1, '123', 'basic-update' ), container);
			expect(
				container.innerHTML
			).to.equal(
				'<div class="basic"><span>The title is </span></div>'
			);
		} );
		it( 'Second render (update) - should be the same', () => {
			Inferno.render( template( BasicComponent2b, BasicComponent2b, BasicComponent2b), container);
			expect(
				container.innerHTML
			).to.equal(
				'<div><span>component!</span><div><div><span>component!</span><div><div><span>component!</span><div></div></div></div></div></div></div>'
			);
		} );
		it( 'Third render (update) - should be a bit different', () => {
			Inferno.render( template( BasicComponent2b, BasicComponent2b, BasicComponent2c), container);
			expect(
				container.innerHTML
			).to.equal(
				'<div><span>component!</span><div><div><span>component!</span><div><div><span>other component!</span><div></div></div></div></div></div></div>'
			);
			Inferno.render( template( BasicComponent2b, BasicComponent2c, BasicComponent2b), container);
			expect(
				container.innerHTML
			).to.equal(
				'<div><span>component!</span><div><div><span>other component!</span><div><div><span>component!</span><div></div></div></div></div></div></div>'
			);

		} );
		it( 'Forth render (update) - should be a lot different', () => {
			Inferno.render( template( BasicComponent2b, BasicComponent2c, BasicComponent2c), container);
			expect(
				container.innerHTML
			).to.equal(
				'<div><span>component!</span><div><div><span>other component!</span><div><div><span>other component!</span><div></div></div></div></div></div></div>'
			);

			Inferno.render( template( BasicComponent2b, null, BasicComponent2c), container);
			expect(
				container.innerHTML
			).to.equal(
				'<div><span>component!</span><div></div></div>'
			);

			// Fix me! Should be only one component left
			Inferno.render( template( null, null, BasicComponent2c), container);
			expect(
				container.innerHTML
			).to.equal(
				''
			);

			Inferno.render( template( null, null, null), container);
			expect(
				container.innerHTML
			).to.equal(
				''
			);

		} );
		it( 'Fifth render (update) - should be completely different', () => {
			Inferno.render( template( BasicComponent2c, BasicComponent2c, BasicComponent2c), container);
			expect(
				container.innerHTML
			).to.equal(
				'<div><span>other component!</span><div><div><span>other component!</span><div><div><span>other component!</span><div></div></div></div></div></div></div>'
			);
		} );
	} );

	describe( 'should render a basic component and correctly mount', () => {
		let template;
		let componentWillMountCount;

		class ComponentLifecycleCheck extends Inferno.Component {
			render() {
				const template = Inferno.createTemplate((children) =>
					createElement( 'div', null,
						createElement( 'span', null, 'component!' ),
						createElement( 'div', null, children)
					)
				);
				return template(this.props.children);
			}
			componentWillMount() {
				componentWillMountCount++;
			}
		}

		beforeEach(() => {
			componentWillMountCount = 0;
			template = Inferno.createTemplate((Component1, Component2, Component3) =>
					createElement(Component1, null,
						createElement(Component2, null,
							createElement(Component3, null)
						)
					)
			);
		} );

		it( 'Initial render (creation)', () => {
			Inferno.render( template( ComponentLifecycleCheck, ComponentLifecycleCheck, ComponentLifecycleCheck), container);
			expect(
				componentWillMountCount
			).to.equal(
				3
			);
		} );
		it( 'Initial render (update)', () => {
			Inferno.render( template( ComponentLifecycleCheck, ComponentLifecycleCheck, null), container);
			expect(
				componentWillMountCount
			).to.equal(
				2
			);
		} );
	} );

	describe( 'should render multiple components', () => {
		let template;

		beforeEach(() => {
			template = Inferno.createTemplate((Component, title1, name1, Component2, title2, name2) =>
				createElement( 'div', null,
					createElement(Component, { title: title1, name: name1 } ),
					createElement(Component2, { title: title2, name: name2 } )
				)
			);
			Inferno.render( template( BasicComponent1, 'component 1', 'basic-render', BasicComponent1, 'component 2', 'basic-render' ), container);
		} );

		it( 'Initial render (creation)', () => {
			expect(
				container.innerHTML
			).to.equal(
				'<div><div class="basic"><span class="basic-render">The title is component 1</span></div>'
				+ '<div class="basic"><span class="basic-render">The title is component 2</span></div></div>'
			);
		} );

		it( 'Second render (update)', () => {
			Inferno.render( template( BasicComponent1, 'component 1', 'basic-render' ), container);
			expect(
				container.innerHTML
			).to.equal(
				'<div><div class="basic"><span class="basic-render">The title is component 1</span></div></div>'
			);
		} );
	} );

	class BasicComponent3 extends Inferno.Component {
		render() {
			const template = Inferno.createTemplate((styles, title) =>
				createElement( 'div', {
					style: styles
				},
				createElement( 'span', {
					style: styles
				}, 'The title is ', title))
			);

			return template(this.props.styles, this.props.title);
		}
	}

	describe( 'should render a basic component with styling', () => {
				let template;

		beforeEach(() => {
			template = Inferno.createTemplate((Component, props) =>
				createElement(Component, props)
			);
		} );

		it( 'Initial render (creation)', () => {
			Inferno.render( template( BasicComponent3, {
				title: 'styled!',
				styles: {
					color: 'red',
					paddingLeft: 10
				}
			} ), container);

			expect(
				container.innerHTML
			).to.equal( '<div style="color: red; padding-left: 10px;"><span style="color: red; padding-left: 10px;">The title is styled!</span></div>' );

			Inferno.render( template( BasicComponent3, {
				title: 'styled!',
				styles: {
					color: 'red',
					paddingTop: 10
				}
			} ), container);

			expect(
				container.innerHTML
			).to.equal( '<div style="color: red; padding-top: 10px;"><span style="color: red; padding-top: 10px;">The title is styled!</span></div>' );

		} );

		it( 'Second render (update)', () => {
			Inferno.render( template( BasicComponent3, {
				title: 'styled (again)!',
				styles: {
					color: 'blue',
					paddingBottom: 20
				}
			} ), container);

			expect(
				container.innerHTML
			).to.equal( '<div style="color: blue; padding-bottom: 20px;"><span style="color: blue; padding-bottom: 20px;">The title is styled (again)!</span></div>' );
		} );
	} );

	//describe( 'should render a basic component and remove styling #1', () => {
	//	let template;
	//
	//	beforeEach(() => {
	//		template = Inferno.createTemplate((createElement, createComponent, Component) =>
	//			createComponent(Component)
	//		);
	//		Inferno.render(Inferno.createFragment([
	//			{component: BasicComponent3, props: {title: "styled!", styles: { color: "red", padding: 10}}}
	//		], template), container);
	//	} );
	//
	//	it( 'Initial render (creation)', () => {
	//		expect(
	//			container.innerHTML
	//		).to.equal(
	//			'<div style="color: red; padding: 10px;"><span style="color: red; padding: 10px;">The title is styled!</span></div>'
	//		);
	//	} );
	//	it( 'Second render (update)', () => {
	//		Inferno.render(Inferno.createFragment([
	//			{component: BasicComponent3, props: {title: "styles are removed!", styles: null}}
	//		], template), container);
	//		expect(
	//			container.innerHTML
	//		).to.equal(
	//			'<div style=""><span style="">The title is styles are removed!</span></div>'
	//		);
	//	} );
	//} );
	//
	//describe( 'should render a basic component and remove styling #2', () => {
	//	let template;
	//
	//	beforeEach(() => {
	//		template = Inferno.createTemplate((createElement, createComponent, Component) =>
	//			createComponent(Component)
	//		);
	//		Inferno.render(Inferno.createFragment([
	//			{component: BasicComponent3, props: {title: "NOT styled!", styles: null}}
	//		], template), container);
	//	} );
	//
	//	it( 'Initial render (creation)', () => {
	//		expect(
	//			container.innerHTML
	//		).to.equal(
	//			'<div><span>The title is NOT styled!</span></div>'
	//		);
	//	} );
	//	it( 'Second render (update)', () => {
	//		Inferno.render(Inferno.createFragment([
	//			{component: BasicComponent3, props: {title: "styled (again)!", styles: { color: "blue", margin: 20}}}
	//		], template), container);
	//		expect(
	//			container.innerHTML
	//		).to.equal(
	//			'<div style="color: blue; margin: 20px;"><span style="color: blue; margin: 20px;">The title is styled (again)!</span></div>'
	//		);
	//	} );
	//} );
	//
	//class TestComponent extends Inferno.Component {
	//	template(createElement, c, value, styles) {
	//		return createElement( 'select', {
	//				multiple: true,
	//				value: value,
	//				style: styles
	//			}, createElement( 'optgroup', {
	//					label: 'foo-group'
	//				},
	//				createElement( 'option', {
	//					value: 'foo'
	//				}, 'Im a li-tag' )),
	//			createElement( 'optgroup', {
	//				label: 'bar-group'
	//			}, createElement( 'option', {
	//				value: 'bar'
	//			}, 'Im a li-tag' )),
	//			createElement( 'optgroup', {
	//				label: 'dominic-group'
	//			}, createElement( 'option', {
	//				value: 'dominic'
	//			}, 'Im a li-tag' ))
	//		);
	//	}
	//	render() {
	//		return Inferno.createFragment([this.props.value, this.props.style], this.template);
	//	}
	//}
	//
	//describe( 'should render a basic test component', () => {
	//	let template;
	//
	//	beforeEach(() => {
	//		template = Inferno.createTemplate((createElement, createComponent, Component) =>
	//			createElement( 'div', null,
	//				createComponent(Component)
	//			)
	//		);
	//		Inferno.render(Inferno.createFragment([{
	//			component: TestComponent,
	//			props: {
	//				value: ['bar', 'dominic'],
	//				style: { background: 'red' }
	//			}
	//		}], template), container);
	//	} );
	//
	//	it( 'Initial render (creation)', () => {
	//		expect(
	//			container.innerHTML
	//		).to.equal(
	//			'<div><select multiple="" style="background: red;"><optgroup label="foo-group">'
	//			+ '<option value="foo">Im a li-tag</option></optgroup><optgroup label="bar-group">'
	//			+ '<option value="bar">Im a li-tag</option></optgroup><optgroup label="dominic-group">'
	//			+ '<option value="dominic">Im a li-tag</option></optgroup></select></div>'
	//		);
	//	} );
	//	it( 'Second render (update)', () => {
	//		Inferno.render(Inferno.createFragment([{
	//			component: TestComponent,
	//			props: {
	//				value: ['bar', 'dominic'],
	//				style: { background: 'red' }
	//			}
	//		}], template), container);
	//		expect(
	//			container.innerHTML
	//		).to.equal(
	//			'<div><select multiple="" style="background: red;"><optgroup label="foo-group">'
	//			+ '<option value="foo">Im a li-tag</option></optgroup><optgroup label="bar-group">'
	//			+ '<option value="bar">Im a li-tag</option></optgroup><optgroup label="dominic-group">'
	//			+ '<option value="dominic">Im a li-tag</option></optgroup></select></div>'
	//		);
	//	} );
	//} );

	describe( 'should mount and unmount a basic component', () => {
		let mountCount;
		let unmountCount;
		let template;

		class ComponentLifecycleCheck extends Inferno.Component {
			render() {
				const template = Inferno.createTemplate(() =>
					createElement( 'div', null,
						createElement( 'span', null)
					)
				);
				return template();
			}
			componentDidMount() {
				mountCount++;
			}
			componentWillUnmount() {
				unmountCount++;
			}
		}

		beforeEach(() => {
			mountCount = 0;
			unmountCount = 0;
			template = Inferno.createTemplate((Component) =>
				createElement(Component)
			);
			Inferno.render( template( ComponentLifecycleCheck), container);
		} );

		it( 'should have mounted the component', () => {
			expect(mountCount).to.equal(1);
		} );
		it( 'should have unmounted the component', () => {
			Inferno.render(null, container);
			expect(unmountCount).to.equal(1);
		} );
	} );

	describe( 'should mount and unmount a basic component #2', () => {
		let mountCount;
		let unmountCount;
		let template;

		class ComponentLifecycleCheck extends Inferno.Component {
			render() {
				const template = Inferno.createTemplate(() =>
					createElement( 'div', null,
						createElement( 'span', null)
					)
				);

				return template();
			}
			componentDidMount() {
				mountCount++;
			}
			componentWillUnmount() {
				unmountCount++;
			}
		}

		beforeEach(() => {
			mountCount = 0;
			unmountCount = 0;
			template = Inferno.createTemplate((Component) =>
				createElement(Component)
			);
			Inferno.render( template( ComponentLifecycleCheck), container);
		} );

		it( 'should have mounted the component', () => {
			expect(mountCount).to.equal(1);
		} );
		it( 'should have unmounted the component', () => {
			Inferno.render( template( null), container);
			expect(unmountCount).to.equal(1);
		} );
	} );

	describe( 'state changes should trigger all lifecycle events for an update', () => {
		let componentWillMountCount;
		let shouldComponentUpdateCount;
		let componentDidUpdateCount;
		let componentWillUpdateCount;
		let componentWillReceivePropsCount;
		let template;

		class ComponentLifecycleCheck extends Inferno.Component {
			constructor() {
				super();
				this.state = {
					counter: 0
				};
			}
			render() {
				const template = Inferno.createTemplate((counter) =>
					createElement( 'div', null,
						createElement( 'span', null, counter)
					)
				);
				return template(this.state.counter);
			}
			componentWillMount() {
				componentWillMountCount++;
				this.setState( {
					counter: this.state.counter + 1
				} );
			}
			shouldComponentUpdate() {
				shouldComponentUpdateCount++;
				return true;
			}
			componentDidUpdate() {
				componentDidUpdateCount++;
			}
			componentWillUpdate() {
				componentWillUpdateCount++;
			}
			componentWillReceiveProps() {
				componentWillReceivePropsCount++;
			}
		}

		beforeEach((done) => {
			componentWillMountCount = 0;
			shouldComponentUpdateCount = 0;
			componentDidUpdateCount = 0;
			componentWillUpdateCount = 0;
			componentWillReceivePropsCount = 0;
			template = Inferno.createTemplate((Component) =>
					createElement(Component)
			);
			Inferno.render( template( ComponentLifecycleCheck), container);
			waits(30, done);
		} );

		it( 'componentWillMountCount to have fired once', () => {
			expect(componentWillMountCount).to.equal(1);
		} );
		it( 'shouldComponentUpdateCount to have fired once', () => {
			expect(shouldComponentUpdateCount).to.equal(1);
		} );
		it( 'componentWillUpdateCount to have fired once', () => {
			expect(componentWillUpdateCount).to.equal(1);
		} );
		it( 'componentDidUpdateCount to have fired once', () => {
			expect(componentDidUpdateCount).to.equal(1);
		} );
		it( 'componentWillReceivePropsCount not to have fired', () => {
			expect(componentWillReceivePropsCount).to.equal(0);
		} );
		it( 'the element in the component should show the new state', () => {
			expect(container.innerHTML).to.equal(
				'<div><span>1</span></div>'
			);
		} );
	} );

	describe( 'should render a basic component with conditional fragment', () => {
		const tpl4282471407 = Inferno.createTemplate(function (v0) {
			return {
				tag: 'div',
				children: [ '', v0, '', {
					tag: 'p',
					children: 'test'
				}, '' ]
			};
		} );
		const tpl3625453295 = Inferno.createTemplate(function () {
			return {
				tag: 'h1',
				children: 'BIG'
			};
		} );
		const tpl4021787591 = Inferno.createTemplate(function () {
			return {
				tag: 'h2',
				children: 'small'
			};
		} );
		const tpl1546018623 = Inferno.createTemplate(function (v0) {
			return { tag: v0 };
		} );

		class Component extends Inferno.Component {
			render() {
				let condition = true; // some logic
				return tpl4282471407(condition ? tpl3625453295(null) : tpl4021787591(null));
			}
		}

		it( 'Initial render (creation)', () => {
			Inferno.render(tpl1546018623(Component), container);
			expect(container.innerHTML).to.equal(
				'<div><h1>BIG</h1><p>test</p></div>'
			);
		} );
	} );

	describe( 'should render a basic component with a list of values from state', () => {
		const tpl2026545261 = Inferno.createTemplate(function (v0) {
			return {
				tag: 'ul',
				attrs: {
					class: 'login-organizationlist'
				},
				children: [ '', v0, '' ]
			};
		} );
		const tpl3192647933 = Inferno.createTemplate(function (v0) {
			return {
				tag: 'li',
				children: v0
			};
		} );
		const tpl1546018623 = Inferno.createTemplate(function (v0) {
			return { tag: v0 };
		} );

		class Component extends Inferno.Component {
			constructor(props) {
				super(props);
				this.state = {
					organizations: [
						{ name: 'test1', key: '1' },
						{ name: 'test2', key: '2' },
						{ name: 'test3', key: '3' },
						{ name: 'test4', key: '4' },
						{ name: 'test5', key: '5' },
						{ name: 'test6', key: '6' }
					]
				};
			}
			render() {
				return tpl2026545261(this.state.organizations.map(function (result) {
					return tpl3192647933(result.name);
				} ));
			}
		}

		it( 'Initial render (creation)', () => {
			Inferno.render(tpl1546018623(Component), container);
			expect(container.innerHTML).to.equal(
				'<ul class="login-organizationlist"><li>test1</li><li>test2</li><li>test3</li><li>test4</li><li>test5</li><li>test6</li></ul>'
			);
		} );
	} );
} );