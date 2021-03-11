(function() {
	"use strict";
	var Component = Inferno.Component;
	var createElement = Inferno.createElement;
  var InfernoAnimation = Inferno.Animation;

  var AnimatedComponent = InfernoAnimation.AnimatedComponent;

	let renderCounter = 0;

  class ListItem extends AnimatedComponent {
    render() {
    	renderCounter++;
      return createElement('li', { onClick: (e) => this.props.onClick(e, this.props.index)}, this.props.children);
    }
  }

	class List extends Component {
		constructor() {
			super();
			// set initial time:
			this.state = {
				items: []
			};
			this.items = [];
		}

    doRemove = (e, index) => {
      e.preventDefault();
      var newItems = this.state.items
      newItems.splice(index, 1)
      this.setState({
        items: newItems
      })
    }

    doAdd = (e) => {
      e.preventDefault();
      var newItems = this.state.items;
      var nextKey = newItems.length === 0 ? 0 : newItems[newItems.length - 1].key + 1;
      newItems.push({key: nextKey});
      this.setState({
        items: newItems
      });
    }

		componentDidMount() {
			let i = 0;

			while (this.items.length < 20) {
				this.items[this.items.length] = {key: i++};
				this.setState({ items: this.items });
			}
		}

		render() {
			return createElement('div', null, [
        createElement('h2', null, this.props.animation),
        createElement('ul', null, this.state.items.map((item, i) => createElement(ListItem, {key: item.key, index: i, animation: this.props.animation, onClick: this.doRemove}, `${item.key + 1}bar`))),
        createElement('button', { onClick: this.doAdd }, 'Add')
      ]);
		}
	}

	document.addEventListener('DOMContentLoaded', function () {
		var container_1 = document.querySelector('#App1');
		var container_2 = document.querySelector('#App2');

    Inferno.render(createElement(List, {animation: 'HeightAndFade'}), container_1);
    Inferno.render(createElement(List, {animation: 'NoTranistionEvent'}), container_2);
	});
})();
