"use strict";

// TODO! Finish this

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Component = (function () {
    function Component(props) {
        _classCallCheck(this, Component);

        this.props = props;
        this.state = {};
    }

    _createClass(Component, [{
        key: "render",
        value: function render() {}
    }, {
        key: "forceUpdate",
        value: function forceUpdate() {}
    }, {
        key: "setState",
        value: function setState(newStateItems) {
            for (var stateItem in newStateItems) {
                this.state[stateItem] = newStateItems[stateItem];
            }
            this.forceUpdate();
        }
    }, {
        key: "replaceState",
        value: function replaceState(newState) {
            this.state = newSate;
            this.forceUpdate();
        }
    }, {
        key: "componentDidMount",
        value: function componentDidMount() {}
    }, {
        key: "componentWillMount",
        value: function componentWillMount() {}
    }, {
        key: "componentWillUnmount",
        value: function componentWillUnmount() {}
    }]);

    return Component;
})();

exports["default"] = Component;
module.exports = exports["default"];