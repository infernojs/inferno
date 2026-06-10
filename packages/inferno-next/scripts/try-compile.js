import { compile } from '../compiler/compile.js';
import { readFileSync } from 'fs';
const src = readFileSync(process.argv[2], 'utf8');
try {
  const out = compile(src, process.argv[2]);
  console.log('OK');
  console.log('---');
  console.log(out.code);
} catch (e) {
  console.log('FAIL:', e.message);
  console.log(e.stack.split('\n').slice(0, 8).join('\n'));
}
