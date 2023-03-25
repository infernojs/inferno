import { Component, render } from 'inferno';

class Demo extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      numPoints: 0
    };

    this.updateCount = this.updateCount.bind(this);
  }

  updateCount(e) {
    this.setState({
      numPoints: e.target.value
    });
  }

  componentDidMount() {
    this.setState({
      numPoints: 1000
    });
  }

  render(props, state) {
    return (
      <div className="app-wrapper">
        <p>
          The infinite sum
          <math display="block">
            <mrow>
              <munderover>
                <mo>∑</mo>
                <mrow>
                  <mi>n</mi>
                  <mo>=</mo>
                  <mn>1</mn>
                </mrow>
                <mrow>
                  <mo>+</mo>
                  <mn>∞</mn>
                </mrow>
              </munderover>
              <mfrac>
                <mn>1</mn>
                <msup>
                  <mi>n</mi>
                  <mn>2</mn>
                </msup>
              </mfrac>
            </mrow>
          </math>
          is equal to the real number
          <math display="inline">
            <mfrac>
              <msup>
                <mi>π</mi>
                <mn>2</mn>
              </msup>
              <mn>6</mn>
            </mfrac>
          </math>
          .
        </p>
      </div>
    );
  }
}

render(<Demo />, document.getElementById('app'));
