import {createElement, isValidElement} from "inferno-compat";

export function create(obj) {
	var children = [];
	for (var key in obj) {
		if (obj.hasOwnProperty(key)) {
			var child = [].concat(obj[ key ]);
			for (var i = 0; i < child.length; i++) {
				var c = child[ i ];
				// if unkeyed, clone attrs and inject key
				if (isValidElement(c) && !(c.props && c.props.key)) {
					var a = {};
					if (c.props) for (var j in c.props) a[ j ] = c.props[ j ];
					a.key = key + '.' + i;
					c = createElement(c.type, a, c.children);
				}
				if (c != null) children.push(c);
			}
		}
	}
	return children;
}
