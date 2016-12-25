declare module 'inferno-test-utils' {
	type stringArr = string | string[];

	export function renderIntoDocument(element: VNode): VNode;
	export function isElement(element: VNode): boolean;
	export function isElementOfType(inst: VNode, componentClass: Function): boolean;
	export function isDOMComponent(inst: any): boolean;
	export function isDOMComponentElement(inst: VNode): boolean;
	export function isCompositeComponent(inst): boolean;
	export function isCompositeComponentWithType(inst, type: Function): boolean;
	export function findAllInRenderedTree(inst: any, test: Function): VNode[];
	export function scryRenderedDOMComponentsWithClass(root: VNode, classNames: stringArr): VNode[];
	export function scryRenderedDOMComponentsWithTag (root: VNode, tagName: string): VNode[];
	export function scryRenderedComponentsWithType (root: VNode, componentType: Function): VNode[];
	export function findRenderedDOMComponentsWithClass(root: VNode, classNames: Function): VNode;
	export function findenderedDOMComponentsWithTag(root: VNode, tagName: Function): VNode;
	export function findRenderedComponentWithType(root: VNode, componentClass: Function): VNode;
	export function mockComponent(module, mockTagName: string);

	export default {
		renderIntoDocument,
		isElement,
		isElementOfType,
		isDOMComponent,
		isDOMComponentElement,
		isCompositeComponent,
		isCompositeComponentWithType,
		findAllInRenderedTree,
		scryRenderedDOMComponentsWithClass,
		scryRenderedDOMComponentsWithTag,
		scryRenderedComponentsWithType,
		findRenderedDOMComponentsWithClass,
		findenderedDOMComponentsWithTag,
		findRenderedComponentWithType,
		mockComponent
	};
}
