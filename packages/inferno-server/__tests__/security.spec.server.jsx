import { createElement } from 'inferno-create-element';
import { renderToString, streamAsString, streamQueueAsString } from 'inferno-server';
import concatStream from 'concat-stream-es6';

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

      let html = renderToString(<div {...props} />);

      expect(html).toBe('<div></div>');
    });

    it('should reject attribute key injection attack on markup', () => {
      const element1 = createElement('div', { 'blah" onclick="beevil" noise="hi': 'selected' }, null);
      const element2 = createElement('div', { '></div><script>alert("hi")</script>': 'selected' }, null);
      let result1 = renderToString(element1);
      let result2 = renderToString(element2);
      expect(result1.toLowerCase()).not.toContain('onclick');
      expect(result2.toLowerCase()).not.toContain('script');
    });
  });

  describe('streams', () => {
    [streamAsString, streamQueueAsString].forEach(method => {
      it('Should not render invalid attribute names', () => {
        const props = {};
        const userProvidedData = '></div><script>alert("hi")</script>';

        props[userProvidedData] = 'hello';

        streamPromise(<div {...props} />, method).then(html => expect(html).toBe('<div></div>'));
      });

      it('should reject attribute key injection attack on markup', done => {
        const element1 = createElement('div', { 'blah" onclick="beevil" noise="hi': 'selected' }, null);
        streamPromise(element1, method).then(result1 => {
          expect(result1.toLowerCase()).not.toContain('onclick');
          done();
        });
      });

      it('should reject attribute key injection attack on markup #2', done => {
        const element2 = createElement('div', { '></div><script>alert("hi")</script>': 'selected' }, null);
        streamPromise(element2, method).then(result2 => {
          expect(result2.toLowerCase()).not.toContain('script');
          done();
        });
      });
    });
  });
});

function streamPromise(dom, method) {
  return new Promise(function(res, rej) {
    method(dom)
      .on('error', rej)
      .pipe(
        concatStream(function(buffer) {
          res(buffer.toString('utf-8'));
        })
      );
  });
}
