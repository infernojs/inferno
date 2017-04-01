import { processInput } from './InputWrapper';
import { processSelect } from './SelectWrapper';
import { processTextarea } from './TextareaWrapper';
import VNodeFlags from 'inferno-vnode-flags';

/**
 * There is currently no support for switching same input between controlled and nonControlled
 * If that ever becomes a real issue, then re design controlled elements
 * Currently user must choose either controlled or non-controlled and stick with that
 */

export default function processElement(flags, vNode, dom, mounting: boolean): boolean {
	if (flags & VNodeFlags.InputElement) {
		return processInput(vNode, dom, mounting);
	}
	if (flags & VNodeFlags.SelectElement) {
		return processSelect(vNode, dom, mounting);
	}
	if (flags & VNodeFlags.TextareaElement) {
		return processTextarea(vNode, dom, mounting);
	}
	return false;
}
