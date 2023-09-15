import {JSDOM} from 'jsdom';
const dom = new JSDOM(`<!DOCTYPE html><html><body><div id="app"></div></body></html>`);

const rafMock = Promise.resolve().then.bind(Promise.resolve());

global.window = dom.window;
global.document = dom.window.document;
global.Node = dom.window.Node;
global.window.requestAnimationFrame = rafMock
global.requestAnimationFrame = rafMock;

export const container = dom.window.document.querySelector("#app");
