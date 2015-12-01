import attributeHooks from './hooks/attributeHooks';
import styleHooks from './hooks/styleHooks';
import svgHooks from './hooks/svgHooks';

/*
 * Template interface
 */
export default {

    registerAttributeHooks(propName, hook) {
            let attrHook = propName[type] || (propName[type] = {});

            if (isArray(propName)) {
                for (let i = 0; i < propName.length; i++) {
                    attrHook[propName[i]] = hook;
                }
            } else {
                attrHook[propName] = hook;
            }
        },
        registerStyleHooks(propName, hook) {
            let styleHook = styleHooks[type] || (styleHooks[type] = {});

            if (isArray(propName)) {
                for (let i = 0; i < propName.length; i++) {
                    styleHook[propName[i]] = hook;
                }
            } else {
                styleHook[propName] = hook;
            }
        },

        registerSvgHooks(propName, hook) {
            let SvgHook = svgHooks[type] || (svgHooks[type] = {});

            if (isArray(propName)) {
                for (let i = 0; i < propName.length; i++) {
                    SvgHook[propName[i]] = hook;
                }
            } else {
                SvgHook[propName] = hook;
            }
        }
};