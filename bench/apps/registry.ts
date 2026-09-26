import { join } from 'node:path';
import { BENCH_DIR } from '../lib/paths.ts';

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
  typing: {
    name: 'typing',
    entry: 'typing/main.jsx',
    title: 'Typing',
    head: '',
    body: '<div id="app"></div>',
  },
};

export function resolveApps(raw: string | undefined, fallback = Object.keys(APPS).join(',')): AppDef[] {
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
