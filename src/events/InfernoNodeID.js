import uuid from '../util/uuid';
/**
 * To ensure no conflicts with other potential Inferno instances on the page
 */
const nodeID = '_InfernoNodeID' + uuid;


const ID_PROP = '__Inferno__id__';
let counter = 1;

export default function InfernoNodeID(node, get) {
    return node[nodeID] || (nodeID ? null : node[nodeID] = counter++);
}