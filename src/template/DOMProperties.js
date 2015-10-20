import DOMAttributeNamespaces     from './vars/DOMAttributeNamespaces';
import propertyToAttributeMapping from './propertyToAttributeMapping';
import checkMask                  from './checkMask';
import isSVG                      from '../util/isSVG';
import masks                      from './masks';

let {
    MustUseAttribute,
    MustUseProperty,
    HasBooleanValue,
    HasNumericValue,
    HasPositiveNumber
} = masks,

Properties = {
            /**
             * Standard Properties
             */
            accept: MustUseProperty,
            acceptCharset: MustUseProperty,
            accessKey: MustUseProperty,
            action: MustUseProperty,
            allowFullScreen: MustUseAttribute | HasBooleanValue,
            allowTransparency: MustUseAttribute,
            alt: MustUseProperty,
            async: HasBooleanValue,
            autoComplete: MustUseProperty,
            autoFocus: HasBooleanValue,
            autoPlay: HasBooleanValue,
            capture: MustUseAttribute | HasBooleanValue,
            cellPadding: MustUseProperty,
            cellSpacing: MustUseProperty,
            charSet: MustUseAttribute,
            challenge: MustUseAttribute,
            checked: MustUseProperty | HasBooleanValue,
            classID: MustUseAttribute,
            className: isSVG ? MustUseAttribute : MustUseProperty,
            cols: MustUseAttribute | HasPositiveNumber,
            colSpan: MustUseProperty,
            content: MustUseProperty,
            contentEditable: MustUseProperty,
            contextMenu: MustUseAttribute,
            controls: MustUseProperty | HasBooleanValue,
            coords: MustUseProperty,
            crossOrigin: MustUseProperty,
            data: MustUseProperty,
            dateTime: MustUseAttribute,
            defer: HasBooleanValue,
            dir: MustUseProperty,
            disabled: MustUseAttribute | HasBooleanValue,
            download: MustUseAttribute,
            draggable: MustUseProperty,
            encType: MustUseProperty,
            form: MustUseAttribute,
            formAction: MustUseAttribute,
            formEncType: MustUseAttribute,
            formMethod: MustUseAttribute,
            formNoValidate: HasBooleanValue,
            formTarget: MustUseAttribute,
            frameBorder: MustUseAttribute,
            headers: MustUseProperty,
            height: MustUseAttribute,
            hidden: MustUseAttribute | HasBooleanValue,
            high: MustUseAttribute,
            href: MustUseAttribute,
            hrefLang: MustUseAttribute,
            htmlFor: MustUseAttribute,
            httpEquiv: MustUseProperty,
            icon: MustUseProperty,
            id: MustUseProperty,
            is: MustUseAttribute,
            keyParams: MustUseAttribute,
            keyType: MustUseAttribute,
            label: MustUseProperty,
            lang: MustUseProperty,
            list: MustUseAttribute,
            loop: MustUseProperty | HasBooleanValue,
            low: MustUseProperty,
            manifest: MustUseAttribute,
            marginHeight: MustUseProperty,
            marginWidth: MustUseProperty,
            max: MustUseProperty,
            maxLength: MustUseAttribute,
            media: MustUseAttribute,
            mediaGroup: MustUseProperty,
            method: MustUseProperty,
            min: MustUseProperty,
            minLength: MustUseAttribute,
            multiple: MustUseAttribute | HasBooleanValue,
            muted: MustUseProperty | HasBooleanValue,
            name: MustUseAttribute,
            noValidate: HasBooleanValue,
            open: HasBooleanValue,
            optimum: MustUseProperty,
            pattern: MustUseProperty,
            placeholder: MustUseProperty,
            poster: MustUseProperty,
            preload: MustUseProperty,
            radioGroup: MustUseProperty,
            readOnly: MustUseProperty | HasBooleanValue,
            rel: MustUseProperty,
            required: HasBooleanValue,
            role: MustUseAttribute,
            rows: MustUseAttribute | HasPositiveNumber,
            rowSpan: MustUseProperty,
            sandbox: MustUseProperty,
            scope: MustUseProperty,
            scoped: HasBooleanValue,
            scrolling: MustUseProperty,
            seamless: MustUseAttribute | HasBooleanValue,
            selected: MustUseProperty | HasBooleanValue,
            shape: MustUseProperty,
            size: MustUseAttribute | HasPositiveNumber,
            sizes: MustUseAttribute,
            span: HasPositiveNumber,
            spellCheck: MustUseProperty,
            src: MustUseAttribute,
            srcDoc: MustUseProperty,
            srcSet: MustUseAttribute,
            start: MustUseAttribute | HasNumericValue,
            step: MustUseProperty,
            style: MustUseProperty,
            tabIndex: MustUseProperty,
            target: MustUseProperty,
            title: MustUseProperty,
            type: MustUseProperty,
            useMap: MustUseProperty,
            value: MustUseProperty,
            width: MustUseAttribute,
            wmode: MustUseAttribute,

            /**
             * Non-standard Properties
             */
            // autoCapitalize and autoCorrect are supported in Mobile Safari for
            // keyboard hints.
            autoCapitalize: MustUseProperty,
            autoCorrect: MustUseProperty,
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
            attributeNamespace: MustUseProperty,
            mustUseAttribute: checkMask(propConfig, MustUseAttribute),
            mustUseProperty: checkMask(propConfig, MustUseProperty),
            hasBooleanValue: checkMask(propConfig, HasBooleanValue),
            hasNumericValue: checkMask(propConfig, HasNumericValue),
            hasPositiveNumericValue: checkMask(propConfig, HasPositiveNumber)
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