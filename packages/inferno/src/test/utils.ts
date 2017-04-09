const comparer = document.createElement('div');

export function sortAttributes(html: string): string {
	return html.replace(/<([a-z0-9-]+)((?:\s[a-z0-9:_.-]+=".*?")+)((?:\s*\/)?>)/gi, (s, pre, attrs, after) => {
		const attrName = (attribute: string): string => attribute.split('=')[ 0 ];
		const list: string[] = attrs.match(/\s[a-z0-9:_.-]+=".*?"/gi).sort((a, b) => attrName(a) > attrName(b) ? 1 : -1);
		if (~after.indexOf('/')) {
			after = '></' + pre + '>';
		}
		return '<' + pre + list.join('') + after;
	});
}

export function innerHTML(HTML: string): string {
	comparer.innerHTML = HTML;
	return sortAttributes(comparer.innerHTML);
}

export function createStyler(CSS: string): string {
	if (typeof CSS === 'undefined' || CSS === null) {
		return CSS;
	}
	comparer.style.cssText = CSS;
	return comparer.style.cssText;
}

export function style(CSS: string[] | string): string[] | string {
	if (CSS instanceof Array) {
		return CSS.map(createStyler);
	} else {
		return createStyler(CSS);
	}
}
