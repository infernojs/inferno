(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
	'use strict';

	Inferno.options.recyclingEnabled = true; // Advanced optimisation
	var benchmark = require('vdom-benchmark-base');

	var NAME = 'inferno';
	var VERSION = Inferno.version;

	var createVNode = Inferno.createVNode;

	function renderTree(nodes) {
		var children = new Array(nodes.length);
		var i;
		var n;

		for (i = 0; i < nodes.length; i++) {
			n = nodes[i];
			if (n.children !== null) {
				children[i] = createVNode(34, 'div', null, renderTree(n.children), null, n.key, null, true);
			} else {
				children[i] = createVNode(2, 'span', null, n.key, null, n.key, null, true);
			}
		}
		return children;
	}

	function BenchmarkImpl(container, a, b) {
		this.container = container;
		this.a = a;
		this.b = b;
	}

	BenchmarkImpl.prototype.setUp = function () {
	};

	BenchmarkImpl.prototype.tearDown = function () {
		Inferno.render(null, this.container);
	};

	BenchmarkImpl.prototype.render = function () {
		Inferno.render(
			createVNode(34, 'div', null, renderTree(this.a), null, null, null, true),
			this.container
		);
	};

	BenchmarkImpl.prototype.update = function () {
		Inferno.render(
			createVNode(34, 'div', null, renderTree(this.b), null, null, null, true),
			this.container
		);
	};

	document.addEventListener('DOMContentLoaded', function () {
		benchmark(NAME, VERSION, BenchmarkImpl);
	}, false);

},{"vdom-benchmark-base":4}],2:[function(require,module,exports){
	'use strict';

	var Executor = require('./executor');

	function Benchmark() {
		this.running = false;
		this.impl = null;
		this.tests = null;
		this.reportCallback = null;
		this.enableTests = false;

		this.container = document.createElement('div');

		this._runButton = document.getElementById('RunButton');
		this._iterationsElement = document.getElementById('Iterations');
		this._reportElement = document.createElement('pre');

		document.body.appendChild(this.container);
		document.body.appendChild(this._reportElement);

		var self = this;

		this._runButton.addEventListener('click', function(e) {
			e.preventDefault();

			if (!self.running) {
				var iterations = parseInt(self._iterationsElement.value);
				if (iterations <= 0) {
					iterations = 10;
				}

				self.run(iterations);
			}
		}, false);

		this.ready(true);
	}

	Benchmark.prototype.ready = function(v) {
		if (v) {
			this._runButton.disabled = '';
		} else {
			this._runButton.disabled = 'true';
		}
	};

	Benchmark.prototype.run = function(iterations) {
		var self = this;
		this.running = true;
		this.ready(false);

		new Executor(self.impl, self.container, self.tests, 1, function() { // warmup
			new Executor(self.impl, self.container, self.tests, iterations, function(samples) {
				self._reportElement.textContent = JSON.stringify(samples, null, ' ');
				self.running = false;
				self.ready(true);
				if (self.reportCallback != null) {
					self.reportCallback(samples);
				}
			}, undefined, false).start();
		}, undefined, this.enableTests).start();
	};

	module.exports = Benchmark;

},{"./executor":3}],3:[function(require,module,exports){
	'use strict';

	function render(nodes) {
		var children = [];
		var j;
		var c;
		var i;
		var e;
		var n;

		for (i = 0; i < nodes.length; i++) {
			n = nodes[i];
			if (n.children !== null) {
				e = document.createElement('div');
				c = render(n.children);
				for (j = 0; j < c.length; j++) {
					e.appendChild(c[j]);
				}
				children.push(e);
			} else {
				e = document.createElement('span');
				e.textContent = n.key.toString();
				children.push(e);
			}
		}

		return children;
	}

	function testInnerHtml(testName, nodes, container) {
		var c = document.createElement('div');
		var e = document.createElement('div');
		var children = render(nodes);
		for (var i = 0; i < children.length; i++) {
			e.appendChild(children[i]);
		}
		c.appendChild(e);
		if (c.innerHTML !== container.innerHTML) {
			console.log('error in test: ' + testName);
			console.log('container.innerHTML:');
			console.log(container.innerHTML);
			console.log('should be:');
			console.log(c.innerHTML);
		}
	}


	function Executor(impl, container, tests, iterations, cb, iterCb, enableTests) {
		if (iterCb === void 0) iterCb = null;

		this.impl = impl;
		this.container = container;
		this.tests = tests;
		this.iterations = iterations;
		this.cb = cb;
		this.iterCb = iterCb;
		this.enableTests = enableTests;

		this._currentTest = 0;
		this._currentIter = 0;
		this._renderSamples = [];
		this._updateSamples = [];
		this._result = [];

		this._tasksCount = tests.length * iterations;

		this._iter = this.iter.bind(this);
	}

	Executor.prototype.start = function() {
		this._iter();
	};

	Executor.prototype.finished = function() {
		this.cb(this._result);
	};

	Executor.prototype.progress = function() {
		if (this._currentTest === 0 && this._currentIter === 0) {
			return 0;
		}

		var tests = this.tests;
		return (this._currentTest * tests.length + this._currentIter) / (tests.length * this.iterataions);
	};

	Executor.prototype.iter = function() {
		if (this.iterCb != null) {
			this.iterCb(this);
		}

		var tests = this.tests;

		if (this._currentTest < tests.length) {
			var test = tests[this._currentTest];

			if (this._currentIter < this.iterations) {
				var e, t;
				var renderTime, updateTime;

				e = new this.impl(this.container, test.data.a, test.data.b);
				e.setUp();

				t = window.performance.now();
				e.render();
				renderTime = window.performance.now() - t;

				if (this.enableTests) {
					testInnerHtml(test.name + 'render()', test.data.a, this.container);
				}

				t = window.performance.now();
				e.update();
				updateTime = window.performance.now() - t;

				if (this.enableTests) {
					testInnerHtml(test.name + 'update()', test.data.b, this.container);
				}

				e.tearDown();

				this._renderSamples.push(renderTime);
				this._updateSamples.push(updateTime);

				this._currentIter++;
			} else {
				this._result.push({
					name: test.name + ' ' + 'render()',
					data: this._renderSamples.slice(0)
				});

				this._result.push({
					name: test.name + ' ' + 'update()',
					data: this._updateSamples.slice(0)
				});

				this._currentTest++;

				this._currentIter = 0;
				this._renderSamples = [];
				this._updateSamples = [];
			}

			setTimeout(this._iter, 0);
		} else {
			this.finished();
		}
	};

	module.exports = Executor;

},{}],4:[function(require,module,exports){
	'use strict';

	var Benchmark = require('./benchmark');
	var benchmark = new Benchmark();

	function initFromScript(scriptUrl, impl) {
		var e = document.createElement('script');
		e.src = scriptUrl;

		e.onload = function() {
			benchmark.tests = window.generateBenchmarkData().units;
			benchmark.ready(true);
		};

		document.head.appendChild(e);
	}

	function initFromParentWindow(parent, name, version, id) {
		window.addEventListener('message', function(e) {
			var data = e.data;
			var type = data.type;

			if (type === 'tests') {
				benchmark.tests = data.data;
				benchmark.reportCallback = function(samples) {
					parent.postMessage({
						type: 'report',
						data: {
							name: name,
							version: version,
							samples: samples
						},
						id: id
					}, '*');
				};
				benchmark.ready(true);

				parent.postMessage({
					type: 'ready',
					data: null,
					id: id
				}, '*');
			} else if (type === 'run') {
				benchmark.run(data.data.iterations);
			}
		}, false);

		parent.postMessage({
			type: 'init',
			data: null,
			id: id
		}, '*');
	}

	function init(name, version, impl) {
		// Parse Query String.
		var qs = (function(a) {
			if (a == "") return {};
			var b = {};
			for (var i = 0; i < a.length; ++i) {
				var p=a[i].split('=', 2);
				if (p.length == 1) {
					b[p[0]] = "";
				} else {
					b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
				}
			}
			return b;
		})(window.location.search.substr(1).split('&'));

		if (qs['name'] !== void 0) {
			name = qs['name'];
		}

		if (qs['version'] !== void 0) {
			version = qs['version'];
		}

		var type = qs['type'];

		if (qs['test'] !== void 0) {
			benchmark.enableTests = true;
			console.log('tests enabled');
		}

		var id;
		if (type === 'iframe') {
			id = qs['id'];
			if (id === void 0) id = null;
			initFromParentWindow(window.parent, name, version, id);
		} else if (type === 'window') {
			if (window.opener != null) {
				id = qs['id'];
				if (id === void 0) id = null;
				initFromParentWindow(window.opener, name, version, id);
			} else {
				console.log('Failed to initialize: opener window is NULL');
			}
		} else {
			var testsUrl = qs['data']; // url to the script generating test data
			if (testsUrl !== void 0) {
				initFromScript(testsUrl);
			} else {
				console.log('Failed to initialize: cannot load tests data');
			}
		}

		benchmark.impl = impl;
	}

// performance.now() polyfill
// https://gist.github.com/paulirish/5438650
// prepare base perf object
	if (typeof window.performance === 'undefined') {
		window.performance = {};
	}
	if (!window.performance.now){
		var nowOffset = Date.now();
		if (performance.timing && performance.timing.navigationStart) {
			nowOffset = performance.timing.navigationStart;
		}
		window.performance.now = function now(){
			return Date.now() - nowOffset;
		};
	}

	module.exports = init;

},{"./benchmark":2}]},{},[1])

