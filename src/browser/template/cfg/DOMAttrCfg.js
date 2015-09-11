import attrsCfg       from "./attrsCfg";
import defaultAttrCfg from "./defaultAttrCfg";

export default ( attrName ) => attrsCfg[attrName] || defaultAttrCfg;
