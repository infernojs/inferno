import DOMAttributeNamespaces from './vars/DOMAttributeNamespaces';
import propertyToAttributeMapping from './propertyToAttributeMapping';
import checkMask from './checkMask';
import DOMMutationMethods from './DOMMutationMethods';
import isSVG from '../util/isSVG';

let MustUseAttribute = 0x1,
    MustUseProperty = 0x2,
    HasBooleanValue = 0x8,
    HasNumericValue = 0x10,
    HasPositiveNumber = 0x20 | 0x10,
    HasOverloadedBooleanValue = 0x40,

    Properties = {
        /**
         * Standard Properties
         */
        accept: null,
        acceptCharset: null,
        accessKey: null,
        action: null,
        allowFullScreen: MustUseAttribute | HasBooleanValue,
        allowTransparency: MustUseAttribute,
        alt: null,
        async: HasBooleanValue,
        autoComplete: null,
        autoFocus: HasBooleanValue,
        autoPlay: HasBooleanValue,
        capture: MustUseAttribute | HasBooleanValue,
        cellPadding: null,
        cellSpacing: null,
        charSet: MustUseAttribute,
        challenge: MustUseAttribute,
        checked: MustUseProperty | HasBooleanValue,
        classID: MustUseAttribute,
        className: isSVG ? MustUseAttribute : MustUseProperty,
        cols: MustUseAttribute | HasPositiveNumber,
        colSpan: null,
        content: null,
        contentEditable: MustUseAttribute,
        contextMenu: MustUseAttribute,
        controls: MustUseProperty | HasBooleanValue,
        coords: null,
        crossOrigin: null,
        data: null,
        dataset: MustUseProperty,
        dateTime: MustUseAttribute,
        default: MustUseAttribute | HasBooleanValue,
        defer: HasBooleanValue,
        dir: null,
        disabled: MustUseAttribute | HasBooleanValue,
        download: MustUseAttribute,
        draggable: null,
        enabled: MustUseAttribute,
        encType: null,
        form: MustUseAttribute,
        formAction: MustUseAttribute,
        formEncType: MustUseAttribute,
        formMethod: MustUseAttribute,
        formNoValidate: HasBooleanValue,
        formTarget: MustUseAttribute,
        frameBorder: MustUseAttribute,
        headers: null,
        height: MustUseAttribute,
        hidden: MustUseAttribute | HasBooleanValue,
        high: null,
        href: null,
        hrefLang: null,
        htmlFor: null,
        httpEquiv: MustUseProperty,
        icon: MustUseProperty,
        id: MustUseProperty,
        is: MustUseAttribute,
        key: MustUseAttribute,
        keyParams: MustUseAttribute,
        keyType: MustUseAttribute,
        kind: null,
        label: null,
        lang: null,
        list: MustUseAttribute,
        loop: MustUseProperty | HasBooleanValue,
        low: null,
        manifest: MustUseAttribute,
        marginHeight: null,
        marginWidth: null,
        max: null,
        maxLength: MustUseAttribute,
        media: MustUseAttribute,
        mediaGroup: null,
        method: null,
        min: null,
        minLength: MustUseAttribute,
        multiple: MustUseAttribute | HasBooleanValue,
        muted: MustUseProperty | HasBooleanValue,
        name: MustUseAttribute,
        noValidate: HasBooleanValue,
        open: HasBooleanValue,
        optimum: null,
        pattern: null,
        placeholder: null,
        poster: null,
        preload: null,
        radioGroup: null,
        readOnly: MustUseProperty | HasBooleanValue,
        rel: null,
        required: HasBooleanValue,
        role: MustUseAttribute,
        rows: MustUseAttribute | HasPositiveNumber,
        rowSpan: null,
        sandbox: null,
        scope: null,
        scoped: HasBooleanValue,
        scrolling: null,
        seamless: MustUseAttribute | HasBooleanValue,
        selected: MustUseProperty | HasBooleanValue,
        shape: null,
        size: MustUseAttribute | HasPositiveNumber,
        sizes: MustUseAttribute,
        span: HasPositiveNumber,
        spellCheck: null,
        src: MustUseAttribute,
        srcDoc: MustUseProperty,
        srcLang: null,
        srcSet: MustUseAttribute,
        start: MustUseAttribute | HasNumericValue,
        step: null,
        style: null,
        tabIndex: null,
        target: null,
        title: null,
        type: null,
        useMap: null,
        value: null,
        version: MustUseAttribute,
        volume: MustUseAttribute,
        width: MustUseAttribute,
        wmode: MustUseAttribute,
        wrap: MustUseAttribute,
        xmlns: MustUseAttribute,

        /**
         * RDFa Properties
         */
        about: MustUseAttribute,
        datatype: MustUseAttribute,
        inlist: MustUseAttribute,
        prefix: MustUseAttribute,
        // property is also supported for OpenGraph in meta tags.
        property: MustUseAttribute,
        resource: MustUseAttribute,
        typeof: MustUseAttribute,
        vocab: MustUseAttribute,

        /**
         * Non-standard Properties
         */

        // autoCapitalize and autoCorrect are supported in Mobile Safari for
        // keyboard hints.
        autoCapitalize: null,
        autoCorrect: null,
        autoSave: null,
        // color is for Safari mask-icon link
        color: null,
        // itemProp, itemScope, itemType are for
        // Microdata support. See http://schema.org/docs/gs.html
        itemProp: MustUseAttribute,
        itemScope: MustUseAttribute | HasBooleanValue,
        itemType: MustUseAttribute,
        // itemID and itemRef are for Microdata support as well but
        // only specified in the the WHATWG spec document. See
        // https://html.spec.whatwg.org/multipage/microdata.html#microdata-dom-api
        itemID: MustUseAttribute,
        itemRef: MustUseAttribute,
        // property is supported for OpenGraph in meta tags.
        property: MustUseProperty,
        // results show looking glass icon and recent searches on input
        // search fields in WebKit/Blink
        results: null,
        // IE-only attribute that specifies security restrictions on an iframe
        // as an alternative to the sandbox attribute on IE<10
        security: MustUseAttribute,
        // IE-only attribute that controls focus behavior
        unselectable: MustUseAttribute

    };

export default (() => {
    let propInfoByAttributeName = {};

    for (let propName in Properties) {

        let propConfig = Properties[propName],
            attributeName = propertyToAttributeMapping[propName] || propName.toLowerCase(),

            propertyInfo = {
                attributeName: attributeName,
                propertyName: propName,
                attributeNamespace: null,
                mustUseAttribute: checkMask(propConfig, MustUseAttribute),
                mustUseProperty: checkMask(propConfig, MustUseProperty),
                hasBooleanValue: checkMask(propConfig, HasBooleanValue)
            };

        propInfoByAttributeName[attributeName] = propertyInfo;
    }

    return (name) => {
        let lowerCased = name.toLowerCase();
        let propInfo;

        if (DOMAttributeNamespaces[name]) {
            propInfo = {
                attributeName: name,
                mustUseAttribute: true,
                isCustomAttribute: true,
                attributeNamespace: DOMAttributeNamespaces[name]
            };
        } else if (propInfoByAttributeName[lowerCased]) {
            propInfo = propInfoByAttributeName[lowerCased];
        } else {
            propInfo = {
                attributeName: propertyToAttributeMapping[name] || name,
                mustUseAttribute: true,
                isCustomAttribute: true
            };
        }

        if (DOMMutationMethods[lowerCased]) {
            propInfo.mutationMethod = DOMMutationMethods[lowerCased];
        }

        return propInfo;
    };
})();