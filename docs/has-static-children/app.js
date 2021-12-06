(function () {
  'use strict';
  var Component = Inferno.Component;
  var createElement = Inferno.createElement;
  var VNodeFlags = Inferno.VNodeFlags;
  var ChildFlags = Inferno.ChildFlags;
  var createVNode = Inferno.createVNode;

  // https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
  var shuffle = (array) => {
    var currentIndex = array.length,
      temporaryValue,
      randomIndex;

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
  };

  let renderCounter = 0;

  class ListItem extends Component {
    render() {
      renderCounter++;
      return createVNode(
        VNodeFlags.HtmlElement,
        'li',
        'item',
        createElement('div', { className: 'inner' }, [
          createElement('img', {
            width: '20px',
            height: '10px',
            src: 'avatar.png',
          }),
          createElement('div', { className: 'body' }, [
            createElement('h2', null, this.props.children),
            createElement('h3', null, 'Inferno is a blazingly fast framework.'),
          ]),
        ]),
        ChildFlags.HasStaticChildren,
        // ChildFlags.UnknownChildren,
        { onClick: (e) => this.props.onClick(e, this.props.index) }
      );
    }
  }

  class List extends Component {
    constructor() {
      super();

      this.state = {
        items: [],
      };
      this.items = [];
    }

    doRemove = (e, index) => {
      e.preventDefault();
      var newItems = this.state.items.concat([]);
      newItems.splice(index, 1);
      this.setState({
        items: newItems,
      });
    };

    doAdd = (e) => {
      e.preventDefault();
      var newItems = this.state.items.concat([]);
      var nextKey =
        newItems.length === 0
          ? 0
          : newItems.reduce((val, curr) => (curr.key > val ? curr.key : val), 0) + 1;
      newItems.push({ key: nextKey });
      this.setState({
        items: newItems,
      });
    };

    doShuffle = (e) => {
      e && e.preventDefault();
      var newItems = this.state.items.concat([]);
      shuffle(newItems);
      this.setState({
        items: newItems,
      });
    };

    doTimed = (e) => {
      e && e.preventDefault();
      const t0 = performance.now();
      for (let i = 0; i < 1000; i++) {
        var newItems = this.state.items.concat([]);
        shuffle(newItems);
        this.setState({
          items: newItems,
        });
      }
      const t1 = performance.now();
      console.log(`${t1 - t0}`);
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
        { key: item.key, index: i, onClick: this.doRemove },
        `This line is nice with ${item.key + 1} bar`
      );
    };

    render() {
      return createElement('div', null, [
        createElement('ul', null, this.state.items.map(this.renderItem)),
        createElement('h2', null),
        createElement('p', null, this.props.description),
        createElement('button', { onClick: this.doAdd }, 'Add'),
        createElement('button', { onClick: this.doShuffle }, 'Shuffle'),
        createElement('button', { onClick: this.doTimed }, 'Timed'),
      ]);
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    var container_1 = document.querySelector('#App1');

    Inferno.render(
      createElement(List, {
        description:
          'Each card is marked with $HasStaticChildren and this should cut short the patching at the parent.',
      }),
      container_1
    );
  });
})();
