import { useState } from 'inferno-next';

// Single `continue` skips rendering for matching items.
export component FilterList(props) {
  <ul>
    for (const item of props.items; key item.id) {
      if (item.hidden) continue;
      <li>{text item.label}</li>
    }
  </ul>
}

// Multiple `continue`s in sequence — each gates everything after it.
export component MultiContinue(props) {
  <ul>
    for (const item of props.items; key item.id) {
      <span class={'badge id-' + item.id}>{text 'r' + item.id}</span>
      if (item.skipA) continue;
      <span class='a'>{text 'A:' + item.label}</span>
      if (item.skipB) continue;
      <span class='b'>{text 'B:' + item.label}</span>
    }
  </ul>
}

// Continue with no-braces form.
export component NoBraces(props) {
  <ul>
    for (const item of props.items; key item.id) {
      if (item.hidden) continue;
      <li>{text item.label}</li>
    }
  </ul>
}

// Toggle items in/out via state — verifies items reappear when their guard flips.
export component Stateful() {
  const [items, setItems] = useState([
    { id: 1, label: 'a', hidden: false },
    { id: 2, label: 'b', hidden: true },
    { id: 3, label: 'c', hidden: false },
  ]);
  <div>
    <button id='show2' onClick={() => setItems(items.map((x) => x.id === 2 ? { ...x, hidden: false } : x))}>{text 'show 2'}</button>
    <button id='hide1' onClick={() => setItems(items.map((x) => x.id === 1 ? { ...x, hidden: true } : x))}>{text 'hide 1'}</button>
    <ul>
      for (const item of items; key item.id) {
        if (item.hidden) continue;
        <li class={'l-' + item.id}>{text item.label}</li>
      }
    </ul>
  </div>
}

// `return` from a component body still works alongside `continue` (different scopes).
export component ReturnInComponentContinueInLoop(props) {
  if (props.hideAll) return;
  <ul>
    for (const item of props.items; key item.id) {
      if (item.skip) continue;
      <li>{text item.label}</li>
    }
  </ul>
}
