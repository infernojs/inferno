/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails react-core
 */

import React from 'inferno-compat';

const ReactDOM = React;

if (global?.usingJSDOM) {
  describe('ReactDOMComponent', function () {
    describe('updateDOM', function () {
      it('should handle className', function () {
        const container = document.createElement('div');
        ReactDOM.render(<div style={{}} />, container);

        ReactDOM.render(<div className={'foo'} />, container);
        expect(container.firstChild.className).toEqual('foo');
        ReactDOM.render(<div className={'bar'} />, container);
        expect(container.firstChild.className).toEqual('bar');
        ReactDOM.render(<div className={null} />, container);
        expect(container.firstChild.className).toEqual('');
      });

      it('should gracefully handle various style value types', function () {
        const container = document.createElement('div');
        ReactDOM.render(<div style={{}} />, container);
        const stubStyle = container.firstChild.style;

        // set initial style
        const setup = {
          display: 'block',
          left: '1px',
          top: '2px',
          'font-family': 'Arial',
        };
        ReactDOM.render(<div style={setup} />, container);
        expect(stubStyle.display).toEqual('block');
        expect(stubStyle.left).toEqual('1px');
        expect(stubStyle.fontFamily).toEqual('Arial');

        // reset the style to their default state
        const reset = { display: '', left: null, top: null, fontFamily: null };
        ReactDOM.render(<div style={reset} />, container);
        expect(stubStyle.display).toEqual('');
        expect(stubStyle.left).toEqual('');
        expect(stubStyle.top).toEqual('');
        expect(stubStyle.fontFamily).toEqual('');
      });

      it('should update styles if initially null', function () {
        let styles = null;
        const container = document.createElement('div');
        ReactDOM.render(<div style={styles} />, container);

        const stubStyle = container.firstChild.style;

        styles = { display: 'block' };

        ReactDOM.render(<div style={styles} />, container);
        expect(stubStyle.display).toEqual('block');
      });

      it('should update styles if updated to null multiple times', function () {
        let styles = null;
        const container = document.createElement('div');
        ReactDOM.render(<div style={styles} />, container);

        styles = { display: 'block' };
        const stubStyle = container.firstChild.style;

        ReactDOM.render(<div style={styles} />, container);
        expect(stubStyle.display).toEqual('block');

        ReactDOM.render(<div style={null} />, container);
        expect(stubStyle.display).toEqual('');

        ReactDOM.render(<div style={styles} />, container);
        expect(stubStyle.display).toEqual('block');

        ReactDOM.render(<div style={null} />, container);
        expect(stubStyle.display).toEqual('');
      });

      it('should remove attributes', function () {
        const container = document.createElement('div');
        ReactDOM.render(<img height="17" />, container);

        expect(container.firstChild.hasAttribute('height')).toBe(true);
        ReactDOM.render(<img />, container);
        expect(container.firstChild.hasAttribute('height')).toBe(false);
      });

      it('should remove properties', function () {
        const container = document.createElement('div');
        ReactDOM.render(<div className="monkey" />, container);

        expect(container.firstChild.className).toEqual('monkey');
        ReactDOM.render(<div />, container);
        expect(container.firstChild.className).toEqual('');
      });

      it('should clear a single style prop when changing `style`', function () {
        let styles = { display: 'none', color: 'red' };
        const container = document.createElement('div');
        ReactDOM.render(<div style={styles} />, container);

        const stubStyle = container.firstChild.style;

        styles = { color: 'green' };
        ReactDOM.render(<div style={styles} />, container);
        expect(stubStyle.display).toEqual('');
        expect(stubStyle.color).toEqual('green');
      });

      it('should update arbitrary attributes for tags containing dashes', function () {
        const container = document.createElement('div');

        const beforeUpdate = React.createElement('x-foo-component', {}, null);
        ReactDOM.render(beforeUpdate, container);

        const afterUpdate = <x-foo-component myattr="myval" />;
        ReactDOM.render(afterUpdate, container);

        expect(container.childNodes[0].getAttribute('myattr')).toBe('myval');
      });

      it('should clear all the styles when removing `style`', function () {
        const styles = { display: 'none', color: 'red' };
        const container = document.createElement('div');
        ReactDOM.render(<div style={styles} />, container);

        const stubStyle = container.firstChild.style;

        ReactDOM.render(<div />, container);
        expect(stubStyle.display).toEqual('');
        expect(stubStyle.color).toEqual('');
      });

      it('should update styles when `style` changes from null to object', function () {
        const container = document.createElement('div');
        const styles = { color: 'red' };
        ReactDOM.render(<div style={styles} />, container);
        ReactDOM.render(<div />, container);
        ReactDOM.render(<div style={styles} />, container);

        const stubStyle = container.firstChild.style;
        expect(stubStyle.color).toEqual('red');
      });

      it('should empty element when removing innerHTML', function () {
        const container = document.createElement('div');
        ReactDOM.render(
          <div dangerouslySetInnerHTML={{ __html: ':)' }} />,
          container,
        );

        expect(container.firstChild.innerHTML).toEqual(':)');
        ReactDOM.render(<div />, container);
        expect(container.firstChild.innerHTML).toEqual('');
      });

      it('should transition from string content to innerHTML', function () {
        const container = document.createElement('div');
        ReactDOM.render(<div>hello</div>, container);

        expect(container.firstChild.innerHTML).toEqual('hello');
        ReactDOM.render(
          <div dangerouslySetInnerHTML={{ __html: 'goodbye' }} />,
          container,
        );
        expect(container.firstChild.innerHTML).toEqual('goodbye');
      });

      it('should transition from innerHTML to string content', function () {
        const container = document.createElement('div');
        ReactDOM.render(
          <div dangerouslySetInnerHTML={{ __html: 'bonjour' }} />,
          container,
        );

        expect(container.firstChild.innerHTML).toEqual('bonjour');
        ReactDOM.render(<div>adieu</div>, container);
        expect(container.firstChild.innerHTML).toEqual('adieu');
      });

      it('should transition from innerHTML to children in nested el', function () {
        const container = document.createElement('div');
        ReactDOM.render(
          <div>
            <div dangerouslySetInnerHTML={{ __html: 'bonjour' }} />
          </div>,
          container,
        );

        expect(container.textContent).toEqual('bonjour');
        ReactDOM.render(
          <div>
            <div>
              <span>adieu</span>
            </div>
          </div>,
          container,
        );
        expect(container.textContent).toEqual('adieu');
      });

      it('should transition from children to innerHTML in nested el', function () {
        const container = document.createElement('div');
        ReactDOM.render(
          <div>
            <div>
              <span>adieu</span>
            </div>
          </div>,
          container,
        );

        expect(container.textContent).toEqual('adieu');
        ReactDOM.render(
          <div>
            <div dangerouslySetInnerHTML={{ __html: 'bonjour' }} />
          </div>,
          container,
        );
        expect(container.textContent).toEqual('bonjour');
      });

      it('should ignore attribute whitelist for elements with the "is: attribute', function () {
        const container = document.createElement('div');
        ReactDOM.render(<button is="test" cowabunga="chevynova" />, container);
        expect(container.firstChild.hasAttribute('cowabunga')).toBe(true);
      });
    });
  });
}
