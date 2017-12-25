/**
 * @module Inferno-Vnode-Flags
 */ /** TypeDoc Comment */

/* If editing these values check babel-plugin-also */
export const enum VNodeFlags {
  /* First set of bits define shape of vNode */
  HtmlElement = 1,
  ComponentUnknown = 1 << 1,
  ComponentClass = 1 << 2,
  ComponentFunction = 1 << 3,
  Text = 1 << 4,

  /* Special flags */
  SvgElement = 1 << 5,
  MediaElement = 1 << 6,
  InputElement = 1 << 7,
  TextareaElement = 1 << 8,
  SelectElement = 1 << 9,
  Void = 1 << 10,
  Portal = 1 << 11,
  ReCreate = 1 << 12,
  Ignore = 1 << 13,

  /* Masks */
  FormElement = InputElement | TextareaElement | SelectElement,
  Element = HtmlElement |
    SvgElement |
    MediaElement |
    InputElement |
    TextareaElement |
    SelectElement,
  Component = ComponentFunction | ComponentClass | ComponentUnknown,
  VNodeShape = Text | Element | ComponentFunction | ComponentClass | Void
}

export const enum ChildFlags {
  /* Second set of bits define shape of children */
  HasInvalidChildren = 1,
  HasVNodeChildren = 1 << 1,
  HasNonKeyedChildren = 1 << 2,
  HasKeyedChildren = 1 << 3,

  MultipleChildren = HasNonKeyedChildren | HasKeyedChildren
}
