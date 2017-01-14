declare module 'inferno-server' {
  export function renderToString(input: any): string;
  export function renderToStaticMarkup(input: any): string;

  export default {
    renderToString,
    renderToStaticMarkup
  };
}
