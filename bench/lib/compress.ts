import zlib from 'node:zlib';

export interface Sizes {
  raw: number;
  gzip: number;
  brotli: number;
  zstd: number;
}

export const SIZE_KEYS: (keyof Sizes)[] = ['raw', 'gzip', 'brotli', 'zstd'];

export function measure(buf: Buffer | string): Sizes {
  const data = typeof buf === 'string' ? Buffer.from(buf) : buf;
  return {
    raw: data.length,
    gzip: zlib.gzipSync(data, { level: 9 }).length,
    brotli: zlib.brotliCompressSync(data, {
      params: {
        [zlib.constants.BROTLI_PARAM_QUALITY]: 11,
        [zlib.constants.BROTLI_PARAM_MODE]: zlib.constants.BROTLI_MODE_TEXT,
        [zlib.constants.BROTLI_PARAM_SIZE_HINT]: data.length,
      },
    }).length,
    zstd: zlib.zstdCompressSync(data, { params: { [zlib.constants.ZSTD_c_compressionLevel]: 19 } }).length,
  };
}

/**
 * js-framework-benchmark's `42_size-compressed` rule (server/app.ts): brotli
 * with Node defaults for payloads >= 1024 bytes, raw bytes otherwise.
 */
export function jfbCompressed(payloads: Buffer[]): number {
  return payloads.reduce((sum, p) => sum + (p.length >= 1024 ? zlib.brotliCompressSync(p).length : p.length), 0);
}
