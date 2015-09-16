'use strict';

import unitlessCfg   from './cfg/unitlessCfg';
import forIn   from '../../util/forIn';

function extendUnitlessNumber(properties){

  function prefixKey(prefix, key) {
    return prefix + key.charAt(0).toUpperCase() + key.substring(1);
  }

  var prefixes = ['Webkit', 'ms', 'Moz', 'O'];

  forIn(properties, function(prop){

    unitlessCfg[prop] = properties[prop];

    prefixes.forEach(function(prefix) {
      unitlessCfg[prefixKey(prefix, prop)] = properties[prop];
    });
  
  });

  return unitlessCfg;
}

export default extendUnitlessNumber;