import { useState, createContext, use, createPortal } from 'inferno-next';

// Multiple distinct contexts in one tree.
export const ThemeCtx = createContext('light');
export const UserCtx = createContext('anon');
export const CountCtx = createContext(0);

// Reads a single context value.
export component ThemeReader() {
  const v = use(ThemeCtx);
  <span class='theme'>{text v}</span>
}

export component UserReader() {
  const v = use(UserCtx);
  <span class='user'>{text v}</span>
}

export component CountReader() {
  const v = use(CountCtx);
  <span class='count'>{text v}</span>
}

// Reads two contexts in one component.
export component CombinedReader() {
  const theme = use(ThemeCtx);
  const user = use(UserCtx);
  <span class='combined'>{text theme + '/' + user}</span>
}

// Provider value updates → consumers re-render.
export component DynamicProvider() {
  const [v, setV] = useState('init');
  <div>
    <button id='swap' onClick={() => setV(v === 'init' ? 'changed' : 'init')}>{text 'swap'}</button>
    <ThemeCtx.Provider value={v}>
      <ThemeReader />
    </ThemeCtx.Provider>
  </div>
}

// Multiple sibling consumers all see the same value.
export component Siblings() {
  <ThemeCtx.Provider value={'dark'}>
    <div>
      <div class='one'><ThemeReader /></div>
      <div class='two'><ThemeReader /></div>
      <div class='three'><ThemeReader /></div>
    </div>
  </ThemeCtx.Provider>
}

// Distinct contexts — each consumer reads its own; no leak.
export component TwoContexts() {
  <ThemeCtx.Provider value={'dark'}>
    <UserCtx.Provider value={'alice'}>
      <div>
        <ThemeReader />
        <UserReader />
        <CombinedReader />
      </div>
    </UserCtx.Provider>
  </ThemeCtx.Provider>
}

// use() inside an if-branch — the read happens only when the branch mounts.
export component ConditionalUse(props) {
  <ThemeCtx.Provider value={'dark'}>
    <div>
      if (props.show) {
        <ThemeReader />
      } else {
        <span class='hidden'>{text 'hidden'}</span>
      }
    </div>
  </ThemeCtx.Provider>
}

// use() inside for-of items — each item reads the same context independently.
export component ListConsumers(props) {
  <CountCtx.Provider value={props.value}>
    <ul>
      for (const x of props.items; key x) {
        <li>
          <CountReader />
          <span class='ix'>{text x}</span>
        </li>
      }
    </ul>
  </CountCtx.Provider>
}

// Context flows through a portal — consumer in the portal target reads
// the Provider that wraps the portal call site.
export component PortalledContext(props) {
  <ThemeCtx.Provider value={'from-portal-parent'}>
    <div>
      {createPortal(<tsrx><div class='portal-content'><ThemeReader /></div></tsrx>, props.target)}
    </div>
  </ThemeCtx.Provider>
}

// Context updates inside a for-of body — changing the value re-renders all rows.
export component LiveCount(props) {
  const [n, setN] = useState(0);
  <CountCtx.Provider value={n}>
    <div>
      <button id='inc' onClick={() => setN(n + 1)}>{text n}</button>
      <ul>
        for (const x of props.ids; key x) {
          <li>
            <span class='label'>{text 'r' + x}</span>
            <CountReader />
          </li>
        }
      </ul>
    </div>
  </CountCtx.Provider>
}
