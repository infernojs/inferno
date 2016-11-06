import createElement from 'inferno-create-element';
import Link from './Link';

export default function IndexLink(props) {
	props.to = '/';
	return createElement(Link, props);
}
