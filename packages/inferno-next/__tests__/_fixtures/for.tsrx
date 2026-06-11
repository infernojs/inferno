import { useState } from 'inferno-next';

export function List(props) @{
  <ul>
    @for (const item of props.items; key item.id) {
      <li>{item.label as string}</li>
    }
  </ul>
}

// `@for (...) @empty { ... }` — empty branch mounts when the iterable is empty,
// unmounts when items return. Hooks declared in the empty body have their own
// Block boundary, so re-entering the empty state mounts a fresh state.
export function ListWithEmpty(props) @{
  <ul class='outer'>
    @for (const item of props.items; key item.id) {
      <li class='row'>{item.label as string}</li>
    } @empty {
      <li class='empty'>{'No items'}</li>
    }
  </ul>
}

// Toggle items in/out via state — exercises the items → 0 → items transition
// the runtime needs to handle.
export function ToggleableEmpty() @{
  const [items, setItems] = useState([{id: 1, label: 'a'}, {id: 2, label: 'b'}]);
  <div>
    <button id='clear' onClick={() => setItems([])}>{'clear'}</button>
    <button id='restore' onClick={() => setItems([{id: 1, label: 'a'}, {id: 2, label: 'b'}])}>{'restore'}</button>
    <ul class='outer'>
      @for (const item of items; key item.id) {
        <li class='row'>{item.label as string}</li>
      } @empty {
        <li class='empty'>{'No items'}</li>
      }
    </ul>
  </div>
}

export function MutableList() @{
  const [items, setItems] = useState([{id: 1, label: 'a'}, {id: 2, label: 'b'}, {id: 3, label: 'c'}]);
  <div>
    <button id='reverse' onClick={() => setItems([...items].reverse())}>{'rev'}</button>
    <button id='swap' onClick={() => {
      const next = [...items];
      const tmp = next[0]; next[0] = next[next.length - 1]; next[next.length - 1] = tmp;
      setItems(next);
    }}>{'swap'}</button>
    <button id='add' onClick={() => setItems([...items, {id: items.length + 1, label: String.fromCharCode(97 + items.length)}])}>{'add'}</button>
    <button id='remove-first' onClick={() => setItems(items.slice(1))}>{'rm-first'}</button>
    <button id='remove-middle' onClick={() => {
      const next = [...items];
      next.splice(Math.floor(next.length / 2), 1);
      setItems(next);
    }}>{'rm-mid'}</button>
    <button id='clear' onClick={() => setItems([])}>{'clear'}</button>
    <ul>
      @for (const item of items; key item.id) {
        <li>{item.label as string}</li>
      }
    </ul>
  </div>
}
