/* tslint:disable:no-console */
import { render } from 'inferno';

describe('Links', () => {
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

  describe('javascript href', function () {
    it('Should log warning when rendering link starting with javascript::', function () {
      const consoleSpy = spyOn(console, 'error');

      render(<a href="javascript:foobar">test</a>, container);

      expect(consoleSpy).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Rendering links with javascript: URLs is not recommended. Use event handlers instead if you can. Inferno was passed "javascript:foobar".'
      );
      expect(container.innerHTML).toEqual('<a href="javascript:foobar">test</a>');
    });

    it('Should allow patching link to null', function () {
      const consoleSpy = spyOn(console, 'error');

      render(<a href="javascript:foobar">test</a>, container);

      expect(consoleSpy).toHaveBeenCalledTimes(1);

      render(<a>test</a>, container);

      expect(consoleSpy).toHaveBeenCalledTimes(1);

      expect(container.innerHTML).toEqual('<a>test</a>');
    });

    it('Should not log warning when rendering regular link', function () {
      const consoleSpy = spyOn(console, 'error');

      render(<a href="https://github.com/infernojs/inferno">test</a>, container);

      expect(consoleSpy).toHaveBeenCalledTimes(0);
      expect(container.innerHTML).toEqual('<a href="https://github.com/infernojs/inferno">test</a>');
    });
  });
});
