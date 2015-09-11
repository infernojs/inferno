import attrsCfg       from "./attrsCfg";
import defaultAttrCfg from "./defaultAttrCfg";

export default ( attrName ) => {

    return attrsCfg[attrName] || defaultAttrCfg;
};
