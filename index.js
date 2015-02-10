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

	initTemplate(templateHelper) {
		//$ = templateHelper shorthand
		var $ = templateHelper;

		return [
			["div",
				["header",
					["h1", $.text(none => "Example " + this.title)]
				]
			],
			['div#test', {className: $.text(none => this.testClassName)},
				"Test text"
			],
			['div#main',
				//example of a truthy statement
				['div', $.if(isTrue => this.todos.length > 0,
					//on a $.bind() the 2nd param is an internal hint to improve performance
					//this would likely be automatically added on some post compile process
					['span.counter', $.text(none => "There are " + this.todos.length + " todos!")]
				)],
				//example of a falsey statement
				['div', $.if(isFalse => this.todos.length > 0,
					['span.no-todos', "There are no todos!"]
				)]
			],
			['ul.todos',
				$.for(each => this.todos, (todo, index) => [
					['li.todo',
						['h2', "A todo"],
						['span', $.text(none => index + ": " + todo)]
					],
					['div.test', "Foo!"]
				])
			],
			['form', {id: this.formId, method: "post", action: "#"},
				['div.form-control',
					['input', {name: "first_name", type: "text"}]
				],
				['button', {type: "submit", onClick: this._clickSubmit},
					"Submit!"
				]
			]
		];
	}
};

window.Demo = Demo;
