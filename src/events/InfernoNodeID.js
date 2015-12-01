const ID_PROP = '__Inferno__id__';
let counter = 1;

export default function InfernoNodeID(node, onlyGet) {
    return node[ID_PROP] || (onlyGet? null : node[ID_PROP] = counter++);
}