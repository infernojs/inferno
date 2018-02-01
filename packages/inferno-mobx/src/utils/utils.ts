export function isStateless(component) {
  return !(component.prototype && component.prototype.render);
}
