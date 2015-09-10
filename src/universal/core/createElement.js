import createFragment from "./createFragment";
import fragmentTypes  from "./fragmentTypes";
import addAttributes  from "../../browser/template/addAttributes";

//this was added so vdom lovers can still use their beloved vdom API from React :)
//this won't be performant and should only be used for prototyping/testing/experimenting
//note, props/attrs will not update with this current implementation

var templateKeyMap = new WeakMap();

export default ( tag, props ) => {

    for ( var _len = arguments.length, children = Array( _len > 2 ? _len - 2 : 0 ), _key = 2; _key < _len; _key++ ) {

        children[_key - 2] = arguments[_key];

    }

    console.warn( "Inferno.vdom.createElement() is purely experimental, " + "it's performance will be poor and attributes/properities will not update (as of yet)" );

    if ( children.length === 1 ) {

        children = children[0];

    }
    //we need to create a template for this
    function template( fragment ) {

        var root = document.createElement( tag );
        fragment.templateElement = root;

        if ( typeof children !== "object" ) {

            fragment.templateType = fragmentTypes.TEXT;
            root.textContent = children;

        } else {

            if ( children instanceof Array ) {

                fragment.templateType = fragmentTypes.LIST;

            } else {

                fragment.templateType = fragmentTypes.FRAGMENT;

            }

        }

        if ( props ) {

            Inferno.template.addAttributes( root, props );

        }
        fragment.dom = root;

    }

    return createFragment( children, template );

};
