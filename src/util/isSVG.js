import ExecutionEnvironment from './ExecutionEnvironment';

let isSVG;

if (ExecutionEnvironment.canUseDOM) {
	let { implementation } = document;
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
