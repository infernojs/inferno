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

export default function() {
	return isBrowser;
}
