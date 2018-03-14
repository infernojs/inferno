# Dev Tools

Inferno has a development tools module which allows you to inspect the component hierarchies via the React Chrome Developer Tools plugin. You will get a new tab called React in your Chrome DevTools. This shows you the root Inferno components that were rendered on the page, as well as the subcomponents that they ended up rendering.

By selecting one of the components in the tree, you can inspect and edit its current props and state in the panel on the right. In the breadcrumbs you can inspect the selected component, the component that created it, the component that created that one, and so on. If you inspect an Inferno element on the page using the regular Elements tab, then switch over to the React tab, that element will be automatically selected in the React tree.

You can install the React Chrome Dev Tools plugin [here](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi?hl=en).

## Enabling Inferno Dev Tools

To enable the Inferno development tool you must install the `inferno-devtools` module and then `import {initDevTools} from 'inferno-devtools';` and call `initDevTools()` before the initial `render(...)`.

The module translates Inferno components so that they are visible via the React Chrome plugin. Be sure to de-activate the tools in production as the development tool module adds extra overhead that will impact your application.
