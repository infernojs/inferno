import { isNullOrUndef } from "inferno-shared";
import { matchPath } from "./matchPath";
import type { TLoaderData, TLoaderProps } from "./Router";

// export function resolveLoaders(location: string, tree: any): Promise<Record<string, TLoaderData>> {
//   const promises = traverseLoaders(location, tree).map((({path, loader}) => resolveEntry(path, loader)));
//   return Promise.all(promises).then((result) => {
//     return Object.fromEntries(result);
//   });
// }

export function resolveLoaders(loaderEntries: TLoaderEntry[]): Promise<Record<string, TLoaderData>> {
  const promises = loaderEntries.map((({path, loader}) => resolveEntry(path, loader)));
  return Promise.all(promises).then((result) => {
    return Object.fromEntries(result);
  });
}

type TLoaderEntry = {
  path: string,
  loader: (TLoaderProps) => Promise<TLoaderEntry>,
}

export function traverseLoaders(location: string, tree: any): TLoaderEntry[] {
  // Make sure tree isn't null
  if (isNullOrUndef(tree)) return [];

  if (Array.isArray(tree)) {
    const entries = tree.reduce((res, node) => {
      const outpArr = traverseLoaders(location, node);
      return [...res, ...outpArr];
    }, []);
    return entries;
  }


  let outp: TLoaderEntry[] = [];
  // Add any loader on this node
  if (tree.props?.loader && tree.props?.path) {
    // TODO: If we traverse a switch, only the first match should be returned
    // TODO: Should we check if we are in Router? It is defensive and could save a bit of time, but is it worth it?
    const { path, exact = false, strict = false, sensitive = false } = tree.props;
    const match = matchPath(location, {
      path,
      exact,
      strict,
      sensitive,
    });
    if (match) {
      const { params } = match;
      // TODO: How do I pass request?
      outp.push({
        path,
        loader: () => tree.props.loader({ params }),
      })
    }
  }

  // Traverse children
  const entries = traverseLoaders(location, tree.children || tree.props?.children);
  return [...outp, ...entries];
}

function resolveEntry(path, loader): Promise<any> {
  return loader()
    .then((res) => [path, { res }])
    .catch((err) => [ path, { err } ]);
}