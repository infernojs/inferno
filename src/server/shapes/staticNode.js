function attributes(vDom) {
	return [`data-ssr="."`].join(' ');
}

export default function createStaticNode(vDom) {
	return {
		create() {
			// TODO check for void nodes etc...
			// add attributes etc
			return {
				open: `<${vDom} ${ attributes(vDom) }>`,
				close: '</${vDom}>'
			};
		}
	};
}