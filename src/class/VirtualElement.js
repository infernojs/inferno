import VirtualTextNode from './VirtualTextNode';

let doNotShowInHtml = {
	textContent: true,
	appendChild: true,
	setAttribute: true,
	outerHTML: true,
	innerHTML: true,
	children: true,
	tagName: true,
	options: true,
	selected: true,
	value: true
};

//VirtualElements are lightweight replacements for real DOM elements, they allow us to easily
//move, remove, delete elements around our 'virtual DOM' without needing real DOM elements
//we can they find their text string for when we want to renderToString()
class VirtualElement {
	constructor(tagName, xmlns, is) {
		this.tagName = tagName;
		this.xmlns = xmlns;
		this.is = is;
		this.children = [];

		if(tagName === 'select') {
			this.options = [];
		}

		Object.defineProperty(this, 'textContent', {
			set: textValue => {
				/* TODO shouldn't this entire function just be
					this.children = [new VirtualTextNode(textValue)];
				*/
				if (this.children.length > 0) {
					//if we have children, kill them
					this.children = [];
				}
				else {
					this.appendChild(new VirtualTextNode(textValue));
				}
			},
			get: () => this.children[0].nodeValue
		});

		Object.defineProperty(this, 'innerHTML', {
			set: () => {
				throw Error('You cannot set the innerHTML of virtual elements, use declarative API instead');
			},
			get: () => this.children.map(child => child.outerHTML || child.nodeValue).join('')
		});

		Object.defineProperty(this, 'outerHTML', {
			set: () => {
				throw Error('You cannot set the outerHTML of virtual elements, use declarative API instead');
			},
			get: () => {
				const childrenInnerHtml = this.children.map(child => child.outerHTML || child.nodeValue).join('');
				const attributes = [];
				for (let property in this) {
					if (!doNotShowInHtml[property] && this[property] != null) {
						let propVal = this[property];
						if(propVal === true) {
							propVal = '';
						}
						attributes.push(property + `="${ propVal }"`);
					}
				}
				if (attributes.length > 0) {
					return `<${ tagName } ${ attributes }>${ childrenInnerHtml }</${ tagName }>`;
				}
				return `<${ tagName }>${ childrenInnerHtml }</${ tagName }>`;
			}
		});
	}
	appendChild(child) {
		if(this.tagName === 'select') {
			this.options.push(child);
		}
		this.children.push(child);
	}
	setAttribute(attribute, value) {
		this[attribute] = value;
	}
}
export default VirtualElement;
