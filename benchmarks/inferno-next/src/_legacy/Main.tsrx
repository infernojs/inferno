
import { useState } from 'inferno-next';

const ADJECTIVES = ['pretty','large','big','small','tall','short','long','handsome','plain','quaint','clean','elegant','easy','angry','crazy','helpful','mushy','odd','unsightly','adorable','important','inexpensive','cheap','expensive','fancy'];
const COLOURS    = ['red','yellow','blue','green','pink','brown','purple','brown','white','black','orange'];
const NOUNS      = ['table','chair','house','bbq','desk','car','pony','cookie','sandwich','burger','pizza','mouse','keyboard'];

let nextId = 1;
function _random(max) { return (Math.random() * max) | 0; }

function buildData(count) {
  const data = new Array(count);
  for (let i = 0; i < count; i++) {
    data[i] = {
      id: nextId++,
      label: ADJECTIVES[_random(ADJECTIVES.length)] + ' ' +
             COLOURS[_random(COLOURS.length)]       + ' ' +
             NOUNS[_random(NOUNS.length)],
    };
  }
  return data;
}

export default component Main() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(0);

  const run      = () => setItems(buildData(1000));
  const runLots  = () => setItems(buildData(10000));
  const add      = () => setItems((d) => d.concat(buildData(1000)));
  const update   = () => setItems((d) => {
    const out = d.slice();
    for (let i = 0; i < out.length; i += 10) {
      const r = out[i];
      out[i] = { id: r.id, label: r.label + ' !!!' };
    }
    return out;
  });
  const clear    = () => setItems([]);
  const swap     = () => setItems((d) => {
    if (d.length <= 998) return d;
    const out = d.slice();
    const tmp = out[1]; out[1] = out[998]; out[998] = tmp;
    return out;
  });
  const select   = (id) => setSelected(id);
  const remove   = (row) => setItems((d) => {
    const out = d.slice();
    out.splice(out.indexOf(row), 1);
    return out;
  });

  <div id="main" class="container">
    <div class='jumbotron'>
      <div class='row'>
        <div class='col-md-6'><h1>{'inferno-next'}</h1></div>
        <div class='col-md-6'>
          <div class='row'>
            <div class='col-sm-6 smallpad'>
              <button type='button' class='btn btn-primary btn-block' id='run' onClick={run}>{'Create 1,000 rows'}</button>
            </div>
            <div class='col-sm-6 smallpad'>
              <button type='button' class='btn btn-primary btn-block' id='runlots' onClick={runLots}>{'Create 10,000 rows'}</button>
            </div>
            <div class='col-sm-6 smallpad'>
              <button type='button' class='btn btn-primary btn-block' id='add' onClick={add}>{'Append 1,000 rows'}</button>
            </div>
            <div class='col-sm-6 smallpad'>
              <button type='button' class='btn btn-primary btn-block' id='update' onClick={update}>{'Update every 10th row'}</button>
            </div>
            <div class='col-sm-6 smallpad'>
              <button type='button' class='btn btn-primary btn-block' id='clear' onClick={clear}>{'Clear'}</button>
            </div>
            <div class='col-sm-6 smallpad'>
              <button type='button' class='btn btn-primary btn-block' id='swaprows' onClick={swap}>{'Swap Rows'}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <table class='table table-hover table-striped test-data'>
      <tbody>
        for (const row of items; key row.id) {
          <tr class={selected === row.id ? 'danger' : ''}>
            <td class='col-md-1'>{text row.id}</td>
            <td class='col-md-4'>
              <a onClick={() => select(row.id)}>{text row.label}</a>
            </td>
            <td class='col-md-1'>
              <a onClick={() => remove(row)}>
                <span class='glyphicon glyphicon-remove' aria-hidden='true' />
              </a>
            </td>
            <td class='col-md-6' />
          </tr>
        }
      </tbody>
    </table>
    <span class='preloadicon glyphicon glyphicon-remove' aria-hidden='true' />
  </div>
}
