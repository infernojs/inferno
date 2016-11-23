import Component from 'inferno-component';
import Inferno from 'inferno';

class Home extends Component {
	render() {
		return (
			<div>
				Hello World
			</div>
		);
	}
}

Inferno.render(<Home />, document.getElementById('example--home'));
