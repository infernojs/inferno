import { Fragment, type InfernoNode, render } from 'inferno';
import { hydrate } from 'inferno-hydrate';
import {
  renderToString,
  streamAsString,
  streamQueueAsString,
} from 'inferno-server';
import concatStream from 'concat-stream';

// Fragments and arrays must render the same content as in the browser, so that hydration can use it
describe('SSR Fragments and arrays', () => {
  async function stream(streamFactory, input: InfernoNode): Promise<string> {
    return await new Promise((resolve, reject) => {
      streamFactory(input)
        .on('error', reject)
        .pipe(
          concatStream((buffer) => {
            resolve(buffer.toString('utf-8'));
          }),
        );
    });
  }

  function Wrap({ children }) {
    return children;
  }

  function Child({ text }) {
    return <b>{text}</b>;
  }

  const testEntries: Array<{
    description: string;
    template: () => InfernoNode;
    result: string;
  }> = [
    {
      description: 'Fragment with element child',
      template: () => (
        <div>
          <Fragment>{<p>x</p>}</Fragment>
        </div>
      ),
      result: '<div><p>x</p></div>',
    },
    {
      description: 'short Fragment with element child',
      template: () => {
        const child = <p>x</p>;

        return (
          <div>
            <>{child}</>
          </div>
        );
      },
      result: '<div><p>x</p></div>',
    },
    {
      description: 'Fragment with component child',
      template: () => (
        <div>
          <Fragment>{<Child text="x" />}</Fragment>
        </div>
      ),
      result: '<div><b>x</b></div>',
    },
    {
      description: 'empty Fragment',
      template: () => (
        <div>
          <Fragment />
        </div>
      ),
      result: '<div><!--!--></div>',
    },
    {
      description: 'component returning an array with holes',
      template: () => <ul>{<Wrap>{[null, <li>a</li>, false]}</Wrap>}</ul>,
      result: '<ul><li>a</li></ul>',
    },
    {
      description: 'component returning an array with text',
      template: () => <p>{<Wrap>{['a', <b>b</b>, 1]}</Wrap>}</p>,
      result: '<p>a<b>b</b>1</p>',
    },
    {
      description: 'component returning an array with empty text',
      template: () => <p>{<Wrap>{['', <b>b</b>]}</Wrap>}</p>,
      result: '<p> <b>b</b></p>',
    },
    {
      description: 'component returning nested arrays',
      template: () => (
        <p>
          <Wrap>{[[<i>a</i>], [[<b>b</b>]]]}</Wrap>
        </p>
      ),
      result: '<p><i>a</i><b>b</b></p>',
    },
    {
      description: 'component returning an array without vNodes',
      template: () => (
        <p>
          <Wrap>{[null, [false]]}</Wrap>
        </p>
      ),
      result: '<p><!--!--></p>',
    },
  ];

  for (const test of testEntries) {
    it(`Should render ${test.description} to string`, () => {
      expect(renderToString(test.template())).toBe(test.result);
    });

    it(`Should render ${test.description} to stream`, async () => {
      expect(await stream(streamAsString, test.template())).toBe(test.result);
    });

    it(`Should render ${test.description} to queue stream`, async () => {
      expect(await stream(streamQueueAsString, test.template())).toBe(
        test.result,
      );
    });

    it(`Should hydrate ${test.description}`, () => {
      const container = document.createElement('div');

      container.innerHTML = renderToString(test.template());
      document.body.appendChild(container);

      const elements = Array.from(container.querySelectorAll('*'));

      hydrate(test.template(), container);
      expect(Array.from(container.querySelectorAll('*'))).toEqual(elements);

      render(test.template(), container);
      expect(Array.from(container.querySelectorAll('*'))).toEqual(elements);

      render(null, container);
      document.body.removeChild(container);
    });
  }
});
