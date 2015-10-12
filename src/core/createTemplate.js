import templateTypes from '../enum/templateTypes';
import uuid from '../util/uuid';

export default function createTemplate( templateFunction ) {
	//give the function a random key
	templateFunction.key = uuid();
	templateFunction.type = templateTypes.FUNCTIONAL_API;
	return templateFunction;
}
