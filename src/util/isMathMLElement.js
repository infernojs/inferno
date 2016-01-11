function isMathMLElement(nodeName) {
	return nodeName === 'mo'
		|| nodeName === 'mover'
		|| nodeName === 'mn'
		|| nodeName === 'maction'
		|| nodeName === 'menclose'
		|| nodeName === 'merror'
		|| nodeName === 'mfrac'
		|| nodeName === 'mi'
		|| nodeName === 'mmultiscripts'
		|| nodeName === 'mpadded'
		|| nodeName === 'mphantom'
		|| nodeName === 'mroot'
		|| nodeName === 'mrow'
		|| nodeName === 'ms'
		|| nodeName === 'mtd'
		|| nodeName === 'mtable'
		|| nodeName === 'munder'
		|| nodeName === 'msub'
		|| nodeName === 'msup'
		|| nodeName === 'msubsup'
		|| nodeName === 'mtr'
		|| nodeName === 'mtext';
}

export default isMathMLElement;
