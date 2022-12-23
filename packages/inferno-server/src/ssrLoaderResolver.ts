import { isNullOrUndef } from "inferno-shared";
import { matchPath } from "inferno-router";
import type { TLoaderData } from "inferno-router/src/Router";

// TODO: I have moved this back to inferno-router, should import from there
export async function resolveLoaders(location: string, tree: any): Promise<Record<string, TLoaderData>> {
  const promises = traverseLoaders(location, tree).map((({path, loader}) => resolveEntry(path, loader)));
  const result = await Promise.all(promises);
  return Object.fromEntries(result);
}

type TLoaderEntry = {
  path: string,
  loader: Function,
}

function traverseLoaders(location: string, tree: any): TLoaderEntry[] {
  // Make sure tree isn't null
  if (isNullOrUndef(tree)) return [];

  if (Array.isArray(tree)) {
    const entries = tree.reduce((res, node) => {
      const outpArr = traverseLoaders(location, node);
      // TODO: If in Switch, bail on first hit
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

  const entries = traverseLoaders(location, tree.children || tree.props?.children);
  return [...outp, ...entries]
}

async function resolveEntry(path, loader): Promise<any> {
  try {
    const res = await loader()
    return [path, { res }];
  } catch (err) {
    return [ path, { err } ];
  }
}