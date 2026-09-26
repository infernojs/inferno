/**
 * In-page contract between bench apps and the runner (window.__bench):
 *
 *   ready       true once the app has mounted
 *   cases       names of prepared states the app supports (optional)
 *   prepare(c)  untimed: bring the app to the state before the measured op; may
 *               return a selector overriding `op` for that case
 *   op          CSS selector of the element whose real click is the measured op
 *   key         when set, the op is this key pressed into `op` instead of a click
 *   checksum()  DOM signature of the app root, compared across variants so a
 *               variant can't look faster by rendering something different
 *
 * Measured ops are always triggered by real input (CDP mouse/key events), never
 * by calling functions, so event dispatch cost is included like in a real app.
 */

/** 32-bit FNV-1a over a string. */
export function fnv1a(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

export function domChecksum(root) {
  const html = root.innerHTML;
  return `${fnv1a(html)}:${html.length}:${root.getElementsByTagName('*').length}`;
}

/**
 * A fixed, nearly transparent button outside the app root. Its native listener
 * runs `handler`, so trigger overhead is identical for every variant and does
 * not go through Inferno's own event system.
 */
export function createOpButton(handler) {
  const button = document.createElement('button');
  button.id = 'bench-op';
  button.type = 'button';
  button.setAttribute('aria-label', 'bench op');
  button.style.cssText =
    'position:fixed;left:0;top:0;width:24px;height:24px;margin:0;padding:0;border:0;opacity:0.01;z-index:2147483647';
  button.addEventListener('click', (e) => {
    e.stopPropagation();
    handler();
  });
  document.body.appendChild(button);
  return '#bench-op';
}

export function installHarness({ root, cases = [], prepare = () => {}, op = null, extra = {} }) {
  window.__bench = {
    ready: true,
    cases,
    prepare,
    op,
    checksum: () => domChecksum(root()),
    ...extra,
  };
}
