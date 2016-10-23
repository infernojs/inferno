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

import matchRoute from './matchRoute';

function resolve(routes, pathOrContext) {
	const root = Array.isArray(routes) ? { path: '/', children: routes } : routes;
	const context: any = typeof pathOrContext === 'object'
		? { path: pathOrContext.pathname }
		: { path: pathOrContext };

	let match = matchRoute(root, '', context.path), result, value, done = false;

	context.next = function() {
		let next = match.next();
		value = next.value;
		done = next.done;

		if (!done && value && value.route.component) {
			try {
				return Promise.resolve({
					context,
					params: next.value.params,
					component: next.value.route
				});
			} catch (err) {
				return Promise.reject(err);
			}
		}
		return Promise.resolve();
	};

	context.end = function(data) {
		result = data;
		done = true;
	};

	function run() {
		return context.next().then(function(r) {
			r.context.next().then(e => console.log(e));


			if (r !== undefined) {
				result = r;
				done = true;
			}
			if (done) {
				return result;
			}
			return run();
		}).catch(function(err) {
			return err;
		});
	}

	return run().then(function(r) {
		if (r === undefined) {
			context.error = new Error('Inferno route not found');
			context.error.status = 404;
			return {
				context
			};
		}
		return r;
	});
}

export default resolve;
