import koa from 'koa';
import logger from 'koa-logger';
import koaRouter from '@koa/router';
import koaStatic from 'koa-static';
import koaMount from 'koa-mount';
import { renderToString } from 'inferno-server';
import { StaticRouter, resolveLoaders, traverseLoaders } from 'inferno-router'
import {Parcel} from '@parcel/core';
import { createElement } from 'inferno-create-element';

const PORT = process.env.PORT || 3000;
const BASE_URI = `http://localhost:${PORT}`;

const bundles = [];

// Build the app export and browser hydration entry separately, since they share App.tsx.
const bundlers = [
  new Parcel({
    entries: ['./src/App.tsx'],
    defaultConfig: '@parcel/config-default',
    cacheDir: './.parcel-cache/server',
    targets: {
      default: {
        context: 'node',
        isLibrary: true,
        outputFormat: 'commonjs',
        engines: { node: '>=18' },
        distDir: './distServer',
        publicUrl: '/'
      }
    },
    mode: 'development'
  }),
  new Parcel({
    entries: ['./src/indexServer.tsx'],
    defaultConfig: '@parcel/config-default',
    cacheDir: './.parcel-cache/browser',
    targets: {
      browser: {
        context: 'browser',
        engines: { browsers: '> 0.5%, last 2 versions, not dead' },
        distDir: './distBrowser',
        publicUrl: '/dist'
      }
    },
    mode: 'development'
  })
];


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
    <link rel="stylesheet" href="/dist/indexServer.css"/>
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

frontend.get(['/', '/:slug', '/page/:slug'], async (ctx) => {
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

app.listen(PORT, async () => {
  
  // Trigger first transpile
  // https://parceljs.org/features/parcel-api/
  try {
    for (let i = 0, len = bundlers.length; i < len; ++i) {
      const bundler = bundlers[i];
      const { bundleGraph, buildTime } = await bundler.run();
      const builtBundles = bundleGraph.getBundles();
      bundles.push(...builtBundles);
      console.log(`✨ Built ${builtBundles.length} bundles in ${buildTime}ms!`);
    }
  } catch (err) {
    console.log(err.diagnostics);
  }

  console.log('Server listening on: ' + PORT)
})
