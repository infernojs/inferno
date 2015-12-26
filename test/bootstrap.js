// inlcude the files you want to run in the browser here
require('./browser/acceptance/no-jsx/dom-components-tests'); // no-jsx components
require('./browser/acceptance/no-jsx/dom-elements-tests1'); // no-jsx dom-elements-tests
require('./browser/acceptance/no-jsx/dom-elements-tests2'); // no-jsx dom-elements-tests
require('./browser/acceptance/no-jsx/dom-elements-tests3'); // no-jsx dom-elements-tests
require('./browser/acceptance/no-jsx/dom-elements-tests4'); // no-jsx dom-elements-tests
require('./browser/acceptance/no-jsx/svg-tests'); // no-jsx svg tests
//require('./browser/acceptance/no-jsx/event-tests'); // no-jsx event tests
require('./browser/acceptance/jsx/dom-elements-tests'); // jsx dom-elements-tests
require('./browser/acceptance/jsx/dom-components-tests'); // jsx dom-elements-tests
require('./browser/acceptance/jsx/svg-elements-tests'); // jsx svg-elements-tests
require('./browser/acceptance/jsx/jsx-style-tests'); // jsx-style-tests-tests

require('./browser/performance/render/vdom-bench-tests'); // benchmark
// TODO let's add these when we have actual tests for them
//require('./shared/inferno'); // shared
//require('./node/inferno'); // node
