const internalID = '_inferno_';

let counter = 1;

function getDomNodeId(node, onlyGet) {
    return node[internalID] || (onlyGet? null : node[internalID] = counter++);
}

export default getDomNodeId;