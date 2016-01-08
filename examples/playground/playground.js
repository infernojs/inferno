class FocusInput extends Inferno.Component {
	constructor(props) {
		super(props);

		this.state = {
			isEditMode: false
		};

		this.blur = this.blur.bind(this);
		this.focus = this.focus.bind(this);
	}

	blur() {
		console.log(new Date(), ': BLUR');
		this.setState({
			isEditMode: false
		});
	}

	focus() {
		console.log(new Date(), ': FOCUS');
		this.setState({
			isEditMode: true
		});
	}

	render(props) {
		return (
			<div>
				<div
					contenteditable="true"
					class={this.state.isEditMode + ''}
					onBlur={this.blur}
					onFocus={this.focus}>
						{this.state.isEditMode + this.props.value}
					</div>
			</div>
		);
	}
}

class Looper extends Inferno.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<div class="loop">
				{ [ 'Volvo', 'BMW', 'Mercedes' ].map((car) => {
					return (
						<FocusInput value={car} />
					);
				})}
			</div>
		);
	}
}

InfernoDOM.render(<Looper />, document.getElementById('app'));