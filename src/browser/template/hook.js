import setSelectValue "./setSelectValue";

const VENDOR_PREFIXES = ["Webkit", "O", "Moz", "ms"];

// Helper for CSS properties access
let reDash = /\-./g,
    hook = {

        css: {
            _default(name, style) {

                let propName = name.replace(reDash, (str) => str[1].toUpperCase());

                if (!(propName in style)) {
                    propName = VENDOR_PREFIXES
                        .map((prefix) => prefix + propName[0].toUpperCase() + propName.slice(1))
                        .filter((prop) => prop in style)[0];
                }

                return this.css[name] = propName;
            }
        }
    },
    // xlink namespace attributes
    xlinkCfg = {
        "xlink:actuate": "actuate",
        "xlink:arcrole": "arcrole",
        "xlink:href": "href",
        "xlink:role": "role",
        "xlink:show": "show",
        "xlink:title": "title",
        "xlink:type": "type"
    },
    // xml namespace attributes
    xmlCfg = {
        "xml:base": "base",
        "xml:id": "id",
        "xml:lang": "lang",
        "xml:space": "space"
    },
;

hook.class = (node, name, value) => {
    node.setAttribute(name, value);
}

hook.className = (node, name, value) => {
    node[propertyname] = value;
}

 hook.style = (node, name, value) => {

        // FIX ME!! t7 has to be fixed so it handle object literal. Then 
        // we can remove this 'typeof' check
        if (typeof value === "string") {

            node.style.cssText = value;

        } else {

            forIn(value, (styleName, styleValue) => {

                let style = node[name],
                    setter = hook.css[styleName] || HOOK.css._default(styleName, style);

                if (value == null) {
                    value = "";
                }

                if (typeof setter === "function") {
                    setter(value, style);
                } else {
                    style[setter] = typeof value === "number" ? value + "px" : value + ""; // cast to string
                }

            });
        }
    };

hook.value = (node, name, value) => {

    switch (node.tagName) {

        case SELECT:
            // selectbox has special case
            setSelectValue(node, value);
            break;
        default:
            node.setAttribute(name, "" + value);
    }
};


/**
 * Attributes that should be set as a property on common types to improve creation performance
 */
("srcset enctype autocomplete htmlFor className paused placeholder playbackRate radioGroup currentTime srcObject tabIndex volume srcDoc " +
    "mediagroup kind label default id href value name width height").split(" ").forEach((prop) => {

    hook[prop] = (node, name, value) => {
        node[name] = value;
    }
});

/**
 * Properties that should be set as a attributes
 */
("minLength media maxLength manifest list keyType keyParams is inputMode height frameBorder formTarget formMethod" +
  "formEncType formAction form contextMenu cols classID challenge charSet allowTransparency").split(" ").forEach((prop) => {

    hook[prop] = (node, name, value) => {
        node.setAttribute(name, value);
    }
});

/**
 * Non-standard
 */
("security " +

    // itemProp, itemScope, itemType are for
    // Microdata support. See http://schema.org/docs/gs.html
    "itemProp " +
    "itemType " +
    // autoCapitalize and autoCorrect are supported in Mobile Safari for
    // keyboard hints.
    "autoCapitalize " +
    // itemID and itemRef are for Microdata support as well but
    // only specified in the the WHATWG spec document. See
    // https://html.spec.whatwg.org/multipage/microdata.html#microdata-dom-api
    "itemID " +
    "itemRef").split(" ").forEach((prop) => {

    hook[prop] = (node, name, value) => {
        node.setAttribute(name, value);
    }
});

// Boolean properties
("multiple async inert autofocus autoplay checked controls enabled formNoValidate " +
    "loop muted noValidate open readOnly required scoped seamless selected translate " +
    "truespeed defaultSelected sortable reversed nohref noresize indeterminate draggable " +
    "autoplay itemscope").split(" ").forEach((prop) => {

    hook[prop] = (node, propName, value) => {

        // Legacy browsers would fuck this up if we don't force
        // the value to be a boolean
        node[propName] = !!value;
    };
});

// Boolean attributes
("hidden nowrap inert required noresize translate typemustmatch defaultselected defaultchecked disabled defer" +
    "noshade draggable defaultSelected defaultChecked itemScope capture autoPlay autoFocus allowFullScreen").split(" ").split(" ").forEach((prop) => {

    hook[prop.toLowerCase()] = (node, name, attrValue) => {

        // don't set falsy values!
        if (attrValue !== false) {
            // booleans should always be lower cased
            node.setAttribute(name, "" + (attrValue == true ? "" : attrValue).toLowerCase());
        }
    }
});

/**
 * xlink namespace attributes
 */
"xlink:actuate xlink:arcrole xlink:href xlink:role xlink:show xlink:title xlink:type".split(" ").forEach((prop) => {

    hook[prop] = xlinkAttrCfg;

});

/**
 * xml namespace attributes
 */
"xml:base xml:id xml:lang xml:space".split(" ").forEach((prop) => {

    hook[prop] = (node, key, value) {

        node.setAttributeNS("http://www.w3.org/XML/1998/namespace", xmlCfg[key], "" + value);
    };
});