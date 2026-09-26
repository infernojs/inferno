// Controlled-input workload for input latency. Cases:
//   echo        controlled <input> only (Inferno's InputWrapper path)
//   filter-1k   controlled <input> filtering a keyed 1,000 row list on each key
// prepare(case) resets the text and focuses the input; the measured op is a real
// key press dispatched by the runner.
import { Component, linkEvent, render } from 'inferno';
import { installHarness } from '../shared/harness.js';
import { createRandom } from '../shared/prng.js';

const random = createRandom(7);
const WORDS = ['apple', 'banana', 'cherry', 'date', 'elder', 'fig', 'grape', 'honeydew', 'kiwi', 'lemon'];
const ITEMS = Array.from({ length: 1000 }, (_, i) => ({
  id: i,
  label: `${WORDS[Math.floor(random() * WORDS.length)]} ${WORDS[Math.floor(random() * WORDS.length)]} ${i}`,
}));

function onInput(app, e) {
  app.setState({ text: e.target.value });
}

function Row({ item }) {
  return (
    <li className="row" $HasTextChildren>
      {item.label}
    </li>
  );
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { text: '' };
  }

  render() {
    const { text } = this.state;
    let list = null;
    if (this.props.mode === 'filter-1k') {
      const rows = [];
      for (let i = 0; i < ITEMS.length; i++) {
        const item = ITEMS[i];
        if (item.label.includes(text)) {
          rows.push(<Row key={item.id} item={item} />);
        }
      }
      list = <ul $HasKeyedChildren>{rows}</ul>;
    }
    return (
      <div className="typing">
        <input id="typing-input" type="text" value={text} onInput={linkEvent(this, onInput)} autocomplete="off" />
        {list}
      </div>
    );
  }
}

const container = document.getElementById('app');

installHarness({
  root: () => container,
  cases: ['echo', 'filter-1k'],
  prepare(mode) {
    if (mode !== 'echo' && mode !== 'filter-1k') {
      throw new Error(`Unknown typing case ${mode}`);
    }
    render(null, container);
    render(<App mode={mode} />, container);
    const input = document.getElementById('typing-input');
    input.focus();
    return '#typing-input';
  },
  op: '#typing-input',
  extra: { key: 'a' },
});
