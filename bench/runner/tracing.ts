import type { CDPSession } from 'puppeteer-core';
import type { TraceEvent } from '../analysis/trace.ts';

/**
 * Minimal categories for stage attribution: js-framework-benchmark's set minus
 * the sampling CPU profiler (which perturbs timing), plus task boundaries.
 */
export const TRACE_CATEGORIES = [
  'devtools.timeline',
  'disabled-by-default-devtools.timeline',
  'blink.user_timing',
  'toplevel',
  'v8.execute',
];

/** Adds Chrome's input-to-presentation (EventLatency) and frame (PipelineReporter) data. */
export const LATENCY_CATEGORIES = [
  ...TRACE_CATEGORIES,
  'input',
  'cc',
  'latencyInfo',
  'benchmark',
  'disabled-by-default-devtools.timeline.frame',
];

export async function startTracing(browserCdp: CDPSession, categories = TRACE_CATEGORIES): Promise<void> {
  await browserCdp.send('Tracing.start', {
    transferMode: 'ReturnAsStream',
    streamFormat: 'json',
    traceConfig: { recordMode: 'recordUntilFull', includedCategories: categories, excludedCategories: ['*'] },
  });
}

export async function stopTracing(browserCdp: CDPSession): Promise<TraceEvent[]> {
  const complete = new Promise<string>((resolve) => {
    browserCdp.once('Tracing.tracingComplete', (e: any) => resolve(e.stream));
  });
  await browserCdp.send('Tracing.end');
  const stream = await complete;
  let json = '';
  for (;;) {
    const chunk = await browserCdp.send('IO.read', { handle: stream, size: 1 << 22 });
    json += chunk.base64Encoded ? Buffer.from(chunk.data, 'base64').toString('utf8') : chunk.data;
    if (chunk.eof) {
      break;
    }
  }
  await browserCdp.send('IO.close', { handle: stream });
  const parsed = JSON.parse(json);
  return Array.isArray(parsed) ? parsed : parsed.traceEvents;
}
