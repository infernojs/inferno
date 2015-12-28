
const SVGNamespaces = {

		graph: true
};

export default function svgWhitelist(namespace ) {

	if ( namespace === 'svg' || namespace === 'circle') {
		return true;
	}
}