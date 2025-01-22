import { render } from 'inferno';
import { renderToString } from 'inferno-server';
import { hydrate } from 'inferno-hydrate';
import { createElement } from 'inferno-create-element';
import { createContainerWithHTML, validateNodeTree } from 'inferno-utils';

describe('SSR Hydration - (non-JSX)', () => {
  const node = createElement(
    'div',
    null,
    createElement('span', null, 'Hello world'),
  );
  const expect1 = '<div><span>Hello world</span></div>';
  const expect2 = '<div><span>Hello world</span></div>';

  it('Validate various structures', () => {
    const html = renderToString(node);
    const container = createContainerWithHTML(html);

    expect(container.innerHTML).toBe(expect1);
    hydrate(node, container);
    expect(validateNodeTree(node)).toBe(true);
    expect(container.innerHTML).toBe(expect2);
    render(node, container);
    expect(container.innerHTML).toBe(expect2);
  });
});
