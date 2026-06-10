import { useState } from 'inferno-next';

export component Classed(props) {
  <div class={props.kind}>{text 'x'}</div>
}

export component WithAttrs(props) {
  <a href={props.url} title={props.title}>{text 'link'}</a>
}

export component Clicker() {
  const [n, setN] = useState(0);
  <button onClick={() => setN(n + 1)}>{text n}</button>
}

export component FnSetter() {
  const [n, setN] = useState(0);
  <button onClick={() => { setN(c => c + 1); setN(c => c + 1); setN(c => c + 1); }}>{text n}</button>
}
