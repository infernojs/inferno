'use strict';

import unitlessCfg from './cfg/unitlessCfg';
import prefixes    from './prefixes';
import prefixKey   from './prefixKey';
import forIn       from '../../util/forIn';

function extendUnitlessNumber(properties) {

  forIn(properties, function(prop){

    unitlessCfg[prop] = properties[prop];

    prefixes.forEach(function(prefix) {
      unitlessCfg[prefixKey(prefix, prop)] = properties[prop];
    });
  
  });

  return unitlessCfg;
}

export default extendUnitlessNumber;