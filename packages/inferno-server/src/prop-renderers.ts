import { internal_isUnitlessNumber } from 'inferno';
import { isNullOrUndef, isNumber, isStringOrNumber, isTrue } from 'inferno-shared';
import { escapeText, toHyphenCase } from './utils';

export function renderStyleToString(style): string|number {
	if (isStringOrNumber(style)) {
		return style;
	} else {
		const styles: string[] = [];

		for (const styleName in style) {
			const value = style[ styleName ];
			const px = isNumber(value) && !internal_isUnitlessNumber.has(styleName) ? 'px' : '';

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
		const value = props[ propKey ];
		switch ( propKey ) {
			case 'children':
			case 'dangerouslySetInnerHTML':
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
