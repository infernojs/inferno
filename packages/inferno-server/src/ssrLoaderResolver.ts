import { isNullOrUndef } from "inferno-shared";
import { matchPath } from "inferno-router";
import type { TLoaderData } from "inferno-router/src/Router";

export function resolveLoaders(location: string, tree: any): Promise<Record<string, TLoaderData>> {
  const promises = traverseLoaders(location, tree).map((({path, loader}) => resolveEntry(path, loader)));
  return Promise.all(promises).then((result) => Object.fromEntries(result));
}

type TLoaderEntry = {
  path: string,
  loader: Function,
}

function traverseLoaders(location: string, tree: any): TLoaderEntry[] {
  if (Array.isArray(tree)) {
    const entries = tree.reduce((res, node) => {
      const outpArr = traverseLoaders(location, node);
      return [...res, ...outpArr];
    }, []);
    return entries;
  }

  // This is a single node make sure it isn't null
  if (isNullOrUndef(tree) || isNullOrUndef(tree.props)) return [];

  let outp: TLoaderEntry[] = [];
  // Add any loader on this node
  if (tree.props.loader && tree.props.path) {
    // TODO: Should we check if we are in Router? It is defensive and could save a bit of time, but is it worth it?
    const { path, exact = false, strict = false, sensitive = false } = tree.props;
    if (matchPath(location, {
      path,
      exact,
      strict,
      sensitive,
    })) {
      outp.push({
        path,
        loader: tree.props.loader,
      })
    }
  }
  // Traverse children
  if (!isNullOrUndef(tree.props.children)) {
    const entries = traverseLoaders(location, tree.props.children);
    outp = [...outp, ...entries]
  }

  return outp;
}

function resolveEntry(path, loader): Promise<any> {
  return loader()
    .then((res) => [path, { res }])
    .catch((err) => [ path, { err } ]);
}