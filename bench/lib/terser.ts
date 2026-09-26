import type { MinifyOptions } from 'terser';

/** js-framework-benchmark's terser settings, so bundles match what jfb ships. */
export const JFB_TERSER = {
  compress: {
    inline: 0 as const,
    reduce_vars: false,
    passes: 5,
    booleans: false,
    comparisons: false,
    keep_infinity: true,
  },
  toplevel: true,
  mangle: true,
  module: true,
} satisfies MinifyOptions;
