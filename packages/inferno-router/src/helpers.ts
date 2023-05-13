import { TLoaderData } from "./Router";

export function useLoaderData<Res = any>(props: { __loaderData__: TLoaderData<Res, any> }): Res | undefined {
  return props.__loaderData__?.res;
}

export function useLoaderError<Err = any>(props: { __loaderData__: TLoaderData<any, Err> }): Err | undefined {
  return props.__loaderData__?.err;
}