import { hydrate } from 'inferno-hydrate';
import { BrowserRouter } from 'inferno-router'
import { appFactory } from './App';

declare global {
  interface Window {
    __initialData__: any
  }
}

hydrate(<BrowserRouter initialData={window.__initialData__}>{appFactory()}</BrowserRouter>, document.getElementById('app'))
