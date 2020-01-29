import { renderToStaticMarkup, renderToString } from 'inferno-server';
import { Component, createFragment } from 'inferno';
import { createElement } from 'inferno-create-element';
import { ChildFlags } from 'inferno-vnode-flags';
import { hydrate } from 'inferno-hydrate';
//import { performance } from 'perf_hooks';

function WrappedInput(props) {
  return <input type="text" value={props.value} />;
}

function WithChild(props) {
  return <div>{props.children}</div>
}

describe('SSR Creation (JSX)', () => {
  const testEntries = [
    {
      template: (props) => <div>{null}</div>,
    },
    {
      template: (props) => (
        <div>
          {null}
          <span>emptyValue: {null}</span>
        </div>
      ),
    },
    {
      template: (props) => <script src="foo" async />,
    },
    {
      template: (props) => (
        <div>
          Hello world, {'1'}2{'3'}
        </div>
      ),
    },
    {
      template: (props) => <div>"Hello world"</div>,
    },
    {
      template: (props) => <div>Hello world, {/* comment*/}</div>,
    },
    {
      template: (props) => <div>{[null, '123', null, '456']}</div>,
    },
    {
      template: (props) => <p children="foo">foo</p>,
    },
    {
      template: (props) => <input value="bar" />,
    },
    {
      template: (props) => <input value="bar" defaultValue="foo" />,
    },
    {
      template: (props) => <input defaultValue="foo" />,
    },
    {
      template: (props) => <input defaultValue={123} />,
    },
    {
      template: (props) => <WrappedInput value="foo" />,
    },
    {
      template: (props) => (
        <select value="dog">
          <option value="cat">A cat</option>
          <option value="dog">A dog</option>
        </select>
      ),
    },
    {
      template: (props) => (
        <div>
          <div>{''}</div>
          <div>{props.children}</div>
          <p>Test</p>
        </div>
      ),
    },
    {
      template: (props) => <div style={{ 'background-color': 'red', 'border-bottom-color': 'green' }} />,
    },
    {
      template: (props) => <div style={{ 'background-color': null, 'border-bottom-color': null }} />,
    },
    {
      template: (props) => <div style={null}>{props.children}</div>,
    },
    {
      template: (props) => createElement('div', null, 'Hello world <img src="x" onerror="alert(\'&XSS&\')">'),
    },
    {
      template: (props) => <div style={{ opacity: 0.8 }} />,
    },
    {
      template: (props) => <div style="opacity:0.8;">{props.children}</div>,
    },
    {
      template: (props) => <div className={123} />,
    },
    {
      template: (props) => <input defaultValue={123} />,
    },
    {
      template: (props) => (
        <div>
          <br />
          {props.children}
        </div>
      ),
    },
    {
      template: (props) => (
        [
          <p>1</p>,
          <p>2</p>,
          <p>3</p>
        ]
      ),
    },
    {
      template: (props) => [],
    },
    {
      template: (props) => (
        <>
          <p>1</p>
          <p>2</p>
          <p>3</p>
        </> /* reset syntax highlighting */
      ),
    },
    {
      template: (props) => (<></>), /* reset syntax highlighting */
    },
    {
      template: (props) => (<>{props.children}</>), /* reset syntax highlighting */
    }
  ];

  function getVDom(depth) {
    if (depth === 0) {
      return null
    }

    return <WithChild>{testEntries.map((item) => item.template(<div>{getVDom(depth - 1)}</div>))}</WithChild>
  }

  it("Tests performance and memory consumption", () => {
    let output
    const vDom = getVDom(4);
    
    const imax = 100;
    const timing = [];
    const memory = [];
    for (let i = 0; i++ < imax;) {
      const start = performance.now();
      const startMem = process.memoryUsage();
      
      for (let j = 0; j++ < 10;) {
        output = renderToString(vDom);
      }
      const end = performance.now();
      const endMem = process.memoryUsage();
      timing.push((end - start) / 10);
      memory.push({
        heapTotal: (endMem.heapTotal - startMem.heapTotal) / 10 / 1024,
        heapUsed: (endMem.heapUsed - startMem.heapUsed) / 10 / 1024,
        external: (endMem.external - startMem.external) / 10 / 1024,
      })
    }
    console.log("Timing: ", timing)
    console.log("Memory delta: ", memory)
    
    expect(typeof output).toBe('string');
    expect(output.length).toBeGreaterThan(1000);
    expect(output).toContain('<option value="cat">A cat</option>')
    /*
    const container = document.createElement('div');
    document.body.appendChild(container);
    container.innerHTML = output;
    expect(output).toBe(test.result);
    document.body.removeChild(container);
    */
  });
});
