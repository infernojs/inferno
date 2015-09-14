import isBrowser from './isBrowser';

let isSVG;

if (isBrowser) {
	var implementation = document.implementation;
	isSVG = (
		implementation &&
		implementation.hasFeature &&
		implementation.hasFeature(
			'http://www.w3.org/TR/SVG11/feature#BasicStructure',
			'1.1'
		)
	);
}

export default isSVG;
