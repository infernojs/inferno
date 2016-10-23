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

import { matchPath } from './matchPath';

function matchRoute(route, baseUrl, path, parentParams?) {
	let match, childMatches, i = 0;

	return {
		next() {
			if (!route.children) {
				if (!match) {
					match = matchPath(true, route.path, path, parentParams);
					if (match) {
						return {
							done: false,
							value: {
								route,
								baseUrl,
								path: match.path,
								params: match.params
							}
						};
					}
				}
				return { done: true, value: undefined };
			}

			if (!match) {
				match = matchPath(false, route.path, path);
				if (match) {
					return {
						done: false,
						value: {
							route,
							baseUrl,
							path: match.path,
							params: match.params,
						}
					};
				}
			}

			while (i < route.children.length) {

				if (!childMatches) {
					const childRoute = route.children[i];
					const newPath = path.substr(match.path.length);
					childMatches = matchRoute(
						childRoute,
						baseUrl + (match.path === '/' ? '' : match.path),
						newPath.startsWith('/') ? newPath : `/${newPath}`,
						match.params
					);
				}

				let childMatch = childMatches.next();
				if (childMatch.done) {
					i++;
					childMatches = null;
				} else {
					return {
						done: false,
						value: childMatch.value
					};
				}
			}

			return { done: true, value: undefined };
		}
	};
}

export default matchRoute;
