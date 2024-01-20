/* eslint-disable */
import type { NativeClipboardEvent, NativeCompositionEvent, NativeDragEvent, NativeFocusEvent } from './nativetypes';
import type { ChildFlags, VNodeFlags } from 'inferno-vnode-flags';
import type { PropertiesHyphen } from 'csstype';

export interface LinkedEvent<T, E extends Event> {
  data: T;
  event: (data: T, event: E) => void;
}

export type InfernoText = string | number;
export type InfernoChild = Inferno.InfernoElement | InfernoText;

interface InfernoNodeArray extends Array<InfernoNode> {}

export type InfernoFragment = {} | InfernoNodeArray;
export type InfernoSingleNode = InfernoChild | boolean | null | undefined;
export type InfernoNode = InfernoSingleNode | InfernoFragment;
export type NonEmptyProps = Record<string, unknown>;
export type ContextObject = Record<string, unknown>;
export type ParentDOM =
  | Element
  | SVGAElement
  | ShadowRoot
  | DocumentFragment
  | HTMLElement
  | Node
  | null;

// IComponent is defined here, instead of Component to de-couple implementation from interface
export interface IComponent<P, S> {
  // Public
  state: S | null;
  props: Readonly<
    {
      children?: InfernoNode;
    } & P
  >;
  context?: any;
  displayName?: string;
  refs?: any;

  forceUpdate(callback?: Function);

  setState<K extends keyof S>(
    newState: ((prevState: Readonly<S>, props: Readonly<{ children?: InfernoNode } & P>) => Pick<S, K> | S | null) | (Pick<S, K> | S | null),
    callback?: () => void
  ): void;

  componentDidMount?(): void;

  componentWillMount?(): void;

  componentWillReceiveProps?(nextProps: Readonly<{ children?: InfernoNode } & P>, nextContext: any): void;

  shouldComponentUpdate?(nextProps: Readonly<{ children?: InfernoNode } & P>, nextState: Readonly<S>, context: any): boolean;

  componentWillUpdate?(nextProps: Readonly<{ children?: InfernoNode } & P>, nextState: Readonly<S>, context: any): void;

  componentDidUpdate?(prevProps: Readonly<{ children?: InfernoNode } & P>, prevState: Readonly<S>, snapshot: any): void;

  componentWillUnmount?(): void;

  componentDidAppear?(domNode: Element): void;

  componentWillDisappear?(domNode: Element, callback: Function): void;

  componentWillMove?(parentVNode: VNode, parentDOM: Element, dom: Element): void;

  getChildContext?(): void;

  getSnapshotBeforeUpdate?(prevProps: Readonly<{ children?: InfernoNode } & P>, prevState: Readonly<S>): any;

  render(nextProps: Readonly<{ children?: InfernoNode } & P>, nextState: Readonly<S>, nextContext: any): InfernoNode;
}

export interface SemiSyntheticEvent<T> extends Event {
  /**
   * A reference to the element on which the event listener is registered.
   */
  currentTarget: EventTarget & T;
  isDefaultPrevented?: () => boolean;
  isPropagationStopped?: () => boolean;
}

export type ClipboardEvent<T> = SemiSyntheticEvent<T> & NativeClipboardEvent;
export type CompositionEvent<T> = SemiSyntheticEvent<T> & NativeCompositionEvent;
export type DragEvent<T> = InfernoMouseEvent<T> & NativeDragEvent;
export type FocusEvent<T> = SemiSyntheticEvent<T> & NativeFocusEvent;
export interface FormEvent<T> extends SemiSyntheticEvent<T> {
  target: EventTarget & T;
}

export interface ChangeEvent<T> extends SemiSyntheticEvent<T> {
  target: EventTarget & T;
}

export type InfernoKeyboardEvent<T> = SemiSyntheticEvent<T> & KeyboardEvent;
export type InfernoMouseEvent<T> = SemiSyntheticEvent<T> & MouseEvent;
export type InfernoTouchEvent<T> = SemiSyntheticEvent<T> & TouchEvent;
export type InfernoPointerEvent<T> = SemiSyntheticEvent<T> & PointerEvent;
export type InfernoUIEvent<T> = SemiSyntheticEvent<T> & UIEvent;
export type InfernoWheelEvent<T> = InfernoMouseEvent<T> & WheelEvent;
export type InfernoAnimationEvent<T> = SemiSyntheticEvent<T> & AnimationEvent;
export type InfernoTransitionEvent<T> = SemiSyntheticEvent<T> & TransitionEvent;
type Booleanish = boolean | 'true' | 'false';

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
export type KeyboardEventHandler<T = Element> = EventHandler<InfernoKeyboardEvent<T>>;
export type MouseEventHandler<T = Element> = EventHandler<InfernoMouseEvent<T>>;
export type TouchEventHandler<T = Element> = EventHandler<InfernoTouchEvent<T>>;
export type PointerEventHandler<T = Element> = EventHandler<InfernoPointerEvent<T>>;
export type UIEventHandler<T = Element> = EventHandler<InfernoUIEvent<T>>;
export type WheelEventHandler<T = Element> = EventHandler<InfernoWheelEvent<T>>;
export type AnimationEventHandler<T = Element> = EventHandler<InfernoAnimationEvent<T>>;
export type TransitionEventHandler<T = Element> = EventHandler<InfernoTransitionEvent<T>>;

export type Key = string | number | undefined | null;

export interface VNode {
  children: InfernoNode;
  childFlags: ChildFlags;
  dom: Element | null;
  className: string | null | undefined;
  flags: VNodeFlags;
  isValidated?: boolean;
  key: Key;
  props: any;
  ref: any;
  type: any;
}

export interface RefObject<T> {
  readonly current: T | null;
}

export type Ref<T = Element> = { bivarianceHack(instance: T | null): any }['bivarianceHack'];

export interface ForwardRef<P, T> extends Inferno.StatelessComponent<P> {
  ref: Ref<T>;
}

export interface Refs<P> {
  onComponentDidMount?: (domNode: Element | null, nextProps: Readonly<{ children?: InfernoNode } & P>) => void;

  onComponentWillMount?(props: Readonly<{ children?: InfernoNode } & P>): void;

  onComponentShouldUpdate?(lastProps: Readonly<{ children?: InfernoNode } & P>, nextProps: Readonly<{ children?: InfernoNode } & P>): boolean;

  onComponentWillUpdate?(lastProps: Readonly<{ children?: InfernoNode } & P>, nextProps: Readonly<{ children?: InfernoNode } & P>): void;

  onComponentDidUpdate?(lastProps: Readonly<{ children?: InfernoNode } & P>, nextProps: Readonly<{ children?: InfernoNode } & P>): void;

  onComponentWillUnmount?(domNode: Element, nextProps: Readonly<{ children?: InfernoNode } & P>): void;

  onComponentDidAppear?(domNode: Element, props: Readonly<{ children?: InfernoNode } & P>): void;

  onComponentWillDisappear?(domNode: Element, props: Readonly<{ children?: InfernoNode } & P>, callback: Function): void;

  onComponentWillMove?(parentVNode: VNode, parentDOM: Element, dom: Element, props: Readonly<{ children?: InfernoNode } & P>): void;
}

export interface Props<T> {
  children?: InfernoNode;
  key?: Key;
  ref?: Ref<T> | undefined;
}

export declare namespace Inferno {
  //
  // Inferno Elements
  // ----------------------------------------------------------------------
  // tslint:disable-next-line:interface-over-type-literal
  type ComponentState = {};
  type ExoticComponent<P = {}> = (props: P) => InfernoElement;

  interface Attributes {
    key?: Key;

    $ReCreate?: boolean;
    $HasVNodeChildren?: boolean;
    $HasNonKeyedChildren?: boolean;
    $HasKeyedChildren?: boolean;
    $HasTextChildren?: boolean;
    $ChildFlag?: number;
  }
  interface ClassAttributes<T> extends Attributes {
    ref?: Ref<T> | RefObject<T> | null | undefined;
  }

  interface InfernoElement<P = any> {
    type: string | ComponentClass<P> | SFC<P>;
    props: P;
    key?: Key;
  }

  interface SFCElement<P> extends InfernoElement<P> {
    type: SFC<P>;
  }

  type CElement<P, T extends IComponent<P, ComponentState>> = ComponentElement<P, T>;
  interface ComponentElement<P, T extends IComponent<P, ComponentState>> extends InfernoElement<P> {
    type: ComponentClass<P>;
    ref?: Ref<T> | undefined;
  }

  // string fallback for custom web-components
  interface DOMElement<P extends HTMLAttributes<T> | SVGAttributes<T>, T extends Element> extends InfernoElement<P> {
    type: string;
    ref: Ref<T>;
  }

  // InfernoHTML for InfernoHTMLElement
  interface InfernoHTMLElement<T extends HTMLElement> extends DetailedInfernoHTMLElement<AllHTMLAttributes<T>, T> {}

  interface DetailedInfernoHTMLElement<P extends HTMLAttributes<T>, T extends HTMLElement> extends DOMElement<P, T> {
    type: keyof InfernoHTML;
  }

  // InfernoSVG for InfernoSVGElement
  interface InfernoSVGElement extends DOMElement<SVGAttributes<SVGElement>, SVGElement> {
    type: keyof InfernoSVG;
  }

  //
  // Factories
  // ----------------------------------------------------------------------

  type Factory<P> = (props?: Attributes & P, ...children: InfernoNode[]) => InfernoElement<P>;

  type SFCFactory<P> = (props?: Attributes & P, ...children: InfernoNode[]) => SFCElement<P>;

  type ComponentFactory<P, T extends IComponent<P, ComponentState>> = (props?: ClassAttributes<T> & P, ...children: InfernoNode[]) => CElement<P, T>;

  type CFactory<P, T extends IComponent<P, ComponentState>> = ComponentFactory<P, T>;

  type DOMFactory<P extends DOMAttributes<T>, T extends Element> = (props?: (ClassAttributes<T> & P) | null, ...children: InfernoNode[]) => DOMElement<P, T>;

  interface HTMLFactory<T extends HTMLElement> extends DetailedHTMLFactory<AllHTMLAttributes<T>, T> {}

  interface DetailedHTMLFactory<P extends HTMLAttributes<T>, T extends HTMLElement> extends DOMFactory<P, T> {
    (props?: (ClassAttributes<T> & P) | null, ...children: InfernoNode[]): DetailedInfernoHTMLElement<P, T>;
  }

  interface SVGFactory extends DOMFactory<SVGAttributes<SVGElement>, SVGElement> {
    (props?: (ClassAttributes<SVGElement> & SVGAttributes<SVGElement>) | null, ...children: InfernoNode[]): InfernoSVGElement;
  }

  //
  // Inferno Nodes
  // ----------------------------------------------------------------------

  const version: string;

  //
  // Component API
  // ----------------------------------------------------------------------

  interface ChildContextProvider<CC> {
    getChildContext(): CC;
  }

  //
  // Class Interfaces
  // ----------------------------------------------------------------------

  type SFC<P = {}> = StatelessComponent<P>;
  interface StatelessComponent<P = {}> {
    (
      props: {
        children?: InfernoNode;
      } & P &
        Refs<P>,
      context?: any
    ): InfernoElement | null;
    defaultProps?: Partial<P> | undefined | null;
    defaultHooks?: Refs<P> | undefined | null;
  }

  interface ComponentClass<P = {}> {
    new (
      props?: {
        children?: InfernoNode;
      } & P,
      context?: any
    ): IComponent<P, ComponentState>;
    defaultProps?: Partial<P> | undefined | null;
  }

  //
  // Props / DOM Attributes
  // ----------------------------------------------------------------------

  interface HTMLProps<T> extends AllHTMLAttributes<T>, ClassAttributes<T> {}

  type DetailedHTMLProps<E extends HTMLAttributes<T>, T> = ClassAttributes<T> & E;

  interface SVGProps<T> extends SVGAttributes<T>, ClassAttributes<T> {}

  interface DOMAttributes<T> {
    children?: InfernoNode;
    dangerouslySetInnerHTML?:
      | {
          __html: string;
        }
      | null
      | undefined;

    // Clipboard Events
    onCopy?: ClipboardEventHandler<T> | undefined;
    onCut?: ClipboardEventHandler<T> | undefined;
    onPaste?: ClipboardEventHandler<T> | undefined;

    // Composition Events
    onCompositionEnd?: CompositionEventHandler<T> | undefined;
    onCompositionStart?: CompositionEventHandler<T> | undefined;
    onCompositionUpdate?: CompositionEventHandler<T> | undefined;

    // Focus Events
    onFocus?: FocusEventHandler<T> | undefined;
    onBlur?: FocusEventHandler<T> | undefined;

    // Form Events
    onChange?: FormEventHandler<T> | undefined | null;
    onBeforeInput?: FormEventHandler<T> | undefined;
    onInput?: FormEventHandler<T> | undefined;
    onReset?: FormEventHandler<T> | undefined;
    onSubmit?: FormEventHandler<T> | undefined;
    onInvalid?: FormEventHandler<T> | undefined;

    // Image Events
    onLoad?: InfernoEventHandler<T> | undefined;
    onError?: InfernoEventHandler<T> | undefined; // also a Media Event

    // Keyboard Events
    onKeyDown?: KeyboardEventHandler<T> | undefined;
    onKeyPress?: KeyboardEventHandler<T> | undefined;
    onKeyUp?: KeyboardEventHandler<T> | undefined;

    // Media Events
    onAbort?: InfernoEventHandler<T> | undefined;
    onCanPlay?: InfernoEventHandler<T> | undefined;
    onCanPlayThrough?: InfernoEventHandler<T> | undefined;
    onDurationChange?: InfernoEventHandler<T> | undefined;
    onEmptied?: InfernoEventHandler<T> | undefined;
    onEncrypted?: InfernoEventHandler<T> | undefined;
    onEnded?: InfernoEventHandler<T> | undefined;
    onLoadedData?: InfernoEventHandler<T> | undefined;
    onLoadedMetadata?: InfernoEventHandler<T> | undefined;
    onLoadStart?: InfernoEventHandler<T> | undefined;
    onPause?: InfernoEventHandler<T> | undefined;
    onPlay?: InfernoEventHandler<T> | undefined;
    onPlaying?: InfernoEventHandler<T> | undefined;
    onProgress?: InfernoEventHandler<T> | undefined;
    onRateChange?: InfernoEventHandler<T> | undefined;
    onSeeked?: InfernoEventHandler<T> | undefined;
    onSeeking?: InfernoEventHandler<T> | undefined;
    onStalled?: InfernoEventHandler<T> | undefined;
    onSuspend?: InfernoEventHandler<T> | undefined;
    onTimeUpdate?: InfernoEventHandler<T> | undefined;
    onVolumeChange?: InfernoEventHandler<T> | undefined;
    onWaiting?: InfernoEventHandler<T> | undefined;

    // MouseEvents
    onAuxClick?: MouseEventHandler<T> | undefined;
    onClick?: MouseEventHandler<T> | undefined;
    onContextMenu?: MouseEventHandler<T> | undefined;
    onDblClick?: MouseEventHandler<T> | undefined;
    onDrag?: DragEventHandler<T> | undefined;
    onDragEnd?: DragEventHandler<T> | undefined;
    onDragEnter?: DragEventHandler<T> | undefined;
    onDragExit?: DragEventHandler<T> | undefined;
    onDragLeave?: DragEventHandler<T> | undefined;
    onDragOver?: DragEventHandler<T> | undefined;
    onDragStart?: DragEventHandler<T> | undefined;
    onDrop?: DragEventHandler<T> | undefined;
    onMouseDown?: MouseEventHandler<T> | undefined;
    onMouseEnter?: MouseEventHandler<T> | undefined;
    onMouseLeave?: MouseEventHandler<T> | undefined;
    onMouseMove?: MouseEventHandler<T> | undefined;
    onMouseOut?: MouseEventHandler<T> | undefined;
    onMouseOver?: MouseEventHandler<T> | undefined;
    onMouseUp?: MouseEventHandler<T> | undefined;

    // Selection Events
    onSelect?: InfernoEventHandler<T> | undefined;

    // Touch Events
    onTouchCancel?: TouchEventHandler<T> | undefined;
    onTouchEnd?: TouchEventHandler<T> | undefined;
    onTouchMove?: TouchEventHandler<T> | undefined;
    onTouchStart?: TouchEventHandler<T> | undefined;

    // Pointer Events
    onPointerDown?: PointerEventHandler<T> | undefined;
    onPointerMove?: PointerEventHandler<T> | undefined;
    onPointerUp?: PointerEventHandler<T> | undefined;
    onPointerCancel?: PointerEventHandler<T> | undefined;
    onPointerEnter?: PointerEventHandler<T> | undefined;
    onPointerLeave?: PointerEventHandler<T> | undefined;
    onPointerOver?: PointerEventHandler<T> | undefined;
    onPointerOut?: PointerEventHandler<T> | undefined;

    // UI Events
    onScroll?: UIEventHandler<T> | undefined;

    // Wheel Events
    onWheel?: WheelEventHandler<T> | undefined;

    // Animation Events
    onAnimationStart?: AnimationEventHandler<T> | undefined;
    onAnimationEnd?: AnimationEventHandler<T> | undefined;
    onAnimationIteration?: AnimationEventHandler<T> | undefined;

    // Transition Events
    onTransitionEnd?: TransitionEventHandler<T> | undefined;

    // NATIVE EVENTS
    // Clipboard Events
    oncopy?: ClipboardEventHandler<T> | undefined;
    oncut?: ClipboardEventHandler<T> | undefined;
    onpaste?: ClipboardEventHandler<T> | undefined;

    // Composition Events
    oncompositionend?: CompositionEventHandler<T> | undefined;
    oncompositionstart?: CompositionEventHandler<T> | undefined;
    oncompositionupdate?: CompositionEventHandler<T> | undefined;

    // Focus Events
    onfocus?: FocusEventHandler<T> | undefined;
    onblur?: FocusEventHandler<T> | undefined;

    // Form Events
    onchange?: FormEventHandler<T> | undefined | null;
    onbeforeinput?: FormEventHandler<T> | undefined;
    oninput?: FormEventHandler<T> | undefined;
    onreset?: FormEventHandler<T> | undefined;
    onsubmit?: FormEventHandler<T> | undefined;
    oninvalid?: FormEventHandler<T> | undefined;

    // Image Events
    onload?: InfernoEventHandler<T> | undefined;
    onerror?: InfernoEventHandler<T> | undefined; // also a Media Event

    // Keyboard Events
    onkeydown?: KeyboardEventHandler<T> | undefined;
    onkeypress?: KeyboardEventHandler<T> | undefined;
    onkeyup?: KeyboardEventHandler<T> | undefined;

    // Media Events
    onabort?: InfernoEventHandler<T> | undefined;
    oncanplay?: InfernoEventHandler<T> | undefined;
    oncanplaythrough?: InfernoEventHandler<T> | undefined;
    ondurationchange?: InfernoEventHandler<T> | undefined;
    onemptied?: InfernoEventHandler<T> | undefined;
    onencrypted?: InfernoEventHandler<T> | undefined;
    onended?: InfernoEventHandler<T> | undefined;
    onloadeddata?: InfernoEventHandler<T> | undefined;
    onloadedmetadata?: InfernoEventHandler<T> | undefined;
    onloadstart?: InfernoEventHandler<T> | undefined;
    onpause?: InfernoEventHandler<T> | undefined;
    onplay?: InfernoEventHandler<T> | undefined;
    onplaying?: InfernoEventHandler<T> | undefined;
    onprogress?: InfernoEventHandler<T> | undefined;
    onratechange?: InfernoEventHandler<T> | undefined;
    onseeked?: InfernoEventHandler<T> | undefined;
    onseeking?: InfernoEventHandler<T> | undefined;
    onstalled?: InfernoEventHandler<T> | undefined;
    onsuspend?: InfernoEventHandler<T> | undefined;
    ontimeupdate?: InfernoEventHandler<T> | undefined;
    onvolumechange?: InfernoEventHandler<T> | undefined;
    onwaiting?: InfernoEventHandler<T> | undefined;

    // MouseEvents
    onauxclick?: MouseEventHandler<T> | undefined;
    onclick?: MouseEventHandler<T> | undefined;
    oncontextmenu?: MouseEventHandler<T> | undefined;
    ondblclick?: MouseEventHandler<T> | undefined;
    ondrag?: DragEventHandler<T> | undefined;
    ondragend?: DragEventHandler<T> | undefined;
    ondragenter?: DragEventHandler<T> | undefined;
    ondragexit?: DragEventHandler<T> | undefined;
    ondragLeave?: DragEventHandler<T> | undefined;
    ondragover?: DragEventHandler<T> | undefined;
    ondragstart?: DragEventHandler<T> | undefined;
    ondrop?: DragEventHandler<T> | undefined;
    onmousedown?: MouseEventHandler<T> | undefined;
    onmouseenter?: MouseEventHandler<T> | undefined;
    onmouseleave?: MouseEventHandler<T> | undefined;
    onmousemove?: MouseEventHandler<T> | undefined;
    onmouseout?: MouseEventHandler<T> | undefined;
    onmouseover?: MouseEventHandler<T> | undefined;
    onmouseup?: MouseEventHandler<T> | undefined;

    // Selection Events
    onselect?: InfernoEventHandler<T> | undefined;

    // Touch Events
    ontouchcancel?: TouchEventHandler<T> | undefined;
    ontouchend?: TouchEventHandler<T> | undefined;
    ontouchmove?: TouchEventHandler<T> | undefined;
    ontouchstart?: TouchEventHandler<T> | undefined;

    // Pointer Events
    onpointerdown?: PointerEventHandler<T> | undefined;
    onpointermove?: PointerEventHandler<T> | undefined;
    onpointerup?: PointerEventHandler<T> | undefined;
    onpointercancel?: PointerEventHandler<T> | undefined;
    onpointerenter?: PointerEventHandler<T> | undefined;
    onpointerleave?: PointerEventHandler<T> | undefined;
    onpointerover?: PointerEventHandler<T> | undefined;
    onpointerout?: PointerEventHandler<T> | undefined;

    // UI Events
    onscroll?: UIEventHandler<T> | undefined;

    // Wheel Events
    onwheel?: WheelEventHandler<T> | undefined;

    // Animation Events
    onanimationstart?: AnimationEventHandler<T> | undefined;
    onanimationend?: AnimationEventHandler<T> | undefined;
    onanimationiteration?: AnimationEventHandler<T> | undefined;

    // Transition Events
    ontransitionend?: TransitionEventHandler<T> | undefined;
  }

  // All the WAI-ARIA 1.1 attributes from https://www.w3.org/TR/wai-aria-1.1/
  interface AriaAttributes {
    /** Identifies the currently active element when DOM focus is on a composite widget, textbox, group, or application. */
    'aria-activedescendant'?: string | null | undefined;
    /** Indicates whether assistive technologies will present all, or only parts of, the changed region based on the change notifications defined by the aria-relevant attribute. */
    'aria-atomic'?: Booleanish | null | undefined;
    /**
     * Indicates whether inputting text could trigger display of one or more predictions of the user's intended value for an input and specifies how predictions would be
     * presented if they are made.
     */
    'aria-autocomplete'?: 'none' | 'inline' | 'list' | 'both' | null | undefined;
    /** Indicates an element is being modified and that assistive technologies MAY want to wait until the modifications are complete before exposing them to the user. */
    'aria-busy'?: Booleanish | null | undefined;
    /**
     * Indicates the current "checked" state of checkboxes, radio buttons, and other widgets.
     * @see aria-pressed @see aria-selected.
     */
    'aria-checked'?: boolean | 'false' | 'mixed' | 'true' | null | undefined;
    /**
     * Defines the total number of columns in a table, grid, or treegrid.
     * @see aria-colindex.
     */
    'aria-colcount'?: number | null | undefined;
    /**
     * Defines an element's column index or position with respect to the total number of columns within a table, grid, or treegrid.
     * @see aria-colcount @see aria-colspan.
     */
    'aria-colindex'?: number | null | undefined;
    /**
     * Defines the number of columns spanned by a cell or gridcell within a table, grid, or treegrid.
     * @see aria-colindex @see aria-rowspan.
     */
    'aria-colspan'?: number | null | undefined;
    /**
     * Identifies the element (or elements) whose contents or presence are controlled by the current element.
     * @see aria-owns.
     */
    'aria-controls'?: string | null | undefined;
    /** Indicates the element that represents the current item within a container or set of related elements. */
    'aria-current'?: boolean | 'false' | 'true' | 'page' | 'step' | 'location' | 'date' | 'time' | null | undefined;
    /**
     * Identifies the element (or elements) that describes the object.
     * @see aria-labelledby
     */
    'aria-describedby'?: string | null | undefined;
    /**
     * Identifies the element that provides a detailed, extended description for the object.
     * @see aria-describedby.
     */
    'aria-details'?: string | null | undefined;
    /**
     * Indicates that the element is perceivable but disabled, so it is not editable or otherwise operable.
     * @see aria-hidden @see aria-readonly.
     */
    'aria-disabled'?: Booleanish | null | undefined;
    /**
     * Indicates what functions can be performed when a dragged object is released on the drop target.
     * @deprecated in ARIA 1.1
     */
    'aria-dropeffect'?: 'none' | 'copy' | 'execute' | 'link' | 'move' | 'popup' | null | undefined;
    /**
     * Identifies the element that provides an error message for the object.
     * @see aria-invalid @see aria-describedby.
     */
    'aria-errormessage'?: string | null | undefined;
    /** Indicates whether the element, or another grouping element it controls, is currently expanded or collapsed. */
    'aria-expanded'?: Booleanish | null | undefined;
    /**
     * Identifies the next element (or elements) in an alternate reading order of content which, at the user's discretion,
     * allows assistive technology to override the general default of reading in document source order.
     */
    'aria-flowto'?: string | null | undefined;
    /**
     * Indicates an element's "grabbed" state in a drag-and-drop operation.
     * @deprecated in ARIA 1.1
     */
    'aria-grabbed'?: Booleanish | null | undefined;
    /** Indicates the availability and type of interactive popup element, such as menu or dialog, that can be triggered by an element. */
    'aria-haspopup'?: boolean | 'false' | 'true' | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog' | null | undefined;
    /**
     * Indicates whether the element is exposed to an accessibility API.
     * @see aria-disabled.
     */
    'aria-hidden'?: Booleanish | null | undefined;
    /**
     * Indicates the entered value does not conform to the format expected by the application.
     * @see aria-errormessage.
     */
    'aria-invalid'?: boolean | 'false' | 'true' | 'grammar' | 'spelling' | null | undefined;
    /** Indicates keyboard shortcuts that an author has implemented to activate or give focus to an element. */
    'aria-keyshortcuts'?: string | null | undefined;
    /**
     * Defines a string value that labels the current element.
     * @see aria-labelledby.
     */
    'aria-label'?: string | null | undefined;
    /**
     * Identifies the element (or elements) that labels the current element.
     * @see aria-describedby.
     */
    'aria-labelledby'?: string | null | undefined;
    /** Defines the hierarchical level of an element within a structure. */
    'aria-level'?: number | null | undefined;
    /** Indicates that an element will be updated, and describes the types of updates the user agents, assistive technologies, and user can expect from the live region. */
    'aria-live'?: 'off' | 'assertive' | 'polite' | null | undefined;
    /** Indicates whether an element is modal when displayed. */
    'aria-modal'?: Booleanish | null | undefined;
    /** Indicates whether a text box accepts multiple lines of input or only a single line. */
    'aria-multiline'?: Booleanish | null | undefined;
    /** Indicates that the user may select more than one item from the current selectable descendants. */
    'aria-multiselectable'?: Booleanish | null | undefined;
    /** Indicates whether the element's orientation is horizontal, vertical, or unknown/ambiguous. */
    'aria-orientation'?: 'horizontal' | 'vertical' | null | undefined;
    /**
     * Identifies an element (or elements) in order to define a visual, functional, or contextual parent/child relationship
     * between DOM elements where the DOM hierarchy cannot be used to represent the relationship.
     * @see aria-controls.
     */
    'aria-owns'?: string | null | undefined;
    /**
     * Defines a short hint (a word or short phrase) intended to aid the user with data entry when the control has no value.
     * A hint could be a sample value or a brief description of the expected format.
     */
    'aria-placeholder'?: string | null | undefined;
    /**
     * Defines an element's number or position in the current set of listitems or treeitems. Not required if all elements in the set are present in the DOM.
     * @see aria-setsize.
     */
    'aria-posinset'?: number | null | undefined;
    /**
     * Indicates the current "pressed" state of toggle buttons.
     * @see aria-checked @see aria-selected.
     */
    'aria-pressed'?: boolean | 'false' | 'mixed' | 'true' | null | undefined;
    /**
     * Indicates that the element is not editable, but is otherwise operable.
     * @see aria-disabled.
     */
    'aria-readonly'?: Booleanish | null | undefined;
    /**
     * Indicates what notifications the user agent will trigger when the accessibility tree within a live region is modified.
     * @see aria-atomic.
     */
    'aria-relevant'?:
      | 'additions'
      | 'additions removals'
      | 'additions text'
      | 'all'
      | 'removals'
      | 'removals additions'
      | 'removals text'
      | 'text'
      | 'text additions'
      | 'text removals'
      | null
      | undefined;
    /** Indicates that user input is required on the element before a form may be submitted. */
    'aria-required'?: Booleanish | null | undefined;
    /** Defines a human-readable, author-localized description for the role of an element. */
    'aria-roledescription'?: string | null | undefined;
    /**
     * Defines the total number of rows in a table, grid, or treegrid.
     * @see aria-rowindex.
     */
    'aria-rowcount'?: number | null | undefined;
    /**
     * Defines an element's row index or position with respect to the total number of rows within a table, grid, or treegrid.
     * @see aria-rowcount @see aria-rowspan.
     */
    'aria-rowindex'?: number | null | undefined;
    /**
     * Defines the number of rows spanned by a cell or gridcell within a table, grid, or treegrid.
     * @see aria-rowindex @see aria-colspan.
     */
    'aria-rowspan'?: number | null | undefined;
    /**
     * Indicates the current "selected" state of various widgets.
     * @see aria-checked @see aria-pressed.
     */
    'aria-selected'?: Booleanish | null | undefined;
    /**
     * Defines the number of items in the current set of listitems or treeitems. Not required if all elements in the set are present in the DOM.
     * @see aria-posinset.
     */
    'aria-setsize'?: number | null | undefined;
    /** Indicates if items in a table or grid are sorted in ascending or descending order. */
    'aria-sort'?: 'none' | 'ascending' | 'descending' | 'other' | null | undefined;
    /** Defines the maximum allowed value for a range widget. */
    'aria-valuemax'?: number | null | undefined;
    /** Defines the minimum allowed value for a range widget. */
    'aria-valuemin'?: number | null | undefined;
    /**
     * Defines the current value for a range widget.
     * @see aria-valuetext.
     */
    'aria-valuenow'?: number | null | undefined;
    /** Defines the human-readable text alternative of aria-valuenow for a range widget. */
    'aria-valuetext'?: string | null | undefined;
  }

  // All the WAI-ARIA 1.1 role attribute values from https://www.w3.org/TR/wai-aria-1.1/#role_definitions
  type AriaRole =
    | 'alert'
    | 'alertdialog'
    | 'application'
    | 'article'
    | 'banner'
    | 'button'
    | 'cell'
    | 'checkbox'
    | 'columnheader'
    | 'combobox'
    | 'complementary'
    | 'contentinfo'
    | 'definition'
    | 'dialog'
    | 'directory'
    | 'document'
    | 'feed'
    | 'figure'
    | 'form'
    | 'grid'
    | 'gridcell'
    | 'group'
    | 'heading'
    | 'img'
    | 'link'
    | 'list'
    | 'listbox'
    | 'listitem'
    | 'log'
    | 'main'
    | 'marquee'
    | 'math'
    | 'menu'
    | 'menubar'
    | 'menuitem'
    | 'menuitemcheckbox'
    | 'menuitemradio'
    | 'navigation'
    | 'none'
    | 'note'
    | 'option'
    | 'presentation'
    | 'progressbar'
    | 'radio'
    | 'radiogroup'
    | 'region'
    | 'row'
    | 'rowgroup'
    | 'rowheader'
    | 'scrollbar'
    | 'search'
    | 'searchbox'
    | 'separator'
    | 'slider'
    | 'spinbutton'
    | 'status'
    | 'switch'
    | 'tab'
    | 'table'
    | 'tablist'
    | 'tabpanel'
    | 'term'
    | 'textbox'
    | 'timer'
    | 'toolbar'
    | 'tooltip'
    | 'tree'
    | 'treegrid'
    | 'treeitem'
    | (string & {});

  interface CssVariables {
    [key: `--${string}`]: string;
  }

  interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    // Inferno-specific Attributes
    class?: string | null | undefined;
    defaultChecked?: boolean | null | undefined;
    defaultValue?: string | number | ReadonlyArray<string> | null | undefined;

    // Standard HTML Attributes
    accessKey?: string | null | undefined;
    className?: string | null | undefined;
    contentEditable?: Booleanish | 'inherit' | null | undefined;
    contextMenu?: string | null | undefined;
    dir?: string | null | undefined;
    draggable?: Booleanish | null | undefined;
    hidden?: boolean | null | undefined;
    id?: string | null | undefined;
    lang?: string | null | undefined;
    placeholder?: string | null | undefined;
    slot?: string | null | undefined;
    spellCheck?: Booleanish | null | undefined;
    style?: PropertiesHyphen | string | null | undefined | CssVariables;
    tabIndex?: number | null | undefined;
    title?: string | null | undefined;
    translate?: 'yes' | 'no' | null | undefined;

    // Unknown
    radioGroup?: string | null | undefined; // <command>, <menuitem>

    // WAI-ARIA
    role?: AriaRole | null | undefined;

    // RDFa Attributes
    about?: string | null | undefined;
    datatype?: string | null | undefined;
    inlist?: any;
    prefix?: string | null | undefined;
    property?: string | null | undefined;
    resource?: string | null | undefined;
    typeof?: string | null | undefined;
    vocab?: string | null | undefined;

    // Non-standard Attributes
    autoCapitalize?: string | null | undefined;
    autoCorrect?: string | null | undefined;
    autoSave?: string | null | undefined;
    color?: string | null | undefined;
    itemProp?: string | null | undefined;
    itemScope?: boolean | null | undefined;
    itemType?: string | null | undefined;
    itemID?: string | null | undefined;
    itemRef?: string | null | undefined;
    results?: number | null | undefined;
    security?: string | null | undefined;
    unselectable?: 'on' | 'off' | null | undefined;

    // Living Standard
    /**
     * Hints at the type of data that might be entered by the user while editing the element or its contents
     * @see https://html.spec.whatwg.org/multipage/interaction.html#input-modalities:-the-inputmode-attribute
     */
    inputMode?: 'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search' | null | undefined;
    /**
     * Specify that a standard HTML element should behave like a defined custom built-in element
     * @see https://html.spec.whatwg.org/multipage/custom-elements.html#attr-is
     */
    is?: string | null | undefined;
  }

  interface AllHTMLAttributes<T> extends HTMLAttributes<T> {
    // Standard HTML Attributes
    accept?: string | null | undefined;
    acceptCharset?: string | null | undefined;
    action?: string | null | undefined;
    allowFullScreen?: boolean | null | undefined;
    allowTransparency?: boolean | null | undefined;
    alt?: string | null | undefined;
    as?: string | null | undefined;
    async?: boolean | null | undefined;
    autoComplete?: string | null | undefined;
    autoFocus?: boolean | null | undefined;
    autoPlay?: boolean | null | undefined;
    capture?: boolean | 'user' | 'environment' | null | undefined;
    cellPadding?: number | string | null | undefined;
    cellSpacing?: number | string | null | undefined;
    charSet?: string | null | undefined;
    challenge?: string | null | undefined;
    checked?: boolean | null | undefined;
    cite?: string | null | undefined;
    classID?: string | null | undefined;
    cols?: number | null | undefined;
    colSpan?: number | null | undefined;
    content?: string | null | undefined;
    controls?: boolean | null | undefined;
    coords?: string | null | undefined;
    crossOrigin?: string | null | undefined;
    data?: string | null | undefined;
    dateTime?: string | null | undefined;
    default?: boolean | null | undefined;
    defer?: boolean | null | undefined;
    disabled?: boolean | null | undefined;
    download?: any;
    encType?: string | null | undefined;
    form?: string | null | undefined;
    formAction?: string | null | undefined;
    formEncType?: string | null | undefined;
    formMethod?: string | null | undefined;
    formNoValidate?: boolean | null | undefined;
    formTarget?: string | null | undefined;
    frameBorder?: number | string | null | undefined;
    headers?: string | null | undefined;
    height?: number | string | null | undefined;
    high?: number | null | undefined;
    href?: string | null | undefined;
    hrefLang?: string | null | undefined;
    htmlFor?: string | null | undefined;
    httpEquiv?: string | null | undefined;
    integrity?: string | null | undefined;
    keyParams?: string | null | undefined;
    keyType?: string | null | undefined;
    kind?: string | null | undefined;
    label?: string | null | undefined;
    list?: string | null | undefined;
    loop?: boolean | null | undefined;
    low?: number | null | undefined;
    manifest?: string | null | undefined;
    marginHeight?: number | null | undefined;
    marginWidth?: number | null | undefined;
    max?: number | string | null | undefined;
    maxLength?: number | null | undefined;
    media?: string | null | undefined;
    mediaGroup?: string | null | undefined;
    method?: string | null | undefined;
    min?: number | string | null | undefined;
    minLength?: number | null | undefined;
    multiple?: boolean | null | undefined;
    muted?: boolean | null | undefined;
    name?: string | null | undefined;
    nonce?: string | null | undefined;
    noValidate?: boolean | null | undefined;
    open?: boolean | null | undefined;
    optimum?: number | null | undefined;
    pattern?: string | null | undefined;
    placeholder?: string | null | undefined;
    playsInline?: boolean | null | undefined;
    poster?: string | null | undefined;
    preload?: string | null | undefined;
    readOnly?: boolean | null | undefined;
    rel?: string | null | undefined;
    required?: boolean | null | undefined;
    reversed?: boolean | null | undefined;
    rows?: number | null | undefined;
    rowSpan?: number | null | undefined;
    sandbox?: string | null | undefined;
    scope?: string | null | undefined;
    scoped?: boolean | null | undefined;
    scrolling?: string | null | undefined;
    seamless?: boolean | null | undefined;
    selected?: boolean | null | undefined;
    shape?: string | null | undefined;
    size?: number | null | undefined;
    sizes?: string | null | undefined;
    span?: number | null | undefined;
    src?: string | null | undefined;
    srcDoc?: string | null | undefined;
    srcLang?: string | null | undefined;
    srcSet?: string | null | undefined;
    start?: number | null | undefined;
    step?: number | string | null | undefined;
    summary?: string | null | undefined;
    target?: string | null | undefined;
    type?: string | null | undefined;
    useMap?: string | null | undefined;
    value?: string | ReadonlyArray<string> | number | null | undefined;
    width?: number | string | null | undefined;
    wmode?: string | null | undefined;
    wrap?: string | null | undefined;
  }

  type HTMLAttributeReferrerPolicy =
    | ''
    | 'no-referrer'
    | 'no-referrer-when-downgrade'
    | 'origin'
    | 'origin-when-cross-origin'
    | 'same-origin'
    | 'strict-origin'
    | 'strict-origin-when-cross-origin'
    | 'unsafe-url';

  type HTMLAttributeAnchorTarget = '_self' | '_blank' | '_parent' | '_top' | (string & {});

  interface AnchorHTMLAttributes<T> extends HTMLAttributes<T> {
    download?: any;
    href?: string | null | undefined;
    hrefLang?: string | null | undefined;
    media?: string | null | undefined;
    ping?: string | null | undefined;
    rel?: string | null | undefined;
    target?: HTMLAttributeAnchorTarget | null | undefined;
    type?: string | null | undefined;
    referrerPolicy?: HTMLAttributeReferrerPolicy | null | undefined;
  }

  interface AudioHTMLAttributes<T> extends MediaHTMLAttributes<T> {}

  interface AreaHTMLAttributes<T> extends HTMLAttributes<T> {
    alt?: string | null | undefined;
    coords?: string | null | undefined;
    download?: any;
    href?: string | null | undefined;
    hrefLang?: string | null | undefined;
    media?: string | null | undefined;
    referrerPolicy?: HTMLAttributeReferrerPolicy | null | undefined;
    rel?: string | null | undefined;
    shape?: string | null | undefined;
    target?: string | null | undefined;
  }

  interface BaseHTMLAttributes<T> extends HTMLAttributes<T> {
    href?: string | null | undefined;
    target?: string | null | undefined;
  }

  interface BlockquoteHTMLAttributes<T> extends HTMLAttributes<T> {
    cite?: string | null | undefined;
  }

  interface ButtonHTMLAttributes<T> extends HTMLAttributes<T> {
    autoFocus?: boolean | null | undefined;
    disabled?: boolean | null | undefined;
    form?: string | null | undefined;
    formAction?: string | null | undefined;
    formEncType?: string | null | undefined;
    formMethod?: string | null | undefined;
    formNoValidate?: boolean | null | undefined;
    formTarget?: string | null | undefined;
    name?: string | null | undefined;
    type?: 'submit' | 'reset' | 'button' | null | undefined;
    value?: string | ReadonlyArray<string> | number | null | undefined;
  }

  interface CanvasHTMLAttributes<T> extends HTMLAttributes<T> {
    height?: number | string | null | undefined;
    width?: number | string | null | undefined;
  }

  interface ColHTMLAttributes<T> extends HTMLAttributes<T> {
    span?: number | null | undefined;
    width?: number | string | null | undefined;
  }

  interface ColgroupHTMLAttributes<T> extends HTMLAttributes<T> {
    span?: number | null | undefined;
  }

  interface DataHTMLAttributes<T> extends HTMLAttributes<T> {
    value?: string | ReadonlyArray<string> | number | null | undefined;
  }

  interface DetailsHTMLAttributes<T> extends HTMLAttributes<T> {
    open?: boolean | null | undefined;
    onToggle?: InfernoEventHandler<T> | null | undefined;
  }

  interface DelHTMLAttributes<T> extends HTMLAttributes<T> {
    cite?: string | null | undefined;
    dateTime?: string | null | undefined;
  }

  interface DialogHTMLAttributes<T> extends HTMLAttributes<T> {
    onCancel?: InfernoEventHandler<T> | null | undefined;
    onClose?: InfernoEventHandler<T> | null | undefined;
    open?: boolean | null | undefined;
  }

  interface EmbedHTMLAttributes<T> extends HTMLAttributes<T> {
    height?: number | string | null | undefined;
    src?: string | null | undefined;
    type?: string | null | undefined;
    width?: number | string | null | undefined;
  }

  interface FieldsetHTMLAttributes<T> extends HTMLAttributes<T> {
    disabled?: boolean | null | undefined;
    form?: string | null | undefined;
    name?: string | null | undefined;
  }

  interface FormHTMLAttributes<T> extends HTMLAttributes<T> {
    acceptCharset?: string | null | undefined;
    action?: string | null | undefined;
    autoComplete?: string | null | undefined;
    encType?: string | null | undefined;
    method?: string | null | undefined;
    name?: string | null | undefined;
    noValidate?: boolean | null | undefined;
    target?: string | null | undefined;
  }

  interface HtmlHTMLAttributes<T> extends HTMLAttributes<T> {
    manifest?: string | null | undefined;
  }

  interface IframeHTMLAttributes<T> extends HTMLAttributes<T> {
    allow?: string | null | undefined;
    allowFullScreen?: boolean | null | undefined;
    allowTransparency?: boolean | null | undefined;
    /** @deprecated */
    frameBorder?: number | string | null | undefined;
    height?: number | string | null | undefined;
    loading?: 'eager' | 'lazy' | null | undefined;
    /** @deprecated */
    marginHeight?: number | null | undefined;
    /** @deprecated */
    marginWidth?: number | null | undefined;
    name?: string | null | undefined;
    referrerPolicy?: HTMLAttributeReferrerPolicy | null | undefined;
    sandbox?: string | null | undefined;
    /** @deprecated */
    scrolling?: string | null | undefined;
    seamless?: boolean | null | undefined;
    src?: string | null | undefined;
    srcDoc?: string | null | undefined;
    width?: number | string | null | undefined;
  }

  interface ImgHTMLAttributes<T> extends HTMLAttributes<T> {
    alt?: string | null | undefined;
    crossOrigin?: 'anonymous' | 'use-credentials' | '' | null | undefined;
    decoding?: 'async' | 'auto' | 'sync' | null | undefined;
    height?: number | string | null | undefined;
    loading?: 'eager' | 'lazy' | null | undefined;
    referrerPolicy?: HTMLAttributeReferrerPolicy | null | undefined;
    sizes?: string | null | undefined;
    src?: string | null | undefined;
    srcSet?: string | null | undefined;
    useMap?: string | null | undefined;
    width?: number | string | null | undefined;
  }

  interface InsHTMLAttributes<T> extends HTMLAttributes<T> {
    cite?: string | null | undefined;
    dateTime?: string | null | undefined;
  }

  type HTMLInputTypeAttribute =
    | 'button'
    | 'checkbox'
    | 'color'
    | 'date'
    | 'datetime-local'
    | 'email'
    | 'file'
    | 'hidden'
    | 'image'
    | 'month'
    | 'number'
    | 'password'
    | 'radio'
    | 'range'
    | 'reset'
    | 'search'
    | 'submit'
    | 'tel'
    | 'text'
    | 'time'
    | 'url'
    | 'week'
    | (string & {});

  interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
    accept?: string | null | undefined;
    alt?: string | null | undefined;
    autoComplete?: string | null | undefined;
    autoFocus?: boolean | null | undefined;
    capture?: boolean | 'user' | 'environment' | null | undefined; // https://www.w3.org/TR/html-media-capture/#the-capture-attribute
    checked?: boolean | null | undefined;
    crossOrigin?: string | null | undefined;
    disabled?: boolean | null | undefined;
    enterKeyHint?: 'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send' | null | undefined;
    indeterminate?: boolean | null | undefined;
    form?: string | null | undefined;
    formAction?: string | null | undefined;
    formEncType?: string | null | undefined;
    formMethod?: string | null | undefined;
    formNoValidate?: boolean | null | undefined;
    formTarget?: string | null | undefined;
    height?: number | string | null | undefined;
    list?: string | null | undefined;
    max?: number | string | null | undefined;
    maxLength?: number | null | undefined;
    min?: number | string | null | undefined;
    minLength?: number | null | undefined;
    multiple?: boolean | null | undefined;
    name?: string | null | undefined;
    pattern?: string | null | undefined;
    placeholder?: string | null | undefined;
    readOnly?: boolean | null | undefined;
    required?: boolean | null | undefined;
    size?: number | null | undefined;
    src?: string | null | undefined;
    step?: number | string | null | undefined;
    type?: HTMLInputTypeAttribute | null | undefined;
    value?: string | ReadonlyArray<string> | number | null | undefined;
    width?: number | string | null | undefined;
  }

  interface KeygenHTMLAttributes<T> extends HTMLAttributes<T> {
    autoFocus?: boolean | null | undefined;
    challenge?: string | null | undefined;
    disabled?: boolean | null | undefined;
    form?: string | null | undefined;
    keyType?: string | null | undefined;
    keyParams?: string | null | undefined;
    name?: string | null | undefined;
  }

  interface LabelHTMLAttributes<T> extends HTMLAttributes<T> {
    form?: string | null | undefined;
    htmlFor?: string | null | undefined;
    for?: string | null | undefined;
  }

  interface LiHTMLAttributes<T> extends HTMLAttributes<T> {
    value?: string | ReadonlyArray<string> | number | null | undefined;
  }

  interface LinkHTMLAttributes<T> extends HTMLAttributes<T> {
    as?: string | null | undefined;
    crossOrigin?: string | null | undefined;
    href?: string | null | undefined;
    hrefLang?: string | null | undefined;
    integrity?: string | null | undefined;
    media?: string | null | undefined;
    imageSrcSet?: string | null | undefined;
    imageSizes?: string | null | undefined;
    referrerPolicy?: HTMLAttributeReferrerPolicy | null | undefined;
    rel?: string | null | undefined;
    sizes?: string | null | undefined;
    type?: string | null | undefined;
    charSet?: string | null | undefined;
  }

  interface MapHTMLAttributes<T> extends HTMLAttributes<T> {
    name?: string | null | undefined;
  }

  interface MenuHTMLAttributes<T> extends HTMLAttributes<T> {
    type?: string | null | undefined;
  }

  interface MediaHTMLAttributes<T> extends HTMLAttributes<T> {
    autoPlay?: boolean | null | undefined;
    controls?: boolean | null | undefined;
    controlsList?: string | null | undefined;
    crossOrigin?: string | null | undefined;
    loop?: boolean | null | undefined;
    mediaGroup?: string | null | undefined;
    muted?: boolean | null | undefined;
    playsInline?: boolean | null | undefined;
    preload?: string | null | undefined;
    src?: string | null | undefined;
  }

  interface MetaHTMLAttributes<T> extends HTMLAttributes<T> {
    charSet?: string | null | undefined;
    content?: string | null | undefined;
    httpEquiv?: string | null | undefined;
    name?: string | null | undefined;
    media?: string | null | undefined;
  }

  interface MeterHTMLAttributes<T> extends HTMLAttributes<T> {
    form?: string | null | undefined;
    high?: number | null | undefined;
    low?: number | null | undefined;
    max?: number | string | null | undefined;
    min?: number | string | null | undefined;
    optimum?: number | null | undefined;
    value?: string | ReadonlyArray<string> | number | null | undefined;
  }

  interface QuoteHTMLAttributes<T> extends HTMLAttributes<T> {
    cite?: string | null | undefined;
  }

  interface ObjectHTMLAttributes<T> extends HTMLAttributes<T> {
    classID?: string | null | undefined;
    data?: string | null | undefined;
    form?: string | null | undefined;
    height?: number | string | null | undefined;
    name?: string | null | undefined;
    type?: string | null | undefined;
    useMap?: string | null | undefined;
    width?: number | string | null | undefined;
    wmode?: string | null | undefined;
  }

  interface OlHTMLAttributes<T> extends HTMLAttributes<T> {
    reversed?: boolean | null | undefined;
    start?: number | null | undefined;
    type?: '1' | 'a' | 'A' | 'i' | 'I' | null | undefined;
  }

  interface OptgroupHTMLAttributes<T> extends HTMLAttributes<T> {
    disabled?: boolean | null | undefined;
    label?: string | null | undefined;
  }

  interface OptionHTMLAttributes<T> extends HTMLAttributes<T> {
    disabled?: boolean | null | undefined;
    label?: string | null | undefined;
    selected?: boolean | null | undefined;
    value?: string | ReadonlyArray<string> | number | null | undefined;
  }

  interface OutputHTMLAttributes<T> extends HTMLAttributes<T> {
    form?: string | null | undefined;
    htmlFor?: string | null | undefined;
    name?: string | null | undefined;
  }

  interface ParamHTMLAttributes<T> extends HTMLAttributes<T> {
    name?: string | null | undefined;
    value?: string | ReadonlyArray<string> | number | null | undefined;
  }

  interface ProgressHTMLAttributes<T> extends HTMLAttributes<T> {
    max?: number | string | null | undefined;
    value?: string | ReadonlyArray<string> | number | null | undefined;
  }

  interface SlotHTMLAttributes<T> extends HTMLAttributes<T> {
    name?: string | null | undefined;
  }

  interface ScriptHTMLAttributes<T> extends HTMLAttributes<T> {
    async?: boolean | null | undefined;
    /** @deprecated */
    charSet?: string | null | undefined;
    crossOrigin?: string | null | undefined;
    defer?: boolean | null | undefined;
    integrity?: string | null | undefined;
    noModule?: boolean | null | undefined;
    nonce?: string | null | undefined;
    referrerPolicy?: HTMLAttributeReferrerPolicy | null | undefined;
    src?: string | null | undefined;
    type?: string | null | undefined;
  }

  interface SelectHTMLAttributes<T> extends HTMLAttributes<T> {
    autoComplete?: string | null | undefined;
    autoFocus?: boolean | null | undefined;
    disabled?: boolean | null | undefined;
    form?: string | null | undefined;
    multiple?: boolean | null | undefined;
    name?: string | null | undefined;
    required?: boolean | null | undefined;
    size?: number | null | undefined;
    value?: string | ReadonlyArray<string> | number | null | undefined;
    selectedIndex?: number | null | undefined;
  }

  interface SourceHTMLAttributes<T> extends HTMLAttributes<T> {
    height?: number | string | null | undefined;
    media?: string | null | undefined;
    sizes?: string | null | undefined;
    src?: string | null | undefined;
    srcSet?: string | null | undefined;
    type?: string | null | undefined;
    width?: number | string | null | undefined;
  }

  interface StyleHTMLAttributes<T> extends HTMLAttributes<T> {
    media?: string | null | undefined;
    nonce?: string | null | undefined;
    scoped?: boolean | null | undefined;
    type?: string | null | undefined;
  }

  interface TableHTMLAttributes<T> extends HTMLAttributes<T> {
    align?: 'left' | 'center' | 'right' | null | undefined;
    bgcolor?: string | null | undefined;
    border?: number | null | undefined;
    cellPadding?: number | string | null | undefined;
    cellSpacing?: number | string | null | undefined;
    frame?: boolean | null | undefined;
    rules?: 'none' | 'groups' | 'rows' | 'columns' | 'all' | null | undefined;
    summary?: string | null | undefined;
    width?: number | string | null | undefined;
  }

  interface TextareaHTMLAttributes<T> extends HTMLAttributes<T> {
    autoComplete?: string | null | undefined;
    autoFocus?: boolean | null | undefined;
    cols?: number | null | undefined;
    dirName?: string | null | undefined;
    disabled?: boolean | null | undefined;
    form?: string | null | undefined;
    maxLength?: number | null | undefined;
    minLength?: number | null | undefined;
    name?: string | null | undefined;
    placeholder?: string | null | undefined;
    readOnly?: boolean | null | undefined;
    required?: boolean | null | undefined;
    rows?: number | null | undefined;
    value?: string | ReadonlyArray<string> | number | null | undefined;
    wrap?: string | null | undefined;
  }

  interface TdHTMLAttributes<T> extends HTMLAttributes<T> {
    align?: 'left' | 'center' | 'right' | 'justify' | 'char' | null | undefined;
    colSpan?: number | null | undefined;
    headers?: string | null | undefined;
    rowSpan?: number | null | undefined;
    scope?: string | null | undefined;
    abbr?: string | null | undefined;
    height?: number | string | null | undefined;
    width?: number | string | null | undefined;
    valign?: 'top' | 'middle' | 'bottom' | 'baseline' | null | undefined;
  }

  interface ThHTMLAttributes<T> extends HTMLAttributes<T> {
    align?: 'left' | 'center' | 'right' | 'justify' | 'char' | null | undefined;
    colSpan?: number | null | undefined;
    headers?: string | null | undefined;
    rowSpan?: number | null | undefined;
    scope?: string | null | undefined;
    abbr?: string | null | undefined;
  }

  interface TimeHTMLAttributes<T> extends HTMLAttributes<T> {
    dateTime?: string | null | undefined;
  }

  interface TrackHTMLAttributes<T> extends HTMLAttributes<T> {
    default?: boolean | null | undefined;
    kind?: string | null | undefined;
    label?: string | null | undefined;
    src?: string | null | undefined;
    srcLang?: string | null | undefined;
  }

  interface VideoHTMLAttributes<T> extends MediaHTMLAttributes<T> {
    height?: number | string | null | undefined;
    playsInline?: boolean | null | undefined;
    poster?: string | null | undefined;
    width?: number | string | null | undefined;
    disablePictureInPicture?: boolean | null | undefined;
    disableRemotePlayback?: boolean | null | undefined;
  }

  // this list is "complete" in that it contains every SVG attribute
  //
  // The three broad type categories are (in order of restrictiveness):
  //   - "number | string"
  //   - "string"
  //   - union of string literals
  interface SVGAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    class?: string | null | undefined;

    // Attributes which also defined in HTMLAttributes
    // See comment in SVGDOMPropertyConfig.js
    className?: string | null | undefined;
    color?: string | null | undefined;
    height?: number | string | null | undefined;
    id?: string | null | undefined;
    lang?: string | null | undefined;
    max?: number | string | null | undefined;
    media?: string | null | undefined;
    method?: string | null | undefined;
    min?: number | string | null | undefined;
    name?: string | null | undefined;
    style?: any;
    target?: string | null | undefined;
    type?: string | null | undefined;
    width?: number | string | null | undefined;

    // Other HTML properties supported by SVG elements in browsers
    role?: AriaRole | null | undefined;
    tabIndex?: number | null | undefined;
    crossOrigin?: 'anonymous' | 'use-credentials' | '' | null | undefined;

    // SVG Specific attributes
    accentHeight?: number | string | null | undefined;
    'accent-height'?: number | string | null | undefined;
    accumulate?: 'none' | 'sum' | null | undefined;
    additive?: 'replace' | 'sum' | null | undefined;
    alignmentBaseline?:
      | 'auto'
      | 'baseline'
      | 'before-edge'
      | 'text-before-edge'
      | 'middle'
      | 'central'
      | 'after-edge'
      | 'text-after-edge'
      | 'ideographic'
      | 'alphabetic'
      | 'hanging'
      | 'mathematical'
      | 'inherit'
      | null
      | undefined;
    'alignment-baseline'?:
      | 'auto'
      | 'baseline'
      | 'before-edge'
      | 'text-before-edge'
      | 'middle'
      | 'central'
      | 'after-edge'
      | 'text-after-edge'
      | 'ideographic'
      | 'alphabetic'
      | 'hanging'
      | 'mathematical'
      | 'inherit'
      | null
      | undefined;
    allowReorder?: 'no' | 'yes' | null | undefined;
    alphabetic?: number | string | null | undefined;
    amplitude?: number | string | null | undefined;
    arabicForm?: 'initial' | 'medial' | 'terminal' | 'isolated' | null | undefined;
    'arabic-form'?: 'initial' | 'medial' | 'terminal' | 'isolated' | null | undefined;
    ascent?: number | string | null | undefined;
    attributeName?: string | null | undefined;
    attributeType?: string | null | undefined;
    autoReverse?: Booleanish | null | undefined;
    azimuth?: number | string | null | undefined;
    baseFrequency?: number | string | null | undefined;
    baselineShift?: number | string | null | undefined;
    'baseline-shift'?: number | string | null | undefined;
    baseProfile?: number | string | null | undefined;
    bbox?: number | string | null | undefined;
    begin?: number | string | null | undefined;
    bias?: number | string | null | undefined;
    by?: number | string | null | undefined;
    calcMode?: number | string | null | undefined;
    capHeight?: number | string | null | undefined;
    'cap-height'?: number | string | null | undefined;
    clip?: number | string | null | undefined;
    clipPath?: string | null | undefined;
    'clip-path'?: string | null | undefined;
    clipPathUnits?: number | string | null | undefined;
    clipRule?: number | string | null | undefined;
    'clip-rule'?: number | string | null | undefined;
    colorInterpolation?: number | string | null | undefined;
    'color-interpolation'?: number | string | null | undefined;
    colorInterpolationFilters?: 'auto' | 'sRGB' | 'linearRGB' | 'inherit' | null | undefined;
    'color-interpolation-filters'?: 'auto' | 'sRGB' | 'linearRGB' | 'inherit' | null | undefined;
    colorProfile?: number | string | null | undefined;
    'color-profile'?: number | string | null | undefined;
    colorRendering?: number | string | null | undefined;
    'color-rendering'?: number | string | null | undefined;
    contentScriptType?: number | string | null | undefined;
    contentStyleType?: number | string | null | undefined;
    cursor?: number | string | null | undefined;
    cx?: number | string | null | undefined;
    cy?: number | string | null | undefined;
    d?: string | null | undefined;
    decelerate?: number | string | null | undefined;
    descent?: number | string | null | undefined;
    diffuseConstant?: number | string | null | undefined;
    direction?: number | string | null | undefined;
    display?: number | string | null | undefined;
    divisor?: number | string | null | undefined;
    dominantBaseline?: number | string | null | undefined;
    'dominant-baseline'?: number | string | null | undefined;
    dur?: number | string | null | undefined;
    dx?: number | string | null | undefined;
    dy?: number | string | null | undefined;
    edgeMode?: number | string | null | undefined;
    elevation?: number | string | null | undefined;
    enableBackground?: number | string | null | undefined;
    'enable-background'?: number | string | null | undefined;
    end?: number | string | null | undefined;
    exponent?: number | string | null | undefined;
    externalResourcesRequired?: Booleanish | null | undefined;
    fill?: string | null | undefined;
    fillOpacity?: number | string | null | undefined;
    'fill-opacity'?: number | string | null | undefined;
    fillRule?: 'nonzero' | 'evenodd' | 'inherit' | null | undefined;
    'fill-rule'?: 'nonzero' | 'evenodd' | 'inherit' | null | undefined;
    filter?: string | null | undefined;
    filterRes?: number | string | null | undefined;
    filterUnits?: number | string | null | undefined;
    floodColor?: number | string | null | undefined;
    'flood-color'?: number | string | null | undefined;
    floodOpacity?: number | string | null | undefined;
    'flood-opacity'?: number | string | null | undefined;
    focusable?: Booleanish | 'auto' | null | undefined;
    fontFamily?: string | null | undefined;
    'font-family'?: string | null | undefined;
    fontSize?: number | string | null | undefined;
    'font-size'?: number | string | null | undefined;
    fontSizeAdjust?: number | string | null | undefined;
    'font-size-adjust'?: number | string | null | undefined;
    fontStretch?: number | string | null | undefined;
    'font-stretch'?: number | string | null | undefined;
    fontStyle?: number | string | null | undefined;
    'font-style'?: number | string | null | undefined;
    fontVariant?: number | string | null | undefined;
    'font-variant'?: number | string | null | undefined;
    fontWeight?: number | string | null | undefined;
    'font-weight'?: number | string | null | undefined;
    format?: number | string | null | undefined;
    fr?: number | string | null | undefined;
    from?: number | string | null | undefined;
    fx?: number | string | null | undefined;
    fy?: number | string | null | undefined;
    g1?: number | string | null | undefined;
    g2?: number | string | null | undefined;
    glyphName?: number | string | null | undefined;
    'glyph-name'?: number | string | null | undefined;
    glyphOrientationHorizontal?: number | string | null | undefined;
    'glyph-orientation-horizontal'?: number | string | null | undefined;
    glyphOrientationVertical?: number | string | null | undefined;
    'glyph-orientation-vertical'?: number | string | null | undefined;
    glyphRef?: number | string | null | undefined;
    gradientTransform?: string | null | undefined;
    gradientUnits?: string | null | undefined;
    hanging?: number | string | null | undefined;
    horizAdvX?: number | string | null | undefined;
    'horiz-advX'?: number | string | null | undefined;
    horizOriginX?: number | string | null | undefined;
    'horiz-origin-x'?: number | string | null | undefined;
    href?: string | null | undefined;
    ideographic?: number | string | null | undefined;
    imageRendering?: number | string | null | undefined;
    'image-rendering'?: number | string | null | undefined;
    in2?: number | string | null | undefined;
    in?: string | null | undefined;
    intercept?: number | string | null | undefined;
    k1?: number | string | null | undefined;
    k2?: number | string | null | undefined;
    k3?: number | string | null | undefined;
    k4?: number | string | null | undefined;
    k?: number | string | null | undefined;
    kernelMatrix?: number | string | null | undefined;
    kernelUnitLength?: number | string | null | undefined;
    kerning?: number | string | null | undefined;
    keyPoints?: number | string | null | undefined;
    keySplines?: number | string | null | undefined;
    keyTimes?: number | string | null | undefined;
    lengthAdjust?: number | string | null | undefined;
    letterSpacing?: number | string | null | undefined;
    'letter-spacing'?: number | string | null | undefined;
    lightingColor?: number | string | null | undefined;
    'lighting-color'?: number | string | null | undefined;
    limitingConeAngle?: number | string | null | undefined;
    local?: number | string | null | undefined;
    markerEnd?: string | null | undefined;
    'marker-end'?: string | null | undefined;
    markerHeight?: number | string | null | undefined;
    'marker-height'?: number | string | null | undefined;
    markerMid?: string | null | undefined;
    'marker-mid'?: string | null | undefined;
    markerStart?: string | null | undefined;
    'marker-start'?: string | null | undefined;
    markerUnits?: number | string | null | undefined;
    markerWidth?: number | string | null | undefined;
    mask?: string | null | undefined;
    maskContentUnits?: number | string | null | undefined;
    maskUnits?: number | string | null | undefined;
    mathematical?: number | string | null | undefined;
    mode?: number | string | null | undefined;
    numOctaves?: number | string | null | undefined;
    offset?: number | string | null | undefined;
    opacity?: number | string | null | undefined;
    operator?: number | string | null | undefined;
    order?: number | string | null | undefined;
    orient?: number | string | null | undefined;
    orientation?: number | string | null | undefined;
    origin?: number | string | null | undefined;
    overflow?: number | string | null | undefined;
    overlinePosition?: number | string | null | undefined;
    'overline-position'?: number | string | null | undefined;
    overlineThickness?: number | string | null | undefined;
    'overline-thickness'?: number | string | null | undefined;
    paintOrder?: number | string | null | undefined;
    'paint-order'?: number | string | null | undefined;
    panose1?: number | string | null | undefined;
    'panose-1'?: number | string | null | undefined;
    path?: string | null | undefined;
    pathLength?: number | string | null | undefined;
    patternContentUnits?: string | null | undefined;
    patternTransform?: number | string | null | undefined;
    patternUnits?: string | null | undefined;
    pointerEvents?: number | string | null | undefined;
    'pointer-events'?: number | string | null | undefined;
    points?: string | null | undefined;
    pointsAtX?: number | string | null | undefined;
    pointsAtY?: number | string | null | undefined;
    pointsAtZ?: number | string | null | undefined;
    preserveAlpha?: Booleanish | null | undefined;
    preserveAspectRatio?: string | null | undefined;
    primitiveUnits?: number | string | null | undefined;
    r?: number | string | null | undefined;
    radius?: number | string | null | undefined;
    refX?: number | string | null | undefined;
    refY?: number | string | null | undefined;
    renderingIntent?: number | string | null | undefined;
    'rendering-intent'?: number | string | null | undefined;
    repeatCount?: number | string | null | undefined;
    repeatDur?: number | string | null | undefined;
    requiredExtensions?: number | string | null | undefined;
    requiredFeatures?: number | string | null | undefined;
    restart?: number | string | null | undefined;
    result?: string | null | undefined;
    rotate?: number | string | null | undefined;
    rx?: number | string | null | undefined;
    ry?: number | string | null | undefined;
    scale?: number | string | null | undefined;
    seed?: number | string | null | undefined;
    shapeRendering?: number | string | null | undefined;
    'shape-rendering'?: number | string | null | undefined;
    slope?: number | string | null | undefined;
    spacing?: number | string | null | undefined;
    specularConstant?: number | string | null | undefined;
    specularExponent?: number | string | null | undefined;
    speed?: number | string | null | undefined;
    spreadMethod?: string | null | undefined;
    startOffset?: number | string | null | undefined;
    stdDeviation?: number | string | null | undefined;
    stemh?: number | string | null | undefined;
    stemv?: number | string | null | undefined;
    stitchTiles?: number | string | null | undefined;
    stopColor?: string | null | undefined;
    'stop-color'?: string | null | undefined;
    stopOpacity?: number | string | null | undefined;
    'stop-opacity'?: number | string | null | undefined;
    strikethroughPosition?: number | string | null | undefined;
    'strikethrough-position'?: number | string | null | undefined;
    strikethroughThickness?: number | string | null | undefined;
    'strikethrough-thickness'?: number | string | null | undefined;
    string?: number | string | null | undefined;
    stroke?: string | null | undefined;
    strokeDasharray?: string | number | null | undefined;
    'stroke-dasharray'?: string | number | null | undefined;
    strokeDashoffset?: string | number | null | undefined;
    'stroke-dashoffset'?: string | number | null | undefined;
    strokeLinecap?: 'butt' | 'round' | 'square' | 'inherit' | null | undefined;
    'stroke-linecap'?: 'butt' | 'round' | 'square' | 'inherit' | null | undefined;
    strokeLinejoin?: 'miter' | 'round' | 'bevel' | 'inherit' | null | undefined;
    'stroke-linejoin'?: 'miter' | 'round' | 'bevel' | 'inherit' | null | undefined;
    strokeMiterlimit?: number | string | null | undefined;
    'stroke-miterlimit'?: number | string | null | undefined;
    strokeOpacity?: number | string | null | undefined;
    'stroke-opacity'?: number | string | null | undefined;
    strokeWidth?: number | string | null | undefined;
    'stroke-width'?: number | string | null | undefined;
    surfaceScale?: number | string | null | undefined;
    systemLanguage?: number | string | null | undefined;
    tableValues?: number | string | null | undefined;
    targetX?: number | string | null | undefined;
    targetY?: number | string | null | undefined;
    textAnchor?: string | null | undefined;
    textDecoration?: number | string | null | undefined;
    'text-decoration'?: number | string | null | undefined;
    textLength?: number | string | null | undefined;
    textRendering?: number | string | null | undefined;
    'text-rendering'?: number | string | null | undefined;
    to?: number | string | null | undefined;
    transform?: string | null | undefined;
    u1?: number | string | null | undefined;
    u2?: number | string | null | undefined;
    underlinePosition?: number | string | null | undefined;
    'underline-position'?: number | string | null | undefined;
    underlineThickness?: number | string | null | undefined;
    'underline-thickness'?: number | string | null | undefined;
    unicode?: number | string | null | undefined;
    unicodeBidi?: number | string | null | undefined;
    'unicode-bidi'?: number | string | null | undefined;
    unicodeRange?: number | string | null | undefined;
    'unicode-range'?: number | string | null | undefined;
    unitsPerEm?: number | string | null | undefined;
    'units-per-em'?: number | string | null | undefined;
    vAlphabetic?: number | string | null | undefined;
    'v-alphabetic'?: number | string | null | undefined;
    values?: string | null | undefined;
    vectorEffect?: number | string | null | undefined;
    'vector-effect'?: number | string | null | undefined;
    version?: string | null | undefined;
    vertAdvY?: number | string | null | undefined;
    'vert-adv-y'?: number | string | null | undefined;
    vertOriginX?: number | string | null | undefined;
    'vert-origin-x'?: number | string | null | undefined;
    vertOriginY?: number | string | null | undefined;
    'vert-origin-y'?: number | string | null | undefined;
    vHanging?: number | string | null | undefined;
    'v-hanging'?: number | string | null | undefined;
    vIdeographic?: number | string | null | undefined;
    'v-ideographic'?: number | string | null | undefined;
    viewBox?: string | null | undefined;
    viewTarget?: number | string | null | undefined;
    visibility?: number | string | null | undefined;
    vMathematical?: number | string | null | undefined;
    'v-mathematical'?: number | string | null | undefined;
    widths?: number | string | null | undefined;
    wordSpacing?: number | string | null | undefined;
    'word-spacing'?: number | string | null | undefined;
    writingMode?: number | string | null | undefined;
    'writing-mode'?: number | string | null | undefined;
    x1?: number | string | null | undefined;
    x2?: number | string | null | undefined;
    x?: number | string | null | undefined;
    xChannelSelector?: string | null | undefined;
    xHeight?: number | string | null | undefined;
    'x-height'?: number | string | null | undefined;
    xlinkActuate?: string | null | undefined;
    'xlink:actuate'?: string | null | undefined;
    xlinkArcrole?: string | null | undefined;
    'xlink:arcrole'?: string | null | undefined;
    xlinkHref?: string | null | undefined;
    'xlink:href'?: string | null | undefined;
    xlinkRole?: string | null | undefined;
    'xlink:role'?: string | null | undefined;
    xlinkShow?: string | null | undefined;
    'xlink:show'?: string | null | undefined;
    xlinkTitle?: string | null | undefined;
    'xlink:title'?: string | null | undefined;
    xlinkType?: string | null | undefined;
    'xlink:type'?: string | null | undefined;
    xmlBase?: string | null | undefined;
    'xml:base'?: string | null | undefined;
    xmlLang?: string | null | undefined;
    'xml:lang'?: string | null | undefined;
    xmlns?: string | null | undefined;
    xmlnsXlink?: string | null | undefined;
    'xmlns:xlink'?: string | null | undefined;
    xmlSpace?: string | null | undefined;
    'xml:space'?: string | null | undefined;
    y1?: number | string | null | undefined;
    y2?: number | string | null | undefined;
    y?: number | string | null | undefined;
    yChannelSelector?: string | null | undefined;
    z?: number | string | null | undefined;
    zoomAndPan?: string | null | undefined;
  }

  interface WebViewHTMLAttributes<T> extends HTMLAttributes<T> {
    allowFullScreen?: boolean | null | undefined;
    allowpopups?: boolean | null | undefined;
    autoFocus?: boolean | null | undefined;
    autosize?: boolean | null | undefined;
    blinkfeatures?: string | null | undefined;
    disableblinkfeatures?: string | null | undefined;
    disableguestresize?: boolean | null | undefined;
    disablewebsecurity?: boolean | null | undefined;
    guestinstance?: string | null | undefined;
    httpreferrer?: string | null | undefined;
    nodeintegration?: boolean | null | undefined;
    partition?: string | null | undefined;
    plugins?: boolean | null | undefined;
    preload?: string | null | undefined;
    src?: string | null | undefined;
    useragent?: string | null | undefined;
    webpreferences?: string | null | undefined;
  }

  //
  // Inferno.DOM
  // ----------------------------------------------------------------------

  interface InfernoHTML {
    a: DetailedHTMLFactory<AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>;
    abbr: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
    address: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
    area: DetailedHTMLFactory<AreaHTMLAttributes<HTMLAreaElement>, HTMLAreaElement>;
    article: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
    aside: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
    audio: DetailedHTMLFactory<AudioHTMLAttributes<HTMLAudioElement>, HTMLAudioElement>;
    b: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
    base: DetailedHTMLFactory<BaseHTMLAttributes<HTMLBaseElement>, HTMLBaseElement>;
    bdi: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
    bdo: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
    big: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
    blockquote: DetailedHTMLFactory<BlockquoteHTMLAttributes<HTMLQuoteElement>, HTMLQuoteElement>;
    body: DetailedHTMLFactory<HTMLAttributes<HTMLBodyElement>, HTMLBodyElement>;
    br: DetailedHTMLFactory<HTMLAttributes<HTMLBRElement>, HTMLBRElement>;
    button: DetailedHTMLFactory<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;
    canvas: DetailedHTMLFactory<CanvasHTMLAttributes<HTMLCanvasElement>, HTMLCanvasElement>;
    caption: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
    cite: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
    code: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
    col: DetailedHTMLFactory<ColHTMLAttributes<HTMLTableColElement>, HTMLTableColElement>;
    colgroup: DetailedHTMLFactory<ColgroupHTMLAttributes<HTMLTableColElement>, HTMLTableColElement>;
    data: DetailedHTMLFactory<DataHTMLAttributes<HTMLDataElement>, HTMLDataElement>;
    datalist: DetailedHTMLFactory<HTMLAttributes<HTMLDataListElement>, HTMLDataListElement>;
    dd: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
    del: DetailedHTMLFactory<DelHTMLAttributes<HTMLModElement>, HTMLModElement>;
    details: DetailedHTMLFactory<DetailsHTMLAttributes<HTMLDetailsElement>, HTMLDetailsElement>;
    dfn: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
    dialog: DetailedHTMLFactory<DialogHTMLAttributes<HTMLDialogElement>, HTMLDialogElement>;
    div: DetailedHTMLFactory<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
    dl: DetailedHTMLFactory<HTMLAttributes<HTMLDListElement>, HTMLDListElement>;
    dt: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
    em: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
    embed: DetailedHTMLFactory<EmbedHTMLAttributes<HTMLEmbedElement>, HTMLEmbedElement>;
    fieldset: DetailedHTMLFactory<FieldsetHTMLAttributes<HTMLFieldSetElement>, HTMLFieldSetElement>;
    figcaption: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
    figure: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
    footer: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
    form: DetailedHTMLFactory<FormHTMLAttributes<HTMLFormElement>, HTMLFormElement>;
    h1: DetailedHTMLFactory<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
    h2: DetailedHTMLFactory<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
    h3: DetailedHTMLFactory<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
    h4: DetailedHTMLFactory<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
    h5: DetailedHTMLFactory<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
    h6: DetailedHTMLFactory<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
    head: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLHeadElement>;
    header: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
    hgroup: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
    hr: DetailedHTMLFactory<HTMLAttributes<HTMLHRElement>, HTMLHRElement>;
    html: DetailedHTMLFactory<HtmlHTMLAttributes<HTMLHtmlElement>, HTMLHtmlElement>;
    i: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
    iframe: DetailedHTMLFactory<IframeHTMLAttributes<HTMLIFrameElement>, HTMLIFrameElement>;
    img: DetailedHTMLFactory<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>;
    input: DetailedHTMLFactory<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
    ins: DetailedHTMLFactory<InsHTMLAttributes<HTMLModElement>, HTMLModElement>;
    kbd: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
    keygen: DetailedHTMLFactory<KeygenHTMLAttributes<HTMLElement>, HTMLElement>;
    label: DetailedHTMLFactory<LabelHTMLAttributes<HTMLLabelElement>, HTMLLabelElement>;
    legend: DetailedHTMLFactory<HTMLAttributes<HTMLLegendElement>, HTMLLegendElement>;
    li: DetailedHTMLFactory<LiHTMLAttributes<HTMLLIElement>, HTMLLIElement>;
    link: DetailedHTMLFactory<LinkHTMLAttributes<HTMLLinkElement>, HTMLLinkElement>;
    main: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
    map: DetailedHTMLFactory<MapHTMLAttributes<HTMLMapElement>, HTMLMapElement>;
    mark: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
    menu: DetailedHTMLFactory<MenuHTMLAttributes<HTMLElement>, HTMLElement>;
    menuitem: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
    meta: DetailedHTMLFactory<MetaHTMLAttributes<HTMLMetaElement>, HTMLMetaElement>;
    meter: DetailedHTMLFactory<MeterHTMLAttributes<HTMLMeterElement>, HTMLMeterElement>;
    nav: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
    noscript: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
    object: DetailedHTMLFactory<ObjectHTMLAttributes<HTMLObjectElement>, HTMLObjectElement>;
    ol: DetailedHTMLFactory<OlHTMLAttributes<HTMLOListElement>, HTMLOListElement>;
    optgroup: DetailedHTMLFactory<OptgroupHTMLAttributes<HTMLOptGroupElement>, HTMLOptGroupElement>;
    option: DetailedHTMLFactory<OptionHTMLAttributes<HTMLOptionElement>, HTMLOptionElement>;
    output: DetailedHTMLFactory<OutputHTMLAttributes<HTMLOutputElement>, HTMLOutputElement>;
    p: DetailedHTMLFactory<HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>;
    param: DetailedHTMLFactory<ParamHTMLAttributes<HTMLParamElement>, HTMLParamElement>;
    picture: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
    pre: DetailedHTMLFactory<HTMLAttributes<HTMLPreElement>, HTMLPreElement>;
    progress: DetailedHTMLFactory<ProgressHTMLAttributes<HTMLProgressElement>, HTMLProgressElement>;
    q: DetailedHTMLFactory<QuoteHTMLAttributes<HTMLQuoteElement>, HTMLQuoteElement>;
    rp: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
    rt: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
    ruby: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
    s: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
    samp: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
    slot: DetailedHTMLFactory<SlotHTMLAttributes<HTMLSlotElement>, HTMLSlotElement>;
    script: DetailedHTMLFactory<ScriptHTMLAttributes<HTMLScriptElement>, HTMLScriptElement>;
    section: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
    select: DetailedHTMLFactory<SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement>;
    small: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
    source: DetailedHTMLFactory<SourceHTMLAttributes<HTMLSourceElement>, HTMLSourceElement>;
    span: DetailedHTMLFactory<HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>;
    strong: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
    style: DetailedHTMLFactory<StyleHTMLAttributes<HTMLStyleElement>, HTMLStyleElement>;
    sub: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
    summary: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
    sup: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
    table: DetailedHTMLFactory<TableHTMLAttributes<HTMLTableElement>, HTMLTableElement>;
    template: DetailedHTMLFactory<HTMLAttributes<HTMLTemplateElement>, HTMLTemplateElement>;
    tbody: DetailedHTMLFactory<HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement>;
    td: DetailedHTMLFactory<TdHTMLAttributes<HTMLTableDataCellElement>, HTMLTableDataCellElement>;
    textarea: DetailedHTMLFactory<TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>;
    tfoot: DetailedHTMLFactory<HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement>;
    th: DetailedHTMLFactory<ThHTMLAttributes<HTMLTableHeaderCellElement>, HTMLTableHeaderCellElement>;
    thead: DetailedHTMLFactory<HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement>;
    time: DetailedHTMLFactory<TimeHTMLAttributes<HTMLTimeElement>, HTMLTimeElement>;
    title: DetailedHTMLFactory<HTMLAttributes<HTMLTitleElement>, HTMLTitleElement>;
    tr: DetailedHTMLFactory<HTMLAttributes<HTMLTableRowElement>, HTMLTableRowElement>;
    track: DetailedHTMLFactory<TrackHTMLAttributes<HTMLTrackElement>, HTMLTrackElement>;
    u: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
    ul: DetailedHTMLFactory<HTMLAttributes<HTMLUListElement>, HTMLUListElement>;
    var: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
    video: DetailedHTMLFactory<VideoHTMLAttributes<HTMLVideoElement>, HTMLVideoElement>;
    wbr: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
    // webview: DetailedHTMLFactory<WebViewHTMLAttributes<HTMLWebViewElement>, HTMLWebViewElement>;
  }

  interface InfernoSVG {
    animate: SVGFactory;
    circle: SVGFactory;
    clipPath: SVGFactory;
    defs: SVGFactory;
    desc: SVGFactory;
    ellipse: SVGFactory;
    feBlend: SVGFactory;
    feColorMatrix: SVGFactory;
    feComponentTransfer: SVGFactory;
    feComposite: SVGFactory;
    feConvolveMatrix: SVGFactory;
    feDiffuseLighting: SVGFactory;
    feDisplacementMap: SVGFactory;
    feDistantLight: SVGFactory;
    feDropShadow: SVGFactory;
    feFlood: SVGFactory;
    feFuncA: SVGFactory;
    feFuncB: SVGFactory;
    feFuncG: SVGFactory;
    feFuncR: SVGFactory;
    feGaussianBlur: SVGFactory;
    feImage: SVGFactory;
    feMerge: SVGFactory;
    feMergeNode: SVGFactory;
    feMorphology: SVGFactory;
    feOffset: SVGFactory;
    fePointLight: SVGFactory;
    feSpecularLighting: SVGFactory;
    feSpotLight: SVGFactory;
    feTile: SVGFactory;
    feTurbulence: SVGFactory;
    filter: SVGFactory;
    foreignObject: SVGFactory;
    g: SVGFactory;
    image: SVGFactory;
    line: SVGFactory;
    linearGradient: SVGFactory;
    marker: SVGFactory;
    mask: SVGFactory;
    metadata: SVGFactory;
    path: SVGFactory;
    pattern: SVGFactory;
    polygon: SVGFactory;
    polyline: SVGFactory;
    radialGradient: SVGFactory;
    rect: SVGFactory;
    stop: SVGFactory;
    svg: SVGFactory;
    switch: SVGFactory;
    symbol: SVGFactory;
    text: SVGFactory;
    textPath: SVGFactory;
    tspan: SVGFactory;
    use: SVGFactory;
    view: SVGFactory;
  }

  //
  // Browser Interfaces
  // https://github.com/nikeee/2048-typescript/blob/master/2048/js/touch.d.ts
  // ----------------------------------------------------------------------

  interface AbstractView {
    styleMedia: StyleMedia;
    document: Document;
  }

  interface Touch {
    identifier: number;
    target: EventTarget;
    screenX: number;
    screenY: number;
    clientX: number;
    clientY: number;
    pageX: number;
    pageY: number;
  }

  interface TouchList {
    [index: number]: Touch;
    length: number;
    item(index: number): Touch;
    identifiedTouch(identifier: number): Touch;
  }
}

type Defaultize<P, D> = P extends any
  ? string extends keyof P
    ? P
    : Pick<P, Exclude<keyof P, keyof D>> & Partial<Pick<P, Extract<keyof P, keyof D>>> & Partial<Pick<D, Exclude<keyof D, keyof P>>>
  : never;

type InfernoManagedAttributes<C, P> = C extends { defaultProps: infer D } ? Defaultize<P, D> : P;

declare global {
  namespace JSX {
    interface ElementClass extends IComponent<any, any> {
      render(nextProps, nextState, nextContext): InfernoNode;
    }
    interface ElementAttributesProperty {
      props: {};
    }
    interface ElementChildrenAttribute {
      children: {};
    }

    type LibraryManagedAttributes<C, P> = InfernoManagedAttributes<C, P>;

    interface IntrinsicAttributes extends Inferno.Attributes {}
    interface IntrinsicAttributes extends Inferno.Attributes, Refs<any> {}
    interface IntrinsicClassAttributes<T> extends Inferno.ClassAttributes<T> {}

    interface IntrinsicElements {
      // HTML
      a: Inferno.DetailedHTMLProps<Inferno.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>;
      abbr: Inferno.DetailedHTMLProps<Inferno.HTMLAttributes<HTMLElement>, HTMLElement>;
      address: Inferno.DetailedHTMLProps<Inferno.HTMLAttributes<HTMLElement>, HTMLElement>;
      area: Inferno.DetailedHTMLProps<Inferno.AreaHTMLAttributes<HTMLAreaElement>, HTMLAreaElement>;
      article: Inferno.DetailedHTMLProps<Inferno.HTMLAttributes<HTMLElement>, HTMLElement>;
      aside: Inferno.DetailedHTMLProps<Inferno.HTMLAttributes<HTMLElement>, HTMLElement>;
      audio: Inferno.DetailedHTMLProps<Inferno.AudioHTMLAttributes<HTMLAudioElement>, HTMLAudioElement>;
      b: Inferno.DetailedHTMLProps<Inferno.HTMLAttributes<HTMLElement>, HTMLElement>;
      base: Inferno.DetailedHTMLProps<Inferno.BaseHTMLAttributes<HTMLBaseElement>, HTMLBaseElement>;
      bdi: Inferno.DetailedHTMLProps<Inferno.HTMLAttributes<HTMLElement>, HTMLElement>;
      bdo: Inferno.DetailedHTMLProps<Inferno.HTMLAttributes<HTMLElement>, HTMLElement>;
      big: Inferno.DetailedHTMLProps<Inferno.HTMLAttributes<HTMLElement>, HTMLElement>;
      blockquote: Inferno.DetailedHTMLProps<Inferno.BlockquoteHTMLAttributes<HTMLQuoteElement>, HTMLQuoteElement>;
      body: Inferno.DetailedHTMLProps<Inferno.HTMLAttributes<HTMLBodyElement>, HTMLBodyElement>;
      br: Inferno.DetailedHTMLProps<Inferno.HTMLAttributes<HTMLBRElement>, HTMLBRElement>;
      button: Inferno.DetailedHTMLProps<Inferno.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;
      canvas: Inferno.DetailedHTMLProps<Inferno.CanvasHTMLAttributes<HTMLCanvasElement>, HTMLCanvasElement>;
      caption: Inferno.DetailedHTMLProps<Inferno.HTMLAttributes<HTMLElement>, HTMLElement>;
      cite: Inferno.DetailedHTMLProps<Inferno.HTMLAttributes<HTMLElement>, HTMLElement>;
      code: Inferno.DetailedHTMLProps<Inferno.HTMLAttributes<HTMLElement>, HTMLElement>;
      col: Inferno.DetailedHTMLProps<Inferno.ColHTMLAttributes<HTMLTableColElement>, HTMLTableColElement>;
      colgroup: Inferno.DetailedHTMLProps<Inferno.ColgroupHTMLAttributes<HTMLTableColElement>, HTMLTableColElement>;
      data: Inferno.DetailedHTMLProps<Inferno.DataHTMLAttributes<HTMLDataElement>, HTMLDataElement>;
      datalist: Inferno.DetailedHTMLProps<Inferno.HTMLAttributes<HTMLDataListElement>, HTMLDataListElement>;
      dd: Inferno.DetailedHTMLProps<Inferno.HTMLAttributes<HTMLElement>, HTMLElement>;
      del: Inferno.DetailedHTMLProps<Inferno.DelHTMLAttributes<HTMLModElement>, HTMLModElement>;
      details: Inferno.DetailedHTMLProps<Inferno.DetailsHTMLAttributes<HTMLDetailsElement>, HTMLDetailsElement>;
      dfn: Inferno.DetailedHTMLProps<Inferno.HTMLAttributes<HTMLElement>, HTMLElement>;
      dialog: Inferno.DetailedHTMLProps<Inferno.DialogHTMLAttributes<HTMLDialogElement>, HTMLDialogElement>;
      div: Inferno.DetailedHTMLProps<Inferno.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
      dl: Inferno.DetailedHTMLProps<Inferno.HTMLAttributes<HTMLDListElement>, HTMLDListElement>;
      dt: Inferno.DetailedHTMLProps<Inferno.HTMLAttributes<HTMLElement>, HTMLElement>;
      em: Inferno.DetailedHTMLProps<Inferno.HTMLAttributes<HTMLElement>, HTMLElement>;
      embed: Inferno.DetailedHTMLProps<Inferno.EmbedHTMLAttributes<HTMLEmbedElement>, HTMLEmbedElement>;
      fieldset: Inferno.DetailedHTMLProps<Inferno.FieldsetHTMLAttributes<HTMLFieldSetElement>, HTMLFieldSetElement>;
      figcaption: Inferno.DetailedHTMLProps<Inferno.HTMLAttributes<HTMLElement>, HTMLElement>;
      figure: Inferno.DetailedHTMLProps<Inferno.HTMLAttributes<HTMLElement>, HTMLElement>;
      footer: Inferno.DetailedHTMLProps<Inferno.HTMLAttributes<HTMLElement>, HTMLElement>;
      form: Inferno.DetailedHTMLProps<Inferno.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement>;
      h1: Inferno.DetailedHTMLProps<Inferno.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
      h2: Inferno.DetailedHTMLProps<Inferno.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
      h3: Inferno.DetailedHTMLProps<Inferno.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
      h4: Inferno.DetailedHTMLProps<Inferno.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
      h5: Inferno.DetailedHTMLProps<Inferno.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
      h6: Inferno.DetailedHTMLProps<Inferno.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
      head: Inferno.DetailedHTMLProps<Inferno.HTMLAttributes<HTMLHeadElement>, HTMLHeadElement>;
      header: Inferno.DetailedHTMLProps<Inferno.HTMLAttributes<HTMLElement>, HTMLElement>;
      hgroup: Inferno.DetailedHTMLProps<Inferno.HTMLAttributes<HTMLElement>, HTMLElement>;
      hr: Inferno.DetailedHTMLProps<Inferno.HTMLAttributes<HTMLHRElement>, HTMLHRElement>;
      html: Inferno.DetailedHTMLProps<Inferno.HtmlHTMLAttributes<HTMLHtmlElement>, HTMLHtmlElement>;
      i: Inferno.DetailedHTMLProps<Inferno.HTMLAttributes<HTMLElement>, HTMLElement>;
      iframe: Inferno.DetailedHTMLProps<Inferno.IframeHTMLAttributes<HTMLIFrameElement>, HTMLIFrameElement>;
      img: Inferno.DetailedHTMLProps<Inferno.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>;
      input: Inferno.DetailedHTMLProps<Inferno.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
      ins: Inferno.DetailedHTMLProps<Inferno.InsHTMLAttributes<HTMLModElement>, HTMLModElement>;
      kbd: Inferno.DetailedHTMLProps<Inferno.HTMLAttributes<HTMLElement>, HTMLElement>;
      keygen: Inferno.DetailedHTMLProps<Inferno.KeygenHTMLAttributes<HTMLElement>, HTMLElement>;
      label: Inferno.DetailedHTMLProps<Inferno.LabelHTMLAttributes<HTMLLabelElement>, HTMLLabelElement>;
      legend: Inferno.DetailedHTMLProps<Inferno.HTMLAttributes<HTMLLegendElement>, HTMLLegendElement>;
      li: Inferno.DetailedHTMLProps<Inferno.LiHTMLAttributes<HTMLLIElement>, HTMLLIElement>;
      link: Inferno.DetailedHTMLProps<Inferno.LinkHTMLAttributes<HTMLLinkElement>, HTMLLinkElement>;
      main: Inferno.DetailedHTMLProps<Inferno.HTMLAttributes<HTMLElement>, HTMLElement>;
      map: Inferno.DetailedHTMLProps<Inferno.MapHTMLAttributes<HTMLMapElement>, HTMLMapElement>;
      mark: Inferno.DetailedHTMLProps<Inferno.HTMLAttributes<HTMLElement>, HTMLElement>;
      media: Inferno.DetailedHTMLProps<Inferno.MediaHTMLAttributes<HTMLMediaElement>, HTMLMediaElement>;
      menu: Inferno.DetailedHTMLProps<Inferno.MenuHTMLAttributes<HTMLElement>, HTMLElement>;
      menuitem: Inferno.DetailedHTMLProps<Inferno.HTMLAttributes<HTMLElement>, HTMLElement>;
      meta: Inferno.DetailedHTMLProps<Inferno.MetaHTMLAttributes<HTMLMetaElement>, HTMLMetaElement>;
      meter: Inferno.DetailedHTMLProps<Inferno.MeterHTMLAttributes<HTMLMeterElement>, HTMLMeterElement>;
      nav: Inferno.DetailedHTMLProps<Inferno.HTMLAttributes<HTMLElement>, HTMLElement>;
      noindex: Inferno.DetailedHTMLProps<Inferno.HTMLAttributes<HTMLElement>, HTMLElement>;
      noscript: Inferno.DetailedHTMLProps<Inferno.HTMLAttributes<HTMLElement>, HTMLElement>;
      object: Inferno.DetailedHTMLProps<Inferno.ObjectHTMLAttributes<HTMLObjectElement>, HTMLObjectElement>;
      ol: Inferno.DetailedHTMLProps<Inferno.OlHTMLAttributes<HTMLOListElement>, HTMLOListElement>;
      optgroup: Inferno.DetailedHTMLProps<Inferno.OptgroupHTMLAttributes<HTMLOptGroupElement>, HTMLOptGroupElement>;
      option: Inferno.DetailedHTMLProps<Inferno.OptionHTMLAttributes<HTMLOptionElement>, HTMLOptionElement>;
      output: Inferno.DetailedHTMLProps<Inferno.OutputHTMLAttributes<HTMLOutputElement>, HTMLOutputElement>;
      p: Inferno.DetailedHTMLProps<Inferno.HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>;
      param: Inferno.DetailedHTMLProps<Inferno.ParamHTMLAttributes<HTMLParamElement>, HTMLParamElement>;
      picture: Inferno.DetailedHTMLProps<Inferno.HTMLAttributes<HTMLElement>, HTMLElement>;
      pre: Inferno.DetailedHTMLProps<Inferno.HTMLAttributes<HTMLPreElement>, HTMLPreElement>;
      progress: Inferno.DetailedHTMLProps<Inferno.ProgressHTMLAttributes<HTMLProgressElement>, HTMLProgressElement>;
      q: Inferno.DetailedHTMLProps<Inferno.QuoteHTMLAttributes<HTMLQuoteElement>, HTMLQuoteElement>;
      rp: Inferno.DetailedHTMLProps<Inferno.HTMLAttributes<HTMLElement>, HTMLElement>;
      rt: Inferno.DetailedHTMLProps<Inferno.HTMLAttributes<HTMLElement>, HTMLElement>;
      ruby: Inferno.DetailedHTMLProps<Inferno.HTMLAttributes<HTMLElement>, HTMLElement>;
      s: Inferno.DetailedHTMLProps<Inferno.HTMLAttributes<HTMLElement>, HTMLElement>;
      samp: Inferno.DetailedHTMLProps<Inferno.HTMLAttributes<HTMLElement>, HTMLElement>;
      slot: Inferno.DetailedHTMLProps<Inferno.SlotHTMLAttributes<HTMLSlotElement>, HTMLSlotElement>;
      script: Inferno.DetailedHTMLProps<Inferno.ScriptHTMLAttributes<HTMLScriptElement>, HTMLScriptElement>;
      section: Inferno.DetailedHTMLProps<Inferno.HTMLAttributes<HTMLElement>, HTMLElement>;
      select: Inferno.DetailedHTMLProps<Inferno.SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement>;
      small: Inferno.DetailedHTMLProps<Inferno.HTMLAttributes<HTMLElement>, HTMLElement>;
      source: Inferno.DetailedHTMLProps<Inferno.SourceHTMLAttributes<HTMLSourceElement>, HTMLSourceElement>;
      span: Inferno.DetailedHTMLProps<Inferno.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>;
      strong: Inferno.DetailedHTMLProps<Inferno.HTMLAttributes<HTMLElement>, HTMLElement>;
      style: Inferno.DetailedHTMLProps<Inferno.StyleHTMLAttributes<HTMLStyleElement>, HTMLStyleElement>;
      sub: Inferno.DetailedHTMLProps<Inferno.HTMLAttributes<HTMLElement>, HTMLElement>;
      summary: Inferno.DetailedHTMLProps<Inferno.HTMLAttributes<HTMLElement>, HTMLElement>;
      sup: Inferno.DetailedHTMLProps<Inferno.HTMLAttributes<HTMLElement>, HTMLElement>;
      table: Inferno.DetailedHTMLProps<Inferno.TableHTMLAttributes<HTMLTableElement>, HTMLTableElement>;
      template: Inferno.DetailedHTMLProps<Inferno.HTMLAttributes<HTMLTemplateElement>, HTMLTemplateElement>;
      tbody: Inferno.DetailedHTMLProps<Inferno.HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement>;
      td: Inferno.DetailedHTMLProps<Inferno.TdHTMLAttributes<HTMLTableDataCellElement>, HTMLTableDataCellElement>;
      textarea: Inferno.DetailedHTMLProps<Inferno.TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>;
      tfoot: Inferno.DetailedHTMLProps<Inferno.HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement>;
      th: Inferno.DetailedHTMLProps<Inferno.ThHTMLAttributes<HTMLTableHeaderCellElement>, HTMLTableHeaderCellElement>;
      thead: Inferno.DetailedHTMLProps<Inferno.HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement>;
      time: Inferno.DetailedHTMLProps<Inferno.TimeHTMLAttributes<HTMLTimeElement>, HTMLTimeElement>;
      title: Inferno.DetailedHTMLProps<Inferno.HTMLAttributes<HTMLTitleElement>, HTMLTitleElement>;
      tr: Inferno.DetailedHTMLProps<Inferno.HTMLAttributes<HTMLTableRowElement>, HTMLTableRowElement>;
      track: Inferno.DetailedHTMLProps<Inferno.TrackHTMLAttributes<HTMLTrackElement>, HTMLTrackElement>;
      u: Inferno.DetailedHTMLProps<Inferno.HTMLAttributes<HTMLElement>, HTMLElement>;
      ul: Inferno.DetailedHTMLProps<Inferno.HTMLAttributes<HTMLUListElement>, HTMLUListElement>;
      var: Inferno.DetailedHTMLProps<Inferno.HTMLAttributes<HTMLElement>, HTMLElement>;
      video: Inferno.DetailedHTMLProps<Inferno.VideoHTMLAttributes<HTMLVideoElement>, HTMLVideoElement>;
      wbr: Inferno.DetailedHTMLProps<Inferno.HTMLAttributes<HTMLElement>, HTMLElement>;
      // webview: Inferno.DetailedHTMLProps<Inferno.WebViewHTMLAttributes<HTMLWebViewElement>, HTMLWebViewElement>;

      // SVG
      svg: Inferno.SVGProps<SVGSVGElement>;

      animate: Inferno.SVGProps<SVGAnimateElement>;
      animateMotion: Inferno.SVGProps<SVGElement>;
      animateTransform: Inferno.SVGProps<SVGAnimateTransformElement>;
      circle: Inferno.SVGProps<SVGCircleElement>;
      clipPath: Inferno.SVGProps<SVGClipPathElement>;
      defs: Inferno.SVGProps<SVGDefsElement>;
      desc: Inferno.SVGProps<SVGDescElement>;
      ellipse: Inferno.SVGProps<SVGEllipseElement>;
      feBlend: Inferno.SVGProps<SVGFEBlendElement>;
      feColorMatrix: Inferno.SVGProps<SVGFEColorMatrixElement>;
      feComponentTransfer: Inferno.SVGProps<SVGFEComponentTransferElement>;
      feComposite: Inferno.SVGProps<SVGFECompositeElement>;
      feConvolveMatrix: Inferno.SVGProps<SVGFEConvolveMatrixElement>;
      feDiffuseLighting: Inferno.SVGProps<SVGFEDiffuseLightingElement>;
      feDisplacementMap: Inferno.SVGProps<SVGFEDisplacementMapElement>;
      feDistantLight: Inferno.SVGProps<SVGFEDistantLightElement>;
      feDropShadow: Inferno.SVGProps<SVGFEDropShadowElement>;
      feFlood: Inferno.SVGProps<SVGFEFloodElement>;
      feFuncA: Inferno.SVGProps<SVGFEFuncAElement>;
      feFuncB: Inferno.SVGProps<SVGFEFuncBElement>;
      feFuncG: Inferno.SVGProps<SVGFEFuncGElement>;
      feFuncR: Inferno.SVGProps<SVGFEFuncRElement>;
      feGaussianBlur: Inferno.SVGProps<SVGFEGaussianBlurElement>;
      feImage: Inferno.SVGProps<SVGFEImageElement>;
      feMerge: Inferno.SVGProps<SVGFEMergeElement>;
      feMergeNode: Inferno.SVGProps<SVGFEMergeNodeElement>;
      feMorphology: Inferno.SVGProps<SVGFEMorphologyElement>;
      feOffset: Inferno.SVGProps<SVGFEOffsetElement>;
      fePointLight: Inferno.SVGProps<SVGFEPointLightElement>;
      feSpecularLighting: Inferno.SVGProps<SVGFESpecularLightingElement>;
      feSpotLight: Inferno.SVGProps<SVGFESpotLightElement>;
      feTile: Inferno.SVGProps<SVGFETileElement>;
      feTurbulence: Inferno.SVGProps<SVGFETurbulenceElement>;
      filter: Inferno.SVGProps<SVGFilterElement>;
      foreignObject: Inferno.SVGProps<SVGForeignObjectElement>;
      g: Inferno.SVGProps<SVGGElement>;
      image: Inferno.SVGProps<SVGImageElement>;
      line: Inferno.SVGProps<SVGLineElement>;
      linearGradient: Inferno.SVGProps<SVGLinearGradientElement>;
      marker: Inferno.SVGProps<SVGMarkerElement>;
      mask: Inferno.SVGProps<SVGMaskElement>;
      metadata: Inferno.SVGProps<SVGMetadataElement>;
      mpath: Inferno.SVGProps<SVGElement>;
      path: Inferno.SVGProps<SVGPathElement>;
      pattern: Inferno.SVGProps<SVGPatternElement>;
      polygon: Inferno.SVGProps<SVGPolygonElement>;
      polyline: Inferno.SVGProps<SVGPolylineElement>;
      radialGradient: Inferno.SVGProps<SVGRadialGradientElement>;
      rect: Inferno.SVGProps<SVGRectElement>;
      stop: Inferno.SVGProps<SVGStopElement>;
      switch: Inferno.SVGProps<SVGSwitchElement>;
      symbol: Inferno.SVGProps<SVGSymbolElement>;
      text: Inferno.SVGProps<SVGTextElement>;
      textPath: Inferno.SVGProps<SVGTextPathElement>;
      tspan: Inferno.SVGProps<SVGTSpanElement>;
      use: Inferno.SVGProps<SVGUseElement>;
      view: Inferno.SVGProps<SVGViewElement>;

      // MathML
      maction: Inferno.DetailedHTMLProps<Inferno.HTMLAttributes<MathMLElement>, MathMLElement>;
      math: Inferno.DetailedHTMLProps<Inferno.HTMLAttributes<MathMLElement>, MathMLElement>;
      menclose: Inferno.DetailedHTMLProps<Inferno.HTMLAttributes<MathMLElement>, MathMLElement>;
      merror: Inferno.DetailedHTMLProps<Inferno.HTMLAttributes<MathMLElement>, MathMLElement>;
      mfenced: Inferno.DetailedHTMLProps<Inferno.HTMLAttributes<MathMLElement>, MathMLElement>;
      mfrac: Inferno.DetailedHTMLProps<Inferno.HTMLAttributes<MathMLElement>, MathMLElement>;
      mi: Inferno.DetailedHTMLProps<Inferno.HTMLAttributes<MathMLElement>, MathMLElement>;
      mmultiscripts: Inferno.DetailedHTMLProps<Inferno.HTMLAttributes<MathMLElement>, MathMLElement>;
      mn: Inferno.DetailedHTMLProps<Inferno.HTMLAttributes<MathMLElement>, MathMLElement>;
      mo: Inferno.DetailedHTMLProps<Inferno.HTMLAttributes<MathMLElement>, MathMLElement>;
      mover: Inferno.DetailedHTMLProps<Inferno.HTMLAttributes<MathMLElement>, MathMLElement>;
      mpadded: Inferno.DetailedHTMLProps<Inferno.HTMLAttributes<MathMLElement>, MathMLElement>;
      mphantom: Inferno.DetailedHTMLProps<Inferno.HTMLAttributes<MathMLElement>, MathMLElement>;
      mroot: Inferno.DetailedHTMLProps<Inferno.HTMLAttributes<MathMLElement>, MathMLElement>;
      mrow: Inferno.DetailedHTMLProps<Inferno.HTMLAttributes<MathMLElement>, MathMLElement>;
      ms: Inferno.DetailedHTMLProps<Inferno.HTMLAttributes<MathMLElement>, MathMLElement>;
      mspace: Inferno.DetailedHTMLProps<Inferno.HTMLAttributes<MathMLElement>, MathMLElement>;
      msqrt: Inferno.DetailedHTMLProps<Inferno.HTMLAttributes<MathMLElement>, MathMLElement>;
      mstyle: Inferno.DetailedHTMLProps<Inferno.HTMLAttributes<MathMLElement>, MathMLElement>;
      msub: Inferno.DetailedHTMLProps<Inferno.HTMLAttributes<MathMLElement>, MathMLElement>;
      msubsup: Inferno.DetailedHTMLProps<Inferno.HTMLAttributes<MathMLElement>, MathMLElement>;
      msup: Inferno.DetailedHTMLProps<Inferno.HTMLAttributes<MathMLElement>, MathMLElement>;
      mtable: Inferno.DetailedHTMLProps<Inferno.HTMLAttributes<MathMLElement>, MathMLElement>;
      mtd: Inferno.DetailedHTMLProps<Inferno.HTMLAttributes<MathMLElement>, MathMLElement>;
      mtext: Inferno.DetailedHTMLProps<Inferno.HTMLAttributes<MathMLElement>, MathMLElement>;
      mtr: Inferno.DetailedHTMLProps<Inferno.HTMLAttributes<MathMLElement>, MathMLElement>;
      munder: Inferno.DetailedHTMLProps<Inferno.HTMLAttributes<MathMLElement>, MathMLElement>;
      munderover: Inferno.DetailedHTMLProps<Inferno.HTMLAttributes<MathMLElement>, MathMLElement>;
      semantics: Inferno.DetailedHTMLProps<Inferno.HTMLAttributes<MathMLElement>, MathMLElement>;
    }
  }
}
