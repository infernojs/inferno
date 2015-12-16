// inlcude the files you want to run in the browser here



require('./browser/acceptance/no-jsx/dom-components-tests'); // no-jsx components
require('./browser/acceptance/no-jsx/dom-elements-tests'); // no-jsx dom-elements-tests

require('./browser/performance/render/vdom-bench-tests'); // benchmark
//require('./shared/boily'); // shared
require('./node/boily'); // node