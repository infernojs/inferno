import { createElement } from 'inferno-create-element';
import {
  renderToString,
  streamAsString,
  streamQueueAsString,
} from 'inferno-server';
import concatStream from 'concat-stream';

describe('Security - SSR', () => {
  describe('renderToString', () => {
    it('Should not render invalid tagNames', async () => {
      await expect(renderToString(createElement('div'))).resolves.not.toThrow();
      await expect(renderToString(createElement('x-💩'))).resolves.not.toThrow();

      let fn = async () => { await renderToString(createElement('a b')) }
      await expect(fn).rejects.toThrow(/<a b>/);

      fn = async () => { await renderToString(createElement('a\0b')) }
      await expect(fn).rejects.toThrow(/<a\0b>/);

      fn = async () => { await renderToString(createElement('a>')) }
      await expect(fn).rejects.toThrow(/<a>>/);

      fn = async () => { await renderToString(createElement('<')) }
      await expect(fn).rejects.toThrow(/<<>/);

      fn = async () => { await renderToString(createElement('"')) }
      await expect(fn).rejects.toThrow(/<">/);
    });

    it('Should not render invalid attribute names', async () => {
      const props = {};
      const userProvidedData = '></div><script>alert("hi")</script>';

      props[userProvidedData] = 'hello';

      const html = await renderToString(<div {...props} />);

      expect(html).toBe('<div></div>');
    });

    it('should reject attribute key injection attack on markup', async () => {
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
      const result1 = await renderToString(element1);
      const result2 = await renderToString(element2);
      expect(result1.toLowerCase()).not.toContain('onclick');
      expect(result2.toLowerCase()).not.toContain('script');
    });
  });

  describe('streams', () => {
    for (const method of [streamAsString, streamQueueAsString]) {
      it('Should not render invalid attribute names', () => {
        const props = {};
        const userProvidedData = '></div><script>alert("hi")</script>';

        props[userProvidedData] = 'hello';

        streamPromise(<div {...props} />, method).then((html) => {
          expect(html).toBe('<div></div>');
        });
      });

      it('should reject attribute key injection attack on markup', (done) => {
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

      it('should reject attribute key injection attack on markup #2', (done) => {
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
