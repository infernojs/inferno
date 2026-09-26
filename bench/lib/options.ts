import type { AppBuildOptions, Transform } from '../apps/build.ts';

export function splitList(raw: string | undefined, fallback: string): string[] {
  return (raw ?? fallback)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Expands --transform babel,swc × --minify on,off into build option combinations. */
export function buildOptionMatrix(transform: string | undefined, minify: string | undefined): AppBuildOptions[] {
  const transforms = splitList(transform, 'babel').map((t) => {
    if (t !== 'babel' && t !== 'swc') {
      throw new Error(`--transform must be babel or swc, got "${t}"`);
    }
    return t as Transform;
  });
  const minifies = splitList(minify, 'on').map((m) => {
    if (m !== 'on' && m !== 'off') {
      throw new Error(`--minify must be on or off, got "${m}"`);
    }
    return m === 'on';
  });
  return transforms.flatMap((t) => minifies.map((m) => ({ transform: t, minify: m })));
}
