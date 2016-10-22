/*
 The MIT License

 Copyright © 2015-2016 Konstantin Tarkus, Kriasoft LLC.

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 */

import pathToRegExp from 'path-to-regexp';

const cache = new Map();

function decode(val) {
	return typeof val !== 'string' ? val : decodeURIComponent(val);
}

export function matchPath(end, routePath, urlPath, parentParams?) {
  const key = `${routePath}|${end}`;
  let regexp = cache.get(key);

  if (!regexp) {
    const keys = [];
    regexp = { pattern: pathToRegExp(routePath, keys, { end }), keys };
    cache.set(key, regexp);
  }

  const m = regexp.pattern.exec(urlPath);

  if (!m) {
    return null;
  }

  const path = m[0];
  const params = {};
  if (parentParams) {
    Object.assign(params, parentParams);
  }

  for (let i = 1; i < m.length; i += 1) {
    params[regexp.keys[i - 1].name] = decode(m[i]);
  }

  return {
		path: path === '' ? '/' : path,
		params
  };
}
