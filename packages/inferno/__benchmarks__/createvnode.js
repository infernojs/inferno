import { createTextVNode, createVNode } from '../dist-es/core/VNodes';
import { render } from '../dist-es/index';

suite('createVNode', () => {
	/* Do not compare results between each other, these only measure OPS / sec for different structures */

	benchmark('Single node nulls', () => {
		createVNode(2, 'div', null, null);
	});

	benchmark('Single node not defined', () => {
		createVNode(2, 'div');
	});

	benchmark('Regular shape', () => {
		createVNode(2, 'div', null, [
			createVNode(2, 'div', null, '1'),
			createVNode(2, 'div', null, [
				createVNode(2, 'div', null, 'a'),
				createVNode(2, 'div', null, 'b'),
				createVNode(2, 'div', null, 'c')
			])
		]);
	});

	benchmark('20 children siblings', () => {
		createVNode(2, 'div', null, [
			createVNode(2, 'div', null, '1'),
			createVNode(2, 'div', null, '2'),
			createVNode(2, 'div', null, '3'),
			createVNode(2, 'div', null, '4'),
			createVNode(2, 'div', null, '5'),
			createVNode(2, 'div', null, '6'),
			createVNode(2, 'div', null, '7'),
			createVNode(2, 'div', null, '8'),
			createVNode(2, 'div', null, '9'),
			createVNode(2, 'div', null, '10'),
			createVNode(2, 'div', null, '11'),
			createVNode(2, 'div', null, '12'),
			createVNode(2, 'div', null, '13'),
			createVNode(2, 'div', null, '14'),
			createVNode(2, 'div', null, '15'),
			createVNode(2, 'div', null, '16'),
			createVNode(2, 'div', null, '17'),
			createVNode(2, 'div', null, '18'),
			createVNode(2, 'div', null, '19'),
			createVNode(2, 'div', null, '20')
		]);
	});

	benchmark('33 nested nodes', () => {
		createVNode(2, 'div', null, (
			createVNode(2, 'div', null, (
				createVNode(2, 'div', null, (
					createVNode(2, 'div', null, (
						createVNode(2, 'div', null, (
							createVNode(2, 'div', null, (
								createVNode(2, 'div', null, (
									createVNode(2, 'div', null, (
										createVNode(2, 'div', null, (
											createVNode(2, 'div', null, (
												createVNode(2, 'div', null, (
													createVNode(2, 'div', null, (
														createVNode(2, 'div', null, (
															createVNode(2, 'div', null, (
																createVNode(2, 'div', null, (
																	createVNode(2, 'div', null, (
																		createVNode(2, 'div', null, (
																			createVNode(2, 'div', null, (
																				createVNode(2, 'div', null, (
																					createVNode(2, 'div', null, (
																						createVNode(2, 'div', null, (
																							createVNode(2, 'div', null, (
																								createVNode(2, 'div', null, (
																									createVNode(2, 'div', null, (
																										createVNode(2, 'div', null, (
																											createVNode(2, 'div', null, (
																												createVNode(2, 'div', null, (
																													createVNode(2, 'div', null, (
																														createVNode(2, 'div', null, (
																															createVNode(2, 'div', null, (
																																createVNode(2, 'div', null, (
																																	createVNode(2, 'div', null, (
																																		createVNode(2, 'div', null, (
																																			createVNode(2, 'div', null, 'child33')
																																		))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))));
	});

	benchmark('Table shape', () => {
		createVNode(2, 'table', null, [
			createVNode(2, 'thead', null, createVNode(2, 'tr', null, [
				createVNode(2, 'th', null, 'h1')
				, createVNode(2, 'th', null, 'h2')
				, createVNode(2, 'th', null, 'h3')
				, createVNode(2, 'th', null, 'h4')
			]))
			, createVNode(2, 'tbody', null, [ createVNode(2, 'tr', null, [
				createVNode(
					2, 'td', null, '1')
				, createVNode(
					2, 'td', null, '2')
				, createVNode(
					2, 'td', null, '3')
				, createVNode(
					2, 'td', null, '4')
			]), createVNode(2, 'tr', null, [
				createVNode(
					2, 'td', null, '5')
				, createVNode(
					2, 'td', null, '6')
				, createVNode(
					2, 'td', null, '7')
				, createVNode(
					2, 'td', null, '8')
			]), createVNode(2, 'tr', null, [
				createVNode(
					2, 'td', null, '9')
				, createVNode(
					2, 'td', null, '10')
				, createVNode(
					2, 'td', null, '11')
				, createVNode(
					2, 'td', null, '12')
			]) ])
		]);
	});

	benchmark('text node childs (table shape)', () => {
		createVNode(2, 'table', null, [
			createVNode(2, 'thead', null, createVNode(2, 'tr', null, [
				createVNode(2, 'th', null, createTextVNode('h1'))
				, createVNode(2, 'th', null, createTextVNode('h2'))
				, createVNode(2, 'th', null, createTextVNode('h3'))
				, createVNode(2, 'th', null, createTextVNode('h4'))
			]))
			, createVNode(2, 'tbody', null, [ createVNode(2, 'tr', null, [
				createVNode(
					2, 'td', null, createTextVNode('1'))
				, createVNode(
					2, 'td', null, createTextVNode('2'))
				, createVNode(
					2, 'td', null, createTextVNode('3'))
				, createVNode(
					2, 'td', null, createTextVNode('4'))
			]), createVNode(2, 'tr', null, [
				createVNode(
					2, 'td', null, createTextVNode('5'))
				, createVNode(
					2, 'td', null, createTextVNode('6'))
				, createVNode(
					2, 'td', null, createTextVNode('7'))
				, createVNode(
					2, 'td', null, createTextVNode('8'))
			]), createVNode(2, 'tr', null, [
				createVNode(
					2, 'td', null, createTextVNode('9'))
				, createVNode(
					2, 'td', null, createTextVNode('10'))
				, createVNode(
					2, 'td', null, createTextVNode('11'))
				, createVNode(
					2, 'td', null, createTextVNode('12'))
			]) ])
		]);
	});

	benchmark('navigation shape ul - li', () => {
		createVNode(2, 'nav', null, createVNode(2, 'ul', null, [ createVNode(2, 'li', null, createVNode(2, 'a', {
			href: '#'
		}, 'Home')), createVNode(2, 'li', null, createVNode(2, 'a', {
			href: '#'
		}, 'About')), createVNode(2, 'li', null, createVNode(2, 'a', {
			href: '#'
		}, 'Clients')), createVNode(2, 'li', null, createVNode(2, 'a', {
			href: '#'
		}, 'Contact Us')) ]));
	});

	benchmark('typical html page', () => {
		createVNode(2, 'html', null, [ createVNode(2, 'head'), createVNode(2, 'body', null, createVNode(2, 'div', {
			class: 'flex-container'
		}, [ createVNode(2, 'header', null, createVNode(2, 'h1', null, 'City Gallery')), createVNode(2, 'nav', {
			class: 'nav'
		}, createVNode(2, 'ul', null, [ createVNode(2, 'li', null, createVNode(2, 'a', {
			href: '#'
		}, 'London')), createVNode(2, 'li', null, createVNode(2, 'a', {
			href: '#'
		}, 'Paris')), createVNode(2, 'li', null, createVNode(2, 'a', {
			href: '#'
		}, 'Tokyo')) ])), createVNode(2, 'article', {
			class: 'article'
		}, [ createVNode(2, 'h1', null, 'London'), createVNode(2, 'p', null, 'London'), createVNode(2, 'p', null, createVNode(2, 'strong', null, 'Resize')) ]), createVNode(2, 'footer', null, 'Copyright \xA9 W3Schools.com') ])) ]);
	});

	benchmark('deeply nested Arrays (nobody should do this)', () => {
		createVNode(2, 'div', null, [
			createVNode(2, 'div', null, '1'),
			createVNode(2, 'div', null, [[[[[[
				[[createVNode(2, 'div', null, 'a')]],
				[[[[[createVNode(2, 'div', null, 'b')]]]]],
				[[[[[createVNode(2, 'div', null, 'c')]]]]]
			]]]]]])
		]);
	});

	benchmark('Changing attributes (includes render)', () => {
		let container = document.createElement('div');
		// Mount
		render(createVNode(2, 'div', {
			className: 'foo bar',
			style: {
				color: 'red',
				float: 'left'
			},
			'data-attribute': 'data-value',
			'custom-stuff': 'custom'
		}), container);

		// Change
		render(createVNode(2, 'div', {
			className: 'bar',
			style: {
				color: 'blue'
			},
			'data-attribute': 'data-value'
		}), container);

		// Remove all
		render(createVNode(2, 'div', null), container);
	});
});
