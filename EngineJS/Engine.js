var EngineDocument = require('./EngineDocument.js');

var Engine = {};
	
Engine.createDocument = function(funcs) {
	return new EngineDocument(funcs);
};

Engine.Dom = {};

Engine.Dom.Stylesheets = function(filePaths) {
	var stylesheets = [];
	for(var i = 0; i < filePaths.length; i++) {

	}
};


module.exports = Engine;