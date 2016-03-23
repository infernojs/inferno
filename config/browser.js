window.mocha.setup('bdd');
window.onload = function() {
	window.mocha.checkLeaks();
	window.mocha.globals(['expect', 'assert', 'mock', 'sandbox', 'spy', 'stub', 'useFakeServer', 'useFakeTimers', 'useFakeXMLHttpRequest']);
	window.mocha.run();
};