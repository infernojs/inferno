import getContext  from '../../universal/core/getContext';
import removeContext from '../../universal/core/removeContext';

export default function clearDomElement(dom) {
	let context = getContext(dom);
	if (context !== null) {
		removeContext(dom);
	}
	dom.innerHTML = '';
}
