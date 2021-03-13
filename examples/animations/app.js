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

  class SectionItem extends AnimatedComponent {
    render() {
    	renderCounter++;
      return createElement('section', { onClick: (e) => this.props.onClick(e, this.props.index)}, this.props.children);
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
      var newItems = this.state.items.concat([]);
      newItems.splice(index, 1)
      this.setState({
        items: newItems
      })
    }

    doAdd = (e) => {
      e.preventDefault();
      var newItems = this.state.items.concat([]);
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
			}
      this.setState({ items: this.items });
		}

		render() {
			return createElement('div', null, [
        createElement('h2', null, this.props.animation),
        createElement('ul', null, this.state.items.map((item, i) => createElement(ListItem, {key: item.key, index: i, animation: this.props.animation, onClick: this.doRemove}, `${item.key + 1}bar`))),
        createElement('button', { onClick: this.doAdd }, 'Add')
      ]);
		}
	}


	class MixedList extends Component {
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
      var newItems = this.state.items.concat([]);
      newItems.splice(index, 1)
      this.setState({
        items: newItems
      })
    }

    doRemoveSpecial = (e) => {
      e.preventDefault()
      // Remove random ListItem and trigger animation
      var onlyListItems = this.state.items.filter((item) => item.isListItem);
      var toDeleteIndex = parseInt(Math.round(Math.random() * (onlyListItems.length - 1)));
      var toDeleteKey = onlyListItems[toDeleteIndex].key;
      var newItems = this.state.items.filter((item) => item.key !== toDeleteKey);
      this.setState({
        items: newItems
      });

      // Remove random divider during animation
      setTimeout(() => {
        var onlyDividers = this.state.items.filter((item) => !item.isListItem);
        var toDeleteIndex = parseInt(Math.round(Math.random() * (onlyDividers.length - 1)));
        var counter = 0;
        var newItems = this.state.items.filter((item) => item.isListItem || counter++ !== toDeleteIndex);
        this.setState({
          items: newItems
        })
      }, 100)
    }

    doAdd = (e) => {
      e.preventDefault();
      var newItems = this.state.items.concat([]);
      var nextKey = newItems.reduce((prev, curr) => curr.key > prev ? curr.key : prev, 0) + 1;
      newItems.push({key: nextKey, isListItem: true});
      newItems.push({key: nextKey + 1});
      this.setState({
        items: newItems
      });
    }

		componentDidMount() {
			let i = 0;
			while (this.items.length < 40) {
				this.items[this.items.length] = {key: i++, isListItem: true};
				this.items[this.items.length] = {key: i++};
			}
      this.setState({ items: this.items });
		}

		render() {
      // Mixing <section> and <span> instead of using <li> for all to trigger special code path in Inferno
			return createElement('div', null, [
        createElement('h2', null, 'Mixed list'),
        createElement('h3', null, '(no anim on divider)'),
        createElement('article', null, this.state.items.map((item, i) => (item.isListItem
          ? createElement(SectionItem, {key: item.key, index: i, animation: this.props.animation, onClick: this.doRemove}, `${item.key + 1}bar`)
          : createElement('span', {className: 'divider'})))),
        createElement('button', { onClick: this.doAdd }, 'Add'),
        createElement('button', { onClick: this.doRemoveSpecial }, 'Remove')
      ]);
		}
	}


	class ShuffleList extends Component {
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
      var newItems = this.state.items.concat([]);
      newItems.splice(index, 1)
      this.setState({
        items: newItems
      })
    }

    doAdd = (e) => {
      e.preventDefault();
      var newItems = this.state.items.concat([]);
      var nextKey = newItems.reduce((prev, curr) => curr.key > prev ? curr.key : prev, 0) + 1;
      newItems.push({key: nextKey, val: nextKey + 1});
      this.setState({
        items: newItems
      });
    }

    doMix = (e) => {
      e.preventDefault();
      var newItems = this.state.items.concat([]);
      shuffle(newItems);
      this.setState({
        items: newItems
      });
    }

    doReassignKeys = (e) => {
      var tmpItems = this.state.items.concat([]);
      shuffle(tmpItems);
      var newItems = this.state.items.map((item, index) => {
        return Object.assign({}, item, { key: tmpItems[index].key })
      })
      this.setState({
        items: newItems
      })
    }

    doRemoveMix = (e) => {
      // Remove random ListItem and trigger animation
      var toDeleteIndex = parseInt(Math.round(Math.random() * (this.state.items.length - 1)));
      var toDeleteKey = this.state.items[toDeleteIndex].key;
      var newItems = this.state.items.filter((item) => item.key !== toDeleteKey);
      this.setState({
        items: newItems,
        deleted: toDeleteKey + 1
      });

      setTimeout(() => this.doMix(e), 100);
    }

		componentDidMount() {
			let i = 0;

			while (this.items.length < 20) {
				this.items[this.items.length] = {key: i, val: i + 1};
        i++;
			}
      this.setState({ items: this.items });
		}

		render() {
			return createElement('div', null, [
        createElement('h2', null, 'Shuffle'),
        createElement('ul', null, this.state.items.map((item, i) => createElement(ListItem, {key: item.key, index: i, animation: this.props.animation, onClick: this.doRemove}, `${item.val}bar (${item.key})`))),
        createElement('button', { onClick: this.doAdd }, 'Add'),
        createElement('button', { onClick: this.doMix }, 'Shuffle'),
        createElement('button', { onClick: this.doReassignKeys }, 'Shuffle keys'),
        createElement('button', { onClick: this.doRemoveMix }, 'Remove' + (this.state.deleted ? ` (${this.state.deleted})` : '')),
      ]);
		}
	}

  // https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
  var shuffle = (array) => {
    var currentIndex = array.length, temporaryValue, randomIndex;
  
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
  
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
  
      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
  
    return array;
  }


	class RerenderList extends Component {
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
      var newItems = this.state.items.concat([]);
      newItems.splice(index, 1)
      this.setState({
        items: newItems
      })
    }

    doAdd = (e) => {
      e.preventDefault();
      var newItems = this.state.items.concat([]);
      var nextKey = newItems.reduce((prev, curr) => curr.key > prev ? curr.key : prev, 0) + 1;
      newItems.push({key: nextKey, val: nextKey + 1});
      this.setState({
        items: newItems
      });
    }

    componentDidMount() {
      this.componentWillReceiveProps(this.props);
    }

    componentWillReceiveProps(nextProps) {
			let i = 0;

			while (this.items.length < nextProps.items) {
				this.items[this.items.length] = {key: i, val: i + 1};
        i++;
			}
      this.setState({ items: this.items });
    }

		render() {
			return createElement('div', null, [
        createElement('h2', null, 'patchKeyedChildren'),
        createElement('ul', null, this.state.items.map((item, i) => createElement(ListItem, {key: item.key, index: i, animation: this.props.animation, onClick: this.doRemove}, `${item.val}bar (${item.key})`))),
        createElement('button', { onClick: this.doAdd }, 'Add'),
      ]);
		}
	}

  const renderToFive = (e) => {
    e && e.preventDefault();
    var container_5 = document.querySelector('#App5');
    //Inferno.render(createElement('div', null, createElement(RerenderList, {animation: 'HeightAndFade', items: 5})), container_5);
    Inferno.render(createElement(RerenderList, {animation: 'HeightAndFade', items: 5}), container_5);
  }

	document.addEventListener('DOMContentLoaded', function () {
		var container_1 = document.querySelector('#App1');
		var container_2 = document.querySelector('#App2');
		var container_3 = document.querySelector('#App3');
		var container_4 = document.querySelector('#App4');
		

    Inferno.render(createElement(List, {animation: 'HeightAndFade'}), container_1);
    Inferno.render(createElement(List, {animation: 'NoTranistionEvent'}), container_2);
    Inferno.render(createElement(MixedList, {animation: 'HeightAndFade'}), container_3);
    Inferno.render(createElement(ShuffleList, {animation: 'HeightAndFade'}), container_4);
    
    var btn = document.querySelector('#Rerender > button')
    btn.addEventListener('click', renderToFive);
	});
})();
