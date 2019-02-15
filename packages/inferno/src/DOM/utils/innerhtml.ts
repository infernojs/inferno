export function isSameInnerHTML(dom: Element, innerHTML: string): boolean {
  let doc = dom.ownerDocument;

  if (!doc) {
    doc = document;
  }

  const tempdom = doc.createElement('i');

  tempdom.innerHTML = innerHTML;
  return tempdom.innerHTML === dom.innerHTML;
}
