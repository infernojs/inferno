import { pathToRegexp, Keys } from 'path-to-regexp';
import { type Match } from './Route';

const patternCache = {};
const cacheLimit = 10000;
let cacheCount = 0;

const compilePath = (pattern, options): { re: any; keys: Keys } => {
  const cacheKey = `${options.end}${options.strict}${options.sensitive}`;
  const cache = patternCache[cacheKey] || (patternCache[cacheKey] = {});

  if (cache[pattern]) {
    return cache[pattern];
  }

  options.trailing = options.end && !options.strict;
  pattern = pattern.replace(/\?/, '{.:optqspunct}');
  if (!options.exact && !options.strict) {
    pattern = pattern.replace(/\/$/, '{.:optendslash}');
  }

  const { regexp: re, keys } = pathToRegexp(pattern, options)
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

  const loaderData = initialData[path];

  if (path === '*' || path === '/*') {
    return {
      isExact: false,
      loader,
      loaderData,
      params: [],
      path,
      url: '/'
    };
  }

  const { re, keys } = compilePath(path, { end: exact, strict, sensitive });
  const match = re.exec(pathname);

  if (!match) {
    return null;
  }

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
      if (values[index] !== undefined)
        memo[key.name] = values[index];
      return memo;
    }, {}),
    path, // the path pattern used to match
    url: path === '/' && url === '' ? '/' : url, // the matched portion of the URL
  };
}