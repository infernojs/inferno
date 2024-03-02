import { isString, isStringOrNumber } from 'inferno-shared';

function parseStyleAsString(styles: string | object): string {
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

export function renderStyleAttribute(styles: string | object): string {
  const stylesString = parseStyleAsString(styles);

  if (stylesString) {
    return ` style="${stylesString}"`;
  }

  return '';
}
