import { render } from 'inferno';
import { BrowserRouter } from 'inferno-router'
import { appFactory } from './App';

declare global {
  interface Window {
    __initialData__: any
  }
}

render(<BrowserRouter initialData={window.__initialData__}>{appFactory()}</BrowserRouter>, document.getElementById('app'))
