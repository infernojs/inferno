//EngineJS is a for true light-weight, ultra-fast isomorphic "React-like" framework

var Inferno = require('./InfernoJS/Inferno.js');

class NumberBar extends Inferno.Component {

	constructor() {
		this.type = "";
		this.barClass = "";
		this.selected = false;
		this.mouseOver = false;
		this.maxBarWidth = 0;
		this.number = 0;
		this.maxNumber = 0;
		super();
	}

	_getNumberBarStyle() {
		var background, color;

		if (this.selected) {
			background = "rgb(100,100,100)";
			color = "#ffffff";
		} else if (this.mouseOver) {
			background = "rgb(200,200,200)";
			color = "";
		} else {
			background = "";
			color = "";
		}

		return {
			backgroundColor: background,
			color: color
		};
	}

	_getBarStyle() {
		var ratio = this.number / this.maxNumber;
		var value = ratio * this.maxBarWidth + "px";
		var display = this.mouseOver || this.selected ? "none" : "";
		var translate = (1 - ratio) * 100;

		if (this.type === "ask") {
			translate = -translate;
		}

		return {
			display: display,
			transform: "translateX(" + translate + "%)"
		}
	}

	initTemplate($) {
		return [
			['div.numberbar', {style: this._getNumberBarStyle},
				['div', {className: $.text(none => "numberbar-bar numberbar-bar-" + this.type), style: this._getBarStyle}],
				['div.numberbar-number', $.text(none => this.number)]
			],
		];
	}
}

class LadderRow extends Inferno.Component {

	constructor() {
		this.priceLevel = {};
		super();
	}

	initTemplate($) {

		var bidData = function() {
			return {
				type: "bid",
				number: this.priceLevel.bidVolume,
				maxNumber: ordersModel.maxVolume,
				maxBarWidth: "120"
			}
		}.bind(this)

		var askData = function() {
			return {
				type: "ask",
				number: this.priceLevel.askVolume,
				maxNumber: ordersModel.maxVolume,
				maxBarWidth: "120"
			}
		}.bind(this)

		return [
			$.render('div.ladder-cell', new NumberBar(), bidData),
			['div', {className: "ladder-cell ladder-cell-price"}, $.text(none => this.priceLevel.price)],
			$.render('div.ladder-cell', new NumberBar(), askData)
		];
	}
};

class Ladder extends Inferno.Component {

	constructor() {

		this.ladderRows = ordersModel.levels.map(function(priceLevel, index) {
			return {
				ladderRow: new LadderRow(),
				props: function() {
					return {
						priceLevel: priceLevel
					}
				}
			}
		}.bind(this));

		setInterval(function() {
			this.forceUpdate();
		}.bind(this), THROTTLE + (Math.floor(Math.random() * 120)) - 60);

		super();
	}

	//optional way of boosting performance by letting Inferno what it can optimise
	dependencies() {
		//outline what things affect this particular component (not child components)
		return [
			//e.g. if the amount of ladder rows changes, it will affect this component
			this.ladderRows.length
		];
	}

	initTemplate($) {
		return [
			['div.ladder',
				['header', "Apple (AAPL)"]
			],
			['div.bars',
				$.for(each => this.ladderRows, (ladderRow) => [
					$.render('div.ladder-row', ladderRow.ladderRow, ladderRow.props)
				])
			]
		];
	}
}

class LaddersApp extends Inferno.Component {

	constructor() {
		this.ladders = [];

		for(var i = 0; i < NUMBER_OF_LADDERS; i++) {
			this.ladders.push(new Ladder());
		}

		super();
	}

	initTemplate($) {
		return [
			['div.components',
				$.for(each => this.ladders, (ladder) => [
					$.render("div.component", ladder)
				])
			]
		];
	}
};

window.LaddersApp = LaddersApp;
