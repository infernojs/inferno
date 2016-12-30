# inferno-mobx

[![MIT](https://img.shields.io/npm/l/inferno.svg?style=flat-square)](https://github.com/infernojs/inferno/blob/master/LICENSE.md)
[![NPM Version](https://img.shields.io/npm/v/inferno-mobx.svg?style=flat-square)](https://www.npmjs.com/package/inferno-mobx)
[![#mobservable channel on reactiflux discord](https://img.shields.io/badge/discord-%23mobx%20%40reactiflux-blue.svg)](https://discord.gg/0ZcbPKXt5bYAa2J1)
[![#inferno channel on slack](https://img.shields.io/badge/slack-%23inferno%20%40infernojs-red.svg)](https://infernojs.slack.com)

This is a fork of [mobx-react](https://github.com/mobxjs/mobx-react) for [Inferno](https://github.com/infernojs/inferno)

*The module is compatible with Inferno v1, for older versions use [mobx-inferno](https://www.npmjs.com/package/mobx-inferno)*

<p>&nbsp;</p>
<p align="center"><img src="http://infernojs.org/img/inferno.png" width="150px"></p>
<p>&nbsp;</p>

This package provides the bindings for MobX and Inferno.
Exports `observer` and `connect` decorators, a `Provider` and some development utilities.

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
import Inferno from 'inferno'
import Component from 'inferno-component'
import { connect } from 'inferno-mobx'

@connect(['englishStore', 'frenchStore'])
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

Just make sure that you provided your stores using the `Provider`. Ex:

```javascript
// index.js
import Inferno from 'inferno'
import { Provider } from 'inferno-mobx'
import { observable } from 'mobx'
import MyComponent from './MyComponent'

const englishStore = observable({
    title: 'Hello World'
})

const frenchStore = observable({
    title: 'Bonjour tout le monde'
})

Inferno.render(<Provider englishStore={ englishStore } frenchStore={ frenchStore }>
    <MyComponent/>
</Provider>, document.getElementById('root'))
```
