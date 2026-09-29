// jfb-keyed with AnimatedAllComponent rows: enter, leave and move animations
import { render } from 'inferno';
import { AnimatedAllComponent } from 'inferno-animation';
import { createMain, installChecksum } from './app.jsx';

const Main = createMain(AnimatedAllComponent);
render(<Main />, document.getElementById('main'));
installChecksum();
