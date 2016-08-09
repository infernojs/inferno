import {
	isStringOrNumber,
	isNullOrUndefined,
	isNumber
} from './../core/utils';
import { isUnitlessNumber } from '../DOM/utils';
import { toHyphenCase, escapeAttr } from './utils';

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

			if (!isNullOrUndefined(value)) {
				styles.push(`${ toHyphenCase(styleName) }:${ escapeAttr(value) }${ px };`);
			}
		}
		return styles.join();
	}
}

export function renderAttributes(bp, attrs){
	const outputAttrs = [];
	let attrKeys = (attrs && Object.keys(attrs)) || [];
	let html = '';

	if (bp && bp.hasAttrs === true) {
		attrKeys = bp.attrKeys ? bp.attrKeys.concat(attrKeys) : attrKeys;
	}
	attrKeys.forEach((attrsKey, i) => {
		const attr = attrKeys[i];
		const value = attrs[attr];

		if (attr === 'dangerouslySetInnerHTML') {
			return;
		} else {
			if (isStringOrNumber(value)) {
				outputAttrs.push(escapeAttr(attr) + '="' + escapeAttr(value) + '"');
			} else if (isTrue(value)) {
				outputAttrs.push(escapeAttr(attr));
			}
		}
	});

	return outputAttrs;
}
