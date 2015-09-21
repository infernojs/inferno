import attrNameCfg from "./cfg/attrNameCfg";
import hasPropertyAccessor from "./hasPropertyAccessor";
import inArray from "../util/inArray";

/**
 * Set overloaded attributes
 *
 * @param {!Element} node DOM node
 * @param {String} name
 * @param {String} val
 */

let overloadedAttr = (node, name, val) => {
        node.setAttribute(name, (val === true ? '' : val));
    },
    /**
     * Set boolean attributes
     *
     * @param {!Element} node DOM node
     * @param {String} name
     * @param {String} val
     */
    setBooleanAttr = (node, name, val) => {

        if (val !== false) {

            node.setAttribute(name, '' + (val === true ? '' : val));
        }
    },
    /**
     * Set attributes on a DOM node
     *
     * @param {!Element} node DOM node
     * @param {String} name
     * @param {String} val
     */

    setAttr = (node, name, val) => {
        if (name === 'type' && node.tagName === 'INPUT') {
            var value = node.value; // value will be lost in IE if type is changed
            node.setAttribute(name, '' + val);
            node.value = value;
        } else {
            //if ( val !== false) {
            node.setAttribute(attrNameCfg[name] || name, '' + val);
            //		}
        }
    },
    /**
     * Set properties on a DOM node
     *
     * @param {!Element} node DOM node
     * @param {String} name
     * @param {String} val
     */

    setProp = (node, name, val) => {
        node[name] = val;
    },
    /**
     * Set object properties
     *
     * @param {!Element} node DOM node
     * @param {String} name
     * @param {String} val
     */

    setObjProp = (node, name, val) => {
        if (process.env.NODE_ENV !== 'production') {
            var typeOfVal = typeof val;
            if (typeOfVal !== 'object') {
                console.error(`Error! "${name}" attribute expects an object as a value, not a ${typeOfVal}`);
                return;
            }
        }

        var prop = node[name];
		
        for (var i in val) {
            prop[i] = val[i] == null ? '' : val[i];
        }
    },
    /**
     * Set properties after validation check
     *
     * @param {!Element} node DOM node
     * @param {String} name
     * @param {String} val
     */

    setPropWithCheck = (node, name, val) => {
        if (name === 'value' && node.tagName.toLowerCase() === 'select') {
            setSelectValue(node, val);
        } else {
            node[name] !== val && (node[name] = val);
        }
    },
	
    /**
     * Remove a attribute from a DOM node
     *
     * @param {!Element} node DOM node
     * @param {String} name
     */

    removeAttr = (node, name) => {
        node.removeAttribute(attrNameCfg[name] || name);
    },
	
    /**
     * Remove a property from a DOM node
     *
     * @param {!Element} node DOM node
     * @param {String} name
     */

    removeProp = (node, name) => {
        if (name === 'value' && node.tagName === 'SELECT') {
            removeSelectValue(node);
        } else {
            node[name] = hasPropertyAccessor(node.tagName, name);
        }
    },
	
    /**
     * Set select / select multiple
     *
     * @param {!Element} node DOM node
     * @param {String} value
     */
    setSelectValue = (node, value) => {

        var isMultiple = Array.isArray(value),
            options = node.options,
            len = options.length;

        var i = 0,
            optionNode;

        while (i < len) {
            optionNode = options[i++];

            optionNode.selected = value != null && (isMultiple ? inArray(value, optionNode.value) : optionNode.value == value);
        }
    },
	
    /**
     * Remove select / select multiple from a DOM node
     *
     * @param {!Element} node DOM node
     * @param {String} value
     */
    removeSelectValue = (node) => {
        var options = node.options,
            len = options.length;

        var i = 0;

        while (i < len) {
            options[i++].selected = false;
        }
    },
	
    /**
     * Transform HTML attributes to string for SSR rendring
     *
     * @param {!Element} node DOM node
     * @param {String} name
     */

    attrToString = (name, value) => {
        return (attrNameCfg[name] || name) + '="' + escapeAttr(value) + '"';
    },

    /**
     * Transform HTML boolean attributes to string for SSR rendring
     *
     * @param {!Element} node DOM node
     * @param {String} name
     */

    booleanAttrToString = (name, value) => {
        return value ? name : '';
    },
	
    /**
     * Transform CSS style property to string for SSR rendring
     *
     * @param {!Element} node DOM node
     * @param {String} name
     */
    stylePropToString = (name, value) => {
        var styles = '';

        for (var i in value) {
            value[i] != null && (styles += dasherize(i) + ':' + value[i] + ';');
        }

        return styles ? name + '="' + styles + '"' : styles;
    }

var DEFAULT_ATTR_CFG = {
        set: setAttr,
        remove: removeAttr,
        toHtml: attrToString
    },
    OVERLOADED_ATTR = {
        set: overloadedAttr,
        remove: removeAttr,
        toHtml: attrToString
    },
    BOOLEAN_ATTR_CFG = {
        set: setBooleanAttr,
        remove: removeAttr,
        toHtml: booleanAttrToString
    },
    DEFAULT_PROP_CFG = {
        set: setProp,
        remove: removeProp,
        toHtml: attrToString
    },
    BOOLEAN_PROP_CFG = {
        set: setProp,
        remove: removeProp,
        toHtml: booleanAttrToString
    },
    attrsCfg = {
        allowFullScreen: BOOLEAN_ATTR_CFG,
        checked: BOOLEAN_ATTR_CFG,
        hidden: BOOLEAN_ATTR_CFG,
        controls: DEFAULT_PROP_CFG,
        disabled: BOOLEAN_ATTR_CFG,
        download: OVERLOADED_ATTR,
        id: DEFAULT_PROP_CFG,
        ismap: BOOLEAN_ATTR_CFG,
        loop: DEFAULT_PROP_CFG,
        multiple: BOOLEAN_PROP_CFG,
        muted: DEFAULT_PROP_CFG,
        readOnly: BOOLEAN_PROP_CFG,
        required: BOOLEAN_PROP_CFG,
        selected: BOOLEAN_PROP_CFG,
        selectedindex: DEFAULT_PROP_CFG,
        srcDoc: DEFAULT_PROP_CFG,
        style: {
            set: setObjProp,
            remove: removeProp,
            toHtml: stylePropToString
        },
        value: {
            set: setPropWithCheck,
            remove: removeProp,
            toHtml: attrToString
        }
    };

export default function(attrName) {
    return attrsCfg[attrName] || DEFAULT_ATTR_CFG;
}