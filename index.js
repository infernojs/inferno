//EngineJS is a for true light-weight, ultra-fast isomorphic "React-like" framework

var Engine = require('./EngineJS/Engine.js');

//Server on NodeJS
var virtualDom = {};

class MyApp {

	constructor(isServer) {
		this._document = null;
		this._isServer = isServer;
		this._initDocument();
	}

	_initDocument() {

		this._document = Engine.createDocument({
			init: function(data) {
				data.cssFiles = [
					"foo.css",
					"bar.css"
				];
				data.myName = "Dominic";
				data.pageTitle = "Dominic";
			},

			render: function(data) {
				var ListNavigation = require('./components/ListNavigation.js');
				var Dom = Engine.Dom;

				return {
					html: {
						head: {
							title: "Hello world - ${ data.pageTitle }",
							//two different ways of doing it
							//	link: new Engine.ForEach(data.cssFiles, cssFile => {
							//		return { _rel: "stylesheet", _type: "text/css", _href: cssFile }
							//	}),
							//or this way, this way is faster to write :)
							link: new Dom.Stylesheets(data.cssFiles)
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
				}
			}
		});

		if(this.isServer === true) {
			this._document.mount(virtualDom);
		} else {
			this._document.mount();
		}
	};
};

new MyApp(false);

