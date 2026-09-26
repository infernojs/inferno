// Bootstrap only: no bench harness code here, so the bundle stays byte-comparable
// with js-framework-benchmark's (the runner injects its DOM checksum itself).
import { render } from 'inferno';
import { Main } from './app.jsx';

render(<Main />, document.getElementById('main'));
