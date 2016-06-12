(function() {
	var t = InfernoCreateElement;

	var template = Inferno.createBlueprint(function () {
		return {
			tag: "div",
			style: {
				width: "200px",
				height: "200px",
				backgroundColor: "red",

				border: "5px solid black",
				borderRadius: "5px"
			}
		};
	});

	InfernoDOM.render(t('div', null,
		t('span', { className: 'foo'}, 'This is a span!')
	), document.getElementById('app'));

	InfernoDOM.render(t('header', null,
		t('h1', { className: 'foo'}, 'This is a h1!')
	), document.getElementById('app'));

	InfernoDOM.render(t('header', null,
		t('span', { className: 'foo'}, 'This is a span again!')
	), document.getElementById('app'));

	InfernoDOM.render(t('header', null,
		1, 	t('span', { className: 'foo'}, 'This is a span again!'), 2, 3
	), document.getElementById('app'));

})();