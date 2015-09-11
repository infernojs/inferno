import propsCfg       from "./propsCfg";
import defaultPropCfg from "./defaultPropCfg";

export default ( propName ) => {

    return propsCfg[propName] || defaultPropCfg;

};
