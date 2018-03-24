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
export type UIEvent<T> = SemiSyntheticEvent<T> & NativeUIEvent;
export type WheelEvent<T> = MouseEvent<T> & NativeWheelEvent;
export type AnimationEvent<T> = SemiSyntheticEvent<T> & NativeAnimationEvent;
export type TransitionEvent<T> = SemiSyntheticEvent<T> & NativeTransitionEvent;

//
// Event Handler Types
// ----------------------------------------------------------------------

export type EventHandler<E extends SemiSyntheticEvent<any>> = { bivarianceHack(event: E): void }['bivarianceHack'] | LinkedEvent<any, E> | null;

export type InfernoEventHandler<T> = EventHandler<SemiSyntheticEvent<T>>;

export type ClipboardEventHandler<T> = EventHandler<ClipboardEvent<T>>;
export type CompositionEventHandler<T> = EventHandler<CompositionEvent<T>>;
export type DragEventHandler<T> = EventHandler<DragEvent<T>>;
export type FocusEventHandler<T> = EventHandler<FocusEvent<T>>;
export type FormEventHandler<T> = EventHandler<FormEvent<T>>;
export type ChangeEventHandler<T> = EventHandler<ChangeEvent<T>>;
export type KeyboardEventHandler<T> = EventHandler<KeyboardEvent<T>>;
export type MouseEventHandler<T> = EventHandler<MouseEvent<T>>;
export type TouchEventHandler<T> = EventHandler<TouchEvent<T>>;
export type UIEventHandler<T> = EventHandler<UIEvent<T>>;
export type WheelEventHandler<T> = EventHandler<WheelEvent<T>>;
export type AnimationEventHandler<T> = EventHandler<AnimationEvent<T>>;
export type TransitionEventHandler<T> = EventHandler<TransitionEvent<T>>;
