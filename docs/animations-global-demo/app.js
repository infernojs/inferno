import { Component, render } from 'inferno';
import { createElement } from 'inferno-create-element';
import { componentDidAppear, componentWillDisappear } from 'inferno-animation';

const anim = {
  onComponentDidAppear: componentDidAppear,
  onComponentWillDisappear: componentWillDisappear
};

function Logo() {
  return createElement('div', { className: 'logo' }, createElement('img', { width: '120px', height: '120px', src: 'inferno-logo.svg' }));
}
Logo.defaultHooks = anim;

function Payoff() {
  return createElement('h2', { className: 'payoff' }, 'Inferno is a blazingly fast framework.');
}
Payoff.defaultHooks = anim;

function PageOne({ onClick }) {
  return createElement('div', { className: 'Page' }, [
    createElement('div', { className: 'Menu' }, createElement('div', { className: 'body' }, [createElement('h3', null, 'Page 1')])),
    createElement('div', { className: 'content' }, [
      createElement('div', { className: 'Hero' }, [
        createElement(Logo, { globalAnimationKey: 'main-logo', animation: 'AnimateLogo' }),
        createElement(Payoff, { globalAnimationKey: 'payoff', animation: 'AnimateLogo' })
      ]),
      createElement('button', { onClick, children: 'Click here' })
    ])
  ]);
}

function PageTwo({ onClick }) {
  return createElement('div', { className: 'Page' }, [
    createElement('div', { className: 'Menu' }, [
      createElement(Logo, { globalAnimationKey: 'main-logo', animation: 'AnimateLogo' }),
      createElement('div', { className: 'body' }, [
        createElement(Payoff, { globalAnimationKey: 'payoff', animation: 'AnimateLogo' }),
        createElement('h3', null, 'Page 2')
      ])
    ]),
    createElement('div', { className: 'content' }, [createElement('button', { onClick, children: 'Click here' })])
  ]);
}

class App extends Component {
  constructor() {
    super();

    this.state = {
      page: 0
    };

    this.didClick = this.didClick.bind(this);
  }

  didClick(e) {
    e.preventDefault();
    this.setState({
      page: ++this.state.page % 2
    });
  }

  render() {
    return createElement(
      'div',
      null,
      this.state.page === 0 ? createElement(PageOne, { onClick: this.didClick }) : createElement(PageTwo, { onClick: this.didClick })
    );
  }
}

document.addEventListener('DOMContentLoaded', function () {
  var container_1 = document.querySelector('#App1');

  render(
    createElement(App, {
      description:
        'Each card <li> animates height and opacity on add. The image and body of each card animates using the card animation CSS-classes but with different transitions. The card inherits AnimatedComponet which is only aware of the card animation. The child animations need to be finished when the card animations are finished.'
    }),
    container_1
  );
});
