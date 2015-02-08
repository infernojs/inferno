//EngineJS is a for true light-weight, ultra-fast isomorphic "React-like" framework

var Inferno = require('./InfernoJS/Inferno.js');


class Bar extends Inferno.Component {

	constructor() {

		super();
	}

	initTemplate(templateHelper) {
		//$ = templateHelper shorthand
		var $ = templateHelper;

		return [
			['div.ladder-cell'],
			['div.ladder-cell'],
			['div.ladder-cell']
		];
	}
};

class Component extends Inferno.Component {

	constructor() {

		this.bars = [
			new Bar(true),
			new Bar(true),
			new Bar(true),
			new Bar(true),
			new Bar(true),
			new Bar(false),
			new Bar(false),
			new Bar(false),
			new Bar(false),
			new Bar(false)
		];

		super();
	}

	initTemplate(templateHelper) {
		//$ = templateHelper shorthand
		var $ = templateHelper;

		return [
			['div.ladder',
				['header', "Apple (AAPL)"]
			],
			['div.bars',
				$.for(each => this.bars, (bar) => [
					$.render('div.ladder-row', bar)
				])
			]
		];
	}
}

class LaddersApp extends Inferno.Component {

	constructor() {
		//we declare all our properties
		this.components = [
			new Component(),
			new Component(),
			new Component(),
			new Component(),
			new Component(),
			new Component()
		];

		super();
	}

	initTemplate(templateHelper) {
		//$ = templateHelper shorthand
		var $ = templateHelper;

		return [
			['div.components',
				$.for(each => this.components, (component) => [
					$.render("div.component", component)
				])
			]
		];
	}
};

window.LaddersApp = LaddersApp;
