export component Hello() {
  <div class='greet'>{text 'Hello, world'}</div>
}

export component Counter(props) {
  <span>{text props.n}</span>
}

export component Greet(props) {
  <p>{text 'Hello, '}{text props.name}{text ' !'}</p>
}

export component Mixed() {
  <div id='m'>
    <span class='a'>{text 'A'}</span>
    <span class='b'>{text 'B'}</span>
  </div>
}

// SVG — namespace must be preserved on the root and on descendants. Static
// values are inlined into the template HTML so the HTML5 parser places them
// in the SVG namespace via foreign-content rules.
export component SvgStatic() {
  <svg id='chart' viewBox='0 0 100 100' class='chart'>
    <circle cx='50' cy='50' r='40' fill='red' />
    <g class='labels'>
      <text x='50' y='55'>{text 'hi'}</text>
    </g>
  </svg>
}

// SVG with dynamic attribute + dynamic class — exercises the runtime paths
// (setAttribute / setClassName), which must NOT use the .className property
// on SVG (read-only SVGAnimatedString).
export component SvgDynamic(props) {
  <svg id='dyn' viewBox='0 0 100 100' class={props.klass}>
    <rect x='0' y='0' width={props.w} height='20' fill={props.fill} />
  </svg>
}

// MathML — same parser story: HTML5 foreign content handles <math>.
export component MathStatic() {
  <math id='eq' display='block'>
    <mrow>
      <mi>{text 'a'}</mi>
      <mo>{text '+'}</mo>
      <mi>{text 'b'}</mi>
    </mrow>
  </math>
}

export component MathDynamic(props) {
  <math id='dyneq' display={props.display}>
    <mn class={props.klass}>{text props.value}</mn>
  </math>
}
