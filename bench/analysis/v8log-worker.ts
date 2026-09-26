/**
 * Summarizes one V8 log (--log-ic --log-maps --log-deopt --log-code) with V8's
 * own system-analyzer: IC sites that went polymorphic/megamorphic and deopts,
 * restricted to one script (the app bundle). Prints JSON on stdout.
 *
 *   node analysis/v8log-worker.ts <log> <script-basename>
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { CHROMIUM_SRC } from '../lib/paths.ts';

const [file, bundleName] = process.argv.slice(2);

/** IC states as V8 logs them; higher rank = worse. */
const STATE_RANK: Record<string, number> = { '0': 0, '.': 0, '1': 1, '^': 1, P: 2, N: 3, G: 3 };

const processorPath = join(CHROMIUM_SRC, 'v8/tools/system-analyzer/processor.mjs');
if (!existsSync(processorPath)) {
  throw new Error(`V8 system-analyzer not found at ${processorPath} (set CHROMIUM_SRC)`);
}
const { Processor } = await import(pathToFileURL(processorPath).href);
const p = new Processor();
await p.processChunk(readFileSync(file, 'utf8'));
await p.finalize();
const values = (timeline: any): any[] => timeline.all ?? timeline._values ?? [];
const inBundle = (pos: unknown) => String(pos ?? '').startsWith(bundleName);

const ics = new Map<string, any>();
for (const e of values(p.icTimeline)) {
  if (!inBundle(e.sourcePosition)) {
    continue;
  }
  const site = String(e.sourcePosition);
  const k = `${site}\0${e.type}\0${e.key}`;
  const cur = ics.get(k) ?? { site, fn: e.functionName ?? '?', type: e.type, key: String(e.key ?? ''), worst: '0', transitions: 0 };
  cur.transitions++;
  if ((STATE_RANK[e.newState] ?? 0) > (STATE_RANK[cur.worst] ?? 0)) {
    cur.worst = e.newState;
  }
  ics.set(k, cur);
}

const deopts = new Map<string, any>();
for (const e of values(p.deoptTimeline)) {
  if (!inBundle(e.sourcePosition) && !inBundle(e.fileSourcePosition)) {
    continue;
  }
  const site = String(e.fileSourcePosition ?? e.sourcePosition);
  const entry = e._entry ?? e.entry;
  const fn = entry?.functionName ?? /^\S+\s+[+~*^]?(\S+)/.exec(String(entry ?? ''))?.[1] ?? '?';
  const reason = e._reason ?? e.reason ?? e.deoptReason ?? '?';
  const k = `${site}\0${reason}\0${e.type}`;
  const cur = deopts.get(k) ?? { site, fn, reason, type: e.type, count: 0 };
  cur.count++;
  deopts.set(k, cur);
}

process.stdout.write(
  JSON.stringify({
    ics: [...ics.values()]
      .filter((s) => (STATE_RANK[s.worst] ?? 0) >= 2)
      .sort((a, b) => (STATE_RANK[b.worst] ?? 0) - (STATE_RANK[a.worst] ?? 0) || b.transitions - a.transitions),
    deopts: [...deopts.values()].sort((a, b) => b.count - a.count),
    mapCount: values(p.mapTimeline).length,
  }),
);
