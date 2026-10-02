import { createElement } from 'inferno-create-element';
import {
  renderToString,
  streamAsString,
  streamQueueAsString,
} from 'inferno-server';
import concatStream from 'concat-stream';

describe('Security - SSR', () => {
  describe('renderToString', () => {
    it('Should not render invalid tagNames', () => {
      expect(() => renderToString(createElement('div'))).not.toThrow();
      expect(() => renderToString(createElement('x-💩'))).not.toThrow();
      expect(() => renderToString(createElement('a b'))).toThrow(/<a b>/);
      expect(() => renderToString(createElement('a\0b'))).toThrow(/<a\0b>/);
      expect(() => renderToString(createElement('a>'))).toThrow(/<a>>/);
      expect(() => renderToString(createElement('<'))).toThrow(/<<>/);
      expect(() => renderToString(createElement('"'))).toThrow(/<">/);
    });

    it('Should not render invalid attribute names', () => {
      const props = {};
      const userProvidedData = '></div><script>alert("hi")</script>';

      props[userProvidedData] = 'hello';

      const html = renderToString(<div {...props} />);

      expect(html).toBe('<div></div>');
    });

    it('should reject attribute key injection attack on markup', () => {
      const element1 = createElement(
        'div',
        { 'blah" onclick="beevil" noise="hi': 'selected' },
        null,
      );
      const element2 = createElement(
        'div',
        { '></div><script>alert("hi")</script>': 'selected' },
        null,
      );
      const result1 = renderToString(element1);
      const result2 = renderToString(element2);
      expect(result1.toLowerCase()).not.toContain('onclick');
      expect(result2.toLowerCase()).not.toContain('script');
    });
  });

  describe('invalid tag names', () => {
    const invalidTagNames = ['a b', 'a\0b', 'a>', '<', '"', 'a/b', 'a=b'];

    function renderToStringResult(vNode) {
      try {
        return { html: renderToString(vNode), error: null };
      } catch (error) {
        return { html: '', error };
      }
    }

    // Collects everything the stream emits before it fails
    function streamResult(
      vNode,
      method,
    ): Promise<{ html: string; error: unknown }> {
      return new Promise((resolve) => {
        let html = '';
        let stream;

        try {
          stream = method(vNode);
        } catch (error) {
          resolve({ html, error });
          return;
        }
        stream.on('data', (chunk) => {
          html += chunk;
        });
        stream.on('error', (error) => resolve({ html, error }));
        stream.on('end', () => resolve({ html, error: null }));
      });
    }

    const renderers = [
      [
        'renderToString',
        (vNode) => Promise.resolve(renderToStringResult(vNode)),
      ],
      ['streamAsString', (vNode) => streamResult(vNode, streamAsString)],
      [
        'streamQueueAsString',
        (vNode) => streamResult(vNode, streamQueueAsString),
      ],
    ] as const;

    for (const [name, renderResult] of renderers) {
      for (const tagName of invalidTagNames) {
        it(`Should throw an Error naming the tag and render nothing of <${JSON.stringify(tagName)}> with ${name}`, async () => {
          const { html, error } = await renderResult(
            createElement('div', null, createElement(tagName, null, 'child')),
          );

          expect(error instanceof Error).toBe(true);
          expect((error as Error).message).toContain(`<${tagName}>`);
          expect(html).not.toContain('<' + tagName);
          expect(html).not.toContain('child');
        });
      }
    }
  });

  describe('streams', () => {
    for (const method of [streamAsString, streamQueueAsString]) {
      it(`Should not render invalid attribute names with ${method.name}`, () => {
        const props = {};
        const userProvidedData = '></div><script>alert("hi")</script>';

        props[userProvidedData] = 'hello';

        streamPromise(<div {...props} />, method).then((html) => {
          expect(html).toBe('<div></div>');
        });
      });

      it(`should reject attribute key injection of an onclick attribute with ${method.name}`, (done) => {
        const element1 = createElement(
          'div',
          { 'blah" onclick="beevil" noise="hi': 'selected' },
          null,
        );
        streamPromise(element1, method).then((result1) => {
          expect(result1.toLowerCase()).not.toContain('onclick');
          done();
        });
      });

      it(`should reject attribute key injection of a script tag with ${method.name}`, (done) => {
        const element2 = createElement(
          'div',
          { '></div><script>alert("hi")</script>': 'selected' },
          null,
        );
        streamPromise(element2, method).then((result2) => {
          expect(result2.toLowerCase()).not.toContain('script');
          done();
        });
      });
    }
  });
});

async function streamPromise(dom, method) {
  return await new Promise(function (res: (value: string) => void, rej) {
    method(dom)
      .on('error', rej)
      .pipe(
        concatStream(function (buffer) {
          res(buffer.toString('utf-8'));
        }),
      );
  });
}
