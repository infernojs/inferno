import attachFragment from './attachFragment';

function attachFragmentList( context, list, parentDom, component )  {
	for ( let i = 0; i < list.length; i++ ) {
		attachFragment( context, list[i], parentDom, component );
	}
}

export default attachFragmentList;