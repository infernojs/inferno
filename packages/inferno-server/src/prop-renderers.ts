import {isString, isStringOrNumber} from 'inferno-shared';

export function renderStylesToString(styles: string | object): string {
  if (isString(styles)) {
    return styles;
  } else {
    let renderedString = '';
    for (const styleName in styles) {
      const value = styles[styleName];

      if (isStringOrNumber(value)) {
        renderedString += `${styleName}:${value};`;
      }
    }
    return renderedString;
  }
}
