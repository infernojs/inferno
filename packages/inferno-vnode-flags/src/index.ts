/* If editing these values check babel-plugin-also */
/*
 * The JSX plugins write the flags of each vNode into the compiled code as one number, and Inferno's own code
 * tests them with numbers too. The bits that compiled apps and Inferno use most have the lowest values.
 * The values changed in v10, so JSX must be compiled by the v10 plugins.
 */
export const enum VNodeFlags {
  Unknown = 0,
  HtmlElement = 1,

  /*
   * These bits hold the shape of the vNode's children, so a vNode has no field for it. A created vNode
   * has exactly one of them set. They are the ChildFlags of the same name, at other values.
   */
  HasTextChildren = 1 << 1,
  HasNonKeyedChildren = 1 << 2,
  HasVNodeChildren = 1 << 3,
  HasInvalidChildren = 1 << 4,
  HasKeyedChildren = 1 << 5,

  SvgElement = 1 << 6,
  ComponentClass = 1 << 7,
  Fragment = 1 << 8,
  InputElement = 1 << 9,
  Text = 1 << 10,
  TextareaElement = 1 << 11,
  SelectElement = 1 << 12,
  ComponentFunction = 1 << 13,
  Portal = 1 << 14,
  ForwardRef = 1 << 15,
  InUse = 1 << 16,
  ContentEditable = 1 << 17,
  /* Development only: the keys of the vNode's children have been validated */
  Validated = 1 << 18,
  Normalized = 1 << 19,

  // newComponentVNode finds out whether the type is a class, a function or a forwardRef, a vNode never keeps this
  ComponentUnknown = Unknown,

  /* Masks */
  ChildFlagsMask = HasTextChildren |
    HasNonKeyedChildren |
    HasVNodeChildren |
    HasInvalidChildren |
    HasKeyedChildren,
  ForwardRefComponent = ForwardRef | ComponentFunction,
  FormElement = InputElement | TextareaElement | SelectElement,
  Element = HtmlElement | SvgElement | FormElement,
  Component = ComponentFunction | ComponentClass,
  DOMRef = Element | Text | Portal,
  InUseOrNormalized = InUse | Normalized,
  ClearInUse = ~InUse,
  ClearOnClone = ~(InUse | Validated),
  MultipleChildren = HasNonKeyedChildren | HasKeyedChildren,
  ClearChildFlags = ~ChildFlagsMask,
  // A new vNode made from another vNode's flags must not take its children's shape, its validation or
  // the state of its mounted copy: a copy with InUse would be mounted through a clone of its own
  ClearOnCopy = ~(ChildFlagsMask | Validated | InUse | Normalized),
  // Patching ignores these bits when it compares the types of two vNodes, children change in place
  IgnoredByPatch = Normalized | ChildFlagsMask | Validated,
  ComponentKnown = ComponentFunction | ComponentClass,
}

// The shape of the children as the deprecated createVNode and createFragment take it
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
