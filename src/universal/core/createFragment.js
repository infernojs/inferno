import minErr  from "../../util/minErr";
import isArray from "../../util/isArray";

export default function(values, template) {

    if (template.key === undefined) {
        minErr("createFragment()", "Template is missing a key");
    }

    /**
     * To 'failsafe' this and avoid throwing on non-constructor, we have to check
     * if the 'values' are 'null'.
     */

    if (values != null && (isArray(values))) {

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