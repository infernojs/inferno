// TODO!! Optimize!!
export default function removeSelectValueForProperty(node, propName) {

    const options = node.options;
    const len = options.length;

    let i = 0;

    while (i < len) {
        options[i++].selected = false;
    }
}