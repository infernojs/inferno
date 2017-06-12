import Component from "inferno-component";

export class ChildCommon extends Component {
  constructor(props) {
    super(props);

    this._update = this._update.bind(this);
  }

  _update() {
    this.setState({
      data: "bar"
    });
  }

  componentWillMount() {
    this.setState({
      data: "foo"
    });
  }

  render() {
    return (
      <div onclick={this._update}>
        {this.props.name}
        {this.state.data}
      </div>
    );
  }
}
