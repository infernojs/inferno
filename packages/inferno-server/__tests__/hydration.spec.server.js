import { render } from 'inferno';
import { renderToString } from 'inferno-server';

import { createElement } from 'inferno-create-element';
import { createContainerWithHTML, innerHTML, validateNodeTree } from 'inferno-utils';

describe('SSR Hydration - (non-JSX)', () => {
  [
    {
      node: createElement('div', null, createElement('span', null, 'Hello world')),
      expect1: '<div><span>Hello world</span></div>',
      expect2: '<div><span>Hello world</span></div>'
    }
  ].forEach(({ node, expect1, expect2 }, i) => {
    it(`Validate various structures #${i + 1}`, () => {
      const html = renderToString(node);
      const container = createContainerWithHTML(html);

      expect(innerHTML(container.innerHTML)).toBe(innerHTML(expect1));
      render(node, container);
      expect(validateNodeTree(node)).toBe(true);
      expect(innerHTML(container.innerHTML)).toBe(innerHTML(expect2));
      render(node, container);
      expect(innerHTML(container.innerHTML)).toBe(innerHTML(expect2));
    });
  });
});
