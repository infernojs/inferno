//
// Event System
// ----------------------------------------------------------------------

import {
  NativeAnimationEvent,
  NativeClipboardEvent,
  NativeCompositionEvent,
  NativeDragEvent,
  NativeFocusEvent,
  NativeKeyboardEvent,
  NativeMouseEvent,
  NativePointerEvent,
  NativeTouchEvent,
  NativeTransitionEvent,
  NativeUIEvent,
  NativeWheelEvent
} from '../../JSX';
import { LinkedEvent } from './linkEvent';

export interface SemiSyntheticEvent<T> extends Event {
  /**
   * A reference to the element on which the event listener is registered.
   */
  currentTarget: EventTarget & T;
}

export type ClipboardEvent<T> = SemiSyntheticEvent<T> & NativeClipboardEvent;
export type CompositionEvent<T> = SemiSyntheticEvent<T> & NativeCompositionEvent;
export type DragEvent<T> = MouseEvent<T> & NativeDragEvent;
export type FocusEvent<T> = SemiSyntheticEvent<T> & NativeFocusEvent;
export type FormEvent<T> = SemiSyntheticEvent<T>;

export interface InvalidEvent<T> extends SemiSyntheticEvent<T> {
  target: EventTarget & T;
}

export interface ChangeEvent<T> extends SemiSyntheticEvent<T> {
  target: EventTarget & T;
}

export type KeyboardEvent<T> = SemiSyntheticEvent<T> & NativeKeyboardEvent;
export type MouseEvent<T> = SemiSyntheticEvent<T> & NativeMouseEvent;
export type TouchEvent<T> = SemiSyntheticEvent<T> & NativeTouchEvent;
export type PointerEvent<T> = SemiSyntheticEvent<T> & NativePointerEvent;
export type UIEvent<T> = SemiSyntheticEvent<T> & NativeUIEvent;
export type WheelEvent<T> = MouseEvent<T> & NativeWheelEvent;
export type AnimationEvent<T> = SemiSyntheticEvent<T> & NativeAnimationEvent;
export type TransitionEvent<T> = SemiSyntheticEvent<T> & NativeTransitionEvent;

//
// Event Handler Types
// ----------------------------------------------------------------------

export type EventHandler<E extends SemiSyntheticEvent<any>> = { bivarianceHack(event: E): void }['bivarianceHack'] | LinkedEvent<any, E> | null;

export type InfernoEventHandler<T = Element> = EventHandler<SemiSyntheticEvent<T>>;

export type ClipboardEventHandler<T = Element> = EventHandler<ClipboardEvent<T>>;
export type CompositionEventHandler<T = Element> = EventHandler<CompositionEvent<T>>;
export type DragEventHandler<T = Element> = EventHandler<DragEvent<T>>;
export type FocusEventHandler<T = Element> = EventHandler<FocusEvent<T>>;
export type FormEventHandler<T = Element> = EventHandler<FormEvent<T>>;
export type ChangeEventHandler<T = Element> = EventHandler<ChangeEvent<T>>;
export type KeyboardEventHandler<T = Element> = EventHandler<KeyboardEvent<T>>;
export type MouseEventHandler<T = Element> = EventHandler<MouseEvent<T>>;
export type TouchEventHandler<T = Element> = EventHandler<TouchEvent<T>>;
export type PointerEventHandler<T = Element> = EventHandler<PointerEvent<T>>;
export type UIEventHandler<T = Element> = EventHandler<UIEvent<T>>;
export type WheelEventHandler<T = Element> = EventHandler<WheelEvent<T>>;
export type AnimationEventHandler<T = Element> = EventHandler<AnimationEvent<T>>;
export type TransitionEventHandler<T = Element> = EventHandler<TransitionEvent<T>>;
