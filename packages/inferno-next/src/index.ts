export const version = '0.1.0-alpha.0';

export {
  // Public API
  createRoot,
  flushSync,
  drainPassiveEffects,
  act,
  type Root,

  // Hooks
  useState,
  useReducer,
  useEffect,
  useLayoutEffect,
  useInsertionEffect,
  useMemo,
  useCallback,
  useRef,
  useId,
  useImperativeHandle,
  useEffectEvent,
  useDeferredValue,
  useTransition,
  startTransition,
  setTransitionFallbackTimeout,
  getTransitionFallbackTimeout,
  memo,

  // Context
  createContext,
  use,
  type Context,


  // HMR (compiler-emitted when the Vite plugin's hmr option is on)
  hmr,
  HMR,

  // Compiler-emitted runtime helpers
  template,
  clone,
  setText,
  setAttribute,
  setClassName,
  setStyle,
  setSpread,
  attachRef,
  injectStyle,
  delegateEvents,
  forBlock,
  ifBlock,
  tryBlock,
  switchBlock,
  componentSlot,
  portal,
  createPortal,
  type PortalDescriptor,
  withScope,
  renderBlock,
  createBlock,
  unmountBlock,
  scheduleRender,
  getCurrentScope,
  getCurrentBlock,

  type ComponentBody,
  type Scope,
  type Block,
} from './runtime';

// TSRX-migration v1: helper for the `<Dynamic is={X} ... />` form that
// replaces the removed `<@dynamic>` element syntax.
export { Dynamic } from './dynamic';
