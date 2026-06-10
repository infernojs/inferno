import { useState } from 'inferno-next';

export function List(props) @{
  <ul>
    @for (const item of props.items; key item.id) {
      <li>{item.label as string}</li>
    }
  </ul>
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
