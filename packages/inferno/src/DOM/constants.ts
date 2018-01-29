/**
 * @module Inferno
 */ /** TypeDoc Comment */

export const xlinkNS = 'http://www.w3.org/1999/xlink';
export const xmlNS = 'http://www.w3.org/XML/1998/namespace';
export const svgNS = 'http://www.w3.org/2000/svg';

export const strictProps: Record<string, number> = {
  defaultChecked: 1,
  value: 1,
  volume: 1
};

export const booleanProps: Record<string, number> = {
  allowfullscreen: 1,
  autoFocus: 1,
  autoplay: 1,
  capture: 1,
  checked: 1,
  controls: 1,
  default: 1,
  disabled: 1,
  hidden: 1,
  indeterminate: 1,
  loop: 1,
  muted: 1,
  novalidate: 1,
  open: 1,
  readOnly: 1,
  required: 1,
  reversed: 1,
  scoped: 1,
  seamless: 1,
  selected: 1
};

export const namespaces: Record<string, string> = {
  'xlink:actuate': xlinkNS,
  'xlink:arcrole': xlinkNS,
  'xlink:href': xlinkNS,
  'xlink:role': xlinkNS,
  'xlink:show': xlinkNS,
  'xlink:title': xlinkNS,
  'xlink:type': xlinkNS,
  'xml:base': xmlNS,
  'xml:lang': xmlNS,
  'xml:space': xmlNS
};

export const isUnitlessNumber: Record<string, number> = {
  animationIterationCount: 1,
  borderImageOutset: 1,
  borderImageSlice: 1,
  borderImageWidth: 1,
  boxFlex: 1,
  boxFlexGroup: 1,
  boxOrdinalGroup: 1,
  columnCount: 1,
  fillOpacity: 1,
  flex: 1,
  flexGrow: 1,
  flexNegative: 1,
  flexOrder: 1,
  flexPositive: 1,
  flexShrink: 1,
  floodOpacity: 1,
  fontWeight: 1,
  gridColumn: 1,
  gridRow: 1,
  lineClamp: 1,
  lineHeight: 1,
  opacity: 1,
  order: 1,
  orphans: 1,
  stopOpacity: 1,
  strokeDasharray: 1,
  strokeDashoffset: 1,
  strokeMiterlimit: 1,
  strokeOpacity: 1,
  strokeWidth: 1,
  tabSize: 1,
  widows: 1,
  zIndex: 1,
  zoom: 1
};

export const skipProps: Record<string, number> = {
  checked: 1,
  children: 1,
  childrenType: 1,
  className: 1,
  defaultValue: 1,
  key: 1,
  multiple: 1,
  ref: 1
};

export const delegatedEvents: Record<string, number> = {
  onClick: 1,
  onDblClick: 1,
  onFocusIn: 1,
  onFocusOut: 1,
  onKeyDown: 1,
  onKeyPress: 1,
  onKeyUp: 1,
  onMouseDown: 1,
  onMouseMove: 1,
  onMouseUp: 1,
  onSubmit: 1,
  onTouchEnd: 1,
  onTouchMove: 1,
  onTouchStart: 1
};
