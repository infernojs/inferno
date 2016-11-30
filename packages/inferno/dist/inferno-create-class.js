/*!
 * inferno-create-class v1.0.0-beta21
 * (c) 2016 Dominic Gannaway
 * Released under the MIT License.
 */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('./inferno-component')) :
    typeof define === 'function' && define.amd ? define(['inferno-component'], factory) :
    (global.Inferno = global.Inferno || {}, global.Inferno.createClass = factory(global.Inferno.Component));
}(this, (function (Component) { 'use strict';

Component = 'default' in Component ? Component['default'] : Component;

var ERROR_MSG = 'a runtime error occured! Use Inferno in development environment to find the error.';


// this is MUCH faster than .constructor === Array and instanceof Array
// in Node 7 and the later versions of V8, slower in older versions though



function isNullOrUndef(obj) {
    return isUndefined(obj) || isNull(obj);
}

function isFunction(obj) {
    return typeof obj === 'function';
}



function isNull(obj) {
    return obj === null;
}

function isUndefined(obj) {
    return obj === undefined;
}

// don't autobind these methods since they already have guaranteed context.
var AUTOBIND_BLACKLIST = {
    constructor: 1,
    render: 1,
    shouldComponentUpdate: 1,
    componentWillRecieveProps: 1,
    componentWillUpdate: 1,
    componentDidUpdate: 1,
    componentWillMount: 1,
    componentDidMount: 1,
    componentWillUnmount: 1,
    componentDidUnmount: 1
};
function extend(base, props, all) {
    for (var key in props) {
        if (all === true || !isNullOrUndef(props[key])) {
            base[key] = props[key];
        }
    }
    return base;
}
function bindAll(ctx) {
    for (var i in ctx) {
        var v = ctx[i];
        if (typeof v === 'function' && !v.__bound && !AUTOBIND_BLACKLIST[i]) {
            (ctx[i] = v.bind(ctx)).__bound = true;
        }
    }
}
function collateMixins(mixins) {
    var keyed = {};
    for (var i = 0; i < mixins.length; i++) {
        var mixin = mixins[i];
        for (var key in mixin) {
            if (mixin.hasOwnProperty(key) && typeof mixin[key] === 'function') {
                (keyed[key] || (keyed[key] = [])).push(mixin[key]);
            }
        }
    }
    return keyed;
}
function applyMixin(key, inst, mixin) {
    var original = inst[key];
    inst[key] = function () {
        var arguments$1 = arguments;

        var ret;
        for (var i = 0; i < mixin.length; i++) {
            var method = mixin[i];
            var _ret = method.apply(inst, arguments$1);
            if (!isUndefined(_ret)) {
                ret = _ret;
            }
        }
        if (original) {
            var _ret$1 = original.call(inst);
            if (!isUndefined(_ret$1)) {
                ret = _ret$1;
            }
        }
        return ret;
    };
}
function applyMixins(inst, mixins) {
    for (var key in mixins) {
        if (mixins.hasOwnProperty(key)) {
            var mixin = mixins[key];
            if (isFunction(mixin[0])) {
                applyMixin(key, inst, mixin);
            }
            else {
                inst[key] = mixin;
            }
        }
    }
}
function createClass$1(obj) {
    var Cl = (function (Component$$1) {
        function Cl(props) {
            Component$$1.call(this, props);
            this.isMounted = function () { return !this._unmounted; };
            extend(this, obj);
            if (Cl.mixins) {
                applyMixins(this, Cl.mixins);
            }
            bindAll(this);
            if (obj.getInitialState) {
                this.state = obj.getInitialState.call(this);
            }
        }

        if ( Component$$1 ) Cl.__proto__ = Component$$1;
        Cl.prototype = Object.create( Component$$1 && Component$$1.prototype );
        Cl.prototype.constructor = Cl;

        return Cl;
    }(Component));
    Cl.displayName = obj.displayName || 'Component';
    Cl.propTypes = obj.propTypes;
    Cl.defaultProps = obj.getDefaultProps ? obj.getDefaultProps() : undefined;
    Cl.mixins = obj.mixins && collateMixins(obj.mixins);
    
    if (obj.statics) {
        extend(Cl, obj.statics);
    }
    return Cl;
}

return createClass$1;

})));
