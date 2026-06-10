import { useState, useId } from 'inferno-next';

export component Toggle() {
  const [on, setOn] = useState(false);
  <div>
    <button onClick={() => setOn(!on)}>{text on ? 'on' : 'off'}</button>
    <section>
      if (on) {
        <p class='shown'>{text 'shown'}</p>
      } else {
        <p class='hidden'>{text 'hidden'}</p>
      }
    </section>
  </div>
}

export component IfOnly() {
  const [show, setShow] = useState(false);
  <div>
    <button onClick={() => setShow(!show)}>{text 'toggle'}</button>
    <section>
      if (show) {
        <span class='maybe'>{text 'shown'}</span>
      }
    </section>
  </div>
}

export component HookInIf() {
  // Hooks inside an `if` branch — uses our compile-time Symbol slots, so
  // toggling the branch destroys + recreates state (Block boundary semantics).
  const [show, setShow] = useState(true);
  <div>
    <button id='top' onClick={() => setShow(!show)}>{text 'toggle'}</button>
    <section>
      if (show) {
        const [n, setN] = useState(0);
        <button id='inner' onClick={() => setN(n + 1)}>{text n}</button>
      }
    </section>
  </div>
}

export component IdInComponent() {
  const id = useId();
  <label for={id}>{text id}</label>
}
