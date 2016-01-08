
export default function createStaticNode(html) {
	return {
		create() {
			return html;
		}
	};
}