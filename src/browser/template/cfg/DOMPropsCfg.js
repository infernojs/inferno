import propsCfg       from "./propsCfg";
import defaultPropCfg from "./defaultPropCfg";

export default ( propName ) => propsCfg[propName] || defaultPropCfg;
