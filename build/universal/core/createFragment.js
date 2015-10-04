//this function is really only intended to be used for DEV purposes
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports["default"] = function (values, template) {

    if (template.key === undefined) {

        if (templateKeyLookup === undefined) {

            //this was considerably faster than Symbol()
            template.key = "tpl" + Math.floor(Math.random() * 100000);
        }
    }
    if (values instanceof Array) {

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

module.exports = exports["default"];