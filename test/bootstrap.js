// inlcude the files you want to run in the browser here
require('./browser/acceptance/no-jsx/dom-components-tests'); // no-jsx components
require('./browser/acceptance/no-jsx/dom-elements-tests'); // no-jsx dom-elements-tests
require('./browser/acceptance/no-jsx/svg-tests'); // no-jsx svg tests

require('./browser/acceptance/jsx/dom-elements-tests'); // jsx dom-elements-tests
require('./browser/acceptance/jsx/dom-components-tests'); // jsx dom-elements-tests

require('./browser/performance/render/vdom-bench-tests'); // benchmark
// TODO let's add these when we have actual tests for them
//require('./shared/inferno'); // shared
//require('./node/inferno'); // node