import recycledFragments from '../vars/recycledFragments';

export default ( templateKey ) => {

	let fragments = recycledFragments[templateKey];
	if ( !fragments || fragments.length === 0 ) {

		return null;
	}
	return fragments.pop();
};
