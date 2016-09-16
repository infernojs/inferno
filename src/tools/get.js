import { isNullOrUndef } from './../core/utils';

let rreturn = /\r/g,
	each = (collection, cb) => {
		const arr = collection || [];
		const length = arr.length;
		let index = -1;

		while (++index < length) {
			cb(arr[index], index, arr);
		}
		return arr;
	};

export default function (node) {
	const type = isNullOrUndef(node.getAttribute('type')) ? node.nodeName.toLowerCase() : node.getAttribute('type');
	if (arguments.length === 1) {
		if (type === 'checkbox' || type === 'radio') {
			if (!node.checked) {
				return false;
			}

			const val = node.getAttribute('value');
			return isNullOrUndef(val) ? true : val;
		} else if (type === 'select') {
			if (node.multiple) {
				const result = [];

				each(node.options, option => {
					// Don't return options that are disabled or in a disabled optgroup
					if (option.selected &&
						option.getAttribute('disabled') === null &&
						(!option.parentNode.disabled || option.parentNode.nodeName !== 'OPTGROUP')) {
						result.push(option.value || option.text);
					}
				});

				return result;
			}
			return ~node.selectedIndex ? node.options[node.selectedIndex].value : '';
		}
	}

	const ret = node.value;
	return typeof ret === 'string' ?
		// Handle most common string cases
		ret.replace(rreturn, '') :
		// Handle cases where value is null/undef or number
		isNullOrUndef(ret) ? '' : ret;
}
