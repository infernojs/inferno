"use strict";
//EngineJS is a for true light-weight, ultra-fast isomorphic "React-like" framework

var Inferno = require('./InfernoJS/Inferno.js');
var vdml = require('./InfernoJS/vdml.js');

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

	render() {
		var $ = vdml.helpers;
		//$ = VDML helpers, to reduce lines of code and to simplify workflow

		//Pass our markup through our template tagged function so it generates a nice virtual dom
		return t`
			<div>
				<header>
					<h1>Example ${ this.title }</h1>
				</header>
			</div>
			<div className="${ this.testClassName }">Test text</div>
			<div id="main">
				<div>
					${
						$.if(this.todos.length > 0, t`
							<span.counter>
								There are ${ this.todos.length } todos!
							</span>
						`, /* else */ t`
							<span.no-todos>
								There are no todos!
							</span>
						`)
					}
				</div>
				<ul className="todos">
					${
						$.forEach(this.todos, (todo, index) => t`
							<li className="todo">
								<h2>A todo</h2>
								<span>${ index }: ${ todo }</span>
							</li>
						`)
					}
				</ul>
				<section>
					<form action="#" method="post">
						<div class="form-control">
							<input type="text" placeholder="Enter your name" />
						</div>
					</form>
				</section>
			</div>
		`;
	}
}

window.Demo = Demo;
