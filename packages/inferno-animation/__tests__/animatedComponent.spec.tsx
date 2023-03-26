import { render } from 'inferno';
import { renderToString } from 'inferno-server';
import { AnimatedComponent, componentDidAppear, componentWillDisappear } from 'inferno-animation';

describe('inferno-animation AnimatedComponent', () => {
  let container;

  beforeEach(function () {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  function waitForAnimationAndContinue(condition, callback, arg1?) {
    if (container.textContent !== condition) {
      setTimeout(waitForAnimationAndContinue.bind(null, condition, callback, arg1), 10);
      return;
    }

    callback(arg1);
  }

  function afterEachClear(done) {
    container.innerHTML = '';
    document.body.removeChild(container);
    done();
  }

  afterEach(function (done) {
    render(null, container);
    waitForAnimationAndContinue('', afterEachClear, done);
  });

  it('should render class component extending AnimatedComponent into DOM', () => {
    class MyComponent extends AnimatedComponent {
      public render({ children }) {
        return <div>{children}</div>;
      }
    }

    render(<MyComponent>1</MyComponent>, container);
    expect(container.textContent).toBe('1');
  });

  it('should remove class component extending AnimatedComponent from DOM', (done) => {
    class My extends AnimatedComponent {
      public render({ children }) {
        return <div>{children}</div>;
      }
    }

    render(
      <div>
        <My key="#1">1</My>
        <My key="#2">2</My>
        <My key="#3">3</My>
      </div>,
      container
    );
    expect(container.textContent).toBe('123');

    render(
      <div>
        <My key="#1">1</My>
        <My key="#3">3</My>
      </div>,
      container
    );

    /**
     * The reason for recursively calling checkRenderComplete_XXX instead of
     * using a simpler setTimeout is due to a couple of async calls during the animations
     * hooks of AnimatedComponent. These can cause a setTimeout in the test to
     * trigger prior to the animation callbacks and thus remove operations haven't yet
     * been completed. As long as the render operation eventually completes correctly,
     * the test should be considered successful.
     */

    waitForAnimationAndContinue('13', function () {
      render(
        <div>
          <My key="#1">1</My>
          <My key="#4">4</My>
        </div>,
        container
      );

      waitForAnimationAndContinue('14', function () {
        done();
      });
    });
  });

  it('should move class component extending AnimatedComponent from DOM', (done) => {
    class My extends AnimatedComponent {
      public render({ children }) {
        return <div>{children}</div>;
      }
    }

    render(
      <div>
        <My key="#1">1</My>
        <My key="#2">2</My>
        <My key="#3">3</My>
      </div>,
      container
    );
    expect(container.textContent).toBe('123');

    render(
      <div>
        <My key="#1">1</My>
        <My key="#3">3</My>
        <My key="#2">2</My>
      </div>,
      container
    );

    /**
     * The reason for recursively calling checkRenderComplete_XXX instead of
     * using a simpler setTimeout is due to a couple of async calls during the animations
     * hooks of AnimatedComponent. These can cause a setTimeout in the test to
     * trigger prior to the animation callbacks and thus remove operations haven't yet
     * been completed. As long as the render operation eventually completes correctly,
     * the test should be considered successful.
     */
    // Disappear animations complete async

    waitForAnimationAndContinue('132', function () {
      render(
        <div>
          <My key="#4">4</My>
          <My key="#1">1</My>
        </div>,
        container
      );

      waitForAnimationAndContinue('41', function () {
        render(null, container);
        done();
      });
    });
  });

  it('should render class component extending AnimatedComponent to a string', () => {
    class MyComponent extends AnimatedComponent {
      public render({ children }) {
        return <div>{children}</div>;
      }
    }

    const outputStr = renderToString(<MyComponent>1</MyComponent>);
    expect(outputStr).toBe('<div>1</div>');
  });
});

describe('inferno-animation animated functional component', () => {
  let container;

  beforeEach(function () {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  function waitForAnimationAndContinue(condition, callback, arg1?) {
    if (container.textContent !== condition) {
      setTimeout(waitForAnimationAndContinue.bind(null, condition, callback, arg1), 10);
      return;
    }

    callback(arg1);
  }

  function afterEachClear(done) {
    container.innerHTML = '';
    document.body.removeChild(container);
    done();
  }

  afterEach(function (done) {
    render(null, container);
    waitForAnimationAndContinue('', afterEachClear, done);
  });

  it('should render class component extending AnimatedComponent into DOM', () => {
    const MyComponent = ({ children }) => {
      return <div>{children}</div>;
    };

    render(
      <MyComponent onComponentDidAppear={componentDidAppear} onComponentWillDisappear={componentWillDisappear}>
        1
      </MyComponent>,
      container
    );
    expect(container.textContent).toBe('1');
  });

  it('should remove class component extending AnimatedComponent from DOM', (done) => {
    const My = ({ children }) => {
      return <div>{children}</div>;
    };

    const anim = {
      onComponentDidAppear: componentDidAppear,
      onComponentWillDisappear: componentWillDisappear
    };

    render(
      <div>
        <My key="#1" {...anim}>
          1
        </My>
        <My key="#2" {...anim}>
          2
        </My>
        <My key="#3" {...anim}>
          3
        </My>
      </div>,
      container
    );
    expect(container.textContent).toBe('123');

    render(
      <div>
        <My key="#1" {...anim}>
          1
        </My>
        <My key="#3" {...anim}>
          3
        </My>
      </div>,
      container
    );

    /**
     * The reason for recursively calling checkRenderComplete_XXX instead of
     * using a simpler setTimeout is due to a couple of async calls during the animations
     * hooks of AnimatedComponent. These can cause a setTimeout in the test to
     * trigger prior to the animation callbacks and thus remove operations haven't yet
     * been completed. As long as the render operation eventually completes correctly,
     * the test should be considered successful.
     */

    waitForAnimationAndContinue('13', function () {
      render(
        <div>
          <My key="#1" {...anim}>
            1
          </My>
          <My key="#4" {...anim}>
            4
          </My>
        </div>,
        container
      );

      waitForAnimationAndContinue('14', function () {
        done();
      });
    });
  });

  it('should move class component extending AnimatedComponent from DOM', (done) => {
    const My = ({ children }) => {
      return <div>{children}</div>;
    };

    const anim = {
      onComponentDidAppear: componentDidAppear,
      onComponentWillDisappear: componentWillDisappear
    };

    render(
      <div>
        <My key="#1" {...anim}>
          1
        </My>
        <My key="#2" {...anim}>
          2
        </My>
        <My key="#3" {...anim}>
          3
        </My>
      </div>,
      container
    );
    expect(container.textContent).toBe('123');

    render(
      <div>
        <My key="#1" {...anim}>
          1
        </My>
        <My key="#3" {...anim}>
          3
        </My>
        <My key="#2" {...anim}>
          2
        </My>
      </div>,
      container
    );

    /**
     * The reason for recursively calling checkRenderComplete_XXX instead of
     * using a simpler setTimeout is due to a couple of async calls during the animations
     * hooks of AnimatedComponent. These can cause a setTimeout in the test to
     * trigger prior to the animation callbacks and thus remove operations haven't yet
     * been completed. As long as the render operation eventually completes correctly,
     * the test should be considered successful.
     */
    // Disappear animations complete async

    waitForAnimationAndContinue('132', function () {
      render(
        <div>
          <My key="#4" {...anim}>
            4
          </My>
          <My key="#1" {...anim}>
            1
          </My>
        </div>,
        container
      );

      waitForAnimationAndContinue('41', function () {
        render(null, container);
        done();
      });
    });
  });

  it('should render class component extending AnimatedComponent to a string', () => {
    const MyComponent = ({ children }) => {
      return <div>{children}</div>;
    };

    const anim = {
      onComponentDidAppear: componentDidAppear,
      onComponentWillDisappear: componentWillDisappear
    };

    const outputStr = renderToString(<MyComponent {...anim}>1</MyComponent>);
    expect(outputStr).toBe('<div>1</div>');
  });
});
