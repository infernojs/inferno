import { isStringOrNumber, isNullOrUndef, isNumber, isTrue } from './../shared';
import { isUnitlessNumber } from '../DOM/constants';
import { toHyphenCase, escapeAttr } from './utils';

export function renderStyleToString(style): string {
	if (isStringOrNumber(style)) {
		return style;
	} else {
		const styles: string[] = [];
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

export function renderAttributes(props): string[] {
	const outputAttrs: string[] = [];
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
