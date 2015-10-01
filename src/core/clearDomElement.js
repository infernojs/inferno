import getContext  from '../core/getContext';
import removeContext from '../core/removeContext';

export default function clearDomElement(dom) {
	let context = getContext(dom);
	if (context != null) {
		removeContext(dom);
	}
	dom.innerHTML = '';
}
