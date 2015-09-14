import voidCfg		from './cfg/voidCfg';
import forIn		  from '../../util/forIn';
import inArray		from '../../util/inArray';
import { renderStyleToString } from './CSSOperations';
import { renderHtmlMarkup } from './DOMOperations';

let ctx = null;

function booleanAttrToString(name, value) {
	return value ? name : '';
}

/**
 * To get 'selected' and 'selected multiple' rendered correct, we need to do this
 * 'little' test. Else highlighted select values will not be rendred.
 * E.g. '<option selected value='2'></option>' will become '<option value='2'></option>'
 */

function createMarkupForSelect(tagName, value, props, prop) {

	let html = '';

	if (tagName === 'select') {

		ctx = {
			value: value,
			multiple: props.multiple
		};

	} else if (tagName === 'option') {

		if (ctx && (ctx.multiple ? inArray(ctx.value, value) : ctx.value === value)) {

			html += ' ' + booleanAttrToString('selected', true) + ' ' + prop + '=\'' + '' + value + '\'';

		} else {

			html += ' ' + prop + '=\'' + '' + value + '\'';
		}
	}
	return html;
}

function renderToString(props, tagName) {

	// Create a empty objects to avoid the same mistakes as React did
	const properties = {};

	let children = props.children || null;

	// check if we have any attrs / props
	if (props != null) {

		for (let key in props) {

			if (key === 'value') {

				if (tagName === 'textarea' || props.contenteditable) {

					// Child are a pure text string
					children = props[key];
					continue;
				}
			}
			properties[key] = props[key];
		}
	}

	let innerHTML = props && props.innerHTML,
		html = '<' + tagName;

	// try to create markup for HTML attributes and properties
	if (properties != null) {

		forIn(properties, (name, value) => {
			if (name !== 'innerHTML' && (value || (typeof value === 'number'))) {
				// Special case: 'select' and 'select multiple'
				if (name === 'value' && (tagName === 'select' || tagName === 'option')) {
					html += createMarkupForSelect(tagName, value, props, name);
				} else if (name === 'style') {
					html += ' ' + name + '=\'' + '' + renderStyleToString(value) + '\'';

					// we need to check for number values, else expected - '<a download='0'></a>' - would
					// become - '<a></a>'. And the '0' - zero - will be skipped.
				} else if (name !== 'innerHTML' && (value || (typeof value === 'number'))) {
					if (value !== 'false') {
						html += ' ' + renderHtmlMarkup(name, value);
					}
				}
			}
		});
	}

	if (voidCfg[tagName]) {

		html = html + '/>';

		// child nodes
	} else {

		html = html + '>';

		// ... child nodes
		if (children && children.length) {

			let index = 0;

			const len = children.length;

			for (; index < len; index++) {

				html += renderToString(children[index], tagName);
			}

		} else if (innerHTML) {

			html += innerHTML;
		}

		html += '</' + tagName + '>';
	}

	return html;
}

export default renderToString;
