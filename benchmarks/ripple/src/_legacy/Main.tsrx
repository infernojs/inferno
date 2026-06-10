import { track, type Tracked } from 'ripple';

const adjectives = [
  'pretty',
  'large',
  'big',
  'small',
  'tall',
  'short',
  'long',
  'handsome',
  'plain',
  'quaint',
  'clean',
  'elegant',
  'easy',
  'angry',
  'crazy',
  'helpful',
  'mushy',
  'odd',
  'unsightly',
  'adorable',
  'important',
  'inexpensive',
  'cheap',
  'expensive',
  'fancy'
];
const colours = [
  'red',
  'yellow',
  'blue',
  'green',
  'pink',
  'brown',
  'purple',
  'brown',
  'white',
  'black',
  'orange'
];
const nouns = [
  'table',
  'chair',
  'house',
  'bbq',
  'desk',
  'car',
  'pony',
  'cookie',
  'sandwich',
  'burger',
  'pizza',
  'mouse',
  'keyboard'
];

function _random(max: number) {
  return Math.round(Math.random() * 1000) % max;
}

interface Row {
  id: number;
  label: Tracked<string>;
}

export default component App() {
  let rowId = 1;
  const items = track<Row[]>([]);
  const selected = track<number | undefined>(undefined);

  const add = () => (items.value = [...items.value, ...buildData(1000)]);
  const clear = () => {
    items.value = [];
  };

  const partialUpdate = () => {
    for (let i = 0; i < items.value.length; i += 10) {
      const row = items.value[i];
      row.label.value = row.label.value + ' !!!';
    }
  };

  const remove = (row: Row) => {
    const clone = items.value.slice();
    clone.splice(clone.indexOf(row), 1);
    items.value = clone;
  };

  const run = () => {
    items.value = buildData(1000);
  };

  const runLots = () => {
    items.value = buildData(10000);
  };

  const swapRows = () => {
    if (items.value.length > 998) {
      const clone = items.value.slice();
      const tmp = clone[1];
      clone[1] = clone[998];
      clone[998] = tmp;
      items.value = clone;
    }
  };

  function buildData(count = 1000): Row[] {
    const data = new Array(count);
    for (let i = 0; i < count; i++) {
      const label = `${adjectives[_random(adjectives.length)]} ${colours[_random(colours.length)]} ${nouns[_random(nouns.length)]}`;

      data[i] = {
        id: rowId++,
        label: track(label),
      };
    }
    return data;
  }

  <div id="main" class="container">
    <div class="jumbotron">
      <div class="row">
        <div class="col-md-6">
          <h1>{"Ripple"}</h1>
        </div>
        <div class="col-md-6">
          <div class="row">
            <div class="col-sm-6 smallpad">
              <button type="button" class="btn btn-primary btn-block" id="run" onClick={run}>
                {"Create 1,000 rows"}
              </button>
            </div>
            <div class="col-sm-6 smallpad">
              <button type="button" class="btn btn-primary btn-block" id="runlots" onClick={runLots}>
                {"Create 10,000 rows"}
              </button>
            </div>
            <div class="col-sm-6 smallpad">
              <button type="button" class="btn btn-primary btn-block" id="add" onClick={add}>
                {"Append 1,000 rows"}
              </button>
            </div>
            <div class="col-sm-6 smallpad">
              <button type="button" class="btn btn-primary btn-block" id="update" onClick={partialUpdate}>
                {"Update every 10th row"}
              </button>
            </div>
            <div class="col-sm-6 smallpad">
              <button type="button" class="btn btn-primary btn-block" id="clear" onClick={clear}>
                {"Clear"}
              </button>
            </div>
            <div class="col-sm-6 smallpad">
              <button type="button" class="btn btn-primary btn-block" id="swaprows" onClick={swapRows}>
                {"Swap Rows"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <table class="table table-hover table-striped test-data">
      <tbody>
        for (const row of items.value) {
          const id = row.id;

          <tr class={selected.value === id ? 'danger' : ''}>
            <td class="col-md-1">{text id}</td>
            <td class="col-md-4">
              <a onClick={() => { selected.value = id; }}>{text row.label.value}</a>
            </td>
            <td class="col-md-1">
              <a onClick={() => remove(row)}>
                <span class="glyphicon glyphicon-remove" aria-hidden="true" />
              </a>
            </td>
            <td class="col-md-6" />
          </tr>
        }
      </tbody>
    </table>
    <span class="preloadicon glyphicon glyphicon-remove" aria-hidden="true"></span>
  </div>
}
