//import { hydrate } from 'inferno-hydrate';
import { render } from 'inferno';
import { BrowserRouter } from 'inferno-router'
import { appFactory } from './App';

// hydrate(<BrowserRouter>{appFactory()}</BrowserRouter>, document.getElementById('app'))
render(<BrowserRouter>{appFactory()}</BrowserRouter>, document.getElementById('app'))
// render(<Body>Test</Body>, document.getElementById('app'))