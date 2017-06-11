require(['inferno', 'inferno-create-element'], function(Inferno, createElement) {
	Inferno.render(createElement('h1', null, 'Hello World!'), document.getElementById('container'));
});
