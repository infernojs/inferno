// rfc4122 compliant
	let t = [];

	for ( let n = 0; n < 256; n++ ) {
		t[n] = ( n < 16 ? '0' : '' ) + n.toString( 16 )
	}

	export default function uuid() {
		let e = Math.random() * 4294967295 | 0;
		let n = Math.random() * 4294967295 | 0;
		let r = Math.random() * 4294967295 | 0;
		let i = Math.random() * 4294967295 | 0;
		return t[e & 255] + t[e >> 8 & 255] + t[e >> 16 & 255] + t[e >> 24 & 255] + '-' + t[n & 255] + t[n >> 8 & 255] + '-' + t[n >> 16 & 15 | 64] + t[n >> 24 & 255] + '-' + t[r & 63 | 128] + t[r >> 8 & 255] + '-' + t[r >> 16 & 255] + t[r >> 24 & 255] + t[i & 255] + t[i >> 8 & 255] + t[i >> 16 & 255] + t[i >> 24 & 255]
	};