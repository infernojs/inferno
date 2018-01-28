var Inferno = require('inferno');
var createElement = require('inferno-create-element');

Inferno.render(createElement('h1', null, 'Hello World!'), document.getElementById('container'));
