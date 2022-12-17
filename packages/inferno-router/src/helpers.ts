import { TLoaderData } from "./Router";

export function useLoaderData(props: { __loaderData__: TLoaderData }) {
  return props.__loaderData__?.res;
}

export function useLoaderError(props: { __loaderData__: TLoaderData }) {
  return props.__loaderData__?.err;
}