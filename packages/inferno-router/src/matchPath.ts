import pathToRegexp from 'path-to-regexp';
import { type Match } from './Route';

const patternCache = {};
const cacheLimit = 10000;
let cacheCount = 0;

interface pathToRegexKey {
  name: string | number;
  prefix: string;
  delimiter: string;
  optional: boolean;
  repeat: boolean;
  pattern: string;
  partial: boolean;
  asterisk: boolean;
}

const compilePath = (pattern, options): { re: any; keys: pathToRegexKey[] } => {
  const cacheKey = `${options.end}${options.strict}${options.sensitive}`;
  const cache = patternCache[cacheKey] || (patternCache[cacheKey] = {});

  if (cache[pattern]) {
    return cache[pattern];
  }

  const keys = [];
  const re = pathToRegexp(pattern, keys, options);
  const compiledPattern = { re, keys };

  if (cacheCount < cacheLimit) {
    cache[pattern] = compiledPattern;
    cacheCount++;
  }

  return compiledPattern;
};

/**
 * Public API for matching a URL pathname to a path pattern.
 */
export function matchPath(pathname, options: any): Match<any> | null {
  if (typeof options === 'string') {
    options = { path: options };
  }

  const {
    path = '/',
    exact = false,
    strict = false,
    sensitive = false,
    loader,
    initialData = {},
  } = options;
  const { re, keys } = compilePath(path, { end: exact, strict, sensitive });
  const match = re.exec(pathname);

  if (!match) {
    return null;
  }

  const loaderData = initialData[path];

  const [url, ...values] = match;
  const isExact = pathname === url;

  if (exact && !isExact) {
    return null;
  }

  return {
    isExact,
    loader,
    loaderData,
    params: keys.reduce((memo, key, index) => {
      memo[key.name] = values[index];
      return memo;
    }, {}),
    path, // the path pattern used to match
    url: path === '/' && url === '' ? '/' : url, // the matched portion of the URL
  };
}
