import { VNodeFlags } from '../../types';
import { processInput } from './InputWrapper';
import { processSelect } from './SelectWrapper';
import { processTextarea } from './TextareaWrapper';

export const wrappers = new Map();

export default function processElement(flags, vNode, dom) {
	if (flags & VNodeFlags.InputElement) {
		processInput(vNode, dom);
	} else if (flags & VNodeFlags.SelectElement) {
		processSelect(vNode, dom);
	} else if (flags & VNodeFlags.TextareaElement) {
		processTextarea(vNode, dom);
	}
}
