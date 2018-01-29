/**
 * @module Inferno-Server
 */ /** TypeDoc Comment */

import { isUnitlessNumber } from 'inferno';
import { isNumber, isString } from 'inferno-shared';
import { getCssPropertyName } from './utils';

export function renderStylesToString(styles: string | object): string {
  if (isString(styles)) {
    return styles;
  } else {
    let renderedString = '';
    for (const styleName in styles) {
      const value = styles[styleName];

      if (isString(value)) {
        renderedString += `${getCssPropertyName(styleName)}${value};`;
      } else if (isNumber(value)) {
        renderedString += `${getCssPropertyName(styleName)}${value}${isUnitlessNumber[styleName] ? '' : 'px'};`;
      }
    }
    return renderedString;
  }
}
