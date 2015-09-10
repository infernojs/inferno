import propsCfg       from "./cfg/propsCfg";
import defaultPropCfg from "./cfg/defaultPropCfg";

export default ( propName ) => {

    return propsCfg[propName] || defaultPropCfg;

};
