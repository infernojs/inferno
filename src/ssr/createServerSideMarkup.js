import createOpenTagMarkup         from './createOpenTagMarkup';
import createMarkupForFormElements from './createMarkupForFormElements';
import createContentMarkup         from './createContentMarkup';
import specialTags                 from './specialTags';
import voidElementTags             from './voidElementTags';

export default (tag, props, children) => {
    // option, optgroup, select
    if (specialTags(tag)) {
        return createMarkupForFormElements(tag, props, children);
    } else {

        let tagOpen = createOpenTagMarkup(tag, props, children);
        let tagContent = createContentMarkup(tag, props, children);

        return voidElementTags(tag) ? tagOpen + '/>' : tagOpen + '>' + tagContent + '</' + tag + '>';
    }
}