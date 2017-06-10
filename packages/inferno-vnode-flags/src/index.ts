const enum VNodeFlags {
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

	FormElement = InputElement | TextareaElement | SelectElement,
	Element = HtmlElement | SvgElement | MediaElement | InputElement | TextareaElement | SelectElement,
	Component = ComponentFunction | ComponentClass | ComponentUnknown
}

export default VNodeFlags;
