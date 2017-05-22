import createElement from '../';

const emptyFn = function emptyFunction() {
};

suite('createElement', () => {
	/* Do not compare results between each other, these only measure OPS / sec for different structures */

	benchmark('Single node nulls', () => {
		createElement('div', null, null);
	});

	benchmark('Single node not defined', () => {
		createElement('div');
	});

	benchmark('Regular shape', () => {
		createElement('div', null, [
			createElement('div', null, '1'),
			createElement('div', null, [
				createElement('div', null, 'a'),
				createElement('div', null, 'b'),
				createElement('div', null, 'c')
			])
		]);
	});

	benchmark('20 children siblings', () => {
		createElement('div', null, [
			createElement('div', null, '1'),
			createElement('div', null, '2'),
			createElement('div', null, '3'),
			createElement('div', null, '4'),
			createElement('div', null, '5'),
			createElement('div', null, '6'),
			createElement('div', null, '7'),
			createElement('div', null, '8'),
			createElement('div', null, '9'),
			createElement('div', null, '10'),
			createElement('div', null, '11'),
			createElement('div', null, '12'),
			createElement('div', null, '13'),
			createElement('div', null, '14'),
			createElement('div', null, '15'),
			createElement('div', null, '16'),
			createElement('div', null, '17'),
			createElement('div', null, '18'),
			createElement('div', null, '19'),
			createElement('div', null, '20')
		]);
	});

	benchmark('33 nested nodes', () => {
		createElement('div', null, (
			createElement('div', null, (
				createElement('div', null, (
					createElement('div', null, (
						createElement('div', null, (
							createElement('div', null, (
								createElement('div', null, (
									createElement('div', null, (
										createElement('div', null, (
											createElement('div', null, (
												createElement('div', null, (
													createElement('div', null, (
														createElement('div', null, (
															createElement('div', null, (
																createElement('div', null, (
																	createElement('div', null, (
																		createElement('div', null, (
																			createElement('div', null, (
																				createElement('div', null, (
																					createElement('div', null, (
																						createElement('div', null, (
																							createElement('div', null, (
																								createElement('div', null, (
																									createElement('div', null, (
																										createElement('div', null, (
																											createElement('div', null, (
																												createElement('div', null, (
																													createElement('div', null, (
																														createElement('div', null, (
																															createElement('div', null, (
																																createElement('div', null, (
																																	createElement('div', null, (
																																		createElement('div', null, (
																																			createElement('div', null, 'child33')
																																		))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))));
	});

	benchmark('Table shape', () => {
		createElement('table', null, [
			createElement('thead', null, createElement('tr', null, [
				createElement('th', null, 'h1')
				, createElement('th', null, 'h2')
				, createElement('th', null, 'h3')
				, createElement('th', null, 'h4')
			]))
			, createElement('tbody', null, [ createElement('tr', null, [
				createElement(
					'td', null, '1')
				, createElement(
					'td', null, '2')
				, createElement(
					'td', null, '3')
				, createElement(
					'td', null, '4')
			]), createElement('tr', null, [
				createElement(
					'td', null, '5')
				, createElement(
					'td', null, '6')
				, createElement(
					'td', null, '7')
				, createElement(
					'td', null, '8')
			]), createElement('tr', null, [
				createElement(
					'td', null, '9')
				, createElement(
					'td', null, '10')
				, createElement(
					'td', null, '11')
				, createElement(
					'td', null, '12')
			]) ])
		]);
	});

	benchmark('text node childs (table shape)', () => {
		createElement('table', null, [
			createElement('thead', null, createElement('tr', null, [
				createElement('th', null, createElement('p', null, 'h1'))
				, createElement('th', null, createElement('p', null, 'h2'))
				, createElement('th', null, createElement('p', null, 'h3'))
				, createElement('th', null, createElement('p', null, 'h4'))
			]))
			, createElement('tbody', null, [ createElement('tr', null, [
				createElement(
					'td', null, createElement('p', null, '1'))
				, createElement(
					'td', null, createElement('p', null, '2'))
				, createElement(
					'td', null, createElement('p', null, '3'))
				, createElement(
					'td', null, createElement('p', null, '4'))
			]), createElement('tr', null, [
				createElement(
					'td', null, createElement('p', null, '5'))
				, createElement(
					'td', null, createElement('p', null, '6'))
				, createElement(
					'td', null, createElement('p', null, '7'))
				, createElement(
					'td', null, createElement('p', null, '8'))
			]), createElement('tr', null, [
				createElement(
					'td', null, createElement('p', null, '9'))
				, createElement(
					'td', null, createElement('p', null, '10'))
				, createElement(
					'td', null, createElement('p', null, '11'))
				, createElement(
					'td', null, createElement('p', null, '12'))
			]) ])
		]);
	});

	benchmark('navigation shape ul - li', () => {
		createElement('nav', null, createElement('ul', null, [ createElement('li', null, createElement('a', {
			href: '#'
		}, 'Home')), createElement('li', null, createElement('a', {
			href: '#'
		}, 'About')), createElement('li', null, createElement('a', {
			href: '#'
		}, 'Clients')), createElement('li', null, createElement('a', {
			href: '#'
		}, 'Contact Us')) ]));
	});

	benchmark('navigation shape ul - li with events', () => {
		createElement('nav', null, createElement('ul', null, [ createElement('li', null, createElement('a', {
			href: '#',
			onMouseMove: emptyFn
		}, 'Home')), createElement('li', null, createElement('a', {
			href: '#'
		}, 'About')), createElement('li', null, createElement('a', {
			href: '#',
			onClick: emptyFn,
			onAutoComplete: emptyFn,
			onAbort: emptyFn,
			onfocus: emptyFn,
			onDragEnd: emptyFn,
			onDragStart: emptyFn
		}, 'Clients')), createElement('li', null, createElement('a', {
			href: '#',
			onClick: emptyFn
		}, 'Contact Us')) ]));
	});

	benchmark('typical html page', () => {
		createElement('html', null, [ createElement('head'), createElement('body', null, createElement('div', {
			class: 'flex-container'
		}, [ createElement('header', null, createElement('h1', null, 'City Gallery')), createElement('nav', {
			class: 'nav'
		}, createElement('ul', null, [ createElement('li', null, createElement('a', {
			href: '#'
		}, 'London')), createElement('li', null, createElement('a', {
			href: '#'
		}, 'Paris')), createElement('li', null, createElement('a', {
			href: '#'
		}, 'Tokyo')) ])), createElement('article', {
			class: 'article'
		}, [ createElement('h1', null, 'London'), createElement('p', null, 'London'), createElement('p', null, createElement('strong', null, 'Resize')) ]), createElement('footer', null, 'Copyright \xA9 W3Schools.com') ])) ]);
	});
});
