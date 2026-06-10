import { useState } from 'inferno-next';

// Simple early-return: render nothing when condition holds.
export component Maybe(props) {
  if (props.hide) return;
  <p class='shown'>{text 'shown'}</p>
}

// Two early-returns in sequence. Each gates the remainder.
export component Multi(props) {
  <p class='hello'>{text 'hello'}</p>
  if (props.stopA) return;
  <p class='world'>{text 'world'}</p>
  if (props.stopB) return;
  <p class='done'>{text 'done'}</p>
}

// Early return with toggle state — re-renders should re-evaluate.
export component Toggleable() {
  const [show, setShow] = useState(true);
  <button onClick={() => setShow(!show)}>{text 'toggle'}</button>
  if (!show) return;
  <p class='content'>{text 'content'}</p>
}

// Early-return inside a no-braces if.
export component NoBraces(props) {
  if (props.hide) return;
  <p class='visible'>{text 'visible'}</p>
}
