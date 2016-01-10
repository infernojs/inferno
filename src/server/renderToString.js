export default function renderToString(item) {
	return item.tree.html.create(item);
}