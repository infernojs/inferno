import { addDOMDynamicAttributes, updateDOMDynamicAttributes, clearListeners, handleHooks } from './addAttributes';

export default function addShapeAttributes(domNode, item, dynamicAttrs, node, treeLifecycle, isSVG){
	addDOMDynamicAttributes(item, domNode, dynamicAttrs, node, 'onCreated', isSVG);
	if (dynamicAttrs.onAttached) {
		treeLifecycle.addTreeSuccessListener(() => {
			handleHooks(item, dynamicAttrs, domNode, 'onAttached');
		});
	}
}