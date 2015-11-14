import infernoID from './vars/infernoID';

let counter = 1;

export default (node, onlyGet) => node[infernoID] || (onlyGet ? null : node[infernoID] = counter++);
