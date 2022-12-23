import koa from 'koa';; // koa@2
import logger from 'koa-logger';
import koaRouter from 'koa-router'; // koa-router@next
import koaJSONBody from 'koa-json-body';
import { renderToString, resolveLoaders } from 'inferno-server';
import { StaticRouter } from 'inferno-router'
import {Parcel} from '@parcel/core';
import { createElement } from 'inferno-create-element';

const PORT = process.env.PORT || 3000

// Parcel watch subscription and bundle output
let subscription;
let bundles;

let bundler = new Parcel({
  entries: './src/App.tsx',
  defaultConfig: '@parcel/config-default',
  targets: {
    default: {
      context: 'node',
      engines: {
        node: ">=18"
      },
      distDir: "./distServer",
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
    }, 1000)
  })
});

frontend.get('/:slug?', async (ctx) => {
  const location = ctx.params.slug === undefined ? '/': `/${ctx.params.slug}`;

  const pathToAppJs  = bundles.find(b => b.name === 'App.js').filePath;
  const { appFactory } = require(pathToAppJs)
  const app = appFactory();

  const initialData = await resolveLoaders(location, app);

  const htmlApp = renderToString(createElement(StaticRouter, {
    context: {},
    location,
    initialData,
  }, app))

  ctx.body = htmlApp;
})


/**
 * Mount all the routes for Koa to handle
 */
app.use(api.routes());
app.use(api.allowedMethods());
app.use(frontend.routes());
app.use(frontend.allowedMethods());

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
