// Port of js-framework-benchmark frameworks/keyed/inferno-9/src/store.js.
// The only functional change is the seeded PRNG in place of Math.random.
import { createRandom, seedFromLocation } from '../shared/prng.js';

const nextRandom = createRandom(seedFromLocation());

function random(max) {
  return Math.round(nextRandom() * 1000) % max;
}

let rowId = 1;
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
  'fancy',
];
const colours = ['red', 'yellow', 'blue', 'green', 'pink', 'brown', 'purple', 'brown', 'white', 'black', 'orange'];
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
  'keyboard',
];

function buildData(count, result) {
  for (let i = 0; i < count; i++) {
    result.push({
      id: rowId++,
      label: adjectives[random(adjectives.length)] + ' ' + colours[random(colours.length)] + ' ' + nouns[random(nouns.length)],
    });
  }
}

export class Store {
  constructor() {
    this.data = [];
    this.selected = undefined;
  }

  run() {
    this.data = [];
    this.add();
    this.selected = undefined;
  }

  runLots() {
    const newData = [];
    buildData(10000, newData);
    this.data = newData;
    this.selected = undefined;
  }

  add() {
    buildData(1000, this.data);
  }

  update() {
    const data = this.data;

    for (let i = 0; i < data.length; i += 10) {
      const dataItem = data[i];

      data[i] = {
        id: dataItem.id,
        label: dataItem.label + ' !!!',
      };
    }
  }

  select(id) {
    this.selected = id;
  }

  delete(id) {
    const data = this.data;
    const idx = data.findIndex((d) => d.id === id);

    data.splice(idx, 1);
  }

  clear() {
    this.data = [];
    this.selected = undefined;
  }

  swapRows() {
    const data = this.data;

    if (data.length > 998) {
      const a = data[1];
      data[1] = data[998];
      data[998] = a;
    }
  }
}
