import attachFragment from "./attachFragment";

export default ( context, list, parentDom, component ) => {

    for ( let i = 0; i < list.length; i++ ) {

        attachFragment( context, list[i], parentDom, component );

    }

};
