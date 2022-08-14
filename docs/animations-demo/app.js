import { Component, render } from 'inferno';
import { createElement } from 'inferno-create-element';
import { AnimatedComponent, componentDidAppear, componentWillDisappear } from 'inferno-animation';

let renderCounter = 0;

const anim = {
  onComponentDidAppear: componentDidAppear,
  onComponentWillDisappear: componentWillDisappear
};

class ListItem extends AnimatedComponent {
  render() {
    renderCounter++;
    return createElement(
      'li',
      {
        className: 'item',
        onClick: (e) => this.props.onClick(e, this.props.index)
      },
      createElement('div', { className: 'inner' }, [
        createElement('img', { width: '120px', height: '120px', src: 'avatar.png' }),
        createElement('div', { className: 'body' }, [
          createElement('h2', null, this.props.children),
          createElement('h3', null, 'Inferno is a blazingly fast framework.')
        ])
      ])
    );
  }
}

class List extends Component {
  constructor() {
    super();

    this.state = {
      items: []
    };
    this.items = [];
  }

  doRemove = (e, index) => {
    e.preventDefault();
    var newItems = this.state.items.concat([]);
    newItems.splice(index, 1);
    this.setState({
      items: newItems
    });
  };

  doAdd = (e) => {
    e.preventDefault();
    var newItems = this.state.items.concat([]);
    var nextKey = newItems.length === 0 ? 0 : newItems[newItems.length - 1].key + 1;
    newItems.push({ key: nextKey });
    this.setState({
      items: newItems
    });
  };

  componentDidMount() {
    let i = 0;

    while (this.items.length < 20) {
      this.items[this.items.length] = { key: i++ };
    }
    this.setState({ items: this.items });
  }

  renderItem = (item, i) => {
    return createElement(
      ListItem,
      { key: item.key, index: i, animation: this.props.animation, onClick: this.doRemove },
      `This line is nice with ${item.key + 1} bar`
    );
  };

  render() {
    return createElement('div', null, [
      createElement('ul', null, this.state.items.map(this.renderItem)),
      createElement('h2', null, this.props.animation),
      createElement('p', null, this.props.description),
      createElement('button', { onClick: this.doAdd }, 'Add')
    ]);
  }
}

document.addEventListener('DOMContentLoaded', function () {
  var container_1 = document.querySelector('#App1');

  render(
    createElement(List, {
      animation: 'Complex',
      description:
        'Each card <li> animates height and opacity on add. The image and body of each card animates using the card animation CSS-classes but with different transitions. The card inherits AnimatedComponet which is only aware of the card animation. The child animations need to be finished when the card animations are finished.'
    }),
    container_1
  );
});
