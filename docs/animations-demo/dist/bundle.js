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

    var Component = Inferno.Component;
    var createElement = Inferno.createElement;
    var InfernoAnimation = Inferno.Animation;
    var AnimatedComponent = InfernoAnimation.AnimatedComponent;
        InfernoAnimation.componentDidAppear;
        InfernoAnimation.componentWillDisappear;
    var _InfernoAnimation$uti = InfernoAnimation.utils;
        _InfernoAnimation$uti.addClassName;
        _InfernoAnimation$uti.removeClassName;
        _InfernoAnimation$uti.forceReflow;
        _InfernoAnimation$uti.registerTransitionListener;

    var ListItem = /*#__PURE__*/function (_AnimatedComponent) {
      _inheritsLoose(ListItem, _AnimatedComponent);

      function ListItem() {
        return _AnimatedComponent.apply(this, arguments) || this;
      }

      var _proto = ListItem.prototype;

      _proto.render = function render() {
        var _this = this;
        return createElement('li', {
          className: "item",
          onClick: function onClick(e) {
            return _this.props.onClick(e, _this.props.index);
          }
        }, createElement('div', {
          className: "inner"
        }, [createElement('img', {
          width: "120px",
          height: "120px",
          src: "avatar.png"
        }), createElement('div', {
          className: "body"
        }, [createElement('h2', null, this.props.children), createElement('h3', null, "Inferno is a blazingly fast framework.")])]));
      };

      return ListItem;
    }(AnimatedComponent);

    var List = /*#__PURE__*/function (_Component) {
      _inheritsLoose(List, _Component);

      function List() {
        var _this2;

        _this2 = _Component.call(this) || this;

        _this2.doRemove = function (e, index) {
          e.preventDefault();

          var newItems = _this2.state.items.concat([]);

          newItems.splice(index, 1);

          _this2.setState({
            items: newItems
          });
        };

        _this2.doAdd = function (e) {
          e.preventDefault();

          var newItems = _this2.state.items.concat([]);

          var nextKey = newItems.length === 0 ? 0 : newItems[newItems.length - 1].key + 1;
          newItems.push({
            key: nextKey
          });

          _this2.setState({
            items: newItems
          });
        };

        _this2.renderItem = function (item, i) {
          return createElement(ListItem, {
            key: item.key,
            index: i,
            animation: _this2.props.animation,
            onClick: _this2.doRemove
          }, "This line is nice with " + (item.key + 1) + " bar");
        };

        _this2.state = {
          items: []
        };
        _this2.items = [];
        return _this2;
      }

      var _proto2 = List.prototype;

      _proto2.componentDidMount = function componentDidMount() {
        var i = 0;

        while (this.items.length < 20) {
          this.items[this.items.length] = {
            key: i++
          };
        }

        this.setState({
          items: this.items
        });
      };

      _proto2.render = function render() {
        return createElement('div', null, [createElement('ul', null, this.state.items.map(this.renderItem)), createElement('h2', null, this.props.animation), createElement('p', null, this.props.description), createElement('button', {
          onClick: this.doAdd
        }, 'Add')]);
      };

      return List;
    }(Component);

    document.addEventListener('DOMContentLoaded', function () {
      var container_1 = document.querySelector('#App1');
      Inferno.render(createElement(List, {
        animation: 'Complex',
        description: 'Each card <li> animates height and opacity on add. The image and body of each card animates using the card animation CSS-classes but with different transitions. The card inherits AnimatedComponet which is only aware of the card animation. The child animations need to be finished when the card animations are finished.'
      }), container_1);
    });
  })();

}());
