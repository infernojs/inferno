(function () {
  'use strict';

  function _inheritsLoose(subClass, superClass) {
    subClass.prototype = Object.create(superClass.prototype);
    subClass.prototype.constructor = subClass;

    _setPrototypeOf(subClass, superClass);
  }

  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };

    return _setPrototypeOf(o, p);
  }

  (function () {
    // https://jsfiddle.net/oLwa7ysr/

    /* (flags, type, props, children, key, ref, noNormalise) */

    Inferno.createVNode;
    var Component = Inferno.Component;
    var createElement = Inferno.createElement;
    var renderCounter = 0;

    var ListItem = /*#__PURE__*/function (_Component) {
      _inheritsLoose(ListItem, _Component);

      function ListItem() {
        return _Component.apply(this, arguments) || this;
      }

      var _proto = ListItem.prototype;

      _proto.render = function render() {
        renderCounter++;
        return createElement('li', null, this.props.children);
      };

      return ListItem;
    }(Component);

    var List = /*#__PURE__*/function (_Component2) {
      _inheritsLoose(List, _Component2);

      function List() {
        var _this;

        _this = _Component2.call(this) || this; // set initial time:

        _this.state = {
          items: []
        };
        _this.items = [];
        return _this;
      }

      var _proto2 = List.prototype;

      _proto2.componentDidMount = function componentDidMount() {
        var i = 0;

        while (this.items.length < 2000) {
          this.items[this.items.length] = createElement(ListItem, {
            key: ++i
          }, this.items.length + "bar");
          this.setState({
            items: this.items
          });
        }
      };

      _proto2.render = function render() {
        return createElement('ul', null, this.state.items);
      };

      return List;
    }(Component);

    document.addEventListener('DOMContentLoaded', function () {
      var container = document.querySelector('#App');
      var count = 2;
      var totalTime = 0;

      for (var i = 0; i < count; i++) {
        Inferno.render(createElement(List), container);
      }

      setTimeout(function () {
        Inferno.render(createElement('div', null, "\n\t\t\t\tRounds: " + count + ",\n\t\t\t\tAverage: " + totalTime / count + ",\n\t\t\t\tTotal: " + totalTime + ",\n\t\t\t\tcounter: " + renderCounter + "\n\t\t\t"), container);
      }, 5000);
    });
  })();

}());
