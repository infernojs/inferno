import camelCasePropsToDashCase from './camelCasePropsToDashCase';
import camelize from './camelize';

export default {
    volume (node, name, value) {
        // The 'volume' attribute can only contain a number in the range 0.0 to 1.0, where 0.0 is the 
        // quietest and 1.0 the loudest. So we optimize by checking for the most obvious first...
        if (value === 0.0 || (value === 1) || (typeof value === 'number' && (value > -1 && (value < 1.1)))) {
            node.setAttribute(name, value);
        }
    },
    dataset (node, name, value) {
        for (let idx in value) {
            node.setAttribute('data-' + camelize(idx), camelCasePropsToDashCase(value[idx]));
        }
    }
};