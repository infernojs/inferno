import getRecycledFragment from "./getRecycledFragment";
import updateFragment      from "./updateFragment";
import attachFragmentList  from "./attachFragmentList";
import fragmentTypes       from "./fragmentTypes";
import insertFragment      from "./insertFragment";
import render              from "../../browser/core/render";
import setT7Dependency     from "../../other/setT7Dependency";

let attachFagment = ( context, fragment, parentDom, component, nextFragment, replace ) => {

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

        //the user can optionally opt out of using the t7 dependency, thus removing the requirement
        //to pass the t7 reference into the template constructor
        if ( setT7Dependency() ) {

            template( fragment, fragment.t7ref );

        } else {

            template( fragment );

        }
        //if this fragment has a single value, we attach only that value
        if ( fragment.templateValue ) {

            switch ( fragment.templateType ) {
                case fragmentTypes.LIST:
                    attachFragmentList( context, fragment.templateValue, fragment.templateElement );
                    break;
                case fragmentTypes.LIST_REPLACE:
                    attachFragment( context, fragment.templateValue, fragment.templateElement, component );
                    break;
                case fragmentTypes.FRAGMENT:
                    //TODO do we need this still?
                    break;
                case fragmentTypes.FRAGMENT_REPLACE:
                    attachFragment( context, fragment.templateValue, parentDom, fragment.templateElement, true );
                    fragment.templateElement = fragment.templateValue.dom.parentNode;
                    break;
            }

        } else if ( fragment.templateValues ) {

            //if the fragment has multiple values, we must loop through them all and attach them
            //pulling this block of code out into its own function caused strange things to happen
            //with performance. it was faster in Gecko but far slower in v8
            for ( let i = 0, length = fragment.templateValues.length; i < length; i++ ) {

                var element = fragment.templateElements[i];
                var value = fragment.templateValues[i];
                switch ( fragment.templateTypes[i] ) {
                    case fragmentTypes.LIST:
                        attachFragmentList( context, value, element );
                        break;
                    case fragmentTypes.LIST_REPLACE:
                        var nodeList = document.createDocumentFragment();
                        var placeholderNode = fragment.templateElements[i];
                        attachFragmentList( context, value, nodeList );
                        placeholderNode.parentNode.replaceChild( nodeList, placeholderNode );
                        fragment.templateElements[i] = nodeList;
                        break;
                    case fragmentTypes.FRAGMENT:
                        //TODO do we need this still?
                        break;
                    case fragmentTypes.FRAGMENT_REPLACE:
                        attachFragment( context, value, parentDom, element, true );
                        fragment.templateElements[i] = value.dom.parentNode;
                        break;
                }

            }

        }

    }

    insertFragment( context, parentDom, fragment.dom, nextFragment, replace );

};

export default attachFagment;
