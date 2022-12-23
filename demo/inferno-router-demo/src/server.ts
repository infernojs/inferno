import koa from 'koa';; // koa@2
import logger from 'koa-logger';
import koaRouter from 'koa-router'; // koa-router@next
import koaJSONBody from 'koa-json-body';
import { renderToString, resolveLoaders } from 'inferno-server';

const PORT = process.env.PORT || 3000

const app = new koa()
const api = new koaRouter()

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


/**
 * Mount all the routes for Koa to handle
 */
app.use(api.routes());
app.use(api.allowedMethods());

app.listen(PORT, () => {
  console.log('Server listening on: ' + PORT)
})
