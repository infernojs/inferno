import { useState, createContext, use } from 'inferno-next';

export component Label(props) {
  <span class='lbl'>{text props.text}</span>
}

export component Greeting(props) {
  <div>
    <Label text={props.name} />
  </div>
}

// Context test setup.
export const Theme = createContext('light');

export component ThemeReader() {
  const theme = use(Theme);
  <span class='theme'>{text theme}</span>
}

export component App() {
  const [n, setN] = useState(0);
  <div>
    <button onClick={() => setN(n + 1)}>{text n}</button>
    <Theme.Provider value={n % 2 === 0 ? 'light' : 'dark'}>
      <ThemeReader />
    </Theme.Provider>
  </div>
}

// Nested Providers — inner overrides outer.
export component Nested() {
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
export component DefaultOnly() {
  <div><ThemeReader /></div>
}
