import * as koa from 'koa'; // koa@2
import * as logger from 'koa-logger';
import * as koaRouter from 'koa-router'; // koa-router@next
import * as koaStatic from 'koa-static';
import * as koaMount from 'koa-mount';
import { renderToString } from 'inferno-server';
import { StaticRouter, resolveLoaders, traverseLoaders } from 'inferno-router'
import {Parcel} from '@parcel/core';
import { createElement } from 'inferno-create-element';

const PORT = process.env.PORT || 3000;
const BASE_URI = `http://localhost:${PORT}`;

// Parcel watch subscription and bundle output
// NOTE: Currently deactivated watcher (the following line and `bundler.watch` further down)
// let subscription;
let bundles;

let bundler = new Parcel({
  // NOTE: Specifying target: { source: './src/App.tsx' } didn't work for me
  entries: ['./src/App.tsx', './src/indexServer.tsx'],
  defaultConfig: '@parcel/config-default',
  targets: {
    default: {
      context: 'node',
      engines: {
        node: ">=18"
      },
      distDir: "./distServer",
      publicUrl: "/", // Should be picked up from environment
    },
    browser: {
      context: 'browser',
      engines: {
        browsers: '> 0.5%, last 2 versions, not dead'
      },
      distDir: "./distBrowser",
      publicUrl: "/", // Should be picked up from environment
    }
  },
  mode: 'development'
});


const app = new koa()
const api = new koaRouter()
const frontend = new koaRouter()

/**
 * Logging
 */
app.use(logger((str, args) => {
  console.log(str)
}))

/**
 * Endpoint for healthcheck
 */
api.get('/api/ping', (ctx) => {
  ctx.body = 'ok';
});
api.get('/api/about', async (ctx) => {

  return new Promise((resolve) => {
    setTimeout(() => {
      ctx.body = {
        title: "Inferno-Router",
        body: "Routing with async data loader support."
      };
      resolve(null);
    }, 500)
  })
});

api.get('/api/page/:slug', async (ctx) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      ctx.body = {
        title: ctx.params.slug.toUpperCase(),
        body: "This is a page."
      };
      resolve(null);
    }, 1300)
  })
});

function renderPage(html, initialData) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8"/>
    <title>Inferno Router Demo</title>
    <link rel="stylesheet" href="/dist/App.css"/>
    <script type="module" src="/dist/indexServer.js"></script>
    <script>
    window.__initialData__ = ${JSON.stringify(initialData)};
    </script>
  </head>
  <body>
    <div id="app">${html}</div>
  </body>
</html>  
`
}

frontend.get('(/page)?/:slug?', async (ctx) => {
  const location = ctx.path;

  const pathToAppJs  = bundles.find(b => b.name === 'App.js' && b.env.context === 'node').filePath;
  const { appFactory } = require(pathToAppJs)
  const app = appFactory();

  const loaderEntries = traverseLoaders(location, app, BASE_URI);
  const initialData = await resolveLoaders(loaderEntries);

  const htmlApp = renderToString(createElement(StaticRouter, {
    context: {},
    location,
    initialData,
  }, app))

  ctx.body = renderPage(htmlApp, initialData);
})


/**
 * Mount all the routes for Koa to handle
 */
app.use(api.routes());
app.use(api.allowedMethods());
app.use(frontend.routes());
app.use(frontend.allowedMethods());
app.use(koaMount('/dist', koaStatic('distBrowser')));

// bundler.watch((err, event) => {
//   if (err) {
//     // fatal error
//     throw err;
//   }

//   if (event.type === 'buildSuccess') {
//     bundles = event.bundleGraph.getBundles();
//     console.log(`✨ Built ${bundles.length} bundles in ${event.buildTime}ms!`);
//   } else if (event.type === 'buildFailure') {
//     console.log(event.diagnostics);
//   }
// }).then((sub => subscription = sub));

app.listen(PORT, async () => {
  
  // Trigger first transpile
  // https://parceljs.org/features/parcel-api/
  try {
    let {bundleGraph, buildTime} = await bundler.run();
    bundles = bundleGraph.getBundles();
    console.log(`✨ Built ${bundles.length} bundles in ${buildTime}ms!`);
  } catch (err) {
    console.log(err.diagnostics);
  }

  console.log('Server listening on: ' + PORT)
})
