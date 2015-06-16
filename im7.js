
var im7 = (function() {
  "use strict";

  var vectorTree = {};
  var recordTree = {};

  //TODO add a DEV mode that lets the user know that they can only use im7 objects within im7 objects
  //except strings and numbers as these are already immutable. why? because im7 objects return
  //unique key (Symbol) on their toString() methods, allowing them have unique key indexes

  function getUniqueKey() {
    return Symbol();
  }

  function getRecordRootEntryPoint(rootKey) {
    var key = rootKey.toString();

    if(recordTree[key] == undefined) {
      recordTree[key] = {};
    }
    return recordTree[key];
  }

  function getVectorTreeEntry(entryPoint, key) {
    if(entryPoint === null) {
      entryPoint = vectorTree;
    }

    var id = key.toString();

    if(entryPoint[id] == undefined) {
      entryPoint[id] = {};
    }
    return entryPoint[id];
  };

  function getRecordTreeEntry(entryPoint, key, val) {
    if(entryPoint === null) {
      entryPoint = recordTree;
    }

    var id = val.toString();

    if(entryPoint[key] == undefined) {
      entryPoint[key] = {};
    }
    if(entryPoint[key][id] == undefined) {
      entryPoint[key][id] = {};
    }
    return entryPoint[key][id];
  };

  function Record(data) {
    var i = 0, key = null;

    for(key in data) {
      this[key] = data[key];
    }

    this._key = getUniqueKey();
    this._type = "Record";
  };

  Record.prototype.toString = function() {
    return this._key;
  }

  function ImmutableVector(data) {
    var i = 0,
        l = data.length;

    for(; i < l; ++i) {
      this[i] = data[i];
    }

    this.length = l;
    this._key = getUniqueKey();
    this._type = "ImmutableVector";
  }

  ImmutableVector.prototype.toString = function() {
    return this._key;
  }

  function Sequencer() {
    this._count = 0;
  }

  Sequencer.prototype.getCount = function() {
    this._count++;
    return this._count;
  }

  function getType(obj) {
    var type = typeof obj;
    if(type === "string" || type === "number") {
      return 1;
    } else if(type === "object") {
      if(obj instanceof ImmutableVector) {
        return 2;
      } else if(obj instanceof Record) {
        return 3;
      } else if(obj instanceof Array) {
        return 4;
      } else {
        return 5;
      }
    }
  }

  function ImmutableProp(store) {
    var ImmutableProp = function() {
      if (arguments.length) store = arguments[0];
      return store;
    };

    ImmutableProp.toJSON = function() {
      return store;
    };

    return ImmutableProp;
  }

  //the squencedRecords flag will ensure all child Records structures are unique by their sequence
  function im7(data, squencedRecords) {
    var type = getType(data);

    if(type === 4) {
      return im7.Vector(data, null, squencedRecords);
    } else if (type === 5) {
      return im7.Record(data, null, squencedRecords);
    } else if(type === 1) {
      return ImmutableProp(data);
    }
  };

  im7.Vector = function createVector(data, sequencerRef, squencedRecords) {
    var i = 0, l = data.length, entryPoint = null, type = 0, item = null;

    for(; i < l; i++) {
      item = data[i];
      if(item != null) {
        type = getType(item);
        //if type if 4, we need to make it a Vector
        if(type === 4) {
          item = im7.Vector(item, sequencerRef, squencedRecords);
          data[i] = item;
        }
        //if type if 5, we need to make it a Record
        else if (type === 5) {
          item = im7.Record(item, sequencerRef, squencedRecords);
          data[i] = item;
        }
        entryPoint = getVectorTreeEntry(entryPoint, item);
      }
    }

    if(entryPoint.end == undefined) {
      entryPoint.end = new ImmutableVector(data);
    }

    return entryPoint.end;
  };

  im7.Record = function createRecord(data, sequencerRef, squencedRecords) {
    var entryPoint = null, key = null, sequencer = null, type = 0, item = null, seqCount = 0, endPoint = null;

    if(squencedRecords) {
      if(sequencerRef == null) {
        sequencer = new Sequencer();
      } else {
        sequencer = sequencerRef;
      }

      seqCount = sequencer.getCount();
    }

    for(key in data) {
      item = data[key];
      if(item != null) {
        type = getType(item);
        //if type if 4, we need to make it a Vector
        if(type === 4) {
          item = im7.Vector(item, sequencer, squencedRecords);
          data[key] = item;
        }
        //if type if 5, we need to make it a Record
        else if (type === 5) {
          item = im7.Record(item, sequencer, squencedRecords);
          data[key] = item;
        }
        entryPoint = getRecordTreeEntry(entryPoint, key, item);
      }
    }

    endPoint = entryPoint[seqCount];

    if(endPoint == undefined) {
      endPoint = new Record(data);
      entryPoint[seqCount] = endPoint;
    }

    return endPoint;
  };

  return im7;

})();

if(typeof module != "undefined" && module.exports != null) {
  module.exports = im7;
}
