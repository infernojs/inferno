import { isStringOrNumber, isNullOrUndef, isNumber } from './../core/utils';
import { isUnitlessNumber } from '../DOM/constants';
import { toHyphenCase, escapeAttr } from './utils';
import { isTrue } from '../core/utils';

export function renderStyleToString(style) {
	if (isStringOrNumber(style)) {
		return style;
	} else {
		const styles = [];
		const keys = Object.keys(style);

		for (let i = 0; i < keys.length; i++) {
			const styleName = keys[i];
			const value = style[styleName];
			const px = isNumber(value) && !isUnitlessNumber[styleName] ? 'px' : '';

			if (!isNullOrUndef(value)) {
				styles.push(`${ toHyphenCase(styleName) }:${ escapeAttr(value) }${ px };`);
			}
		}
		return styles.join();
	}
}

export function renderAttributes(props){
	const outputAttrs = [];
	const propsKeys = (props && Object.keys(props)) || [];

	propsKeys.forEach((propKey, i) => {
		const value = props[propKey];
		switch (propKey) {
			case 'dangerouslySetInnerHTML' :
			case 'className' :
			case 'style' :
				return;
			default :
				if (isStringOrNumber(value)) {
					outputAttrs.push(escapeAttr(propKey) + '="' + escapeAttr(value) + '"');
				} else if (isTrue(value)) {
					outputAttrs.push(escapeAttr(propKey));
				}
		}
	});

	return outputAttrs;
}
