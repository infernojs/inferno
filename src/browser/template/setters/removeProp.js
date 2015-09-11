import removeSelectValue from "./removeSelectValue";
import HOOKS             from "../hooks/propHook";

export default function( node, name ) {

    if ( HOOK.remove[name]) {

	  HOOK.remove[name](node, name);

    } else {

        node[name] = "";
    }
}
