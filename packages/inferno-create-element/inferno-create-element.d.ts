declare module 'inferno-create-element' {
  export default function createElement(name: any, props?: any, ...children): VNode;

  export function isValidElement(obj: VNode): boolean;  // TODO maybe move to helpers? ask core devs
}
