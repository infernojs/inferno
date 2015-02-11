//EngineJS is a for true light-weight, ultra-fast isomorphic "React-like" framework

var Inferno = require('./InfernoJS/Inferno.js');

class Demo extends Inferno.Component {

	constructor() {
		//we declare all our properties
		this.todos = [
			"Clean the dishes",
			"Cook the dinner",
			"Code some coding",
			"Comment on stuff"
		];

		this.testClassName = "foo-bar";
		this.title = "Todo Demo";
		this.formId = "todo-form";

		super();
	}

	_clickSubmit(e) {
		debugger;
	}

	render($) {
		//$ = RenderHelper, to reduce lines of code and to simplify workflow
		return [
			['div'],
				['header'],
					['h1'],
						`Example ${ this.title }`,
					['/h1'],
				['/header'],
			['/div'],
			['div', {className: this.testClassName}],
				'Test text',
			['/div'],
			['div#main'],
				['div'],
					//example of a truthy helper
					$.if(this.todos.length > 0, [
						['span.counter'],
							`There are ${ this.todos.length } todos!`,
						['/span']
					], [ //else
						['span.no-todos'],
							"There are no todos!",
						['/span']
					]),
				['/div'],
			['/div'],
			['ul.todos'],
				//usage of forEach helper
				$.forEach(this.todos, (todo, index) => [
					['li.todo'],
						['h2'],"A todo",['/h2'],
						['span'], `${ index }: ${ todo }`,['/span'],
					['/li']
				]),
			['/ul'],
			['form', {id: this.formId, method: "post", action: "#"}],
				['div.form-control'],
					['input', {name: "first_name", type: "text"}],
				['/div'],
				['button', {type: "submit", onClick: this._clickSubmit}],
					"Submit!",
				['/button'],
			['/form']
		];
	}
};

window.Demo = Demo;
