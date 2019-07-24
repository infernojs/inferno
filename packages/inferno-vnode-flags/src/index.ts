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
  InputElement = 1 << 6,
  TextareaElement = 1 << 7,
  SelectElement = 1 << 8,
  Void = 1 << 9,
  Portal = 1 << 10,
  ReCreate = 1 << 11,
  ContentEditable = 1 << 12,
  Fragment = 1 << 13,
  InUse = 1 << 14,
  ForwardRef = 1 << 15,
  Normalized = 1 << 16,

  /* Masks */
  ForwardRefComponent = ForwardRef | ComponentFunction,
  FormElement = InputElement | TextareaElement | SelectElement,
  Element = HtmlElement | SvgElement | FormElement,
  Component = ComponentFunction | ComponentClass | ComponentUnknown,
  DOMRef = Element | Text | Void | Portal,
  InUseOrNormalized = InUse | Normalized,
  ClearInUse = ~InUse,
  ComponentKnown = ComponentFunction | ComponentClass
}

// Combinations are not possible, its bitwise only to reduce vNode size
export const enum ChildFlags {
  UnknownChildren = 0, // When zero is passed children will be normalized
  /* Second set of bits define shape of children */
  HasInvalidChildren = 1,
  HasVNodeChildren = 1 << 1,
  HasNonKeyedChildren = 1 << 2,
  HasKeyedChildren = 1 << 3,
  HasTextChildren = 1 << 4,

  MultipleChildren = HasNonKeyedChildren | HasKeyedChildren
}
