(function () {
	let t = Inferno.createElement;

	Inferno.render(t('div', null,
		t('span', { className: 'foo' }, 'This is a span!')
	), document.getElementById('app'));

	Inferno.render(t('header', null,
		t('h1', { className: 'foo' }, 'This is a h1!')
	), document.getElementById('app'));

	Inferno.render(t('header', null,
		t('span', { className: 'foo' }, 'This is a span again!')
	), document.getElementById('app'));

	Inferno.render(t('header', null,
		1, 	t('span', { className: 'foo' }, 'This is a span again!'), 2, 3
	), document.getElementById('app'));

})();
