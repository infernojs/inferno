# Demo of Inferno-Router

NOTE: Requires Node.js >=24 (Babel 8).

```sh
pnpm install
pnpm --filter inferno-router-demo run dev:frontend
```

Go to http://127.0.0.1:1234/

To run the server-rendered demo, use `pnpm --filter inferno-router-demo run dev:backend`
and open http://localhost:3000/.

The demo uses Babel 8 and the current Inferno JSX plugin through a local Parcel
transformer. Parcel handles the remaining JavaScript, TypeScript, and Sass compilation.

After installing the workspace, run `pnpm --filter inferno-router-demo run test:backend`
to check backend startup, API and frontend routes, and static assets.
