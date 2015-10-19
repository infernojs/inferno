import DOMAttributeNamespaces     from './vars/DOMAttributeNamespaces';
import propertyToAttributeMapping from './propertyToAttributeMapping';
import checkMask                  from './checkMask';

let
    MustUseAttribute = 0x1,
    MustUseProperty = 0x2,
    HasBooleanValue = 0x8,
    HasNumericValue = 0x10,
    HasPositiveNumber = 0x20 | 0x10,
    HasOverloadedBooleanValue = 0x40;

let  Properties = {
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
            // To set className on SVG elements, it's necessary to use .setAttribute;
            // this works on HTML elements too in all browsers except IE8.
            className: MustUseAttribute,
            cols: MustUseAttribute | HasPositiveNumber,
            colSpan: null,
            content: null,
            contentEditable: null,
            contextMenu: MustUseAttribute,
            controls: MustUseProperty | HasBooleanValue,
            coords: null,
            crossOrigin: null,
            data: null, // For `<object />` acts as `src`.
            dateTime: MustUseAttribute,
            defer: HasBooleanValue,
            dir: null,
            disabled: MustUseAttribute | HasBooleanValue,
            download: MustUseAttribute,
            draggable: null,
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
            httpEquiv: null,
            icon: null,
            id: MustUseProperty,
            is: MustUseAttribute,
            keyParams: MustUseAttribute,
            keyType: MustUseAttribute,
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
            srcSet: MustUseAttribute,
            start: MustUseAttribute | HasNumericValue,
            step: null,
            style: null,
            tabIndex: null,
            target: null,
            title: null,
            type: null,
            useMap: null,
            value: MustUseProperty,
            width: MustUseAttribute,
            wmode: MustUseAttribute,

            /**
             * Non-standard Properties
             */
            // autoCapitalize and autoCorrect are supported in Mobile Safari for
            // keyboard hints.
            autoCapitalize: null,
            autoCorrect: null,
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
            property: null,
            // IE-only attribute that controls focus behavior
            unselectable: MustUseAttribute
        };

export default (() => {
    let propInfoByAttributeName = {};
    
	for(let propName in Properties) {

        let propConfig = Properties[propName];
        let attributeName = propertyToAttributeMapping[propName] || propName.toLowerCase();

        let propertyInfo = {
            attributeName: attributeName,
            propertyName: propName,
            attributeNamespace: null,
            mustUseAttribute: checkMask(propConfig, MustUseAttribute),
            mustUseProperty: checkMask(propConfig, MustUseProperty),
            hasBooleanValue: checkMask(propConfig, HasBooleanValue),
            hasNumericValue: checkMask(propConfig, HasNumericValue),
            hasPositiveNumericValue: checkMask(propConfig, HasPositiveNumber),
            hasOverloadedBooleanValue: checkMask(propConfig, HasOverloadedBooleanValue)
        };

        propInfoByAttributeName[attributeName] = propertyInfo;
    }

    return (attributeName) => {
        let lowerCased = attributeName.toLowerCase();
        let propInfo;


        if (DOMAttributeNamespaces[attributeName]) {
            propInfo = {
                attributeName: attributeName,
                mustUseAttribute: true,
                isCustomAttribute: true,
                namespace: DOMAttributeNamespaces[attributeName]
            };
        } else if (propInfoByAttributeName.hasOwnProperty(lowerCased)) {
            propInfo = propInfoByAttributeName[lowerCased];
        } else {
            propInfo = {
                attributeName: attributeName,
                mustUseAttribute: true,
                isCustomAttribute: true
            };
        }

        return propInfo;
    };
})();