const VENDOR_PREFIXES = ["Webkit", "O", "Moz", "ms"];

// Helper for CSS properties access
let reDash = /\-./g,
    hooks = { set: {}, find(name, style) {
   
        let propName = name.replace(reDash, (str) => str[1].toUpperCase());

        if (!(propName in style)) {
            propName = VENDOR_PREFIXES
                .map((prefix) => prefix + propName[0].toUpperCase() + propName.slice(1))
                .filter((prop) => prop in style)[0];
        }

        return this.set[name] = propName;
    }};

// Exclude the following css properties from adding px
"float fill-opacity font-weight line-height opacity orphans widows z-index zoom".split(" ").forEach((propName) => {
    let stylePropName = propName.replace(reDash, (str) => str[1].toUpperCase());

        hooks.set[propName] = (value, style) => {
            style[stylePropName] = value.toString();
        };
});

export default hooks;