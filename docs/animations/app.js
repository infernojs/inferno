(function() {
	"use strict";
	var Component = Inferno.Component;
	var createElement = Inferno.createElement;
  var InfernoAnimation = Inferno.Animation;

  var {
    AnimatedComponent,
    componentDidAppear,
    componentWillDisappear
  } = InfernoAnimation;
  
  var {
    addClassName,
    removeClassName,
    forceReflow,
    registerTransitionListener,
  } = InfernoAnimation.utils;

	let renderCounter = 0;

  const anim = {
    onComponentDidAppear: componentDidAppear,
    onComponentWillDisappear: componentWillDisappear
  }

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

  const FuncListItem = ({children, ...props}) => {
    renderCounter++;
    return createElement('li', { onClick: (e) => props.onClick(e, props.index)}, children);
  }

  const FuncSectionItem = ({children, ...props}) => {
    renderCounter++;
    return createElement('section', { onClick: (e) => props.onClick(e, props.index)}, children);
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

    renderItem = (item, i) => {
      if (this.props.useFunctionalComponent) {
        return createElement(FuncListItem, {key: item.key, index: i, animation: this.props.animation, ...anim, onClick: this.doRemove}, `${item.key + 1}bar`);
      }
      else {
        return createElement(ListItem, {key: item.key, index: i, animation: this.props.animation, onClick: this.doRemove}, `${item.key + 1}bar`)
      }
    }

		render() {
			return createElement('div', null, [
        createElement('ul', null, this.state.items.map(this.renderItem)),
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

    componentDidAppear = (dom) => {
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
      registerTransitionListener([dom], function () {
        // *** Cleanup ***
        // 5. Remove the element
        removeClassName(dom, animCls.active)
        removeClassName(dom, animCls.end)
      })

      // 4. Activate target state
      requestAnimationFrame(() => {
        removeClassName(dom, animCls.start)
        addClassName(dom, animCls.end)
      })
    }

    componentWillDisappear = (dom, callback) => {
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
      registerTransitionListener([dom], function () {
        // *** Cleanup ***

        // Simulate some work is being done
        // setTimeout(function () {
        //   callback();
        // }, 1000);
        callback();
      })

      // 4. Activate target state
      requestAnimationFrame(() => {
        addClassName(dom, animCls.end)
        removeClassName(dom, animCls.start)
      })
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
      // NOTE! If the divider is the last element, it will cause everything to be removed,
      // thus cutting the running animation short. This is expected behaviour because we don't
      // check if the parent has an animating child. Opportunity for improvement.
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

    renderItem = (item, i) => {
      if (this.props.useFunctionalComponent) {
        return createElement(FuncSectionItem, {key: item.key, index: i, animation: this.props.animation, ...anim, onClick: this.doRemove}, `${item.key + 1}bar`)
      }
      else {
        return createElement(SectionItem, {key: item.key, index: i, animation: this.props.animation, onClick: this.doRemove}, `${item.key + 1}bar`)
      }

    }

		render() {
      // Mixing <section> and <span> instead of using <li> for all to trigger special code path in Inferno
			return createElement('div', null, [
        createElement('article', null, this.state.items.map((item, i) => (item.isListItem
          ? this.renderItem(item, i)
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

    renderItem = (item, i) => {
      if (this.props.useFunctionalComponent) {
        return createElement(FuncListItem, {key: item.key, index: i, animation: this.props.animation, ...anim, onClick: this.doRemove}, `${item.val}bar (${item.key})`);
      }
      else {
        return createElement(ListItem, {key: item.key, index: i, animation: this.props.animation, onClick: this.doRemove}, `${item.val}bar (${item.key})`);
      }
    }

		render() {
			return createElement('div', null, [
        createElement('ul', null, this.state.items.map(this.renderItem)),
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

    renderItem = (item, i) => {
      if (this.props.useFunctionalComponent) {
        return createElement(FuncListItem, {key: item.key, index: i, animation: this.props.animation, ...anim, onClick: this.doRemove}, `${item.val}bar (${item.key})`);
      }
      else {
        return createElement(ListItem, {key: item.key, index: i, animation: this.props.animation, onClick: this.doRemove}, `${item.val}bar (${item.key})`);
      }
    }

		render() {
			return createElement('div', null, [
        createElement('ul', null, this.state.items.map(this.renderItem)),
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

    var useFunctionalComponent = location.search === '?functional'

    Inferno.render(createElement(List, {
      useFunctionalComponent,
      animation: 'HeightAndFade',
      description: 'The children in this container animate opacity and height when added and removed. Click an item to remove it.',
    }), container_1);

    Inferno.render(createElement(List, {
      useFunctionalComponent,
      animation: 'NoTranistionEvent',
      description: 'The children in this container have a broken animation. This is detected by inferno-animation and the animation callback is called immediately. Click an item to remove it.',
    }), container_2);

    Inferno.render(createElement(MixedList, {
      useFunctionalComponent,
      animation: 'HeightAndFade',
      description: 'This container fades in and blocks the children from animating on first render. There is no animation on divider between elements. When you click [Remove] a random row and another random divder will be removed. Click an item to remove it (leaving the divider).',
    }), container_3);

    Inferno.render(createElement(ShuffleList, {
      useFunctionalComponent,
      animation: 'HeightAndFade',
      description: 'This container will shuffle keys or items. Click an item to remove it.',
    }), container_4);

    var btn = document.querySelector('#Rerender > button')
    btn.addEventListener('click', (e) => {
      e && e.preventDefault();
      //Inferno.render(createElement('div', null, createElement(RerenderList, {animation: 'HeightAndFade', items: 5})), container_5);
      Inferno.render(createElement(RerenderList, {
        useFunctionalComponent,
        animation: 'HeightAndFade',
        items: 5,
        description: 'This container will be filled with 5 rows every time you click the button. Click an item to remove it.',
      }), container_5);
    });
	});
})();
