import { render } from 'inferno-compat';

describe('Warnings', () => {
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

  it('Should warn if inferno-compat overrides existing onInput ( text ) handler', () => {
    function myTest() {}
    function anotherMethod() {}

    const spy = spyOn(console, 'error');

    render(<input type="text" onChange={anotherMethod} onInput={myTest} />, container);

    expect(spy.calls.count()).toBe(1);
    expect(spy.calls.argsFor(0)).toEqual([
      `Inferno-compat Warning! 'onInput' handler is reserved to support React like 'onChange' event flow.
Original event handler 'function myTest' will not be called.`
    ]);
  });
});
