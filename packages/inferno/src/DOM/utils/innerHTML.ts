export function isSameInnerHTML(dom: Element, innerHTML: string): boolean {
  const temp = document.createElement('i');

  temp.innerHTML = innerHTML;
  return temp.innerHTML === dom.innerHTML;
}
