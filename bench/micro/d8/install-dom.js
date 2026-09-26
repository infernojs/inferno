// Imported first by the d8 entry so the DOM exists before Inferno's module code
// runs (rendering.ts reads document.body and patches Node.prototype at load).
import * as shim from '../dom-shim.js';

shim.installDom();
globalThis.__shim = shim;
