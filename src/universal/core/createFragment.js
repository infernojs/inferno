//this function is really only intended to be used for DEV purposes
export default ( values, template ) => {

    if ( template.key === undefined ) {

        //if the template function is missing a key property, we'll need to make one
        var templateKeyLookup = templateKeyMap.get( template );
        if ( templateKeyLookup === undefined ) {

            var key = Symbol();
            templateKeyMap.set( template, key );
            //this was considerably faster than Symbol()
            template.key = "tpl" + Math.floor( Math.random() * 100000 );

        }

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
