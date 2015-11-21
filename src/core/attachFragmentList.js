import attachFragment from './attachFragment';

function attachFragmentList( context, list, parentDom, component )  {
	for ( let i = 0; i < list.length; i++ ) {
		var item = list[i];
		//check this is a fragment we're dealing with
		if(item.template) {
			attachFragment( context, item, parentDom, component );
		} else {
			//otherwise it's an element, so we can simply append it
			parentDom.appendChild(item);
		}
	}
}

export default attachFragmentList;