import { LifecycleClass } from 'inferno-shared';
import { handleComponentInput } from '../DOM/utils';
import { InfernoInput } from './VNodes';

export interface Root {
	dom: Element | SVGAElement;
	input: InfernoInput;
	lifecycle: LifecycleClass;
}

export const options: {
	afterMount: null|Function,
	afterRender: null|Function,
	afterUpdate: null|Function,
	beforeRender: null|Function,
	beforeUnmount: null|Function
	createVNode: null|Function,
	component: {
		create: null|Function,
		handleInput: Function
		patch: null|Function
	},
	findDOMNodeEnabled: boolean,
	recyclingEnabled: boolean,
	roots: Root[]
} = {
	afterMount: null,
	afterRender: null,
	afterUpdate: null,
	beforeRender: null,
	beforeUnmount: null,
	component: {
		create: null,
		handleInput: handleComponentInput,
		patch: null
	},
	createVNode: null,
	findDOMNodeEnabled: false,
	recyclingEnabled: false,
	roots: []
};
