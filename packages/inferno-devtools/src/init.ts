import { createDevToolsBridge } from './bridge';


export function initDevTools() {
  /* tslint:disable */
  if (typeof window['__REACT_DEVTOOLS_GLOBAL_HOOK__'] === 'undefined') {
    return;
  }
  window['__REACT_DEVTOOLS_GLOBAL_HOOK__'].inject(createDevToolsBridge());
  /* tslint:enable */
}
