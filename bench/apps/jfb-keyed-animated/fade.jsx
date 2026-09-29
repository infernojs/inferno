// jfb-keyed with AnimatedComponent rows: enter and leave animations, no move hooks
import { render } from 'inferno';
import { AnimatedComponent } from 'inferno-animation';
import { createMain, installChecksum } from './app.jsx';

const Main = createMain(AnimatedComponent);
render(<Main />, document.getElementById('main'));
installChecksum();
