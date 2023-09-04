export function isStateless(component: any): boolean {
  return !component.prototype?.render;
}
