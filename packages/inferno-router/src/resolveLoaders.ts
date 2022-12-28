import { isNullOrUndef } from "inferno-shared";
import { matchPath } from "./matchPath";
import type { TLoaderData, TLoaderProps } from "./Router";
import { Switch } from "./Switch";

export function resolveLoaders(loaderEntries: TLoaderEntry[]): Promise<Record<string, TLoaderData>> {
  const promises = loaderEntries.map((({path, params, request, loader}) => {
    return resolveEntry(path, params, request, loader);
  }));
  return Promise.all(promises).then((result) => {
    return Object.fromEntries(result);
  });
}

type TLoaderEntry = {
  path: string,
  params: Record<string, any>,
  request: Request,
  controller: AbortController,
  loader: (TLoaderProps) => Promise<TLoaderEntry>,
}

export function traverseLoaders(location: string, tree: any, parentIsSwitch = false): TLoaderEntry[] {
  // Make sure tree isn't null
  if (isNullOrUndef(tree)) return [];

  if (Array.isArray(tree)) {
    let hasMatch = false;
    const entries = tree.reduce((res, node) => {
      if (parentIsSwitch && hasMatch) return res;

      const outpArr = traverseLoaders(location, node, node?.type === Switch);
      return [...res, ...outpArr];
    }, []);
    return entries;
  }


  let outp: TLoaderEntry[] = [];
  // Add any loader on this node (but only on the VNode)
  let isRouteButNotMatch = false;
  if (tree.props) {
    // TODO: If we traverse a switch, only the first match should be returned
    // TODO: Should we check if we are in Router? It is defensive and could save a bit of time, but is it worth it?
    const { path, exact = false, strict = false, sensitive = false } = tree.props;
    const match = matchPath(location, {
      path,
      exact,
      strict,
      sensitive,
    });

    // So we can bail out of recursion it this was a Route which didn't match
    isRouteButNotMatch = !match;

    if (match && !tree.context && tree.props?.loader && tree.props?.path) {
      const { params } = match;
      const controller = new AbortController();
      const request = createClientSideRequest(location, controller.signal);

      outp.push({
        path,
        params,
        request,
        controller,
        loader: tree.props.loader,
      })
    }
  }

  // Traverse ends here
  if (isRouteButNotMatch) return outp;

  // Traverse children
  const entries = traverseLoaders(location, tree.children || tree.props?.children, tree.type === Switch);
  return [...outp, ...entries];
}

function resolveEntry(path, params, request, loader): Promise<any> {
  return loader({ params, request })
    .then((res) => [ path, { res } ])
    .catch((err) => [ path, { err } ]);
}

// From react-router
// NOTE: We don't currently support the submission param of createClientSideRequest which is why
// some of the related code is commented away

export type FormEncType =
  | "application/x-www-form-urlencoded"
  | "multipart/form-data";

export type MutationFormMethod = "post" | "put" | "patch" | "delete";
export type FormMethod = "get" | MutationFormMethod;

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


function createClientSideRequest(
  location: string | Location,
  signal: AbortSignal,
  // submission?: Submission
): Request {
  const url = createClientSideURL(location);
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
  if (typeof Request === 'undefined' && process.env.NODE_ENV === 'test') {
    // @ts-ignore
    global.Request = class Request {
      url;
      signal;
      constructor(url: URL | string, init: RequestInit) {
        this.url = url;
        this.signal = init.signal;
      }
    }
  }
  
  // Content-Type is inferred (https://fetch.spec.whatwg.org/#dom-request)
  return new Request(url, init);
}

/**
 * Parses a string URL path into its separate pathname, search, and hash components.
 */

export function createClientSideURL(location: Location | string): URL {
  // window.location.origin is "null" (the literal string value) in Firefox
  // under certain conditions, notably when serving from a local HTML file
  // See https://bugzilla.mozilla.org/show_bug.cgi?id=878297
  let base =
    typeof window !== "undefined" &&
    typeof window.location !== "undefined" &&
    window.location.origin !== "null"
      ? window.location.origin
      : window.location.href;

  // INVESTIGATE: Do we really need base if we get a Location object?
  const url = new URL(location.toString(), base);
  url.hash = '';

    // invariant(
    //   base,
    //   `No window.location.(origin|href) available to create URL for href: ${href}`
    // );
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