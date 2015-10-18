import createMarkupForStyles from './createMarkupForStyles';
import createMarkupForProperty from './createMarkupForProperty';

export default (props) => {
    let markup = '';
    for (let name in props) {
        let value = props[name];
        if (value != null) {
            markup += (name === 'style') ? `${' ' + name}="${createMarkupForStyles(value)}"` : ' ' + createMarkupForProperty(name, value);
        }
    }

    return markup;
}