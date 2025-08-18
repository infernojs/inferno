import { createElement } from 'inferno-compat';
import { isValidElement } from 'inferno-shared';

export function create(obj) {
  const children = [];
  for (let key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      let child = [].concat(obj[key]);
      for (var i = 0; i < child.length; i++) {
        let c = child[i];
        // if non-keyed, clone attrs and inject key
        if (isValidElement(c) && !(c.props && c.props.key)) {
          let a = {};
          if (c.props) for (var j in c.props) a[j] = c.props[j];
          a.key = key + '.' + i;
          c = createElement(c.type, a, c.children);
        }
        if (c != null) children.push(c);
      }
    }
  }
  return children;
}
