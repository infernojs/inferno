/**
 * `<Dynamic is={X} ... />` — runtime helper introduced for the TSRX
 * migration (Phase 1). The compiler lowers a `<Dynamic ... />` JSX call into a
 * `componentSlot(...)` invocation just like any other component, with the
 * twist that the rendered component is read from `props.is` on every render
 * (so swapping the component reference re-mounts under the existing slot).
 *
 * Replaces the removed `<@dynamic>` element syntax from earlier TSRX
 * versions. Mirrors `tsrx-react`'s `Dynamic` re-export shape so user code
 * looks the same across frameworks.
 *
 * Implementation is intentionally tiny: it's a component body that just
 * defers to whichever component is currently sitting in `props.is`. The
 * surrounding `componentSlot` machinery handles mount / unmount on identity
 * change (`comp !== state.currentComp`), so dynamically swapping `is` to a
 * different component cleanly tears down the previous instance and mounts
 * the new one.
 */
import type { ComponentBody, Scope } from './runtime';

export interface DynamicProps {
  is: ComponentBody<any>;
  // `is` is the only special prop; everything else is forwarded.
  [key: string]: any;
}

export function Dynamic(scope: Scope, props: DynamicProps, extra: any): void {
  const { is: Comp, ...rest } = props;
  // Invoke the chosen component directly. Hooks / context / DOM mount all
  // happen inside the outer slot's Block — the user sees Dynamic as a plain
  // function indirection.
  Comp(scope, rest, extra);
}
