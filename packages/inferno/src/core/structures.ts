/* Internal Types */
import VNodeFlags from 'inferno-vnode-flags';

export interface Styles {
	[key: string]: number | string;
}

export interface IProps {
	[index: string]: any;
}
export interface VType {
	flags: VNodeFlags;
}
