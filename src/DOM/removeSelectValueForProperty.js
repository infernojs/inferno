// TODO!! Optimize!!
export default function removeSelectValueForProperty( vNode, domNode, propName ) {
	const options = domNode.options;
	const len = options.length;

	let i = 0;

	while ( i < len ) {
		options[i++].selected = false;
	}
}