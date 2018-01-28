import { render } from 'inferno';
import { observer } from 'inferno-mobx';
import { createClass } from 'inferno-create-class';
import { createElement } from 'inferno-create-element';

const stateLessComp = ({ testProp }) => <div>result: {testProp}</div>;

stateLessComp.defaultProps = {
  testProp: 'default value for prop testProp'
};

describe('Stateless components MOBX', () => {
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

  it('stateless component', done => {
    const StatelessCompObserver = observer(stateLessComp);
    expect(StatelessCompObserver.defaultProps.testProp).toBe('default value for prop testProp');
    const wrapper = <StatelessCompObserver testProp={10} />;

    render(<StatelessCompObserver testProp="hello world" />, container);

    expect(container.textContent).toBe('result: hello world');
    done();
  });

  it('stateless component with context support', done => {
    const StateLessCompWithContext = (props, context) => createElement('div', {}, 'context: ' + context.testContext);
    const StateLessCompWithContextObserver = observer(StateLessCompWithContext);
    const ContextProvider = createClass({
      getChildContext: () => ({ testContext: 'hello world' }),
      render: () => <StateLessCompWithContextObserver />
    });
    render(<ContextProvider />, container);
    expect(container.textContent.replace(/\n/, '')).toBe('context: hello world');
    done();
  });
});
