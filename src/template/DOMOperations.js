import attrNameCfg from "./cfg/attrNameCfg";
import hasPropertyAccessor from "./hasPropertyAccessor";
import inArray from "../util/inArray";
import isSVG from "../util/isSVG";

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
            let value = node.value; // value will be lost in IE if type is changed
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
            let typeOfVal = typeof val;
            if (typeOfVal !== 'object') {
                console.error(`Error! "${name}" attribute expects an object as a value, not a ${typeOfVal}`);
                return;
            }
        }

        let prop = node[name];

        for (let i in val) {
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

        let isMultiple = Array.isArray(value),
            options = node.options,
            len = options.length;

        let i = 0,
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
        let options = node.options,
            len = options.length;

        let i = 0;

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
        let styles = '';

        for (let i in value) {
            value[i] != null && (styles += dasherize(i) + ':' + value[i] + ';');
        }

        return styles ? name + '="' + styles + '"' : styles;
    }

let IS_ATTRIBUTE = {
        set: setAttr,
        remove: removeAttr,
        toHtml: attrToString
    },
    IS_OVERLOADED_ATTRIBUTE = {
        set: overloadedAttr,
        remove: removeAttr,
        toHtml: attrToString
    },
    IS_BOOLEAN_ATTRIBUTE = {
        set: setBooleanAttr,
        remove: removeAttr,
        toHtml: booleanAttrToString
    },
    IS_PROPERTY = {
        set: setProp,
        remove: removeProp,
        toHtml: attrToString
    },
    IS_BOOLEAN_PROPERTY = {
        set: setProp,
        remove: removeProp,
        toHtml: booleanAttrToString
    },
    attrsCfg = {

        allowFullScreen: IS_BOOLEAN_ATTRIBUTE,
        allowTransparency: IS_ATTRIBUTE,
        async: IS_BOOLEAN_ATTRIBUTE,
        autoFocus: IS_BOOLEAN_ATTRIBUTE,
        autoPlay: IS_BOOLEAN_ATTRIBUTE,
        capture: IS_BOOLEAN_ATTRIBUTE,
        charSet: IS_ATTRIBUTE,
        challenge: IS_ATTRIBUTE,
        checked: IS_BOOLEAN_ATTRIBUTE,
        classID: IS_ATTRIBUTE,
        className: isSVG ? IS_ATTRIBUTE : IS_PROPERTY,
        cols: IS_ATTRIBUTE,
        contextMenu: IS_ATTRIBUTE,
        controls: IS_BOOLEAN_PROPERTY,
        dateTime: IS_ATTRIBUTE,
        default: IS_BOOLEAN_ATTRIBUTE,
        defer: IS_BOOLEAN_ATTRIBUTE,
        declare: IS_BOOLEAN_ATTRIBUTE,
        defaultchecked: IS_BOOLEAN_ATTRIBUTE,
        defaultmuted: IS_BOOLEAN_ATTRIBUTE,
        defaultselected: IS_BOOLEAN_ATTRIBUTE,
        disabled: IS_BOOLEAN_ATTRIBUTE,
        draggable: IS_BOOLEAN_ATTRIBUTE,
        download: IS_OVERLOADED_ATTRIBUTE,
        form: IS_ATTRIBUTE,
        formAction: IS_ATTRIBUTE,
        formEncType: IS_ATTRIBUTE,
        formMethod: IS_ATTRIBUTE,
        formNoValidate: IS_BOOLEAN_PROPERTY,
        formTarget: IS_ATTRIBUTE,
        frameBorder: IS_ATTRIBUTE,
        height: IS_PROPERTY,
        hidden: IS_BOOLEAN_ATTRIBUTE,
        id: IS_PROPERTY,
        inputMode: IS_ATTRIBUTE,
        is: IS_ATTRIBUTE,
        ismap: IS_BOOLEAN_PROPERTY,
        keyParams: IS_ATTRIBUTE,
        keyType: IS_ATTRIBUTE,
        label: IS_PROPERTY,
        list: IS_ATTRIBUTE,
        loop: IS_BOOLEAN_PROPERTY,
        manifest: IS_ATTRIBUTE,
        maxLength: IS_ATTRIBUTE,
        media: IS_ATTRIBUTE,
        minLength: IS_ATTRIBUTE,
        muted: IS_BOOLEAN_PROPERTY,
        multiple: IS_BOOLEAN_PROPERTY,
        name: IS_PROPERTY,
        nohref: IS_ATTRIBUTE,
        noshade: IS_ATTRIBUTE,
        noValidate: IS_BOOLEAN_ATTRIBUTE,
        open: IS_BOOLEAN_ATTRIBUTE,
        placeholder: IS_PROPERTY,
        readOnly: IS_BOOLEAN_PROPERTY,
        reversed: IS_BOOLEAN_PROPERTY,
        required: IS_BOOLEAN_PROPERTY,
        role: IS_ATTRIBUTE,
        rows: IS_ATTRIBUTE,
        scoped: IS_BOOLEAN_ATTRIBUTE,
        seamless: IS_BOOLEAN_ATTRIBUTE,
        selected: IS_BOOLEAN_PROPERTY,
        selectedIndex: IS_PROPERTY,
        size: IS_ATTRIBUTE,
        sizes: IS_ATTRIBUTE,
        sortable: IS_BOOLEAN_ATTRIBUTE,
        span: IS_ATTRIBUTE,
        spellCheck: IS_BOOLEAN_ATTRIBUTE,
        srcDoc: IS_PROPERTY,
        srcSet: IS_ATTRIBUTE,
        start: IS_ATTRIBUTE,
        style: {
            set: setObjProp,
            remove: removeProp,
            toHtml: stylePropToString
        },
        translate: IS_BOOLEAN_ATTRIBUTE,
        truespeed: IS_BOOLEAN_ATTRIBUTE,
        typemustmatch: IS_BOOLEAN_ATTRIBUTE,
        value: {
            set: setPropWithCheck,
            remove: removeProp,
            toHtml: attrToString
        },
        visible: IS_BOOLEAN_ATTRIBUTE,
        width: IS_PROPERTY,
        wmode: IS_ATTRIBUTE,

        /**
         * Non-standard Properties
         */

        // itemProp, itemScope, itemType are for
        // Microdata support. See http://schema.org/docs/gs.html
        itemProp: IS_ATTRIBUTE,
        itemScope: IS_BOOLEAN_ATTRIBUTE,
        itemType: IS_ATTRIBUTE,
        // itemID and itemRef are for Microdata support as well but
        // only specified in the the WHATWG spec document. See
        // https://html.spec.whatwg.org/multipage/microdata.html#microdata-dom-api
        itemID: IS_ATTRIBUTE,
        itemRef: IS_ATTRIBUTE,
        // IE-only attribute that specifies security restrictions on an iframe
        // as an alternative to the sandbox attribute on IE<10
        security: IS_ATTRIBUTE,
        // IE-only attribute that controls focus behavior
        unselectable: IS_ATTRIBUTE
    };

export default function(attrName) {
    return attrsCfg[attrName] || IS_ATTRIBUTE;
}