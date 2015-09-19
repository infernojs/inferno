export default {
	selectedIndex(node, value) {
		
        // selectbox has special case
        if (node.tagName === "SELECT" && (Array.prototype.every.call(node.options, (o) => !(o.selected = o.value === value)))) { 
            node.selectedIndex = -1;
        } else {

			node.selectedIndex = value;
			
			}
	},
	className(node, value) {
		node.className = value || '';
	}
};
