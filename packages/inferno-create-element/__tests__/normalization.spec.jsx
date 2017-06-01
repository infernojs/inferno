
import { render } from 'inferno';
import Component from 'inferno-component';
import { isNullOrUndef } from 'inferno-shared';
import { isVNode } from 'inferno/core/VNodes';

describe('Normalization process', () => {
	let container;

	beforeEach(function () {
		container = document.createElement('div');
		document.body.appendChild(container);
	});

	afterEach(function () {
		render(null, container);
		container.innerHTML = '';
		document.body.removeChild(container);
	});

	describe('Keys should always be unique within siblings', () => {
		// This function verifies there are no duplicate keys within children vNodes
		// If Inferno goes back to nonKeyed routine in future change this function so that "all" can be null or unique
		function verifyKeys(vNodes) {
			if (Array.isArray(vNodes)) {
				const keyValues = vNodes.map(function (vnode) {
					return vnode.key;
				});
				const isDuplicate = keyValues.some(function (item, idx) {
					return keyValues.indexOf(item) !== idx;
				});

				expect(isDuplicate).to.eql(false, 'All siblings should have unique key');

				for (let i = 0; i < vNodes.length; i++) {
					verifyKeys(vNodes[ i ].children);
				}
			} else if (!isNullOrUndef(vNodes) && isVNode(vNodes)) {
				verifyKeys(vNodes.children);
			}
		}

		it('Should work when using functions within siblings', () => {
			function meta(metas) {
				return metas.map(
					(meta) => {
						return <meta property={ meta.property } content={ meta.content }/>;
					}
				);
			}

			function link(links) {
				return links.map(
					(link) => {
						return <link rel={ link.rel } href={ link.href }/>;
					}
				);
			}

			const vNode = <head>
				<title>{ 'test' }</title>
				{ meta([{ property: 'p', content: 'c' }, { property: 'p1', content: 'c1' }]) }
				{ link([{ rel: 'rel', href: 'href1' }, { rel: 'rel', href: 'href2' }]) }
			</head>;

			verifyKeys(vNode);
		});

		it('Should handle nested arrays when keys are defined', () => {
			let i = 0;

			class A extends Component {
				shouldComponentUpdate() {
					return false;
				}

				render() {
					return <div>{this.props.i} ({i++})</div>;
				}
			}

			render(
				<div>
					<A i={0}/>
					{[ <A i={'A'} key={'A'}/>,
						<A i={'B'} key={'B'}/> ]}
					<A i={1}/>
					{[ <A i={'A'} key={'A'}/>,
						<A i={'B'} key={'B'}/> ]}
					<A i={2}/>
				</div>,
				container
			);

			expect(container.innerHTML).to.eql('<div><div>0 (0)</div><div>A (1)</div><div>B (2)</div><div>1 (3)</div><div>A (4)</div><div>B (5)</div><div>2 (6)</div></div>');

			render(
				<div>
					<A i={0}/>
					{[ <A i={'B'} key={'B'}/>,
						<A i={'A'} key={'A'}/> ]}
					<A i={1}/>
					{[ <A i={'B'} key={'B'}/>,
						<A i={'A'} key={'A'}/> ]}
					<A i={2}/>
				</div>
				, container
			);

			expect(container.innerHTML).to.eql('<div><div>0 (0)</div><div>B (2)</div><div>A (1)</div><div>1 (3)</div><div>B (5)</div><div>A (4)</div><div>2 (6)</div></div>');
		});

		describe('Static variations', () => {
			const staticScenarios = [
				(
				<div>
						<div>1</div>
						<div>2</div>
					</div>
				),
				(
				<table>
						<thead>
						<tr>
							<th>h1</th>
							<th>h2</th>
							<th>h3</th>
							<th>h4</th>
						</tr>
						</thead>
						<tbody>
						<tr>
							<td>a1</td>
							<td>a2</td>
							<td>a3</td>
							<td>a4</td>
						</tr>
						<tr>
							<td>b1</td>
							<td>b2</td>
							<td>b3</td>
							<td>b4</td>
						</tr>
						<tr>
							<td>c1</td>
							<td>c2</td>
							<td>c3</td>
							<td>c4</td>
						</tr>
						</tbody>
					</table>
				),
				(
				<nav>
						<ul>
							<li><a href="#">Home</a></li>
							<li><a href="#">About</a></li>
							<li><a href="#">Clients</a></li>
							<li><a href="#">Contact Us</a></li>
						</ul>
					</nav>
				),
				(
				<ol>
						<li>Lorem ipsum dolor sit amet, consectetuer adipiscing elit.</li>
						<li>Aliquam tincidunt mauris eu risus.</li>
						<li>Vestibulum auctor dapibus neque.</li>
					</ol>
				)
			];

			staticScenarios.forEach((node, index) => {
				it('Static Variation #' + index, () => {
					verifyKeys(node);
				});
			});
		});

		describe('Static variations with keys', () => {
			const staticScenarios = [
				(
				<div key="2">
						<div key="1">1</div>
						<div key="2">2</div>
					</div>
				),
				(
				<table key="1">
						<thead key="1">
						<tr key="1">
							<th key="1">h1</th>
							<th key="2">h2</th>
							<th key="3">h3</th>
							<th key="4">h4</th>
						</tr>
						</thead>
						<tbody key="2">
						<tr key="1">
							<td key="1">a1</td>
							<td key="2">a2</td>
							<td key="3">a3</td>
							<td key="4">a4</td>
						</tr>
						<tr key="2">
							<td key="1">b1</td>
							<td key="2">b2</td>
							<td key="3">b3</td>
							<td key="4">b4</td>
						</tr>
						<tr key="3">
							<td>c1</td>
							<td>c2</td>
							<td>c3</td>
							<td>c4</td>
						</tr>
						</tbody>
					</table>
				)
			];

			staticScenarios.forEach((node, index) => {
				it('Static Variation with keys #' + index, () => {
					verifyKeys(node);
				});
			});
		});

		describe('Dynamic variations', () => {
			function makeArr(data) {
				return data.map((v) => {
					let result;

					if (typeof v === 'function') {
						result = v();
					} else {
						result = v;
					}

					return <div>{result}</div>;
				});
			}

			const dynamicScenarios = [
				(
				<div>
						<div>1</div>
						{makeArr([ 'a', 'b', 'c' ])}
					</div>
				),
				(
				<div>
						{makeArr([ 'a', 'b', 'c' ])}
						<div>1</div>
					</div>
				),
				(
				<div>
						{makeArr([ 'a', 'b', 'c' ])}
						<div>1</div>
						{makeArr([ 'a', 'b', 'c' ])}
					</div>
				),
				(
				<div>
						{makeArr([ 'a', 'b', 'c' ])}
						<div>1</div>
						{makeArr([ 'a', makeArr([ 'a', 'b', 'c' ]), 'b', 'c' ])}
					</div>
				),
				(
				<div>
						{[ 'a', 'b' ]}
						{makeArr([ 'a', 'b', 'c' ])}
						{makeArr([ 'a', makeArr([ 'a', 'b', 'c' ]), 'b', 'c' ])}
					</div>
				),
				(
				<div>
						{[ 'a', 'b', makeArr([ 'a', 'b', 'c' ]), makeArr([ 'a', 'b', 'c' ]), makeArr([ 'a', 'b', 'c' ]) ]}
					</div>
				),
				(
				<div>
						<div>1</div>
						<div>{makeArr([ 'a', 'b', 'c' ])}</div>
						<div>{makeArr([ 'a', makeArr([ 'a', 'b', 'c' ]), 'b', 'c' ])}</div>
					</div>
				),
				(
				<div>
						<div>1</div>
						<div>{makeArr([ 'a', makeArr([ 'a', 'b', 'c' ]), <div>{makeArr([ 'a', 'b', 'c' ])}</div>, 'c' ])}</div>
					</div>
				),
				(
				<div>
						<div>{makeArr([ <div>1</div>, 'b', 'c' ])}</div>
						<div>{makeArr([ 'a', makeArr([ <div>1</div>, <div>1</div>, <div>1</div> ]), 'b', 'c' ])}</div>
					</div>
				),
				(
				<div>
						<div>{makeArr([ <div>{makeArr([ 'a', makeArr([ 'a', 'b', 'c' ]), 'b', 'c' ])}</div>, makeArr([ 'a',
							<div>{makeArr([ 'a', 'b', 'c' ])}</div>, 'c' ]), 'b', 'c' ])}</div>
					</div>
				)
			];

			dynamicScenarios.forEach((node, index) => {
				it('Dynamic Variation #' + index, () => {
					verifyKeys(node);
				});
			});
		});

		describe('Dynamic variations with keys', () => {
			function makeArr(data) {
				return data.map((v) => {
					let result;

					if (typeof v === 'function') {
						result = v();
					} else {
						result = v;
					}

					return <div key={result}>{result}</div>;
				});
			}

			const dynamicScenarios = [
				(
				<div>
						<div key="1">1</div>
						{makeArr([ 'a', 'b', 'c' ])}
					</div>
				),
				(
				<div>
						{makeArr([ 'a', 'b', 'c' ])}
						<div key="1">1</div>
					</div>
				),
				(
				<div>
						{makeArr([ 'a', 'b', 'c' ])}
						<div key="1">1</div>
						{makeArr([ 'a', 'b', 'c' ])}
					</div>
				),
				(
				<div>
						{makeArr([ 'a', 'b', 'c' ])}
						<div key="1">1</div>
						{makeArr([ 'a', makeArr([ 'a', 'b', 'c' ]), 'b', 'c' ])}
					</div>
				),
				(
				<div>
						{makeArr([ 'a', 'b' ])}
						{makeArr([ 'a', 'b', 'c' ])}
						{makeArr([ 'a', makeArr([ 'a', 'b', 'c' ]), 'b', 'c' ])}
					</div>
				),
				(
				<div>
						{makeArr([ 'a', 'b', makeArr([ 'a', 'b', 'c' ]), makeArr([ 'a', 'b', 'c' ]), makeArr([ 'a', 'b', 'c' ]) ])}
					</div>
				),
				(
				<div>
						<div key="1">1</div>
						<div>{makeArr([ 'a', 'b', 'c' ])}</div>
						<div>{makeArr([ 'a', makeArr([ 'a', 'b', 'c' ]), 'b', 'c' ])}</div>
					</div>
				),
				(
				<div>
						<div key="1">1</div>
						<div>{makeArr([ 'a', makeArr([ 'a', 'b', 'c' ]), <div>{makeArr([ 'a', 'b', 'c' ])}</div>, 'c' ])}</div>
					</div>
				),
				(
				<div>
						<div>{makeArr([ <div key="1">1</div>, 'b', 'c' ])}</div>
						<div>{makeArr([ 'a', makeArr([ <div key="1">1</div>, <div key="11">1</div>,
							<div key="111">1</div> ]), 'b', 'c' ])}</div>
					</div>
				),
				(
				<div>
						<div>{makeArr([ <div>{makeArr([ 'a', makeArr([ 'a', 'b', 'c' ]), 'b', 'c' ])}</div>, makeArr([ 'a',
							<div>{makeArr([ 'a', 'b', 'c' ])}</div>, 'c' ]), 'b', 'c' ])}</div>
					</div>
				)
			];

			dynamicScenarios.forEach((node, index) => {
				it('Dynamic Variation with keys #' + index, () => {
					verifyKeys(node);
				});
			});
		});
	});

	describe('Warning two duplicate keys', () => {
		it('Should give warning if two duplicates is found', () => {
			const errorNode = (
				<div>
					<div key="1">2</div>
					<div key="1">1</div>
				</div>
			);

			render(errorNode, container);
		});
	});
});
