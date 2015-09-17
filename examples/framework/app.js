var toggleBool = s => {
	s.bool = !s.bool;
};

var toggler = u => t7`<button onClick=${ () => u(toggleBool) }>Toggle</button>`;

var renderer = (s, u) => t7`
	<div>
		<div>${ s.bool }</div>
		${ toggler(u) }
	</div>
`;

Framework({ bool: true }, renderer, document.body);
