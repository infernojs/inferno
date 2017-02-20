// Change N to change the number of drawn circles.

var N = 200;

// The Backbone implementation:
(function(){

	var Box = Backbone.Model.extend({

		defaults: {
			top: 0,
			left: 0,
			color: 0,
			content: 0
		},

		initialize: function() {
			this.count = 0;
		},

		tick: function() {
			var count = this.count += 1;
			this.set({
				top: Math.sin(count / 10) * 10,
				left: Math.cos(count / 10) * 10,
				color: (count) % 255,
				content: count % 100
			});
		}

	});


	var BoxView = Backbone.View.extend({

		className: 'box-view',

		template: _.template($('#underscore-template').html()),

		initialize: function() {
			this.model.bind('change', this.render, this);
		},

		render: function() {
			this.$el.html(this.template(this.model.attributes));
			return this;
		}

	});

	var boxes;

	var backboneInit = function() {
		boxes = _.map(_.range(N), function(i) {
			var box = new Box({number: i});
			var view = new BoxView({model: box});
			$('#grid').append(view.render().el);
			return box;
		});
	};

	var backboneAnimate = function() {
		for (var i = 0, l = boxes.length; i < l; i++) {
			boxes[i].tick();
		}
	};

	window.runBackbone = function() {
		reset();
		backboneInit();
		setTimeout(function () {
			startClock();
			benchmarkLoop(backboneAnimate);
		}, 300);
	};

})();

// The Ember implementation:
(function(){

	var Box = Ember.Object.extend({

		top: 0,
		left: 0,
		content: 0,
		count: 0,

		tick: function() {
			var count = this.get('count') + 1;
			this.set('count', count);
			this.set('top', Math.sin(count / 10) * 10);
			this.set('left', Math.cos(count / 10) * 10);
			this.set('color', count % 255);
			this.set('content', count % 100);
			this.set('style', this.computeStyle());
		},

		computeStyle: function() {
			return 'top: ' + this.get('top') + 'px; left: ' +  this.get('left') +'px; background: rgb(0,0,' + this.get('color') + ');';
		}

	});

	var htmlbarsTemplate = Ember.HTMLBars.compile($('#htmlbars-box').text().trim());

	var BoxView = Ember.View.extend({
		usingHTMLBars: true,
		template: htmlbarsTemplate,
		classNames: ['box-view']
	});

	var boxes;

// var App = Ember.Application.create();

	var emberInit = function() {
		boxes = _.map(_.range(N), function(i) {
			var box = Box.create();
			var view = BoxView.create({context: box});
			view.appendTo('#grid');
			box.set('number', i);
			return box;
		});
	};

	var emberAnimate = function() {
		Ember.run(function() {
			for (var i = 0, l = boxes.length; i < l; i++) {
				boxes[i].tick();
			}
		});
	};


	window.runEmber = function() {
		reset();
		emberInit();
		setTimeout(function () {
			startClock();
			benchmarkLoop(emberAnimate);
		}, 300);
	};

})();

// The mercury implementation
(function () {
	var h = mercury.h
	var drawBox = function (key, count) {
		return h('.box-view', [
			h('.box', {
				style: {
					top: String(Math.sin(count / 10) * 10) + 'px',
					left: String(Math.cos(count / 10) * 10) + 'px',
					background: 'rgb(0, 0,' + count % 255 + ')'
				}
			}, String(count % 100))
		])
	}

	var Render = _.memoize(function Render(count) {
		return h('div', _.map(_.range(N), function (i) {
			return drawBox(i, count)
		}))
	})

	var state = mercury.value(0)

	var mercuryInit = function() {
		mercury.app(document.getElementById('grid'), state, Render)
	};

	var mercuryAnimate = function() {
		state.set((state() + 1) % 255)
	};

	window.runMercury = function() {
		state = mercury.value(0);
		reset();
		mercuryInit();
		setTimeout(function () {
			startClock();
			benchmarkLoop(mercuryAnimate);
		}, 300);
	};
}());

// The Inferno implementation:
(function(){

	Inferno.options.recyclingEnabled = true; // Advanced optimisation
	var createVNode = Inferno.createVNode;
	var container = document.getElementById('grid');

	var counter;
	var boxViewProps = { className: 'box-view' };

	function createBoxes(count) {
		var boxes = [];
		for (var i = 0; i < N; i++) {
			var style = 'top:' + Math.sin(count / 10) * 10 + 'px;' +
					'left:' + Math.cos(count / 10) * 10 + 'px;' +
					'background-color:' + 'rgb(0, 0,' + count % 255 + ');';

			boxes.push(createVNode(2, 'div', boxViewProps, createVNode(2, 'div', { className: 'box', style: style }, count % 100, null, null, null, true), null, null, null, true));

		}
		return boxes;
	}

	var infernoAnimate = function() {
		Inferno.render(
			createVNode(66, 'div', null, createBoxes(counter++), null, null, null, true),
			container
		);
	};

	var infernoInit = function() {
		counter = -1;
		infernoAnimate();
	};

	window.runInferno = function() {
		var grid = document.getElementById('grid');
		Inferno.render(null, grid);
		reset();
		infernoInit();
		setTimeout(function () {
			startClock();
			benchmarkLoop(infernoAnimate);
		}, 300);
	};

})();


// The React implementation:
(function(){

	var BoxView = React.createClass({
		render: function() {
			var count = this.props.count + 1;
			return (
				React.createElement('div',
					{className: "box-view"},
					React.createElement('div',
						{
							className: "box",
							style: {
								top: Math.sin(count / 10) * 10,
								left: Math.cos(count / 10) * 10,
								background: 'rgb(0, 0,' + count % 255 + ')'
							}
						},
						count % 100
					)
				)
			);
		}

	});

	var BoxesView = React.createClass({
		render: function() {
			var boxes = [];
			for (var i = 0; i < N; i++) {
				boxes.push(React.createElement(BoxView, {key: i, count: this.props.count}));
			}
			return React.createElement('div', null, boxes);
		}

	});

	var counter;
	var reactInit = function() {
		counter = -1;
		reactAnimate();
	};

	var reactAnimate = function() {
		ReactDOM.render(
			React.createElement(BoxesView, {count: counter++}),
			document.getElementById('grid')
		);
	};

	window.runReact = function() {
		reset();
		reactInit();
		setTimeout(function () {
			startClock();
			benchmarkLoop(reactAnimate);
		}, 300);
	};

})();

// rawdog
(function(){

	var BoxView = function(number){
		this.el = document.createElement('div');
		this.el.className = 'box-view';
		this.el.innerHTML = '<div class="box" id="box-' + number + '"></div>';
		this.count = 0;
		this.render()
	}

	BoxView.prototype.render = function(){
		var count = this.count
		var el = this.el.firstChild
		el.style.top = Math.sin(count / 10) * 10 + 'px';
		el.style.left = Math.cos(count / 10) * 10 + 'px';
		el.style.background = 'rgb(0,0,' + count % 255 + ')';
		el.textContent = String(count % 100);
	}

	BoxView.prototype.tick = function(){
		this.count++;
		this.render();
	}

	var boxes;

	var init = function() {
		boxes = _.map(_.range(N), function(i) {
			var view = new BoxView(i);
			$('#grid').append(view.el);
			return view;
		});
	};

	var animate = function() {
		for (var i = 0, l = boxes.length; i < l; i++) {
			boxes[i].tick();
		}
	};

	window.runRawdog = function() {
		reset();
		init();
		setTimeout(function () {
			startClock();
			benchmarkLoop(animate);
		}, 300);
	};

})();

// The Vue implementation:
(function(){

	var Box = Vue.extend({
		template: '#vue-template',
		name: 'Box',
		data: function () {
			return {
				number: 0,
				count: 0,
				top: 0,
				left: 0,
				bg: 0,
				content: ''
			}
		},
		methods: {
			tick: function () {
				var c = ++this.count
				this.top = Math.sin(c / 10) * 10
				this.left = Math.cos(c / 10) * 10
				this.bg = c % 255
				this.content = c % 100
			}
		},
		computed: {
			style: function () {
				return {
					top: this.top + 'px',
					left: this.left + 'px',
					backgroundColor: 'rgb(0,0,' + this.bg + ')'
				}
			}
		}
	})

	var boxes = [];

	var vueInit = function() {
		boxes.forEach(function (box) {
			box.$destroy();
		});
		boxes = _.map(_.range(N), function(i) {
			var box = new Box();
			box.number = i;
			box.$mount().$appendTo('#grid');
			return box;
		});
	};

	var vueAnimate = function() {
		for (var i = 0, l = boxes.length; i < l; i++) {
			boxes[i].tick();
		}
	};

	window.runVue = function() {
		reset();
		vueInit();
		setTimeout(function () {
			startClock();
			benchmarkLoop(vueAnimate);
		}, 300);
	};

})();

window.timeout = null;
window.totalTime = null;
window.loopCount = null;
window.startDate = null;
window.reset = function() {
	$('#grid').empty();
	$('#timing').html('&nbsp;');
	clearTimeout(timeout);
};
window.startClock = function () {
	loopCount = 0;
	totalTime = 0;
	startDate = Date.now();
}

window.benchmarkLoop = function(fn) {
	totalTime += Date.now() - startDate;
	startDate = Date.now();
	fn();
	loopCount++;
	if (loopCount % 20 === 0) {
		$('#timing').text('Performed ' + loopCount + ' iterations in ' + totalTime + ' ms (average ' + (totalTime / loopCount).toFixed(2) + ' ms per loop).');
	}
	timeout = _.defer(benchmarkLoop, fn);
};
