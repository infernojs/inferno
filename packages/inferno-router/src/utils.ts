import { VNodeFlags } from 'inferno-vnode-flags';
import { isNull } from 'inferno-shared';
import { type Path } from 'history';

export function warning(condition, message): void {
  if (!condition) {
    console.error(message);
  }
}

export function combinePath({
  pathname = '/',
  search = '',
  hash = '',
}: Partial<Path>): string {
  return pathname + search + hash;
}

export function isValidElement(obj: any): boolean {
  const isValidObject = typeof obj === 'object' && !isNull(obj);

  if (!isValidObject) {
    return false;
  }

  return (obj.flags & (VNodeFlags.Component | VNodeFlags.Element)) > 0;
}

export function invariant(condition, format, a?, b?, c?, d?, e?, f?): void {
  if (!condition) {
    let error;
    if (format === undefined) {
      error = new Error(
        'Minified exception occurred; use the non-minified dev environment ' +
          'for the full error message and additional helpful warnings.',
      );
    } else {
      const args = [a, b, c, d, e, f];
      let argIndex = 0;
      error = new Error(
        format.replace(/%s/g, function () {
          return args[argIndex++];
        }),
      );
      error.name = 'Invariant Violation';
    }

    error.framesToPop = 1; // we don't care about invariant's own frame
    throw error;
  }
}
