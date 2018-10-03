export function getNumberStyleValue(style: string, value: number) {
  switch (style) {
    case 'animation-iteration-count':
    case 'border-image-outset':
    case 'border-image-slice':
    case 'border-image-width':
    case 'box-flex':
    case 'box-flex-group':
    case 'box-ordinal-group':
    case 'column-count':
    case 'fill-opacity':
    case 'flex':
    case 'flex-grow':
    case 'flex-negative':
    case 'flex-order':
    case 'flex-positive':
    case 'flex-shrink':
    case 'flood-opacity':
    case 'font-weight':
    case 'grid-column':
    case 'grid-row':
    case 'line-clamp':
    case 'line-height':
    case 'opacity':
    case 'order':
    case 'orphans':
    case 'stop-opacity':
    case 'stroke-dasharray':
    case 'stroke-dashoffset':
    case 'stroke-miterlimit':
    case 'stroke-opacity':
    case 'stroke-width':
    case 'tab-size':
    case 'widows':
    case 'z-index':
    case 'zoom':
      return value;
    default:
      return value + 'px';
  }
}

const uppercasePattern = /[A-Z]/g;

export function hyphenCase(str) {
  return str.replace(uppercasePattern, '-$&').toLowerCase();
}
