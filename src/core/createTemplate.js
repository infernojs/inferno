import templateTypes from '../enum/templateTypes';

export default function createTemplate( templateFunction ) {
	//give the function a random key
	templateFunction.key = 't' + Math.floor(Math.random() * 100000);
	templateFunction.type = templateTypes.FUNCTIONAL_API;
	return templateFunction;
}
