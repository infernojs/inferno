import destroyFragment from './destroyFragment';

export default function removeFragment(context, parentDom, item) {
	let domItem = item.dom;

	destroyFragment( context, item );
	domItem.parentNode.removeChild( domItem );
};
