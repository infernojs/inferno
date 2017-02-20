import {
	isNullOrUndef,
	isNumber,
	isStringOrNumber,
	isTrue
} from 'inferno-shared';
import {
	escapeText,
	toHyphenCase
} from './utils';

import { internal_isUnitlessNumber } from 'inferno';

export function renderStyleToString(style): string {
	if (isStringOrNumber(style)) {
		return style;
	} else {
		const styles: string[] = [];

		for (let styleName in style) {
			const value = style[styleName];
			const px = isNumber(value) && !internal_isUnitlessNumber[styleName] ? 'px' : '';

			if (!isNullOrUndef(value)) {
				styles.push(`${ toHyphenCase(styleName) }:${ escapeText(value) }${ px };`);
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
			case 'dangerouslySetInnerHTML':
			case 'className':
			case 'style':
				return;
			default:
				if (isStringOrNumber(value)) {
					outputAttrs.push(escapeText(propKey) + '="' + escapeText(value) + '"');
				} else if (isTrue(value)) {
					outputAttrs.push(escapeText(propKey));
				}
		}
	});

	return outputAttrs;
}
