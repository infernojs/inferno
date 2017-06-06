import { createVNode, render } from 'inferno';
import Component from 'inferno-component';
import { renderToString } from 'inferno-server';
import { createContainerWithHTML, innerHTML, validateNodeTree } from 'inferno-utils';

class Comp extends Component {
	render() {
		return (
			<div>
				<div id="b1">block 1</div>
				<div id="b2">block 2</div>
				<div id="b3">block 3</div>
			</div>
		);
	}
}

const compHtml = '<div><div id="b1">block 1</div><div id="b2">block 2</div><div id="b3">block 3</div></div>';

describe('SSR Hydration Extended - (JSX)', () => {
	[
		{
			html: '<div><div>Hello world</div></div>',
			component: <Comp />,
		},
		{
			html:
				'<div><div>Hello world</div><div>Hello world</div><div>Hello world</div><div>Hello world</div><div>Hello world</div></div>',
			component: <Comp />,
		},
		{
			html: '<div><div><div>Hello world</div></div></div>',
			component: <Comp />,
		},
		{
			html: '<div><div><div>Hello world</div></div><span>Hola</span></div>',
			component: <Comp />,
		},
		{
			html:
				'<div><span><div>Hello world</div></span><div><div id="b1">block 1</div><div id="b2">block 2</div><div id="b3">block 3</div></div></div>',
			component: <Comp />,
		},
		{
			html:
				'<div><span><div>Hello world</div></span><div><div id="b1">block 1</div><div id="b2">block 2</div><div id="b3">block 3</div></div><span>Hola</span></div>',
			component: <Comp />,
		},
	].forEach(({ html, component }, i) => {
		it(`do test #${i + 1}`, () => {
			let container = createContainerWithHTML(html);
			render(component, container);
			console.log(container.innerHTML);
			expect(innerHTML(container.innerHTML)).toBe(innerHTML(compHtml));
		});
	});
});
