/* If editing these values check babel-plugin-also */
export const enum VNodeFlags {
  /* First set of bits define shape of vNode */
  Unknown = 0,
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
  Portal = 1 << 10,
  ReCreate = 1 << 11,
  ContentEditable = 1 << 12,
  Fragment = 1 << 13,
  InUse = 1 << 14,
  ForwardRef = 1 << 15,
  Normalized = 1 << 16,

  /*
   * Bits 17-21 hold the shape of the vNode's children, so a vNode has no field for it. They are the
   * ChildFlags shifted left by ChildFlagsShift, and a created vNode has exactly one of them set.
   */
  ChildFlagsShift = 17,
  HasInvalidChildren = 1 << 17,
  HasVNodeChildren = 1 << 18,
  HasNonKeyedChildren = 1 << 19,
  HasKeyedChildren = 1 << 20,
  HasTextChildren = 1 << 21,
  ChildFlagsMask = 31 << ChildFlagsShift,
  /* Development only: the keys of the vNode's children have been validated */
  Validated = 1 << 22,

  /* Masks */
  ForwardRefComponent = ForwardRef | ComponentFunction,
  FormElement = InputElement | TextareaElement | SelectElement,
  Element = HtmlElement | SvgElement | FormElement,
  Component = ComponentFunction | ComponentClass | ComponentUnknown,
  DOMRef = Element | Text | Portal,
  InUseOrNormalized = InUse | Normalized,
  ClearInUse = ~InUse,
  ClearOnClone = ~(InUse | Validated),
  MultipleChildren = HasNonKeyedChildren | HasKeyedChildren,
  ClearChildFlags = ~ChildFlagsMask,
  // A new vNode made from another vNode's flags must not take its children's shape or its validation
  ClearOnCopy = ~(ChildFlagsMask | Validated),
  // Patching ignores these bits when it compares the types of two vNodes, children change in place
  IgnoredByPatch = Normalized | ChildFlagsMask | Validated,
  ComponentKnown = ComponentFunction | ComponentClass,
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

  MultipleChildren = HasNonKeyedChildren | HasKeyedChildren,
}
