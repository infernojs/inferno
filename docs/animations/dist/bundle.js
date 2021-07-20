(function () {
  'use strict';

  function _extends() {
    _extends = Object.assign || function (target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];

        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }

      return target;
    };

    return _extends.apply(this, arguments);
  }

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

  function _objectWithoutPropertiesLoose(source, excluded) {
    if (source == null) return {};
    var target = {};
    var sourceKeys = Object.keys(source);
    var key, i;

    for (i = 0; i < sourceKeys.length; i++) {
      key = sourceKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      target[key] = source[key];
    }

    return target;
  }

  var _excluded = ["children"],
      _excluded2 = ["children"],
      _excluded3 = ["children"];

  (function () {

    var Component = Inferno.Component;
    var createElement = Inferno.createElement;
    var InfernoAnimation = Inferno.Animation;
    var AnimatedComponent = InfernoAnimation.AnimatedComponent,
        AnimatedMoveComponent = InfernoAnimation.AnimatedMoveComponent,
        componentDidAppear = InfernoAnimation.componentDidAppear,
        componentWillDisappear = InfernoAnimation.componentWillDisappear,
        componentWillMove = InfernoAnimation.componentWillMove;
    var _InfernoAnimation$uti = InfernoAnimation.utils,
        addClassName = _InfernoAnimation$uti.addClassName,
        removeClassName = _InfernoAnimation$uti.removeClassName,
        forceReflow = _InfernoAnimation$uti.forceReflow,
        registerTransitionListener = _InfernoAnimation$uti.registerTransitionListener;
    var anim = {
      onComponentDidAppear: componentDidAppear,
      onComponentWillDisappear: componentWillDisappear
    };
    var animMove = {
      onComponentWillMove: componentWillMove
    };

    var ListItem = /*#__PURE__*/function (_AnimatedComponent) {
      _inheritsLoose(ListItem, _AnimatedComponent);

      function ListItem() {
        return _AnimatedComponent.apply(this, arguments) || this;
      }

      var _proto = ListItem.prototype;

      _proto.render = function render() {
        var _this = this;
        return createElement('li', {
          onClick: function onClick(e) {
            return _this.props.onClick(e, _this.props.index);
          }
        }, this.props.children);
      };

      return ListItem;
    }(AnimatedComponent);

    var SectionItem = /*#__PURE__*/function (_AnimatedComponent2) {
      _inheritsLoose(SectionItem, _AnimatedComponent2);

      function SectionItem() {
        return _AnimatedComponent2.apply(this, arguments) || this;
      }

      var _proto2 = SectionItem.prototype;

      _proto2.render = function render() {
        var _this2 = this;
        return createElement('section', {
          onClick: function onClick(e) {
            return _this2.props.onClick(e, _this2.props.index);
          }
        }, this.props.children);
      };

      return SectionItem;
    }(AnimatedComponent);

    var FuncListItem = function FuncListItem(_ref) {
      var children = _ref.children,
          props = _objectWithoutPropertiesLoose(_ref, _excluded);
      return createElement('li', {
        onClick: function onClick(e) {
          return props.onClick(e, props.index);
        }
      }, children);
    };

    var FuncSectionItem = function FuncSectionItem(_ref2) {
      var children = _ref2.children,
          props = _objectWithoutPropertiesLoose(_ref2, _excluded2);
      return createElement('section', {
        onClick: function onClick(e) {
          return props.onClick(e, props.index);
        }
      }, children);
    };

    var ListItemMoveAnim = /*#__PURE__*/function (_AnimatedMoveComponen) {
      _inheritsLoose(ListItemMoveAnim, _AnimatedMoveComponen);

      function ListItemMoveAnim() {
        return _AnimatedMoveComponen.apply(this, arguments) || this;
      }

      var _proto3 = ListItemMoveAnim.prototype;

      _proto3.render = function render() {
        var _this3 = this;
        return createElement('li', {
          onClick: function onClick(e) {
            return _this3.props.onClick(e, _this3.props.index);
          }
        }, this.props.children);
      };

      return ListItemMoveAnim;
    }(AnimatedMoveComponent);

    var FuncListItemMoveAnim = function FuncListItemMoveAnim(_ref3) {
      var children = _ref3.children,
          props = _objectWithoutPropertiesLoose(_ref3, _excluded3);
      return createElement('li', {
        onClick: function onClick(e) {
          return props.onClick(e, props.index);
        }
      }, children);
    };

    var List = /*#__PURE__*/function (_Component) {
      _inheritsLoose(List, _Component);

      function List() {
        var _this4;

        _this4 = _Component.call(this) || this;

        _this4.doRemove = function (e, index) {
          e.preventDefault();

          var newItems = _this4.state.items.concat([]);

          newItems.splice(index, 1);

          _this4.setState({
            items: newItems
          });
        };

        _this4.doAdd = function (e) {
          e.preventDefault();

          var newItems = _this4.state.items.concat([]);

          var nextKey = newItems.length === 0 ? 0 : newItems[newItems.length - 1].key + 1;
          newItems.push({
            key: nextKey
          });

          _this4.setState({
            items: newItems
          });
        };

        _this4.doRemove20 = function (e) {
          e.preventDefault();

          var newItems = _this4.state.items.concat([]);

          newItems.splice(newItems.length >= 20 ? newItems.length - 20 : 0, newItems.length >= 20 ? 20 : newItems.length);

          _this4.setState({
            items: newItems
          });
        };

        _this4.doAdd20 = function (e) {
          e.preventDefault();

          var newItems = _this4.state.items.concat([]);

          var nextKey = newItems.length === 0 ? 0 : newItems[newItems.length - 1].key + 1;

          for (var i = 0; i < 20; i++) {
            newItems.push({
              key: nextKey + i
            });
          }

          _this4.setState({
            items: newItems
          });
        };

        _this4.renderItem = function (item, i) {
          if (_this4.props.useFunctionalComponent) {
            return createElement(FuncListItem, _extends({
              key: item.key,
              index: i,
              animation: _this4.props.animation
            }, anim, {
              onClick: _this4.doRemove
            }), item.key + 1 + "bar");
          } else {
            return createElement(ListItem, {
              key: item.key,
              index: i,
              animation: _this4.props.animation,
              onClick: _this4.doRemove
            }, item.key + 1 + "bar");
          }
        };

        _this4.state = {
          items: []
        };
        _this4.items = [];
        return _this4;
      }

      var _proto4 = List.prototype;

      _proto4.componentDidMount = function componentDidMount() {
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

      _proto4.render = function render() {
        return createElement('div', null, [createElement('ul', null, this.state.items.map(this.renderItem)), createElement('h2', null, this.props.animation), createElement('p', null, this.props.description), createElement('button', {
          onClick: this.doAdd
        }, 'Add'), createElement('button', {
          onClick: this.doAdd20
        }, 'Add 20'), createElement('button', {
          onClick: this.doRemove20
        }, 'Remove 20')]);
      };

      return List;
    }(Component);

    var MixedList = /*#__PURE__*/function (_Component2) {
      _inheritsLoose(MixedList, _Component2);

      function MixedList() {
        var _this5;

        _this5 = _Component2.call(this) || this;

        _this5.componentDidAppear = function (dom) {
          var animCls = {
            'start': 'fade-enter',
            'active': 'fade-enter-active',
            'end': 'fade-enter-end'
          }; // 1. Set animation start state

          addClassName(dom, animCls.start);
          forceReflow(); // 2. Activate transition

          addClassName(dom, animCls.active); // 3. Set an animation listener, code at end
          // Needs to be done after activating so timeout is calculated correctly

          registerTransitionListener([dom], function () {
            // *** Cleanup ***
            // 5. Remove the element
            removeClassName(dom, animCls.active);
            removeClassName(dom, animCls.end);
          }); // 4. Activate target state

          requestAnimationFrame(function () {
            removeClassName(dom, animCls.start);
            addClassName(dom, animCls.end);
          });
        };

        _this5.componentWillDisappear = function (dom, callback) {
          var animCls = {
            'start': 'fade-leave',
            'active': 'fade-leave-active',
            'end': 'fade-leave-end'
          }; // 1. Set animation start state

          addClassName(dom, animCls.start); // 2. Activate transitions

          addClassName(dom, animCls.active); // 3. Set an animation listener, code at end
          // Needs to be done after activating so timeout is calculated correctly

          registerTransitionListener([dom], function () {
            // *** Cleanup ***
            // Simulate some work is being done
            // setTimeout(function () {
            //   callback();
            // }, 1000);
            callback();
          }); // 4. Activate target state

          requestAnimationFrame(function () {
            addClassName(dom, animCls.end);
            removeClassName(dom, animCls.start);
          });
        };

        _this5.doRemove = function (e, index) {
          e.preventDefault();

          var newItems = _this5.state.items.concat([]);

          newItems.splice(index, 1);

          _this5.setState({
            items: newItems
          });
        };

        _this5.doRemoveSpecial = function (e) {
          e.preventDefault(); // Remove random ListItem and trigger animation

          var onlyListItems = _this5.state.items.filter(function (item) {
            return item.isListItem;
          });

          var toDeleteIndex = parseInt(Math.round(Math.random() * (onlyListItems.length - 1)));
          var toDeleteKey = onlyListItems[toDeleteIndex].key;

          var newItems = _this5.state.items.filter(function (item) {
            return item.key !== toDeleteKey;
          });

          _this5.setState({
            items: newItems
          }); // Remove random divider during animation
          // NOTE! If the divider is the last element, it will cause everything to be removed,
          // thus cutting the running animation short. This is expected behaviour because we don't
          // check if the parent has an animating child. Opportunity for improvement.


          setTimeout(function () {
            var onlyDividers = _this5.state.items.filter(function (item) {
              return !item.isListItem;
            });

            var toDeleteIndex = parseInt(Math.round(Math.random() * (onlyDividers.length - 1)));
            var counter = 0;

            var newItems = _this5.state.items.filter(function (item) {
              return item.isListItem || counter++ !== toDeleteIndex;
            });

            _this5.setState({
              items: newItems
            });
          }, 100);
        };

        _this5.doAdd = function (e) {
          e.preventDefault();

          var newItems = _this5.state.items.concat([]);

          var nextKey = newItems.reduce(function (prev, curr) {
            return curr.key > prev ? curr.key : prev;
          }, 0) + 1;
          newItems.push({
            key: nextKey,
            isListItem: true
          });
          newItems.push({
            key: nextKey + 1
          });

          _this5.setState({
            items: newItems
          });
        };

        _this5.renderItem = function (item, i) {
          if (_this5.props.useFunctionalComponent) {
            return createElement(FuncSectionItem, _extends({
              key: item.key,
              index: i,
              animation: _this5.props.animation
            }, anim, {
              onClick: _this5.doRemove
            }), item.key + 1 + "bar");
          } else {
            return createElement(SectionItem, {
              key: item.key,
              index: i,
              animation: _this5.props.animation,
              onClick: _this5.doRemove
            }, item.key + 1 + "bar");
          }
        };

        var _i = 0;
        var items = [];

        while (items.length < 40) {
          items[items.length] = {
            key: _i++,
            isListItem: true
          };
          items[items.length] = {
            key: _i++
          };
        }

        _this5.state = {
          items: items
        };
        return _this5;
      }

      var _proto5 = MixedList.prototype;

      _proto5.render = function render() {
        var _this6 = this;

        // Mixing <section> and <span> instead of using <li> for all to trigger special code path in Inferno
        return createElement('div', null, [createElement('article', null, this.state.items.map(function (item, i) {
          return item.isListItem ? _this6.renderItem(item, i) : createElement('span', {
            className: 'divider'
          });
        })), createElement('h2', null, 'Mixed list'), createElement('p', null, this.props.description), createElement('button', {
          onClick: this.doAdd
        }, 'Add'), createElement('button', {
          onClick: this.doRemoveSpecial
        }, 'Remove')]);
      };

      return MixedList;
    }(Component);

    var ShuffleList = /*#__PURE__*/function (_Component3) {
      _inheritsLoose(ShuffleList, _Component3);

      function ShuffleList() {
        var _this7;

        _this7 = _Component3.call(this) || this; // set initial time:

        _this7.doRemove = function (e, index) {
          e && e.preventDefault();

          var newItems = _this7.state.items.concat([]);

          newItems.splice(index, 1);

          _this7.setState({
            items: newItems
          });
        };

        _this7.doAdd = function (e) {
          e && e.preventDefault();

          var newItems = _this7.state.items.concat([]);

          var nextKey = newItems.reduce(function (prev, curr) {
            return curr.key > prev ? curr.key : prev;
          }, 0) + 1;
          newItems.push({
            key: nextKey,
            val: nextKey
          });

          _this7.setState({
            items: newItems
          });
        };

        _this7.doMix = function (e) {
          e && e.preventDefault();

          var newItems = _this7.state.items.concat([]);

          shuffle(newItems);

          _this7.setState({
            items: newItems
          });
        };

        _this7.doReassignKeys = function (e) {
          e && e.preventDefault();

          var tmpItems = _this7.state.items.concat([]);

          shuffle(tmpItems);

          var newItems = _this7.state.items.map(function (item, index) {
            return Object.assign({}, item, {
              key: tmpItems[index].key
            });
          });

          _this7.setState({
            items: newItems
          });
        };

        _this7.doRemoveMix = function (e) {
          e && e.preventDefault();

          if (_this7.state.items.length === 0) {
            return;
          } // Remove random ListItem and trigger animation


          var toDeleteIndex = parseInt(Math.round(Math.random() * (_this7.state.items.length - 1)));
          var toDeleteKey = _this7.state.items[toDeleteIndex].key;

          var newItems = _this7.state.items.filter(function (item) {
            return item.key !== toDeleteKey;
          });

          _this7.setState({
            items: newItems,
            deleted: toDeleteKey + 1
          });

          setTimeout(function () {
            return _this7.doMix(e);
          }, 100);
        };

        _this7.removeAndShuffle = function (e) {
          e && e.preventDefault();

          for (var i = 0; i < 20; i++) {
            setTimeout(function () {
              var toDeleteIndex = parseInt(Math.round(Math.random() * (_this7.state.items.length - 1)));

              _this7.doRemove(undefined, toDeleteIndex);

              _this7.doReassignKeys();

              _this7.doMix();
            });
          }
        };

        _this7.doAdd20 = function (e) {
          e && e.preventDefault(); // Add data

          for (var i = 0; i < 20; i++) {
            _this7.doAdd();
          } // Shuffle them


          for (var _i2 = 0; _i2 < 5; _i2++) {
            _this7.doReassignKeys();

            _this7.doMix();
          }
        };

        _this7.doAdd20SeqMix = function (e) {
          e && e.preventDefault(); // Add data

          for (var i = 0; i < 20; i++) {
            _this7.doAdd();
          } // Shuffle them


          for (var _i3 = 0; _i3 < 5; _i3++) {
            setTimeout(function () {
              // this.doReassignKeys(e);
              _this7.doMix();
            }, 500 + 100 * _i3);
          }
        };

        _this7.renderItem = function (item, i) {
          if (_this7.props.useFunctionalComponent) {
            return createElement(FuncListItem, _extends({
              key: item.key,
              index: i,
              animation: _this7.props.animation
            }, anim, {
              onClick: _this7.doRemove
            }), item.val + "bar (" + item.key + ")");
          } else {
            return createElement(ListItem, {
              key: item.key,
              index: i,
              animation: _this7.props.animation,
              onClick: _this7.doRemove
            }, item.val + "bar (" + item.key + ")");
          }
        };

        _this7.state = {
          items: []
        };
        _this7.items = [];
        return _this7;
      }

      var _proto6 = ShuffleList.prototype;

      _proto6.componentDidMount = function componentDidMount() {
        var i = 0;

        while (this.items.length < 20) {
          this.items[this.items.length] = {
            key: i,
            val: i
          };
          i++;
        }

        this.setState({
          items: this.items
        });
      };

      _proto6.render = function render() {
        return createElement('div', null, [createElement('ul', null, this.state.items.map(this.renderItem)), createElement('h2', null, 'Shuffle'), createElement('p', null, this.props.description), createElement('button', {
          onClick: this.doAdd
        }, 'Add'), createElement('button', {
          onClick: this.doMix
        }, 'Shuffle'), createElement('button', {
          onClick: this.doReassignKeys
        }, 'Shuffle keys'), createElement('button', {
          onClick: this.doRemoveMix
        }, 'Remove' + (this.state.deleted ? " (" + this.state.deleted + ")" : '')), createElement('button', {
          onClick: this.doAdd20
        }, 'Add and shuffle 20'), createElement('button', {
          onClick: this.doAdd20SeqMix
        }, 'Add 20 do 5 shuffle'), createElement('button', {
          onClick: this.removeAndShuffle
        }, 'Remove and shuffle 20')]);
      };

      return ShuffleList;
    }(Component); // https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array


    var shuffle = function shuffle(array) {
      var currentIndex = array.length,
          temporaryValue,
          randomIndex; // While there remain elements to shuffle...

      while (0 !== currentIndex) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1; // And swap it with the current element.

        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
      }

      return array;
    };

    var RerenderList = /*#__PURE__*/function (_Component4) {
      _inheritsLoose(RerenderList, _Component4);

      function RerenderList() {
        var _this8;

        _this8 = _Component4.call(this) || this; // set initial time:

        _this8.doRemove = function (e, index) {
          e.preventDefault();

          var newItems = _this8.state.items.concat([]);

          newItems.splice(index, 1);

          _this8.setState({
            items: newItems
          });
        };

        _this8.doAdd = function (e) {
          e.preventDefault();

          var newItems = _this8.state.items.concat([]);

          var nextKey = newItems.reduce(function (prev, curr) {
            return curr.key > prev ? curr.key : prev;
          }, 0) + 1;
          newItems.push({
            key: nextKey,
            val: nextKey
          });

          _this8.setState({
            items: newItems
          });
        };

        _this8.renderItem = function (item, i) {
          if (_this8.props.useFunctionalComponent) {
            return createElement(FuncListItem, _extends({
              key: item.key,
              index: i,
              animation: _this8.props.animation
            }, anim, {
              onClick: _this8.doRemove
            }), item.val + "bar (" + item.key + ")");
          } else {
            return createElement(ListItem, {
              key: item.key,
              index: i,
              animation: _this8.props.animation,
              onClick: _this8.doRemove
            }, item.val + "bar (" + item.key + ")");
          }
        };

        _this8.state = {
          items: []
        };
        _this8.items = [];
        return _this8;
      }

      var _proto7 = RerenderList.prototype;

      _proto7.componentDidMount = function componentDidMount() {
        this.componentWillReceiveProps(this.props);
      };

      _proto7.componentWillReceiveProps = function componentWillReceiveProps(nextProps) {
        var i = 0;

        while (this.items.length < nextProps.items) {
          this.items[this.items.length] = {
            key: i,
            val: i
          };
          i++;
        }

        this.setState({
          items: this.items
        });
      };

      _proto7.render = function render() {
        return createElement('div', null, [createElement('ul', null, this.state.items.map(this.renderItem)), createElement('h2', null, 'patchKeyedChildren'), createElement('p', null, this.props.description), createElement('button', {
          onClick: this.doAdd
        }, 'Add')]);
      };

      return RerenderList;
    }(Component);

    var ShuffleListWithAnimation = /*#__PURE__*/function (_Component5) {
      _inheritsLoose(ShuffleListWithAnimation, _Component5);

      function ShuffleListWithAnimation() {
        var _this9;

        _this9 = _Component5.call(this) || this; // set initial time:

        _this9.doMove = function (e, index) {
          e && e.preventDefault();

          var newItems = _this9.state.items.concat([]);

          var _newItems$splice = newItems.splice(index, 1),
              tmp = _newItems$splice[0];

          newItems.splice(Math.round(Math.random() * newItems.length), 0, tmp);

          _this9.setState({
            items: newItems
          });
        };

        _this9.doAdd = function (e) {
          e && e.preventDefault();

          var newItems = _this9.state.items.concat([]);

          var nextKey = newItems.reduce(function (prev, curr) {
            return curr.key > prev ? curr.key : prev;
          }, 0) + 1;
          newItems.push({
            key: nextKey,
            val: nextKey
          });

          _this9.setState({
            items: newItems
          });
        };

        _this9.doMix = function (e) {
          e && e.preventDefault();

          var newItems = _this9.state.items.concat([]);

          shuffle(newItems); // So this is the shuffled order

          console.log('Expected order: ' + newItems.map(function (el) {
            return '(' + el.val + ')';
          }).join(','));

          _this9.setState({
            items: newItems
          }); // And this is what the DOM looks like


          setTimeout(function () {
            var res = document.querySelector('#App6 ul').textContent.match(/\(\d*\)/g);
            console.log('Actual order:   ' + res.join(','));
          }, 100);
        };

        _this9.doDoubleMix = function (e) {
          e && e.preventDefault();

          var newItems = _this9.state.items.concat([]);

          shuffle(newItems); // So this is the shuffled order

          console.log('Expected order 1: ' + newItems.map(function (el) {
            return '(' + el.val + ')';
          }).join(','));

          _this9.setState({
            items: newItems
          });

          setTimeout(function () {
            var newItems2 = newItems.concat([]);
            shuffle(newItems2);

            _this9.setState({
              items: newItems2
            });

            console.log('Expected order 2: ' + newItems2.map(function (el) {
              return '(' + el.val + ')';
            }).join(','));
          }, 1); // And this is what the DOM looks like

          setTimeout(function () {
            var res = document.querySelector('#App6 ul').textContent.match(/\(\d*\)/g);
            console.log('Actual order:     ' + res.join(','));
          }, 100);
        };

        _this9.doMoveOne = function (e) {
          e && e.preventDefault();

          var newItems = _this9.state.items.concat([]);

          newItems.push(newItems.shift());

          _this9.setState({
            items: newItems
          });
        };

        _this9.doClearMarkers = function (e) {
          e && e.preventDefault();
          var tmp = document.querySelectorAll('.debugMarker');
          tmp.forEach(function (marker) {
            marker.parentNode.removeChild(marker);
          });
        };

        _this9.renderItem = function (item, i) {
          if (_this9.props.useFunctionalComponent) {
            return createElement(FuncListItemMoveAnim, _extends({
              key: item.key,
              index: i,
              animation: _this9.props.animation
            }, animMove, {
              onClick: _this9.doMove
            }), item.val + "bar (" + item.key + ")");
          } else {
            return createElement(ListItemMoveAnim, {
              key: item.key,
              index: i,
              animation: _this9.props.animation,
              onClick: _this9.doMove
            }, item.val + "bar (" + item.key + ")");
          }
        };

        _this9.state = {
          items: []
        };
        _this9.items = [];
        return _this9;
      }

      var _proto8 = ShuffleListWithAnimation.prototype;

      _proto8.componentDidMount = function componentDidMount() {
        var i = 0;

        while (this.items.length < 5) {
          this.items[this.items.length] = {
            key: i,
            val: i
          };
          i++;
        }

        this.setState({
          items: this.items
        });
      };

      _proto8.render = function render() {
        return createElement('div', null, [createElement('ul', null, this.state.items.map(this.renderItem)), createElement('h2', null, 'Shuffle w. Anim'), createElement('p', null, this.props.description), createElement('button', {
          onClick: this.doAdd
        }, 'Add'), createElement('button', {
          onClick: this.doMix
        }, 'Shuffle'), createElement('button', {
          onClick: this.doDoubleMix
        }, 'DoubleShuffle'), createElement('button', {
          onClick: this.doMoveOne
        }, 'Move 1'), createElement('button', {
          onClick: this.doRemoveMix
        }, 'Remove' + (this.state.deleted ? " (" + this.state.deleted + ")" : '')), createElement('button', {
          onClick: this.doClearMarkers
        }, 'Clear debug markers')]);
      };

      return ShuffleListWithAnimation;
    }(Component);

    document.addEventListener('DOMContentLoaded', function () {
      var container_1 = document.querySelector('#App1');
      var container_2 = document.querySelector('#App2');
      var container_3 = document.querySelector('#App3');
      var container_4 = document.querySelector('#App4');
      var container_5 = document.querySelector('#App5');
      var container_6 = document.querySelector('#App6');
      var useFunctionalComponent = location.search === '?functional';
      Inferno.render(createElement(List, {
        useFunctionalComponent: useFunctionalComponent,
        animation: 'HeightAndFade',
        description: 'The children in this container animate opacity and height when added and removed. Click an item to remove it.'
      }), container_1);
      Inferno.render(createElement(List, {
        useFunctionalComponent: useFunctionalComponent,
        animation: 'NoTranistionEvent',
        description: 'The children in this container have a broken animation. This is detected by inferno-animation and the animation callback is called immediately. Click an item to remove it.'
      }), container_2);
      Inferno.render(createElement(MixedList, {
        useFunctionalComponent: useFunctionalComponent,
        animation: 'HeightAndFade',
        description: 'This container fades in and blocks the children from animating on first render. There is no animation on divider between elements. When you click [Remove] a random row and another random divder will be removed. Click an item to remove it (leaving the divider).'
      }), container_3);
      Inferno.render(createElement(ShuffleList, {
        useFunctionalComponent: useFunctionalComponent,
        animation: 'HeightAndFade',
        description: 'This container will shuffle keys or items. Click an item to remove it.'
      }), container_4);
      var btn = document.querySelector('#Rerender > button');
      btn.addEventListener('click', function (e) {
        e && e.preventDefault(); //Inferno.render(createElement('div', null, createElement(RerenderList, {animation: 'HeightAndFade', items: 5})), container_5);

        Inferno.render(createElement(RerenderList, {
          useFunctionalComponent: useFunctionalComponent,
          animation: 'HeightAndFade',
          items: 5,
          description: 'This container will be filled with 5 rows every time you click the button. Click an item to remove it.'
        }), container_5);
      });
      Inferno.render(createElement(ShuffleListWithAnimation, {
        useFunctionalComponent: useFunctionalComponent,
        animation: 'MoveAnim',
        description: 'This container will animate items on shuffle. Click an item to randomly move it.'
      }), container_6);
    });
  })();

}());
