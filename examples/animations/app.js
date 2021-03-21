(function() {
	"use strict";
	var Component = Inferno.Component;
	var createElement = Inferno.createElement;
  var InfernoAnimation = Inferno.Animation;

  var AnimatedComponent = InfernoAnimation.AnimatedComponent;
  var {
    addClassName,
    removeClassName,
    forceReflow,
    registerTransitionListener,
  } = InfernoAnimation.utils;

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
        createElement('ul', null, this.state.items.map((item, i) => createElement(ListItem, {key: item.key, index: i, animation: this.props.animation, onClick: this.doRemove}, `${item.key + 1}bar`))),
        createElement('h2', null, this.props.animation),
        createElement('p', null, this.props.description),
        createElement('button', { onClick: this.doAdd }, 'Add')
      ]);
		}
	}


	class MixedList extends Component {
		constructor() {
			super();

      let i = 0;
      let items = [];
			while (items.length < 40) {
				items[items.length] = {key: i++, isListItem: true};
				items[items.length] = {key: i++};
			}

			this.state = {
				items
			};
		}

    didAppear = (dom) => {
      const animCls = {
        'start': 'fade-enter',
        'active': 'fade-enter-active',
        'end': 'fade-enter-end'
      }
      // 1. Set animation start state
      addClassName(dom, animCls.start)
      forceReflow()

      // 2. Activate transition
      addClassName(dom, animCls.active)

      // 3. Set an animation listener, code at end
      // Needs to be done after activating so timeout is calculated correctly
      registerTransitionListener([dom, dom.children[0]], function () {
        // *** Cleanup ***
        // 5. Remove the element
        removeClassName(dom, animCls.active)
        removeClassName(dom, animCls.end)
      }, false)

      // 4. Activate target state
      setTimeout(() => {
        removeClassName(dom, animCls.start)
        addClassName(dom, animCls.end)
      }, 5)
    }

    willDisappear = (dom, callback) => {
      const animCls = {
        'start': 'fade-leave',
        'active': 'fade-leave-active',
        'end': 'fade-leave-end'
      }

      // 1. Set animation start state
      addClassName(dom, animCls.start)

      // 2. Activate transitions
      addClassName(dom, animCls.active);

      // 3. Set an animation listener, code at end
      // Needs to be done after activating so timeout is calculated correctly
      registerTransitionListener(dom, function () {
        // *** Cleanup ***

        // Simulate some work is being done
        // setTimeout(function () {
        //   callback();
        // }, 1000);
        callback();
      }, false)

      // 4. Activate target state
      setTimeout(() => {
        addClassName(dom, animCls.end)
        removeClassName(dom, animCls.start)
      }, 5)
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

		render() {
      // Mixing <section> and <span> instead of using <li> for all to trigger special code path in Inferno
			return createElement('div', null, [
        createElement('article', null, this.state.items.map((item, i) => (item.isListItem
          ? createElement(SectionItem, {key: item.key, index: i, animation: this.props.animation, onClick: this.doRemove}, `${item.key + 1}bar`)
          : createElement('span', {className: 'divider'})))),
        createElement('h2', null, 'Mixed list'),
        createElement('p', null, this.props.description),
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
      e && e.preventDefault();
      var newItems = this.state.items.concat([]);
      newItems.splice(index, 1)
      this.setState({
        items: newItems
      })
    }

    doAdd = (e) => {
      e && e.preventDefault();
      var newItems = this.state.items.concat([]);
      var nextKey = newItems.reduce((prev, curr) => curr.key > prev ? curr.key : prev, 0) + 1;
      newItems.push({key: nextKey, val: nextKey + 1});
      this.setState({
        items: newItems
      });
    }

    doMix = (e) => {
      e && e.preventDefault();
      var newItems = this.state.items.concat([]);
      shuffle(newItems);
      this.setState({
        items: newItems
      });
    }

    doReassignKeys = (e) => {
      e && e.preventDefault();
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
      e && e.preventDefault();
		  if (this.state.items.length === 0) {
		    return;
      }
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

    removeAndShuffle = (e) => {
      e && e.preventDefault();
		  for (let i = 0; i < 20; i++) {
        setTimeout(() => {
          var toDeleteIndex = parseInt(Math.round(Math.random() * (this.state.items.length - 1)));
          this.doRemove(undefined, toDeleteIndex);
          this.doReassignKeys();
          this.doMix();
        })
      }
    }

    doAdd20 = (e) => {
      e && e.preventDefault();
      // Add data
      for (let i = 0; i < 20; i++) {
        this.doAdd()
      }
      // Shuffle them
      for (let i = 0; i < 5; i++) {
        this.doReassignKeys();
        this.doMix();
      }
    }
    
    doAdd20SeqMix = (e) => {
      e && e.preventDefault();
      // Add data
      for (let i = 0; i < 20; i++) {
        this.doAdd()
      }
      // Shuffle them
      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          // this.doReassignKeys(e);
          this.doMix();
        }, 500 + 100 * i)
      }
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
        createElement('ul', null, this.state.items.map((item, i) => createElement(ListItem, {key: item.key, index: i, animation: this.props.animation, onClick: this.doRemove}, `${item.val}bar (${item.key})`))),
        createElement('h2', null, 'Shuffle'),
        createElement('p', null, this.props.description),
        createElement('button', { onClick: this.doAdd }, 'Add'),
        createElement('button', { onClick: this.doMix }, 'Shuffle'),
        createElement('button', { onClick: this.doReassignKeys }, 'Shuffle keys'),
        createElement('button', { onClick: this.doRemoveMix }, 'Remove' + (this.state.deleted ? ` (${this.state.deleted})` : '')),
        createElement('button', { onClick: this.doAdd20 }, 'Add and shuffle 20'),
        createElement('button', { onClick: this.doAdd20SeqMix }, 'Add 20 do 5 shuffle'),
        createElement('button', { onClick: this.removeAndShuffle }, 'Remove and shuffle 20')
      ]);
		}
	}

  class PatchingIssues extends Component {
    constructor() {
      super();
      // set initial time:
      this.state = {
        items: [
          this._getItem(1),
          this._getItem(2),
          this._getItem(3),
          this._getItem(4)
        ]
      };
      this.items = [];
    }

    _getItem(i) {
      return {key: i, val: i}
    }


    doRemove = (e, index) => {
      e.preventDefault();
      var newItems = this.state.items.concat([]);
      newItems.splice(index, 1)
      this.setState({
        items: newItems
      })
    }

    useCase1 = (e) => {
      // Setup the test
      this.setState({

      });
    }

    render() {
      return createElement('div', null, [
        createElement('ul', null, this.state.items.map((item, i) => createElement(ListItem, {key: item.key, index: i, animation: this.props.animation, onClick: this.doRemove}, `${item.val}bar (${item.key})`))),
        createElement('h2', null, 'Patching bugs'),
        createElement('p', null, this.props.description),
        createElement('button', { onClick: this.useCase1 }, 'Use case 1')
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
        createElement('ul', null, this.state.items.map((item, i) => createElement(ListItem, {key: item.key, index: i, animation: this.props.animation, onClick: this.doRemove}, `${item.val}bar (${item.key})`))),
        createElement('h2', null, 'patchKeyedChildren'),
        createElement('p', null, this.props.description),
        createElement('button', { onClick: this.doAdd }, 'Add'),
      ]);
		}
	}

	document.addEventListener('DOMContentLoaded', function () {
		var container_1 = document.querySelector('#App1');
		var container_2 = document.querySelector('#App2');
		var container_3 = document.querySelector('#App3');
		var container_4 = document.querySelector('#App4');
    var container_5 = document.querySelector('#App5');
    var container_6 = document.querySelector('#App6');


    Inferno.render(createElement(List, {
      animation: 'HeightAndFade',
      description: 'The children in this container animate opacity and height when added and removed. Click an item to remove it.',
    }), container_1);

    Inferno.render(createElement(List, {
      animation: 'NoTranistionEvent',
      description: 'The children in this container have a broken animation. This is detected by inferno-animation and the animation callback is called immediately. Click an item to remove it.',
    }), container_2);

    Inferno.render(createElement(MixedList, {
      animation: 'HeightAndFade',
      description: 'This container fades in and blocks the children from animating on first render. There is no animation on divider between elements. When you click [Remove] a random row and another random divder will be removed. Click an item to remove it (leaving the divider).',
    }), container_3);

    Inferno.render(createElement(ShuffleList, {
      animation: 'HeightAndFade',
      description: 'This container will shuffle keys or items. Click an item to remove it.',
    }), container_4);

    var btn = document.querySelector('#Rerender > button')
    btn.addEventListener('click', (e) => {
      e && e.preventDefault();
      //Inferno.render(createElement('div', null, createElement(RerenderList, {animation: 'HeightAndFade', items: 5})), container_5);
      Inferno.render(createElement(RerenderList, {
        animation: 'HeightAndFade',
        items: 5,
        description: 'This container will be filled with 5 rows every time you click the button. Click an item to remove it.',
      }), container_5);
    });

    // This currently doesn't do anything so hiding
    // Inferno.render(createElement(PatchingIssues, {
    //   animation: 'HeightAndFade',
    //   description: 'This reproduce issues with patching and deferred removal of nodes.',
    // }), container_6);
	});
})();
