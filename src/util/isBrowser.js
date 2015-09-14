// TODO get rid of this
// let the user decide whether it's the browser or not

let isBrowser = false;

if (typeof window !== 'undefined') {
	isBrowser = true;
}

export function removeBrowser() {
	isBrowser = false;
}

export function addBrowser() {
	isBrowser = true;
}

export default () => isBrowser;
