"use strict";

import getRecycledFragment	 from "./getRecycledFragment";
import updateFragment		 from "./updateFragment";
import attachFragmentList    from "./attachFragmentList";
import fragmentValueTypes    from "../enum/fragmentValueTypes";
import insertFragment        from "./insertFragment";
import render                from "./render";
import templateTypes         from "../enum/templateTypes";
import templateCreateElement from "../../browser/template/createElement";

let attachFragment = function attachFragment( context, fragment, parentDom, component, nextFragment, replace ) {
	let fragmentComponent = fragment.component;

    if ( fragmentComponent ) {
        if ( typeof fragmentComponent === "function" ) {
            fragmentComponent = fragment.component = new fragmentComponent( fragment.props );
            fragmentComponent.context = null;
            fragmentComponent.forceUpdate = Inferno.render.bind( null, fragmentComponent.render.bind( fragmentComponent ), parentDom, fragmentComponent );
            fragmentComponent.forceUpdate();
        }
        return;
    }
    let recycledFragment = null,
        template = fragment.template,
        templateKey = template.key;

    if ( context.shouldRecycle === true ) {
        recycledFragment = getRecycledFragment( templateKey );
    }

    if ( recycledFragment !== null ) {
        updateFragment( context, recycledFragment, fragment, parentDom, component );
    } else {
        //there are different things we need to check for now
        switch (template.type) {
            case templateTypes.TEMPLATE_API:
                template(fragment);
                break;
            case templateTypes.T7_TEMPLATE_API:
                template(fragment, fragment.t7ref);
                break;
            case templateTypes.FUNCTIONAL_API:
                let createElement = templateCreateElement.bind(fragment);
                let params = [createElement], length = (fragment.templateValue && 1) || (fragment.templateValues && fragment.templateValues.length) || 0;

                //create our pointers, for example 0,1,2,3,4,5 as params to pass through
                for(let i = 0; i < length; i++) {
                    params.push({pointer: i});
                }
                fragment.dom = template.apply(null, params);
                break;
            default:
                template(fragment);
                break;
        }
        //if this fragment has a single value, we attach only that value
        if ( fragment.templateValue ) {
            switch ( fragment.templateType ) {
                case fragmentValueTypes.LIST:
                    attachFragmentList( context, fragment.templateValue, fragment.templateElement );
                    break;
                case fragmentValueTypes.LIST_REPLACE:
                    attachFragment( context, fragment.templateValue, fragment.templateElement, component );
                    break;
                case fragmentValueTypes.FRAGMENT:
                    //TODO do we need this still?
                    break;
                case fragmentValueTypes.FRAGMENT_REPLACE:
                    attachFragment( context, fragment.templateValue, parentDom, fragment.templateElement, true );
                    fragment.templateElement = fragment.templateValue.dom.parentNode;
                    break;
            }

        } else if ( fragment.templateValues ) {
            //if the fragment has multiple values, we must loop through them all and attach them
            //pulling this block of code out into its own function caused strange things to happen
            //with performance. it was faster in Gecko but far slower in v8
            for ( let i = 0, length = fragment.templateValues.length; i < length; i++ ) {

                let element = fragment.templateElements[i],
                    value = fragment.templateValues[i];
                switch ( fragment.templateTypes[i] ) {
                    case fragmentValueTypes.LIST:
                        attachFragmentList( context, value, element );
                        break;
                    case fragmentValueTypes.LIST_REPLACE:
                        let nodeList = document.createDocumentFragment(),
                            placeholderNode = fragment.templateElements[i];
                        attachFragmentList( context, value, nodeList );
                        placeholderNode.parentNode.replaceChild( nodeList, placeholderNode );
                        fragment.templateElements[i] = nodeList;
                        break;
                    case fragmentValueTypes.FRAGMENT:
                        //TODO do we need this still?
                        break;
                    case fragmentValueTypes.FRAGMENT_REPLACE:
                        attachFragment( context, value, parentDom, component, element, true );
                        fragment.templateElements[i] = value.dom.parentNode;
                        break;
                }
            }
        }
    }

    insertFragment( context, parentDom, fragment.dom, nextFragment, replace );
};

export default attachFragment;
