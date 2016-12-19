---
title: Get Started
---

There are three ways to get setup with Inferno: using the simple `create-inferno-app`, installing via NPM, or by using the Cloudfare CDN.

## Create Inferno App

Similar to React's `create-react-app`, you can get started by using `create-inferno-app`. Make sure that you have Node installed

```
(sudo) npm install -g create-inferno-app
create-inferno-app MyFirstInfernoApp
cd MyFirstInfernoApp
npm start
```

Then navigate to [`http://localhost:8080/`](http://localhost:8080) to view the application.

## NPM Installation
Inferno is packaged on NPM as `inferno`.

<div>
  `npm install inferno --save`
</div>

This will set you up with the core package and everything you need to start creating components and rendering them, but you'll probably want to take a look at our [other packages]({{site.url}}/guides/architecture) for convenience.

## Cloudfare

Pre-bundled files for browser consumption can be found on [our cdnjs](https://cdnjs.com/libraries/inferno):

```
https://cdnjs.cloudflare.com/ajax/libs/inferno/1.0.0-beta37/inferno.min.js
```