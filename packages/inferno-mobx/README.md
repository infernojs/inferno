# inferno-mobx

This is a fork of [mobx-react](https://github.com/mobxjs/mobx-react) for [Inferno](https://github.com/infernojs/inferno)

The module is compatible with Inferno v1+, for older versions use [mobx-inferno](https://www.npmjs.com/package/mobx-inferno)

This package provides the bindings for MobX and Inferno.
Exports `observer` and `inject` decorators, a `Provider` and some development utilities.

## Install

```
npm install --save inferno-mobx
```

Also install [mobx](https://github.com/mobxjs/mobx) dependency _(required)_ if you don't already have it

```
npm install --save mobx
```

## Example

You can inject props using the following syntax

```javascript
// MyComponent.js
import { Component } from 'inferno';
import { inject, observer } from 'inferno-mobx';

@inject(['englishStore', 'frenchStore']) @observer
class MyComponent extends Component {
    render({ englishStore, frenchStore }) {
        return <div>
            <p>{ englishStore.title }</p>
            <p>{ frenchStore.title }</p>
        </div>
    }
}

export default MyComponent
```

If you're not using decorators, you can do this instead:

```javascript
// MyComponent.js
import { Component } from 'inferno';
import { inject, observer } from 'inferno-mobx';

class MyComponent extends Component {
    render({ englishStore, frenchStore }) {
        return <div>
            <p>{ englishStore.title }</p>
            <p>{ frenchStore.title }</p>
        </div>
    }
}

export default inject(['englishStore', 'frenchStore'])(observer(MyComponent));
```

Just make sure that you provided your stores using the `Provider`. Ex:

```javascript
// index.js
import { render } from 'inferno';
import { Provider } from 'inferno-mobx';
import { observable } from 'mobx';
import MyComponent from './MyComponent';

const englishStore = observable({
    title: 'Hello World'
});

const frenchStore = observable({
    title: 'Bonjour tout le monde'
});

render(<Provider englishStore={ englishStore } frenchStore={ frenchStore }>
    <MyComponent/>
</Provider>, document.getElementById('root'));
```
