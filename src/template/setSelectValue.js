export default function(node, props) {
	let propValue = props.value;
	let selectedValue, i, l;
	let options = node.options;

	// Avoid use of 'isArray'. We know it's an array if 'multiple'
	if (props.multiple) {
		selectedValue = {};
		for (i = 0, l = propValue.length; i < l; i++) {
			selectedValue['' + propValue[i]] = true;
		}
		for (i = 0, l = options.length; i < l; i++) {
			var selected = selectedValue[options[i].value];
			if (options[i].selected !== selected) {
				options[i].selected = selected;
			}
		}
	} else {
		// Do not set `select.value` as exact behavior isn't consistent across all
		// browsers for all cases.
		selectedValue = '' + propValue;
		for (i = 0, l = options.length; i < l; i++) {
			if (options[i].value === selectedValue) {
				options[i].selected = true;
				return;
			}
		}
		if (options.length) {
			options[0].selected = true;
		}
	}
}
