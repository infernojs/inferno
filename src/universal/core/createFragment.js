export default function createFragment( values, template ) {

    if ( template.key === undefined ) {
        throw Error("createFragment failed, template is missing key");
    }
    if ( values instanceof Array ) {

        return {
            dom: null,
            key: null,
            next: null,
            template: template,
            templateElements: null,
            templateTypes: null,
            templateValues: values
        };

    } else {

        return {
            dom: null,
            key: null,
            next: null,
            template: template,
            templateElement: null,
            templateType: null,
            templateValue: values
        };

    }

	};
