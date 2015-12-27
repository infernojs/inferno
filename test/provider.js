import Inferno from '../src';

describe('Provider', () => {
    let container;

    beforeEach(() => {
        container = document.createElement('div');
    });

    afterEach(() => {
         Inferno.render(null, container);
    });

    const store = {
      name: 'Hello world!'
    };
    const childrenTemplate = Inferno.createTemplate(children => children);
    class MainApp extends Inferno.Component {
		render() {
			return <div>{ this.context.store.name }</div>;
		}
    }

    class Provider extends Inferno.Component {
		render() {
            return childrenTemplate( this.props.children );
		}
		getChildContext() {
			return {
				store: this.props.store
			}
		}
    }

    it('should render a basic provider component with its children', () => {
        Inferno.render((
            <Provider store={ store }>
                <MainApp />
            </Provider>
        ), container);
    });

    it('Initial render (creation)', () => {
        Inferno.render((
            <Provider store={ store }>
                <MainApp />
            </Provider>
        ), container);

        expect(
          container.innerHTML
        ).to.equal(
          '<div>Hello world!</div>'
        );
    });
});
