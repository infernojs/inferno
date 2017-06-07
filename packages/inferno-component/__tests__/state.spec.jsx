import { createVNode, render } from 'inferno';
import Component from '../dist-es';
import VNodeFlags from 'inferno-vnode-flags';

class TestCWRP extends Component {
	constructor(props) {
		super(props);

		this.state = {
			a: 0,
			b: 0
		};
	}

	componentWillReceiveProps() {
		this.setStateSync({ a: 1 });

		if (this.state.a !== 1) {
			this.props.done('state is not correct');
			return;
		}

		this.props.done();
	}

	render() {
		return <div>{JSON.stringify(this.state)}</div>;
	}
}

describe('state', () => {
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

	// As per React
	it('Should not have state defined in base constructor', () => {
		class Foo extends Component {
			constructor(p, c) {
				super(p, c);

				expect(this.state).to.be.a('null');
			}
		}

		const f = new Foo({}, {});

		expect(f).not.to.be.a('null');
	});

	describe('setting state', () => {

		it('setStateSync should apply state during componentWillReceiveProps', (done) => {
			const node = createVNode(VNodeFlags.ComponentClass, TestCWRP, null, null, { done }, null);
			render(node, container);
			node.props.foo = 1;
			render(node, container);
		});
	});


	describe('didUpdate and setState', () => {
		it('order', (done) => {
			class Test extends Component {

				constructor(props, context) {
					super(props, context);

					this.state = {
						testScrollTop: 0
					};
				}

				componentWillReceiveProps(nextProps) {
					console.log('CWRP', nextProps.scrollTop);
					if (nextProps.scrollTop !== 0){
						this.setState({ testScrollTop: nextProps.scrollTop });
					}
				}

				componentDidUpdate(prevProps, prevState) {
					expect(prevState.testScrollTop).to.equal(0);
					expect(this.state.testScrollTop).to.equal(200);
				}

				render(){
					return (<div>aa</div>);
				}

			}

			class Example extends Component{

				constructor(props, context) {
					super(props, context);
					this.state = {
						exampleScrollTop: 0
					};
				}

				render(){
					return (<Test scrollTop={this.state.exampleScrollTop}/>);
				}

				componentDidMount(){
					setTimeout(()=> {
						this.setState({ exampleScrollTop: 200 });

						setTimeout(() => {
							done();
						}, 50);
					}, 50);
				}
			}

			render(
				<Example name="World" />,
				document.getElementById('container')
			);
		});
	});
});
