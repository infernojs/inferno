namespace Inferno {
  declare const enum VNodeFlags {
    Text = 1,
    HtmlElement = 1 << 1,

    ComponentClass = 1 << 2,
    ComponentFunction = 1 << 3,
    ComponentUnknown = 1 << 4,

    HasKeyedChildren = 1 << 5,
    HasNonKeyedChildren = 1 << 6,

    SvgElement = 1 << 7,
    MediaElement = 1 << 8,
    InputElement = 1 << 9,
    TextareaElement = 1 << 10,
    SelectElement = 1 << 11,
    Void = 1 << 12,
    Element = HtmlElement | SvgElement | MediaElement | InputElement | TextareaElement | SelectElement,
    Component = ComponentFunction | ComponentClass | ComponentUnknown
  }
}

declare module 'inferno-vnode-flags' {
  export default {
    Text: Inferno.Text,
    HtmlElement: Inferno.HtmlElement,

    ComponentClass: Inferno.ComponentClass,
    ComponentFunction: Inferno.ComponentFunction,
    ComponentUnknown: Inferno.ComponentUnknown,

    HasKeyedChildren: Inferno.HasKeyedChildren,
    HasNonKeyedChildren: Inferno.HasNonKeyedChildren,

    SvgElement: Inferno.SvgElement,
    MediaElement: Inferno.MediaElement,
    InputElement: Inferno.InputElement,
    TextareaElement: Inferno.TextareaElement,
    SelectElement: Inferno.SelectElement,
    Void: Inferno.Void,
    Element: Inferno.Element,
  };
}
