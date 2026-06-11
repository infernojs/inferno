/**
 * `<Dynamic is={X} ... />` — runtime helper introduced for the TSRX
 * migration. The compiler lowers `<Dynamic ... />` to a regular
 * `componentSlot(__s, …, Dynamic, props)` call like any other component.
 * Dynamic itself then opens a CHILD slot keyed on the chosen component
 * identity, so swapping `is={X}` → `is={Y}` triggers the standard
 * `comp !== state.currentComp` path in `componentSlot`: previous instance
 * unmounts cleanly, new instance mounts under the same slot boundary,
 * hooks/state/context all behave per the React-shape contract.
 *
 * Replaces the removed `<@dynamic>` element syntax from earlier TSRX
 * versions. Mirrors `tsrx-react`'s `Dynamic` re-export shape so user code
 * looks the same across frameworks.
 *
 * The intermediate slot is required: invoking `Comp(scope, …)` directly
 * would mount the new component into Dynamic's OWN scope, so identity
 * change would leak the old comp's hook state into the new one. Routing
 * through `componentSlot` gives Dynamic its own scope boundary.
 */
import { componentSlot, type ComponentBody, type Scope } from './runtime';

export interface DynamicProps {
  is: ComponentBody<any>;
  // `is` is the only special prop; everything else is forwarded.
  [key: string]: any;
}

export function Dynamic(scope: Scope, props: DynamicProps, _extra: any): void {
  const { is: Comp, ...rest } = props;
  const block = scope.block;
  componentSlot(scope, '_dyn', block.parentNode, Comp, rest, block.endMarker);
}
