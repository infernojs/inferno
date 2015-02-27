"use strict";
//EngineJS is a for true light-weight, ultra-fast isomorphic "React-like" framework

var Inferno = require('./InfernoJS/Inferno.js');

class Demo extends Inferno.Component {

	constructor() {
		//variables with no underscore prefix "_" are classified as "props"
		//these props should never be directly modified within a component or its children
		//props should only be input into the component
		this.todos = [
			"Clean the dishes",
			"Cook the dinner",
			"Code some coding",
			"Comment on stuff"
		];
		this.testClassName = "foo-bar";
		this.title = "Todo Demo";

		//variables with a prefixed underscore "_" are classified as "state" objects
		//these are not meant to have any visibility outside of this component
		this._formId = "todo-form";

		super();
	}

	_clickSubmit(e) {
		debugger;
	}

	render($) {
		//$ = RenderHelper, to reduce lines of code and to simplify workflow

		//you can use quickhand syntax to give elements classes and ids
		//<div.foo>, <span#bar>

		//you can also optionally close the elements with the quickhand to allow for easier
		//reading and syntax checking

		//Remember to pass the HTML through Inferno.compile(...)
		return Inferno.compile(`
			<div>
				<header>
					<h1>
						Example ${ this.title }
					</h1>
				</header>
			</div>
			<div className="${ this.testClassName }">
				Test text
			</div>
			<div#main>
				<div>
					${
						$.if(this.todos.length > 0, `
							<span.counter>
								There are ${ this.todos.length } todos!
							</span>
						`, /* else */ `
							<span.no-todos>
								There are no todos!
							</span>
						`)
					}
				</div>
				<ul.todos>
					${
						$.forEach(this.todos, (todo, index) => `
							<li.todo>
								<h2>A todo</h2>
								<span>${ index }: ${ todo }</span>
							</li>
						`)
					}
				</ul.todos>
				<section>
					<form action="#" method="post">
						<div class="form-control">
							<input type="text" placeholder="Enter your name">
						</div>
					</form>
				</section>
			</div#main>
		`);
	}
}

window.Demo = Demo;
