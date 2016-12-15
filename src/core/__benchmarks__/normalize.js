import benchmark from 'benchmark';
import { normalize } from 'inferno';

suite('Normalize', () => {
  benchmark('Normalize', () => {
    normalize({
      children: null,
      dom: null,
      events: null,
      flags: 1 << 12,
      key: null,
      props: null,
      ref: null,
      type: 'Text'
    })
  });
}); 