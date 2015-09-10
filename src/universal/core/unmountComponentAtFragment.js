import removeContext from "./removeContext";

export default ( fragment ) => {

    var component = fragment.component;
    component.componentWillUnmount();
    removeContext( component.context.dom );
    component.forceUpdate = badUpdate;
    component.context = null;
    component = null;

};
