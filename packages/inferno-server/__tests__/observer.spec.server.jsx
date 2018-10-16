import { render } from 'inferno';
import * as mobx from 'mobx';
import { observer, trackComponents, useStaticRendering } from 'inferno-mobx';
import { renderToStaticMarkup } from 'inferno-server';

const getDNode = (obj, prop) => obj.$mobx.values[prop];

describe('Mobx Observer Server', () => {
  let container;

  beforeEach(function() {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(function() {
    render(null, container);
    container.innerHTML = '';
    document.body.removeChild(container);
  });

  it('does not views alive when using static + string rendering', function() {
    useStaticRendering(true);

    let renderCount = 0;
    const data = mobx.observable({
      z: 'hi'
    });

    const TestComponent = observer(function testComponent() {
      renderCount++;
      return <div>{data.z}</div>;
    });

    const output = renderToStaticMarkup(<TestComponent />);

    data.z = 'hello';

    expect(output).toBe('<div>hi</div>');
    expect(renderCount).toBe(1);

    expect(getDNode(data, 'z').observers.length).toBe(0);

    useStaticRendering(false);
  });
});
