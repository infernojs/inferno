import getContext  from '../core/getContext';
import removeContext from '../core/removeContext';
import unmountComponentAtNode from './unmountComponentAtNode';

export default function clearDomElement(dom) {
	let context = getContext(dom);
	//unmountComponentAtNode(dom);
	if (context != null) {
		removeContext(dom);
	}
}
