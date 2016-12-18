---
title: Inferno Redux
---

We understand that a lot of applications in the React ecosystem use [Redux](//reduxjs.org) to manage data. Thus we have created a port of React-Redux for Inferno to ease the process of porting an application over. 

## `Provider`

The `Provider` component allows an application to connect to a Redux store. 

**Warning:** The `store` prop on a `Provider` should not be changed dynamically and is not supported in `Inferno-redux`. 

```jsx
import Inferno from 'inferno'
import { Provider } from 'inferno-redux
import { createStore } from 'redux

// Component Declarations... 

const store = createStore(..reducers)

Inferno.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
)
```

## Connect

```javascript
connect(
  mapStateToProps,
  mapDispatchToProps,
  options: 
)

The `connect` function allows components to access the redux store state 
