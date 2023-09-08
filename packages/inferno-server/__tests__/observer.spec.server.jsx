import { render } from 'inferno';
import { observer, useStaticRendering } from 'inferno-mobx';
import { renderToStaticMarkup } from 'inferno-server';
import { getObserverTree, observable } from 'mobx';

describe('Mobx Observer Server', () => {
  let container;

  beforeEach(function () {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(function () {
    render(null, container);
    container.innerHTML = '';
    document.body.removeChild(container);
  });

  it('does not views alive when using static + string rendering', function () {
    useStaticRendering(true);

    let renderCount = 0;
    const data = observable({
      z: 'hi',
    });

    const TestComponent = observer(function testComponent() {
      renderCount++;
      return <div>{data.z}</div>;
    });

    const output = renderToStaticMarkup(<TestComponent />);

    data.z = 'hello';

    expect(output).toBe('<div>hi</div>');
    expect(renderCount).toBe(1);

    expect(getObserverTree(data, 'z').observers).not.toBeDefined();

    useStaticRendering(false);
  });
});
