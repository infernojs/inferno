# inferno-mobx

[![Build Status](https://img.shields.io/travis/trueadm/inferno/master.svg?style=flat-square)](https://travis-ci.org/trueadm/inferno/branches)
[![MIT](https://img.shields.io/npm/l/inferno.svg?style=flat-square)](https://github.com/trueadm/inferno/blob/master/LICENSE.md)
[![NPM Version](https://img.shields.io/npm/v/inferno-mobx.svg?style=flat-square)](https://www.npmjs.com/package/inferno-mobx)
[![npm downloads](https://img.shields.io/npm/dm/inferno-mobx.svg?style=flat-square)](https://www.npmjs.org/package/inferno-mobx)

[![#mobservable channel on reactiflux discord](https://img.shields.io/badge/discord-%23mobx%20%40reactiflux-blue.svg)](https://discord.gg/0ZcbPKXt5bYAa2J1)
[![#inferno channel on slack](https://img.shields.io/badge/slack-%23inferno%20%40infernojs-red.svg)](https://infernojs.slack.com)

This is a fork of [mobx-react](https://github.com/mobxjs/mobx-react) for [Inferno](https://github.com/trueadm/inferno)

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
import Inferno from 'inferno'
import Component from 'inferno-component'
import { connect } from 'mobx-inferno'

@connect(['model'])
class MyComponent extends Component {
    render() {
        return <p>{this.props.model.hello}</p>
    }
}
```

Just make sure that you provided your stores using the `Provider`. Ex:

```javascript
import Inferno from 'inferno'
import InfernoDOM from 'inferno-dom'
import { Provider } from 'mobx-inferno'
import { observable } from 'mobx'

const model = observable({
    hello: 'world'
})

InfernoDOM.render(<Provider model={model}>
            <MyComponent/>
        </Provider>, document.getElementById('root'))
```
