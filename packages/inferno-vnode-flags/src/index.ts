/* If editing these values check babel-plugin-also */
/*
 * The JSX plugins write the flags of each vNode into the compiled code as one number, so the bits they
 * emit most have the lowest values. The bits of elements keep their v9 values, which code compiled by
 * older plugins passes to the deprecated factories.
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

  SvgElement = 1 << 5,
  InputElement = 1 << 6,
  TextareaElement = 1 << 7,
  SelectElement = 1 << 8,
  HasKeyedChildren = 1 << 9,
  ComponentClass = 1 << 10,
  ReCreate = 1 << 11,
  ContentEditable = 1 << 12,
  Fragment = 1 << 13,

  /* The JSX plugins do not emit these, Inferno sets them */
  ComponentFunction = 1 << 14,
  Text = 1 << 15,
  InUse = 1 << 16,
  Normalized = 1 << 17,
  ForwardRef = 1 << 18,
  Portal = 1 << 19,
  /* Development only: the keys of the vNode's children have been validated */
  Validated = 1 << 20,

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
