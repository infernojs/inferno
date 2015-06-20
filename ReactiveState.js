var ReactiveState = (function() {
  //ReactiveState will help manage properties and data within it
  //and be able to check if its data changes and let others know of the change

  ReactiveState.State = function(value) {
    this.value = value;
  };

  function addGetterSetters(root, key) {
    Object.defineProperty(root, key, {
      get: function() {
        if(root._useStateMode === true) {
          return root._state[key];
        } else {
          return root._value[key];
        }
      },
      set: function(value) {
        root._hasChanged = true;
        root._value[key] = value;
        root._state[key].value = value;
      }
    });
  };

  function addRootChanges(root, keys) {
    //we then need to add defineProperties to each of the new ones
    for(var i = 0, l = keys.length; i < l; i++) {
      //ignore underscore values, as they are private
      if(keys[i][0] !== "_") {
        root._value[keys[i]] = root[keys[i]];
        root._state[keys[i]] = new ReactiveState.State(root[keys[i]]);
        addGetterSetters(root, keys[i]);
      }
    }
  };

  function checkForRootChanges() {
    var keys = Object.keys(this);
    //have we got the same amount of keys
    if(keys.length !== this._attrCount) {
      this._hasChanged = true;
      //then we need to see what object is new
      addRootChanges(this, keys);
      this._attrCount = keys.length;
    }
    //if its the first time doing this, don't trigger listeners
    if(keys.length === 0) {
      this._hasChanged = false;
    }
    //check every 50ms to see if we have new keys
    setTimeout(checkForRootChanges.bind(this), 50);
  };

  function triggerChanges() {
    if(this._hasChanged === true) {
      this._hasChanged = false;
      for(var i = 0, l = this._listeners.length; i < l; i++) {
        this._listeners[i]();
      }
    }
    requestAnimationFrame(triggerChanges.bind(this));
  };

  function ReactiveState() {
    //check for updates
    this._attrCount = 0;
    this._value = {};
    this._state = {};
    this._hasChanged = false;
    this._useStateMode = false;
    this._listeners = [];
    checkForRootChanges.call(this);
    triggerChanges.call(this);
  };

  ReactiveState.prototype.syncUpdate = function() {
    checkForRootChanges.call(this);
    triggerChanges.call(this);
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
