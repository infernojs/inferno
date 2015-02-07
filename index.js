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

		this.colours = ["red", "blue", "green"];
		this.colourIndex = 0;

		//just to show the flexibility, this array will store all our header dom nodes in our template
		this.headerElems = [];

		this.title = "Todo Demo";
		this.formId = "todo-form";

		super();
	}

	_clickSubmit(e) {
		debugger;
	}

	animate() {
		for(var i = 0; i < this.headerElems.length; i++) {
			this.headerElems[i].style.color = this.colours[this.colourIndex];
		}
		this.colourIndex++;
		if(this.colourIndex === 4) {
			this.colourIndex = 0;
		}
	}

	initTemplate(templateHelper) {
		//$ = templateHelper shorthand
		var $ = templateHelper;

		return [
			["div",
				["header",
					["h1", {storeRef: this.headerElems}, $.bind(text => "Example " + this.title)]
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
						['h2', {storeRef: this.headerElems}, "A todo"],
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
