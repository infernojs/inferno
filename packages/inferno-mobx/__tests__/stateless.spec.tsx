import { Component, render } from 'inferno';
import { observer } from 'inferno-mobx';
import { createElement } from 'inferno-create-element';

interface StateLessCompProps {
  testProp: string | number;
}

const stateLessComp = ({ testProp }: StateLessCompProps) => (
  <div>result: {testProp}</div>
);

stateLessComp.defaultProps = {
  testProp: 'default value for prop testProp',
};

describe('Stateless components MOBX', () => {
  let container: HTMLDivElement;

  beforeEach(function () {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(function () {
    render(null, container);
    container.innerHTML = '';
    document.body.removeChild(container);
  });

  it('stateless component', (done) => {
    const StatelessCompObserver = observer(stateLessComp);
    expect(StatelessCompObserver.defaultProps.testProp).toBe(
      'default value for prop testProp',
    );
    render(<StatelessCompObserver testProp="hello world" />, container);

    expect(container.textContent).toBe('result: hello world');
    done();
  });

  it('stateless component with context support', (done) => {
    const StateLessCompWithContext = (
      _props: object,
      context: { testContext: string },
    ) => createElement('div', {}, 'context: ' + context.testContext);
    const StateLessCompWithContextObserver = observer(StateLessCompWithContext);

    class ContextProvider extends Component {
      getChildContext() {
        return { testContext: 'hello world' };
      }

      render() {
        return <StateLessCompWithContextObserver />;
      }
    }

    render(<ContextProvider />, container);
    expect(container.textContent!.replace(/\n/, '')).toBe(
      'context: hello world',
    );
    done();
  });
});
