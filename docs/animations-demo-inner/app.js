import { Component, render, createRef } from 'inferno';
import { createElement } from 'inferno-create-element';
import { componentDidAppear, componentWillDisappear } from 'inferno-animation';

class Page extends Component {
  componentDidAppear(dom) {
    // We need to store a reference to the animating child that
    // isn't removed on unmount. Currently, this requires passing
    // a ref as property and referencing the .current property
    // of that object.
    this._innerEl = this.props.innerRef.current;
    componentDidAppear(this._innerEl, { animation: 'inner' });
  }

  componentWillDisappear(dom, callback) {
    componentWillDisappear(this._innerEl, { animation: 'inner' }, callback);
  }

  render() {
    return createElement(
      'div',
      {
        className: 'page'
      },
      createElement('div', { className: 'random-wrapper' }, [
        createElement('h3', null, 'Page ' + this.props.step),
        createElement('img', { width: '120px', height: '120px', src: 'avatar.png' }),
        createElement('p', null, 'The entire page is swapped, but we are only animating div.inner. This gives the apperance of only swapping the box below.'),
        createElement(
          'p',
          null,
          "In order not to hide the incoming content we can't set background on div.page. The background needs to be provided by a backdrop in the wizard component."
        ),
        createElement('div', { ref: this.props.innerRef, className: 'inner' }, [
          createElement('h2', null, 'Step ' + this.props.step),
          createElement(
            'button',
            {
              onClick: (e) => {
                e.preventDefault();
                this.props.onNext();
              }
            },
            'Next'
          )
        ])
      ])
    );
  }
}

const nrofSteps = 3;

class Wizard extends Component {
  constructor() {
    super();

    // Ref objects used to reference the animating children of each page
    this._innerAnimRefs = [];
    for (let i = 0; i < nrofSteps; i++) {
      this._innerAnimRefs.push(createRef());
    }

    this.state = {
      showStepIndex: 0
    };
  }

  doGoNext = () => {
    this.setState({
      showStepIndex: (this.state.showStepIndex + 1) % nrofSteps
    });
  };

  render() {
    const { showStepIndex } = this.state;

    return createElement(Page, { key: 'page_' + showStepIndex, step: showStepIndex + 1, innerRef: this._innerAnimRefs[showStepIndex], onNext: this.doGoNext });
  }
}

document.addEventListener('DOMContentLoaded', function () {
  var container_1 = document.querySelector('#App1');

  render(createElement(Wizard), container_1);
});
