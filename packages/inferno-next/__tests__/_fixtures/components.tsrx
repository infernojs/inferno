import { useState, createContext, use } from 'inferno-next';

export function Label(props) @{
  <span class='lbl'>{props.text as string}</span>
}

export function Greeting(props) @{
  <div>
    <Label text={props.name} />
  </div>
}

// Context test setup.
export const Theme = createContext('light');

export function ThemeReader() @{
  const theme = use(Theme);
  <span class='theme'>{theme as string}</span>
}

export function App() @{
  const [n, setN] = useState(0);
  <div>
    <button onClick={() => setN(n + 1)}>{n as string}</button>
    <Theme.Provider value={n % 2 === 0 ? 'light' : 'dark'}>
      <ThemeReader />
    </Theme.Provider>
  </div>
}

// Nested Providers — inner overrides outer.
export function Nested() @{
  <div>
    <Theme.Provider value={'outer'}>
      <div class='o'><ThemeReader /></div>
      <Theme.Provider value={'inner'}>
        <div class='i'><ThemeReader /></div>
      </Theme.Provider>
    </Theme.Provider>
  </div>
}

// No Provider — falls back to default.
export function DefaultOnly() @{
  <div><ThemeReader /></div>
}
