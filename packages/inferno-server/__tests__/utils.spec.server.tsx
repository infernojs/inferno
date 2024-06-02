import { render } from 'inferno';
import { renderToString } from 'inferno-server';
import { createContainerWithHTML, validateNodeTree } from 'inferno-utils';

describe('Utils - SSR', () => {
  describe('validateNodeTree', () => {
    it('should return true on a valid node tree', async () => {
      const node = (
        <div>
          <span>Hello world</span>
        </div>
      );
      const html = await renderToString(node);
      const container = createContainerWithHTML(html);
      render(node, container);
      expect(validateNodeTree(node)).toBe(true);
    });
  });
});
