import attrsCfg       from "./cfg/attrsCfg";
import defaultAttrCfg from "./cfg/defaultAttrCfg";

export default ( attrName ) => {

    return attrsCfg[attrName] || defaultAttrCfg;

};
