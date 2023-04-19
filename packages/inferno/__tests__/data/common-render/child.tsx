import { Component } from 'inferno';

interface ChildCommonProps {
  name: string;
}

interface ChildCommonState {
  data: string;
}

export class ChildCommon extends Component<ChildCommonProps, ChildCommonState> {
  public state: ChildCommonState;

  constructor(props) {
    super(props);

    this.state = {
      data: ''
    };

    this._update = this._update.bind(this);
  }

  public _update() {
    this.setState({
      data: 'bar'
    });
  }

  public componentWillMount() {
    this.setState({
      data: 'foo'
    });
  }

  public render() {
    return (
      <div onclick={this._update}>
        {this.props.name}
        {this.state.data}
      </div>
    );
  }
}
