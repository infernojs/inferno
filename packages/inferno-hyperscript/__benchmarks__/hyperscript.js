import h from '../';

const emptyFn = function emptyFunction() {
};

suite('hyperscript', () => {
	/* Do not compare results between each other, these only measure OPS / sec for different structures */

	benchmark('Single node nulls', () => {
		h('div', null, null);
	});

	benchmark('Single node not defined', () => {
		h('div');
	});

	benchmark('Regular shape', () => {
		h('div', null, [
			h('div', null, '1'),
			h('div', null, [
				h('div', null, 'a'),
				h('div', null, 'b'),
				h('div', null, 'c')
			])
		]);
	});

	benchmark('20 children siblings', () => {
		h('div', null, [
			h('div', null, '1'),
			h('div', null, '2'),
			h('div', null, '3'),
			h('div', null, '4'),
			h('div', null, '5'),
			h('div', null, '6'),
			h('div', null, '7'),
			h('div', null, '8'),
			h('div', null, '9'),
			h('div', null, '10'),
			h('div', null, '11'),
			h('div', null, '12'),
			h('div', null, '13'),
			h('div', null, '14'),
			h('div', null, '15'),
			h('div', null, '16'),
			h('div', null, '17'),
			h('div', null, '18'),
			h('div', null, '19'),
			h('div', null, '20')
		]);
	});

	benchmark('33 nested nodes', () => {
		h('div', null, (
			h('div', null, (
				h('div', null, (
					h('div', null, (
						h('div', null, (
							h('div', null, (
								h('div', null, (
									h('div', null, (
										h('div', null, (
											h('div', null, (
												h('div', null, (
													h('div', null, (
														h('div', null, (
															h('div', null, (
																h('div', null, (
																	h('div', null, (
																		h('div', null, (
																			h('div', null, (
																				h('div', null, (
																					h('div', null, (
																						h('div', null, (
																							h('div', null, (
																								h('div', null, (
																									h('div', null, (
																										h('div', null, (
																											h('div', null, (
																												h('div', null, (
																													h('div', null, (
																														h('div', null, (
																															h('div', null, (
																																h('div', null, (
																																	h('div', null, (
																																		h('div', null, (
																																			h('div', null, 'child33')
																																		))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))));
	});

	benchmark('Table shape', () => {
		h('table', null, [
			h('thead', null, h('tr', null, [
				h('th', null, 'h1')
				, h('th', null, 'h2')
				, h('th', null, 'h3')
				, h('th', null, 'h4')
			]))
			, h('tbody', null, [ h('tr', null, [
				h(
					'td', null, '1')
				, h(
					'td', null, '2')
				, h(
					'td', null, '3')
				, h(
					'td', null, '4')
			]), h('tr', null, [
				h(
					'td', null, '5')
				, h(
					'td', null, '6')
				, h(
					'td', null, '7')
				, h(
					'td', null, '8')
			]), h('tr', null, [
				h(
					'td', null, '9')
				, h(
					'td', null, '10')
				, h(
					'td', null, '11')
				, h(
					'td', null, '12')
			]) ])
		]);
	});

	benchmark('text node childs (table shape)', () => {
		h('table', null, [
			h('thead', null, h('tr', null, [
				h('th', null, h('p', null, 'h1'))
				, h('th', null, h('p', null, 'h2'))
				, h('th', null, h('p', null, 'h3'))
				, h('th', null, h('p', null, 'h4'))
			]))
			, h('tbody', null, [ h('tr', null, [
				h(
					'td', null, h('p', null, '1'))
				, h(
					'td', null, h('p', null, '2'))
				, h(
					'td', null, h('p', null, '3'))
				, h(
					'td', null, h('p', null, '4'))
			]), h('tr', null, [
				h(
					'td', null, h('p', null, '5'))
				, h(
					'td', null, h('p', null, '6'))
				, h(
					'td', null, h('p', null, '7'))
				, h(
					'td', null, h('p', null, '8'))
			]), h('tr', null, [
				h(
					'td', null, h('p', null, '9'))
				, h(
					'td', null, h('p', null, '10'))
				, h(
					'td', null, h('p', null, '11'))
				, h(
					'td', null, h('p', null, '12'))
			]) ])
		]);
	});

	benchmark('navigation shape ul - li', () => {
		h('nav', null, h('ul', null, [ h('li', null, h('a', {
			href: '#'
		}, 'Home')), h('li', null, h('a', {
			href: '#'
		}, 'About')), h('li', null, h('a', {
			href: '#'
		}, 'Clients')), h('li', null, h('a', {
			href: '#'
		}, 'Contact Us')) ]));
	});

	benchmark('navigation shape ul - li with events', () => {
		h('nav', null, h('ul', null, [ h('li', null, h('a', {
			href: '#',
			onMouseMove: emptyFn
		}, 'Home')), h('li', null, h('a', {
			href: '#'
		}, 'About')), h('li', null, h('a', {
			href: '#',
			onClick: emptyFn,
			onAutoComplete: emptyFn,
			onAbort: emptyFn,
			onfocus: emptyFn,
			onDragEnd: emptyFn,
			onDragStart: emptyFn
		}, 'Clients')), h('li', null, h('a', {
			href: '#',
			onClick: emptyFn
		}, 'Contact Us')) ]));
	});

	benchmark('typical html page', () => {
		h('html', null, [ h('head'), h('body', null, h('div', {
			class: 'flex-container'
		}, [ h('header', null, h('h1', null, 'City Gallery')), h('nav', {
			class: 'nav'
		}, h('ul', null, [ h('li', null, h('a', {
			href: '#'
		}, 'London')), h('li', null, h('a', {
			href: '#'
		}, 'Paris')), h('li', null, h('a', {
			href: '#'
		}, 'Tokyo')) ])), h('article', {
			class: 'article'
		}, [ h('h1', null, 'London'), h('p', null, 'London'), h('p', null, h('strong', null, 'Resize')) ]), h('footer', null, 'Copyright \xA9 W3Schools.com') ])) ]);
	});
});
