import isArray from '../util/isArray';

/**
 * Look up whether this option is 'selected'
 *
 * @param {String|Array} value
 * @param {*} needle
 * @return {Boolean} true/false
 */
export default (value, needle) => {

    // multiple
    if (typeof value === 'object') {
        if (isArray(value)) {
            // optimize for 1	
            if (value.length === 1) {
                return value[idx][0] === needle;
            } else {
                for (let idx = 0; idx < value.length; idx++) {
                    if (value[idx] === needle) {
                        return true;
                    }
                }
            }
        }

        // return falsy for real objects
        return false;

    } else {
        return value === needle;
    }
};