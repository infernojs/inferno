import { join } from 'node:path';
import { BENCH_DIR, JFB_DIR } from '../lib/paths.ts';

export const APPS_DIR = join(BENCH_DIR, 'apps');

export interface AppDef {
  name: string;
  /** Entry module, relative to apps/. */
  entry: string;
  title: string;
  /** Extra markup for <head> (stylesheets are served from /assets). */
  head: string;
  /** Markup for <body> before the bundle script. */
  body: string;
  /** App-local files (relative to apps/) copied next to index.html. */
  assets?: string[];
  /**
   * A js-framework-benchmark implementation served as is (index.html + src/), without Inferno:
   * the same DOM built by other means, as a reference for what the framework costs.
   */
  staticDir?: string;
}

function jfbReference(name: string): AppDef {
  return { name, entry: '', title: name, head: '', body: '', staticDir: join(JFB_DIR, 'frameworks', 'keyed', name) };
}

const JFB_HEAD = '<link href="/assets/jfb/currentStyle.css" rel="stylesheet"/>';
const LOCAL_CSS = '<link href="style.css" rel="stylesheet"/>';

export const APPS: Record<string, AppDef> = {
  'jfb-keyed': {
    name: 'jfb-keyed',
    entry: 'jfb-keyed/main.jsx',
    title: 'Inferno',
    head: JFB_HEAD,
    body: '<div id="main"></div>',
  },
  'jfb-nonkeyed': {
    name: 'jfb-nonkeyed',
    entry: 'jfb-nonkeyed/main.jsx',
    title: 'Inferno',
    head: JFB_HEAD,
    body: '<div id="main"></div>',
  },
  // jfb-keyed with Row vNodes cached per data row (re-created only when label or selection change).
  'jfb-keyed-memo': {
    name: 'jfb-keyed-memo',
    entry: 'jfb-keyed-memo/main.jsx',
    title: 'Inferno',
    head: JFB_HEAD,
    body: '<div id="main"></div>',
  },
  // Template cloning, rows built into a detached tbody in batches.
  'vanillajs-lite': jfbReference('vanillajs-lite'),
  // Template cloning, one row at a time into the connected tbody.
  'vanillajs-3': jfbReference('vanillajs-3'),
  // Template cloning into a detached tbody.
  vanillajs: jfbReference('vanillajs'),
  uibench: {
    name: 'uibench',
    entry: 'uibench/main.jsx',
    title: 'UI Benchmark: Inferno',
    head: LOCAL_CSS,
    body: '<div id="App"></div>',
    assets: ['uibench/style.css'],
  },
  dbmonster: {
    name: 'dbmonster',
    entry: 'dbmonster/main.js',
    title: 'dbmonster',
    head: LOCAL_CSS,
    body: '<div id="app"></div>',
    assets: ['dbmonster/style.css'],
  },
  '1kcomponents': {
    name: '1kcomponents',
    entry: '1kcomponents/main.jsx',
    title: '1k components',
    head: LOCAL_CSS,
    body: '<div id="app"></div>',
    assets: ['1kcomponents/style.css'],
  },
  events: {
    name: 'events',
    entry: 'events/main.jsx',
    title: 'Events',
    head: LOCAL_CSS,
    body: '<div id="App"></div>',
    assets: ['events/style.css'],
  },
  fuzz: {
    name: 'fuzz',
    entry: 'fuzz/main.js',
    title: 'Fuzz',
    head: '',
    body: '<div id="app"></div>',
  },
  anim: {
    name: 'anim',
    entry: 'anim/main.jsx',
    title: 'Move animations',
    head: LOCAL_CSS,
    body: '<div id="app"></div>',
    assets: ['anim/style.css'],
  },
  typing: {
    name: 'typing',
    entry: 'typing/main.jsx',
    title: 'Typing',
    head: '',
    body: '<div id="app"></div>',
  },
};

// The same apps with inferno-animation imported (and so its adapter installed in inferno).
for (const [name, entry] of [
  ['jfb-keyed', 'preload-anim/jfb-keyed.jsx'],
  ['uibench', 'preload-anim/uibench.jsx'],
  ['1kcomponents', 'preload-anim/1kcomponents.jsx'],
  ['dbmonster', 'preload-anim/dbmonster.js'],
  ['fuzz', 'preload-anim/fuzz.js'],
]) {
  APPS[`${name}-anim`] = { ...APPS[name], name: `${name}-anim`, entry };
}

/** Inferno apps (the default for build and size); static references only when named. */
const INFERNO_APPS = Object.values(APPS)
  .filter((app) => !app.staticDir)
  .map((app) => app.name)
  .join(',');

export function resolveApps(raw: string | undefined, fallback = INFERNO_APPS): AppDef[] {
  return (raw ?? fallback)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((name) => {
      const app = APPS[name];
      if (!app) {
        throw new Error(`Unknown app "${name}" (known: ${Object.keys(APPS).join(', ')})`);
      }
      return app;
    });
}

export function renderHtml(app: AppDef, script = 'main.js'): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${app.title}</title>
  ${app.head}
</head>
<body>
  ${app.body}
  <script src="${script}"></script>
</body>
</html>
`;
}
