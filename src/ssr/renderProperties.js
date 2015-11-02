import createMarkupForStyles     from './createMarkupForStyles';
import createMarkupForProperty   from './createMarkupForProperty';
import camelCasePropsToDashCase  from '../template/camelCasePropsToDashCase';

export default (props) => {

    let ret = '';

    for (let name in props) {
        let value = props[name];

        if (name === 'dataset') {

            for (let objName in value) {
                ret += value[objName] != null && ('data-' + objName + '="' + camelCasePropsToDashCase(value[objName]) + '" ');
            }
        } else {

            if (value != null) {

                ret += (name === 'style') ? `${' ' + name}="${createMarkupForStyles(value)}"` : ' ' + createMarkupForProperty(name, value);
            }
        }
    }

    return ret;
}