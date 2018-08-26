export function isSameInnerHTML(dom: Element, innerHTML: string): boolean {
  const tempdom = document.createElement('i');

  tempdom.innerHTML = innerHTML;
  return tempdom.innerHTML === dom.innerHTML;
}
