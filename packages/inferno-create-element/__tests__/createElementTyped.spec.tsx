import { Component, render } from 'inferno';
import { createElement } from 'inferno-create-element';

describe('CreateElement (non-JSX)', () => {
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

    it('Should render zero children', () => {
        const App = () => createElement('div', null);
        render(App(), container);
    });

    it('Should render null children', () => {
        const App = () => createElement('div', null, null);
        render(App(), container);
    });

    it('Should render undefined children', () => {
        const App = () => createElement('div', null, undefined);
        render(App(), container);
    });

    it('Should render one child', () => {
        const App = () => createElement(
            'div',
            null,
            createElement('div', { className: 'title' }, 'Example')
        );

        render(App(), container);
    });

    it('Should render multiple children', () => {
        const App = () => createElement(
            'div',
            null,
            createElement('div', { className: 'title' }, 'Example'),
            createElement('button', { type: 'button', }, 'Do a thing')
        );

        render(App(), container);
    });

    it('Should render array of children', () => {
        const App = () => createElement(
            'div',
            null,
            [
                createElement('div', { className: 'title' }, 'Example'),
                createElement('button', { type: 'button', }, 'Do a thing')
            ]
        );

        render(App(), container);
    });

    it('Should check component props', () => {
        class App extends Component<{ className: string }, any> {
            public render() {
                return createElement(
                    'div',
                    { className: this.props.className },
                    createElement('div', { className: 'title' }, 'Example'),
                    createElement('hr')
                );
            }
        }

        render(createElement(App, { className: "App" }), container);

        /** Should be an error if uncommented: */
        // render(createElement(App, { className: 1 }), container);
        // render(createElement(App, {}), container);

        /** Would like to be an error but it'd break createElement('hr'): */
        render(createElement(App), container);
    });

    it('Should check functional component props', () => {
        const App = ({ className }: { className: string }) => createElement(
            'div',
            { className },
            createElement('div', { className: 'title' }, 'Example'),
            createElement('hr')
        );

        render(createElement(App, { className: "App" }), container);

        /** Should be an error if uncommented: */
        // render(createElement(App, { className: 1 }), container);
        // render(createElement(App, {}), container);

        /** Would like to be an error but it'd break createElement('hr'): */
        render(createElement(App), container);
    });
});
