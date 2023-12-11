import { isNullOrUndef, isUndefined } from 'inferno-shared';
import { matchPath } from './matchPath';
import type { TLoaderData, TLoaderProps } from './Router';
import { Switch } from './Switch';
import { Route } from './Route';

export async function resolveLoaders(
  loaderEntries: TLoaderEntry[],
): Promise<Record<string, TLoaderData>> {
  const promises = loaderEntries.map(
    async ({ path, params, request, loader }) => {
      return await resolveEntry(path, params, request, loader);
    },
  );
  return await Promise.all(promises).then((result) => {
    return Object.fromEntries(result);
  });
}

interface TLoaderEntry {
  path: string;
  params: Record<string, any>;
  request: Request;
  controller: AbortController;
  loader: (props: TLoaderProps<any>) => Promise<TLoaderEntry>;
}

export function traverseLoaders(
  location: string,
  tree: any,
  base?: string,
): TLoaderEntry[] {
  return _traverseLoaders(location, tree, base, false);
}

function _isSwitch(node: any): boolean {
  // Using the same patterns as for _isRoute, but I don't have a test where
  // I pass a Switch via an array, but it is better to be consistent.
  return node?.type?.prototype instanceof Switch || node?.type === Switch;
}

function _isRoute(node: any): boolean {
  // So the === check is needed if routes are passed in an array,
  // the instanceof test if routes are passed as children to a Component
  // This feels inconsistent, but at least it works.
  return node?.type?.prototype instanceof Route || node?.type === Route;
}

// Optionally pass base param during SSR to get fully qualified request URI passed to loader in request param
function _traverseLoaders(
  location: string,
  tree: any,
  base?: string,
  parentIsSwitch = false,
): TLoaderEntry[] {
  // Make sure tree isn't null
  if (isNullOrUndef(tree)) return [];

  if (Array.isArray(tree)) {
    let hasMatch = false;
    const entriesOfArr = tree.reduce((res, node) => {
      if (parentIsSwitch && hasMatch) return res;

      const outpArr = _traverseLoaders(location, node, base, _isSwitch(node));
      if (parentIsSwitch && outpArr.length > 0) {
        hasMatch = true;
      }
      return [...res, ...outpArr];
    }, []);
    return entriesOfArr;
  }

  const outp: TLoaderEntry[] = [];
  if (_isRoute(tree) && tree.props) {
    // TODO: Should we check if we are in Router? It is defensive and could save a bit of time, but is it worth it?
    const {
      path,
      exact = false,
      strict = false,
      sensitive = false,
    } = tree.props;
    const match = matchPath(location, {
      exact,
      path,
      sensitive,
      strict,
    });

    // So we can bail out of recursion it this was a Route which didn't match
    if (!match) {
      return outp;
    } else if (!tree.context && tree.props?.loader && tree.props?.path) {
      // Add any loader on this node (but only on the VNode)
      const { params } = match;
      const controller = new AbortController();
      const request = createClientSideRequest(
        location,
        controller.signal,
        base,
      );

      outp.push({
        controller,
        loader: tree.props.loader,
        params,
        path,
        request,
      });
    }
  }

  // Traverse children
  const children = tree.children ?? tree.props?.children;
  if (isNullOrUndef(children)) return outp;

  const entries = _traverseLoaders(location, children, base, _isSwitch(tree));
  return [...outp, ...entries];
}

async function resolveEntry(path, params, request, loader): Promise<any> {
  return (
    loader({ params, request })
      .then(async (res: any) => {
        // This implementation is based on:
        // https://github.com/remix-run/react-router/blob/4f3ad7b96e6e0228cc952cd7eafe2c265c7393c7/packages/router/router.ts#L2787-L2879

        // Check if regular data object (from tests or initialData)
        if (typeof res.json !== 'function') {
          return [path, { res }];
        }

        const contentType = res.headers.get('Content-Type');
        let dataPromise: Promise<any>;
        // Check between word boundaries instead of startsWith() due to the last
        // paragraph of https://httpwg.org/specs/rfc9110.html#field.content-type
        if (contentType && /\bapplication\/json\b/.test(contentType)) {
          dataPromise = res.json();
        } else {
          dataPromise = res.text();
        }

        return await dataPromise
          .then((body) => {
            // We got a JSON error
            if (!res.ok) {
              return [path, { err: body }];
            }
            // We got JSON response
            return [path, { res: body }];
          })
          // Could not parse JSON
          .catch((err) => [path, { err }]);
      })
      // Could not fetch data
      .catch((err) => [path, { err }])
  );
}

// From react-router
// NOTE: We don't currently support the submission param of createClientSideRequest which is why
// some of the related code is commented away

export type FormEncType =
  | 'application/x-www-form-urlencoded'
  | 'multipart/form-data';

export type MutationFormMethod = 'post' | 'put' | 'patch' | 'delete';
export type FormMethod = 'get' | MutationFormMethod;

// TODO: react-router supports submitting forms with loaders, this is related to that
// const validMutationMethodsArr: MutationFormMethod[] = [
//   "post",
//   "put",
//   "patch",
//   "delete",
// ];
// const validMutationMethods = new Set<MutationFormMethod>(
//   validMutationMethodsArr
// );

/**
 * @private
 * Internal interface to pass around for action submissions, not intended for
 * external consumption
 */
export interface Submission {
  formMethod: FormMethod;
  formAction: string;
  formEncType: FormEncType;
  formData: FormData;
}

const inBrowser = typeof window === 'undefined';
function createClientSideRequest(
  location: string | Location,
  signal: AbortSignal,
  // submission?: Submission
  base?: string,
): Request {
  const url =
    inBrowser || !isUndefined(base)
      ? createClientSideURL(location, base)
      : location.toString();
  const init: RequestInit = { signal };

  // TODO: react-router supports submitting forms with loaders, but this needs more investigation
  // related code is commented out in this file
  // if (submission && isMutationMethod(submission.formMethod)) {
  //   let { formMethod, formEncType, formData } = submission;
  //   init.method = formMethod.toUpperCase();
  //   init.body =
  //     formEncType === "application/x-www-form-urlencoded"
  //       ? convertFormDataToSearchParams(formData)
  //       : formData;
  // }

  // Request is undefined when running tests
  if (process.env.NODE_ENV === 'test' && typeof Request === 'undefined') {
    // @ts-expect-error minimum to fix tests
    global.Request = class Request {
      public url;
      public signal;
      constructor(_url: URL | string, _init: RequestInit) {
        this.url = _url;
        this.signal = _init.signal;
      }
    };
  }

  // Content-Type is inferred (https://fetch.spec.whatwg.org/#dom-request)
  return new Request(url, init);
}

/**
 * Parses a string URL path into its separate pathname, search, and hash components.
 */

export function createClientSideURL(
  location: Location | string,
  base?: string,
): URL {
  if (base === undefined && typeof window !== 'undefined') {
    // window.location.origin is "null" (the literal string value) in Firefox
    // under certain conditions, notably when serving from a local HTML file
    // See https://bugzilla.mozilla.org/show_bug.cgi?id=878297
    base =
      window?.location?.origin !== 'null'
        ? window.location.origin
        : window.location.href;
  }

  const url = new URL(location.toString(), base);
  url.hash = '';
  return url;
}

// TODO: react-router supports submitting forms with loaders, this is related to that
// function isMutationMethod(method?: string): method is MutationFormMethod {
//   return validMutationMethods.has(method as MutationFormMethod);
// }

// function convertFormDataToSearchParams(formData: FormData): URLSearchParams {
//   let searchParams = new URLSearchParams();

//   for (let [key, value] of formData.entries()) {
//     // invariant(
//     //   typeof value === "string",
//     //   'File inputs are not supported with encType "application/x-www-form-urlencoded", ' +
//     //     'please use "multipart/form-data" instead.'
//     // );
//     if (typeof value === "string") {
//       searchParams.append(key, value);
//     }
//   }

//   return searchParams;
// }
