(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var EngineDocument = require("./EngineDocument.js");

var Engine = {};

Engine.createDocument = function (funcs) {
	return new EngineDocument(funcs);
};


module.exports = Engine;

},{"./EngineDocument.js":2}],2:[function(require,module,exports){
"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var EngineDocument = (function () {
	function EngineDocument(funcs) {
		this._funcs = funcs;
		this.data = {};
		this._document = {};

		this._render();
	}

	_prototypeProperties(EngineDocument, null, {
		mount: {
			value: function mount(virtualDom) {
				//we run the init and get the properties
				this._funcs.init.call(this, this.data);

				//do a render
				this._document = this._funcs.render.call(this, this.data);

				debugger;
				//use the window.document
				if (virtualDom == null) {}
			},
			writable: true,
			configurable: true
		},
		_render: {
			value: function _render() {
				//check the diff

				requestAnimationFrame(this._render.bind(this));
			},
			writable: true,
			configurable: true
		}
	});

	return EngineDocument;
})();

;

module.exports = EngineDocument;

},{}],3:[function(require,module,exports){
"use strict";

var ListNavigation = function () {};

module.exports = ListNavigation;

},{}],4:[function(require,module,exports){
"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

//EngineJS is a for true light-weight, ultra-fast isomorphic "React-like" framework

var Engine = require("./EngineJS/Engine.js");

//Server on NodeJS
var virtualDom = {};

var MyApp = (function () {
	function MyApp(isServer) {
		this._document = null;
		this._isServer = isServer;
		this._initDocument();
	}

	_prototypeProperties(MyApp, null, {
		_initDocument: {
			value: function _initDocument() {
				this._document = Engine.createDocument({
					init: function (data) {
						data.cssFiles = ["foo.css", "bar.css"];
						data.myName = "Dominic";
					},

					render: function (data) {
						var ListNavigation = require("./components/ListNavigation.js");

						return {
							html: {
								head: {
									title: "Hello world",
									link: data.cssFiles.forEach(function (cssFile) {
										return { _rel: "stylesheet", _type: "text/css", _href: cssFile };
									})
								},
								body: {
									header: {
										//a web component, so add the "-" for W3 compliance and link it to our web componenet
										"list-navigation": ListNavigation()
									},
									div: {
										span: "my name is ${ data.myName }"
									}
								}
							}
						};
					}
				});

				if (this.isServer === true) {
					this._document.mount(virtualDom);
				} else {
					this._document.mount();
				}
			},
			writable: true,
			configurable: true
		}
	});

	return MyApp;
})();

;

new MyApp(false);

},{"./EngineJS/Engine.js":1,"./components/ListNavigation.js":3}]},{},[4])