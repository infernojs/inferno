//EngineJS is a for true light-weight, ultra-fast isomorphic "React-like" framework

var Engine = require('./EngineJS/Engine.js');

class Demo extends Engine.Component {

	constructor() {
		//we declare all our properties
		this.todos = [
			"Clean the dishes",
			"Cook the dinner",
			"Code some coding",
			"Comment on stuff"
		];

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
					["h1", $.bind(text => "Example " + this.title)]
				]
			],
			['div#main',
				//example of a truthy statement
				$.if(isTrue => this.todos.length > 0,
					['div',
						['span.counter', $.bind(text => "There are " + this.todos.length + " todos!")]
					]
				),
				//example of a falsey statement
				$.if(isFalse => this.todos.length > 0,
					['div',
						['span.no-todos', "There are no todos!"]
					]
				)
			],
			['ul.todos',
				$.for(each => this.todos, (todo, index) => [
					['li.todo',
						['h2', "A todo"],
						['span', $.bind(text => index + ": " + todo)]
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
