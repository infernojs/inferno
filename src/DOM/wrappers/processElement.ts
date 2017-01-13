import { processInput } from './InputWrapper';
import { processSelect } from './SelectWrapper';
import { processTextarea } from './TextareaWrapper';

export const wrappers = new Map();

export default function processElement(flags, vNode, dom): boolean {
	if (flags & VNodeFlags.InputElement) {
		return processInput(vNode, dom);
	}
	if (flags & VNodeFlags.SelectElement) {
		return processSelect(vNode, dom);
	}
	if (flags & VNodeFlags.TextareaElement) {
		return processTextarea(vNode, dom);
	}
	return false;
}
