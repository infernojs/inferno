var ReactiveState = (function() {
  //ReactiveState will help manage properties and data within it
  //and be able to check if its data changes and let others know of the change

  ReactiveState.State = function(value) {
    this.value = value;
    //if the value is not a string or number, we need to attach our own properties
    if(typeof value !== "string" && typeof value !== "number") {
      for(var key in value) {
        this[key] = value[key];
      }
    }
  };

  // function addGetterSetters(root, key) {
  //   Object.defineProperty(root, key, {
  //     get: function() {
  //       if(root._useStateMode === true) {
  //         return root._state[key];
  //       } else {
  //         return root._value[key];
  //       }
  //     },
  //     set: function(value) {
  //       root._hasChanged = true;
  //       root._value[key] = value;
  //       root._state[key].value = value;
  //     }
  //   });
  // };

  function addGetterSetters(root, value) {

    function GetterSetter(setVal) {
      if(setVal != null) {
        value = setVal;
      }
      return value;
    }

    return GetterSetter;
  }

  function generateObservables(root, data) {
    var keys = Object.keys(data);
    //we then need to add defineProperties to each of the new ones
    for(var i = 0, l = keys.length; i < l; i++) {
      //ignore underscore values, as they are private
      if(keys[i][0] !== "_") {
        //root._value[keys[i]] = root[keys[i]];
        //root._state[keys[i]] = new ReactiveState.State(root[keys[i]]);
        root[keys[i]] = addGetterSetters(root, data[keys[i]]);
      }
    }
  };

  function triggerChanges(root) {
    if(root._hasChanged === true) {
      root._hasChanged = false;
      for(var i = 0, l = root._listeners.length; i < l; i++) {
        root._listeners[i]();
      }
    }
    requestAnimationFrame(triggerChanges.bind(null, root));
  };

  function ReactiveState(data) {
    //check for updates
    this._attrCount = 0;
    this._value = {};
    //this._state = {};
    this._hasChanged = false;
    this._useStateMode = false;
    this._listeners = [];

    generateObservables(this, data);
    triggerChanges(this);
  };

  ReactiveState.prototype.toggleStateMode = function() {
    this._useStateMode = !this._useStateMode;
  };

  ReactiveState.prototype.addListener = function(callback) {
    this._listeners.push(callback);
  };

  ReactiveState.prototype.computed = function(computedFunction) {
    //faster than bind
    var self = this;
    return function() {
      var turnBackOn = false;
      var result = null;

      if(self._useStateMode === true) {
        turnBackOn = true;
        self._useStateMode = false;
      }
      result = computedFunction();
      if(turnBackOn === true) {
        self._useStateMode = true;
      }
      return result;
    }
  };

  return ReactiveState;

})();
