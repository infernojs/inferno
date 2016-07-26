import { render, findDOMNode } from '../../../src/DOM/rendering';
import { mount } from '../../../src/DOM/mounting';
import { patch } from '../../../src/DOM/patching';
import { unmount } from '../../../src/DOM/unmounting';
import { createTemplateReducers } from '../../../src/DOM/templates';

export default {
	render,
	findDOMNode,
	mount,
	patch,
	unmount,
	createTemplateReducers
};
