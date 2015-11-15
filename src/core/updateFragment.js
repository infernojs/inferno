import removeFragment             from './removeFragment';
import attachFragment             from './attachFragment';
import updateFragmentValue        from './updateFragmentValue';
import updateFragmentValues       from './updateFragmentValues';
import unmountComponentAtFragment from './unmountComponentAtFragment';

function updateFragment( context, oldFragment, fragment, parent, component ) {
	if ( fragment == null ) {
		removeFragment( context, parent, oldFragment );
		return;
	}
	if ( oldFragment == null ) {
		attachFragment( context, fragment, parent, component );
		return;
	}
	if ( oldFragment.template !== fragment.template ) {
		if ( oldFragment.component ) {
			let oldComponentFragment = oldFragment.component.context.fragment;
			
			unmountComponentAtFragment( oldFragment );
			attachFragment( context, fragment, parent, component, oldComponentFragment, true );
 	        return;
		} 
		attachFragment( context, fragment, parent, component, oldFragment, true );
	   return;
	}
	let fragmentComponent = oldFragment.component;
	//if this fragment is a component
	if ( fragmentComponent ) {
		fragmentComponent.props = fragment.props;
		fragmentComponent.forceUpdate();
		fragment.component = fragmentComponent;
		return;
	}
	//ensure we reference the new fragment with the old fragment's DOM node
	fragment.dom = oldFragment.dom;
	if ( fragment.templateValue !== undefined ) {
		//update a single value in the fragement (templateValue rather than templateValues)
		updateFragmentValue( context, oldFragment, fragment, component );
	} else if ( fragment.templateValues ) {
		//updates all values within the fragment (templateValues is an array)
		updateFragmentValues( context, oldFragment, fragment, component );
	}
}

export default updateFragment;