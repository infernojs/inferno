import { Component, render } from 'inferno';

function $(id) {
  return document.getElementById(id);
}

function SearchBox() {
  return <input autoFocus placeholder="Search" />;
}

// Renders an empty form and adds the element from props.render to it a moment later
class AddLater extends Component {
  constructor(props) {
    super(props);
    this.state = { added: false };
  }

  componentDidMount() {
    setTimeout(() => this.setState({ added: true }, this.props.onAdded), 300);
  }

  render() {
    return <form>{this.state.added ? this.props.render() : null}</form>;
  }
}

function insertInput(container, autofocusBeforeInsert) {
  const form = document.createElement('form');
  const input = document.createElement('input');

  container.appendChild(form);
  if (autofocusBeforeInsert) {
    input.autofocus = true;
  }
  form.appendChild(input);
  if (!autofocusBeforeInsert) {
    input.autofocus = true;
  }
}

// Each case puts an input with autofocus into the container and calls done once the input is in the page
const CASES = {
  nested(container, done) {
    render(
      <form>
        <input autoFocus placeholder="Search" />
      </form>,
      container,
    );
    done();
  },
  root(container, done) {
    render(<input autoFocus placeholder="Search" />, container);
    done();
  },
  update(container, done) {
    render(<AddLater render={() => <input autoFocus placeholder="Search" />} onAdded={done} />, container);
  },
  component(container, done) {
    render(<AddLater render={() => <SearchBox />} onAdded={done} />, container);
  },
  'dom-before'(container, done) {
    insertInput(container, true);
    done();
  },
  'dom-after'(container, done) {
    insertInput(container, false);
    done();
  },
};

function tagName(element) {
  return element ? '<' + element.nodeName.toLowerCase() + '>' : 'null';
}

function showResult(row, container, records) {
  const focused = document.activeElement === container.querySelector('input');
  const expected = row.getAttribute('data-expected');
  const status = $('status');

  status.textContent =
    'expected: ' +
    expected +
    '\nresult:   ' +
    (focused ? 'focused' : 'not focused, document.activeElement is ' + tagName(document.activeElement)) +
    '\nautofocus attribute added after the input was in the page: ' +
    (records.length > 0 ? 'yes' : 'no');
  status.className = 'status ' + (focused === (expected === 'focused') ? 'ok' : 'bad');
}

document.addEventListener('DOMContentLoaded', function () {
  const id = new URLSearchParams(location.search).get('case');
  const run = CASES[id];

  if (!run) {
    return;
  }
  const row = $('case-' + id);
  const container = $('container');
  const records = [];
  // Sees autofocus attribute changes only on elements that are already in the page
  const observer = new MutationObserver((list) => records.push(...list));

  row.classList.add('current');
  $('result-title').textContent = row.querySelector('a').textContent;
  $('again').href = '?case=' + id;
  $('result').hidden = false;
  observer.observe(container, { attributes: true, attributeFilter: ['autofocus'], subtree: true });

  run(container, function () {
    // The browser applies autofocus when it next updates the rendering, so check two frames later
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        records.push(...observer.takeRecords());
        observer.disconnect();
        showResult(row, container, records);
      }),
    );
  });
});
