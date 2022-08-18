import type { NativeClipboardEvent, NativeCompositionEvent, NativeDragEvent, NativeFocusEvent } from './nativetypes';
import type { ChildFlags, VNodeFlags } from 'inferno-vnode-flags';
import type { PropertiesHyphen } from 'csstype';

export interface LinkedEvent<T, E extends Event> {
  data: T;
  event: (data: T, event: E) => void;
}

// IComponent is defined here, instead of Component to de-couple implementation from interface
export interface IComponent<P, S> {
  // Public
  state: S | null;
  props: {
    children?: Inferno.InfernoNode;
  } & P;
  context: any;
  displayName?: string;
  refs?: any;

  forceUpdate(callback?: Function);

  setState<K extends keyof S>(
    newState: ((prevState: Readonly<S>, props: Readonly<{ children?: Inferno.InfernoNode } & P>) => Pick<S, K> | S | null) | (Pick<S, K> | S | null),
    callback?: () => void
  ): void;

  componentDidMount?(): void;

  componentWillMount?(): void;

  componentWillReceiveProps?(nextProps: Readonly<{ children?: Inferno.InfernoNode } & P>, nextContext: any): void;

  shouldComponentUpdate?(nextProps: Readonly<{ children?: Inferno.InfernoNode } & P>, nextState: S, context: any): boolean;

  componentWillUpdate?(nextProps: Readonly<{ children?: Inferno.InfernoNode } & P>, nextState: S, context: any): void;

  componentDidUpdate?(prevProps: Readonly<{ children?: Inferno.InfernoNode } & P>, prevState: S, snapshot: any): void;

  componentWillUnmount?(): void;

  getChildContext?(): void;

  getSnapshotBeforeUpdate?(prevProps: Readonly<{ children?: Inferno.InfernoNode } & P>, prevState: S): any;

  render(nextProps: Readonly<{ children?: Inferno.InfernoNode } & P>, nextState: S, nextContext: any): Inferno.InfernoNode;
}

export interface SemiSyntheticEvent<T> extends Event {
  /**
   * A reference to the element on which the event listener is registered.
   */
  currentTarget: EventTarget & T;
  isDefaultPrevented: () => boolean;
  isPropagationStopped: () => boolean;
}

export type ClipboardEvent<T> = SemiSyntheticEvent<T> & NativeClipboardEvent;
export type CompositionEvent<T> = SemiSyntheticEvent<T> & NativeCompositionEvent;
export type DragEvent<T> = InfernoMouseEvent<T> & NativeDragEvent;
export type FocusEvent<T> = SemiSyntheticEvent<T> & NativeFocusEvent;
export type FormEvent<T> = SemiSyntheticEvent<T>;

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
  children: Inferno.InfernoNode;
  childFlags: ChildFlags;
  dom: Element | null;
  className: string | null | undefined;
  flags: VNodeFlags;
  isValidated?: boolean;
  key: null | number | string;
  props: any;
  ref: any;
  type: any;
}

export interface RefObject<T> {
  readonly current: T | null;
}

export type Ref<T = Element> = { bivarianceHack(instance: T | null): any }['bivarianceHack'] | RefObject<T>;

export interface ForwardRef<P, T> extends Inferno.StatelessComponent<P> {
  ref: Ref<T>;
}

export interface Refs<P> {
  onComponentDidMount?: (domNode: Element | null, nextProps: Readonly<P>) => void;

  onComponentWillMount?(): void;

  onComponentShouldUpdate?(lastProps: Readonly<P>, nextProps: Readonly<P>): boolean;

  onComponentWillUpdate?(lastProps: Readonly<P>, nextProps: Readonly<P>): void;

  onComponentDidUpdate?(lastProps: Readonly<P>, nextProps: Readonly<P>): void;

  onComponentWillUnmount?(domNode: Element, nextProps: Readonly<P>): void;
}

export interface Props<T> {
  children?: Inferno.InfernoNode | undefined;
  key?: Key | undefined;
  ref?: Ref<T> | undefined;
}

export declare namespace Inferno {
  //
  // Inferno Elements
  // ----------------------------------------------------------------------
  type Key = string | number;
  type Ref<T> = string | { bivarianceHack(instance: T | null): any }['bivarianceHack'] | RefObject<T>;

  // tslint:disable-next-line:interface-over-type-literal
  type ComponentState = {};
  type ExoticComponent<P = {}> = (props: P) => InfernoElement;

  interface Attributes {
    key?: Key;

    $HasVNodeChildren?: boolean;
    $HasNonKeyedChildren?: boolean;
    $HasKeyedChildren?: boolean;
    $HasTextChildren?: boolean;
    $ChildFlag?: number;
  }
  interface ClassAttributes<T> extends Attributes {
    ref?: Ref<T> | RefObject<T> | undefined;
  }

  interface InfernoElement<P = any> {
    type: string | ComponentClass<P> | SFC<P>;
    props: P;
    key: Key | null;
  }

  interface SFCElement<P> extends InfernoElement<P> {
    type: SFC<P>;
  }

  type CElement<P, T extends IComponent<P, ComponentState>> = ComponentElement<P, T>;
  interface ComponentElement<P, T extends IComponent<P, ComponentState>> extends InfernoElement<P> {
    type: ComponentClass<P>;
    ref?: Ref<T> | undefined;
  }

  type ClassicElement<P> = CElement<P, ClassicComponent<P, ComponentState>>;

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
  type ClassicFactory<P> = CFactory<P, ClassicComponent<P, ComponentState>>;

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

  type InfernoText = string | number;
  type InfernoChild = InfernoElement | InfernoText;

  interface InfernoNodeArray extends Array<InfernoNode> {}
  type InfernoFragment = {} | InfernoNodeArray;
  type InfernoNode = InfernoChild | InfernoFragment | boolean | null | undefined;

  const version: string;

  //
  // Component API
  // ----------------------------------------------------------------------

  interface ClassicComponent<P = {}, S = {}> extends IComponent<P, S> {
    replaceState(nextState: S, callback?: () => any): void;
    isMounted(): boolean;
    getInitialState?(): S;
  }

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
        children?: Inferno.InfernoNode;
      } & P &
        Refs<P>,
      context?: any
    ): InfernoElement | null;
    defaultProps?: Partial<P> | undefined;
    defaultHooks?: Refs<P> | undefined;
  }

  interface ComponentClass<P = {}> {
    new (
      props?: {
        children?: Inferno.InfernoNode;
      } & P,
      context?: any
    ): IComponent<P, ComponentState>;
    defaultProps?: Partial<P> | undefined;
  }

  //
  // Props / DOM Attributes
  // ----------------------------------------------------------------------

  interface HTMLProps<T> extends AllHTMLAttributes<T>, ClassAttributes<T> {}

  type DetailedHTMLProps<E extends HTMLAttributes<T>, T> = ClassAttributes<T> & E;

  interface SVGProps<T> extends SVGAttributes<T>, ClassAttributes<T> {}

  interface DOMAttributes<T> {
    children?: InfernoNode | undefined;
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
  }

  // All the WAI-ARIA 1.1 attributes from https://www.w3.org/TR/wai-aria-1.1/
  interface AriaAttributes {
    /** Identifies the currently active element when DOM focus is on a composite widget, textbox, group, or application. */
    'aria-activedescendant'?: string | undefined;
    /** Indicates whether assistive technologies will present all, or only parts of, the changed region based on the change notifications defined by the aria-relevant attribute. */
    'aria-atomic'?: Booleanish | undefined;
    /**
     * Indicates whether inputting text could trigger display of one or more predictions of the user's intended value for an input and specifies how predictions would be
     * presented if they are made.
     */
    'aria-autocomplete'?: 'none' | 'inline' | 'list' | 'both' | undefined;
    /** Indicates an element is being modified and that assistive technologies MAY want to wait until the modifications are complete before exposing them to the user. */
    'aria-busy'?: Booleanish | undefined;
    /**
     * Indicates the current "checked" state of checkboxes, radio buttons, and other widgets.
     * @see aria-pressed @see aria-selected.
     */
    'aria-checked'?: boolean | 'false' | 'mixed' | 'true' | undefined;
    /**
     * Defines the total number of columns in a table, grid, or treegrid.
     * @see aria-colindex.
     */
    'aria-colcount'?: number | undefined;
    /**
     * Defines an element's column index or position with respect to the total number of columns within a table, grid, or treegrid.
     * @see aria-colcount @see aria-colspan.
     */
    'aria-colindex'?: number | undefined;
    /**
     * Defines the number of columns spanned by a cell or gridcell within a table, grid, or treegrid.
     * @see aria-colindex @see aria-rowspan.
     */
    'aria-colspan'?: number | undefined;
    /**
     * Identifies the element (or elements) whose contents or presence are controlled by the current element.
     * @see aria-owns.
     */
    'aria-controls'?: string | undefined;
    /** Indicates the element that represents the current item within a container or set of related elements. */
    'aria-current'?: boolean | 'false' | 'true' | 'page' | 'step' | 'location' | 'date' | 'time' | undefined;
    /**
     * Identifies the element (or elements) that describes the object.
     * @see aria-labelledby
     */
    'aria-describedby'?: string | undefined;
    /**
     * Identifies the element that provides a detailed, extended description for the object.
     * @see aria-describedby.
     */
    'aria-details'?: string | undefined;
    /**
     * Indicates that the element is perceivable but disabled, so it is not editable or otherwise operable.
     * @see aria-hidden @see aria-readonly.
     */
    'aria-disabled'?: Booleanish | undefined;
    /**
     * Indicates what functions can be performed when a dragged object is released on the drop target.
     * @deprecated in ARIA 1.1
     */
    'aria-dropeffect'?: 'none' | 'copy' | 'execute' | 'link' | 'move' | 'popup' | undefined;
    /**
     * Identifies the element that provides an error message for the object.
     * @see aria-invalid @see aria-describedby.
     */
    'aria-errormessage'?: string | undefined;
    /** Indicates whether the element, or another grouping element it controls, is currently expanded or collapsed. */
    'aria-expanded'?: Booleanish | undefined;
    /**
     * Identifies the next element (or elements) in an alternate reading order of content which, at the user's discretion,
     * allows assistive technology to override the general default of reading in document source order.
     */
    'aria-flowto'?: string | undefined;
    /**
     * Indicates an element's "grabbed" state in a drag-and-drop operation.
     * @deprecated in ARIA 1.1
     */
    'aria-grabbed'?: Booleanish | undefined;
    /** Indicates the availability and type of interactive popup element, such as menu or dialog, that can be triggered by an element. */
    'aria-haspopup'?: boolean | 'false' | 'true' | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog' | undefined;
    /**
     * Indicates whether the element is exposed to an accessibility API.
     * @see aria-disabled.
     */
    'aria-hidden'?: Booleanish | undefined;
    /**
     * Indicates the entered value does not conform to the format expected by the application.
     * @see aria-errormessage.
     */
    'aria-invalid'?: boolean | 'false' | 'true' | 'grammar' | 'spelling' | undefined;
    /** Indicates keyboard shortcuts that an author has implemented to activate or give focus to an element. */
    'aria-keyshortcuts'?: string | undefined;
    /**
     * Defines a string value that labels the current element.
     * @see aria-labelledby.
     */
    'aria-label'?: string | undefined;
    /**
     * Identifies the element (or elements) that labels the current element.
     * @see aria-describedby.
     */
    'aria-labelledby'?: string | undefined;
    /** Defines the hierarchical level of an element within a structure. */
    'aria-level'?: number | undefined;
    /** Indicates that an element will be updated, and describes the types of updates the user agents, assistive technologies, and user can expect from the live region. */
    'aria-live'?: 'off' | 'assertive' | 'polite' | undefined;
    /** Indicates whether an element is modal when displayed. */
    'aria-modal'?: Booleanish | undefined;
    /** Indicates whether a text box accepts multiple lines of input or only a single line. */
    'aria-multiline'?: Booleanish | undefined;
    /** Indicates that the user may select more than one item from the current selectable descendants. */
    'aria-multiselectable'?: Booleanish | undefined;
    /** Indicates whether the element's orientation is horizontal, vertical, or unknown/ambiguous. */
    'aria-orientation'?: 'horizontal' | 'vertical' | undefined;
    /**
     * Identifies an element (or elements) in order to define a visual, functional, or contextual parent/child relationship
     * between DOM elements where the DOM hierarchy cannot be used to represent the relationship.
     * @see aria-controls.
     */
    'aria-owns'?: string | undefined;
    /**
     * Defines a short hint (a word or short phrase) intended to aid the user with data entry when the control has no value.
     * A hint could be a sample value or a brief description of the expected format.
     */
    'aria-placeholder'?: string | undefined;
    /**
     * Defines an element's number or position in the current set of listitems or treeitems. Not required if all elements in the set are present in the DOM.
     * @see aria-setsize.
     */
    'aria-posinset'?: number | undefined;
    /**
     * Indicates the current "pressed" state of toggle buttons.
     * @see aria-checked @see aria-selected.
     */
    'aria-pressed'?: boolean | 'false' | 'mixed' | 'true' | undefined;
    /**
     * Indicates that the element is not editable, but is otherwise operable.
     * @see aria-disabled.
     */
    'aria-readonly'?: Booleanish | undefined;
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
    'aria-required'?: Booleanish | undefined;
    /** Defines a human-readable, author-localized description for the role of an element. */
    'aria-roledescription'?: string | undefined;
    /**
     * Defines the total number of rows in a table, grid, or treegrid.
     * @see aria-rowindex.
     */
    'aria-rowcount'?: number | undefined;
    /**
     * Defines an element's row index or position with respect to the total number of rows within a table, grid, or treegrid.
     * @see aria-rowcount @see aria-rowspan.
     */
    'aria-rowindex'?: number | undefined;
    /**
     * Defines the number of rows spanned by a cell or gridcell within a table, grid, or treegrid.
     * @see aria-rowindex @see aria-colspan.
     */
    'aria-rowspan'?: number | undefined;
    /**
     * Indicates the current "selected" state of various widgets.
     * @see aria-checked @see aria-pressed.
     */
    'aria-selected'?: Booleanish | undefined;
    /**
     * Defines the number of items in the current set of listitems or treeitems. Not required if all elements in the set are present in the DOM.
     * @see aria-posinset.
     */
    'aria-setsize'?: number | undefined;
    /** Indicates if items in a table or grid are sorted in ascending or descending order. */
    'aria-sort'?: 'none' | 'ascending' | 'descending' | 'other' | undefined;
    /** Defines the maximum allowed value for a range widget. */
    'aria-valuemax'?: number | undefined;
    /** Defines the minimum allowed value for a range widget. */
    'aria-valuemin'?: number | undefined;
    /**
     * Defines the current value for a range widget.
     * @see aria-valuetext.
     */
    'aria-valuenow'?: number | undefined;
    /** Defines the human-readable text alternative of aria-valuenow for a range widget. */
    'aria-valuetext'?: string | undefined;
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

  interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    // Inferno-specific Attributes
    class?: string | undefined;
    defaultChecked?: boolean | undefined;
    defaultValue?: string | number | ReadonlyArray<string> | undefined;

    // Standard HTML Attributes
    accessKey?: string | undefined;
    className?: string | undefined;
    contentEditable?: Booleanish | 'inherit' | undefined;
    contextMenu?: string | undefined;
    dir?: string | undefined;
    draggable?: Booleanish | undefined;
    hidden?: boolean | undefined;
    id?: string | undefined;
    lang?: string | undefined;
    placeholder?: string | undefined;
    slot?: string | undefined;
    spellCheck?: Booleanish | undefined;
    style?: PropertiesHyphen | string | null | undefined;
    tabIndex?: number | undefined;
    title?: string | undefined;
    translate?: 'yes' | 'no' | undefined;

    // Unknown
    radioGroup?: string | undefined; // <command>, <menuitem>

    // WAI-ARIA
    role?: AriaRole | undefined;

    // RDFa Attributes
    about?: string | undefined;
    datatype?: string | undefined;
    inlist?: any;
    prefix?: string | undefined;
    property?: string | undefined;
    resource?: string | undefined;
    typeof?: string | undefined;
    vocab?: string | undefined;

    // Non-standard Attributes
    autoCapitalize?: string | undefined;
    autoCorrect?: string | undefined;
    autoSave?: string | undefined;
    color?: string | undefined;
    itemProp?: string | undefined;
    itemScope?: boolean | undefined;
    itemType?: string | undefined;
    itemID?: string | undefined;
    itemRef?: string | undefined;
    results?: number | undefined;
    security?: string | undefined;
    unselectable?: 'on' | 'off' | undefined;

    // Living Standard
    /**
     * Hints at the type of data that might be entered by the user while editing the element or its contents
     * @see https://html.spec.whatwg.org/multipage/interaction.html#input-modalities:-the-inputmode-attribute
     */
    inputMode?: 'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search' | undefined;
    /**
     * Specify that a standard HTML element should behave like a defined custom built-in element
     * @see https://html.spec.whatwg.org/multipage/custom-elements.html#attr-is
     */
    is?: string | undefined;
  }

  interface AllHTMLAttributes<T> extends HTMLAttributes<T> {
    // Standard HTML Attributes
    accept?: string | undefined;
    acceptCharset?: string | undefined;
    action?: string | undefined;
    allowFullScreen?: boolean | undefined;
    allowTransparency?: boolean | undefined;
    alt?: string | undefined;
    as?: string | undefined;
    async?: boolean | undefined;
    autoComplete?: string | undefined;
    autoFocus?: boolean | undefined;
    autoPlay?: boolean | undefined;
    capture?: boolean | 'user' | 'environment' | undefined;
    cellPadding?: number | string | undefined;
    cellSpacing?: number | string | undefined;
    charSet?: string | undefined;
    challenge?: string | undefined;
    checked?: boolean | undefined;
    cite?: string | undefined;
    classID?: string | undefined;
    cols?: number | undefined;
    colSpan?: number | undefined;
    content?: string | undefined;
    controls?: boolean | undefined;
    coords?: string | undefined;
    crossOrigin?: string | undefined;
    data?: string | undefined;
    dateTime?: string | undefined;
    default?: boolean | undefined;
    defer?: boolean | undefined;
    disabled?: boolean | undefined;
    download?: any;
    encType?: string | undefined;
    form?: string | undefined;
    formAction?: string | undefined;
    formEncType?: string | undefined;
    formMethod?: string | undefined;
    formNoValidate?: boolean | undefined;
    formTarget?: string | undefined;
    frameBorder?: number | string | undefined;
    headers?: string | undefined;
    height?: number | string | undefined;
    high?: number | undefined;
    href?: string | undefined;
    hrefLang?: string | undefined;
    htmlFor?: string | undefined;
    httpEquiv?: string | undefined;
    integrity?: string | undefined;
    keyParams?: string | undefined;
    keyType?: string | undefined;
    kind?: string | undefined;
    label?: string | undefined;
    list?: string | undefined;
    loop?: boolean | undefined;
    low?: number | undefined;
    manifest?: string | undefined;
    marginHeight?: number | undefined;
    marginWidth?: number | undefined;
    max?: number | string | undefined;
    maxLength?: number | undefined;
    media?: string | undefined;
    mediaGroup?: string | undefined;
    method?: string | undefined;
    min?: number | string | undefined;
    minLength?: number | undefined;
    multiple?: boolean | undefined;
    muted?: boolean | undefined;
    name?: string | undefined;
    nonce?: string | undefined;
    noValidate?: boolean | undefined;
    open?: boolean | undefined;
    optimum?: number | undefined;
    pattern?: string | undefined;
    placeholder?: string | undefined;
    playsInline?: boolean | undefined;
    poster?: string | undefined;
    preload?: string | undefined;
    readOnly?: boolean | undefined;
    rel?: string | undefined;
    required?: boolean | undefined;
    reversed?: boolean | undefined;
    rows?: number | undefined;
    rowSpan?: number | undefined;
    sandbox?: string | undefined;
    scope?: string | undefined;
    scoped?: boolean | undefined;
    scrolling?: string | undefined;
    seamless?: boolean | undefined;
    selected?: boolean | undefined;
    shape?: string | undefined;
    size?: number | undefined;
    sizes?: string | undefined;
    span?: number | undefined;
    src?: string | undefined;
    srcDoc?: string | undefined;
    srcLang?: string | undefined;
    srcSet?: string | undefined;
    start?: number | undefined;
    step?: number | string | undefined;
    summary?: string | undefined;
    target?: string | undefined;
    type?: string | undefined;
    useMap?: string | undefined;
    value?: string | ReadonlyArray<string> | number | undefined;
    width?: number | string | undefined;
    wmode?: string | undefined;
    wrap?: string | undefined;
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
    href?: string | undefined;
    hrefLang?: string | undefined;
    media?: string | undefined;
    ping?: string | undefined;
    rel?: string | undefined;
    target?: HTMLAttributeAnchorTarget | undefined;
    type?: string | undefined;
    referrerPolicy?: HTMLAttributeReferrerPolicy | undefined;
  }

  interface AudioHTMLAttributes<T> extends MediaHTMLAttributes<T> {}

  interface AreaHTMLAttributes<T> extends HTMLAttributes<T> {
    alt?: string | undefined;
    coords?: string | undefined;
    download?: any;
    href?: string | undefined;
    hrefLang?: string | undefined;
    media?: string | undefined;
    referrerPolicy?: HTMLAttributeReferrerPolicy | undefined;
    rel?: string | undefined;
    shape?: string | undefined;
    target?: string | undefined;
  }

  interface BaseHTMLAttributes<T> extends HTMLAttributes<T> {
    href?: string | undefined;
    target?: string | undefined;
  }

  interface BlockquoteHTMLAttributes<T> extends HTMLAttributes<T> {
    cite?: string | undefined;
  }

  interface ButtonHTMLAttributes<T> extends HTMLAttributes<T> {
    autoFocus?: boolean | undefined;
    disabled?: boolean | undefined;
    form?: string | undefined;
    formAction?: string | undefined;
    formEncType?: string | undefined;
    formMethod?: string | undefined;
    formNoValidate?: boolean | undefined;
    formTarget?: string | undefined;
    name?: string | undefined;
    type?: 'submit' | 'reset' | 'button' | undefined;
    value?: string | ReadonlyArray<string> | number | undefined;
  }

  interface CanvasHTMLAttributes<T> extends HTMLAttributes<T> {
    height?: number | string | undefined;
    width?: number | string | undefined;
  }

  interface ColHTMLAttributes<T> extends HTMLAttributes<T> {
    span?: number | undefined;
    width?: number | string | undefined;
  }

  interface ColgroupHTMLAttributes<T> extends HTMLAttributes<T> {
    span?: number | undefined;
  }

  interface DataHTMLAttributes<T> extends HTMLAttributes<T> {
    value?: string | ReadonlyArray<string> | number | undefined;
  }

  interface DetailsHTMLAttributes<T> extends HTMLAttributes<T> {
    open?: boolean | undefined;
    onToggle?: InfernoEventHandler<T> | undefined;
  }

  interface DelHTMLAttributes<T> extends HTMLAttributes<T> {
    cite?: string | undefined;
    dateTime?: string | undefined;
  }

  interface DialogHTMLAttributes<T> extends HTMLAttributes<T> {
    onCancel?: InfernoEventHandler<T> | undefined;
    onClose?: InfernoEventHandler<T> | undefined;
    open?: boolean | undefined;
  }

  interface EmbedHTMLAttributes<T> extends HTMLAttributes<T> {
    height?: number | string | undefined;
    src?: string | undefined;
    type?: string | undefined;
    width?: number | string | undefined;
  }

  interface FieldsetHTMLAttributes<T> extends HTMLAttributes<T> {
    disabled?: boolean | undefined;
    form?: string | undefined;
    name?: string | undefined;
  }

  interface FormHTMLAttributes<T> extends HTMLAttributes<T> {
    acceptCharset?: string | undefined;
    action?: string | undefined;
    autoComplete?: string | undefined;
    encType?: string | undefined;
    method?: string | undefined;
    name?: string | undefined;
    noValidate?: boolean | undefined;
    target?: string | undefined;
  }

  interface HtmlHTMLAttributes<T> extends HTMLAttributes<T> {
    manifest?: string | undefined;
  }

  interface IframeHTMLAttributes<T> extends HTMLAttributes<T> {
    allow?: string | undefined;
    allowFullScreen?: boolean | undefined;
    allowTransparency?: boolean | undefined;
    /** @deprecated */
    frameBorder?: number | string | undefined;
    height?: number | string | undefined;
    loading?: 'eager' | 'lazy' | undefined;
    /** @deprecated */
    marginHeight?: number | undefined;
    /** @deprecated */
    marginWidth?: number | undefined;
    name?: string | undefined;
    referrerPolicy?: HTMLAttributeReferrerPolicy | undefined;
    sandbox?: string | undefined;
    /** @deprecated */
    scrolling?: string | undefined;
    seamless?: boolean | undefined;
    src?: string | undefined;
    srcDoc?: string | undefined;
    width?: number | string | undefined;
  }

  interface ImgHTMLAttributes<T> extends HTMLAttributes<T> {
    alt?: string | undefined;
    crossOrigin?: 'anonymous' | 'use-credentials' | '' | undefined;
    decoding?: 'async' | 'auto' | 'sync' | undefined;
    height?: number | string | undefined;
    loading?: 'eager' | 'lazy' | undefined;
    referrerPolicy?: HTMLAttributeReferrerPolicy | undefined;
    sizes?: string | undefined;
    src?: string | undefined;
    srcSet?: string | undefined;
    useMap?: string | undefined;
    width?: number | string | undefined;
  }

  interface InsHTMLAttributes<T> extends HTMLAttributes<T> {
    cite?: string | undefined;
    dateTime?: string | undefined;
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
    accept?: string | undefined;
    alt?: string | undefined;
    autoComplete?: string | undefined;
    autoFocus?: boolean | undefined;
    capture?: boolean | 'user' | 'environment' | undefined; // https://www.w3.org/TR/html-media-capture/#the-capture-attribute
    checked?: boolean | undefined;
    crossOrigin?: string | undefined;
    disabled?: boolean | undefined;
    enterKeyHint?: 'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send' | undefined;
    form?: string | undefined;
    formAction?: string | undefined;
    formEncType?: string | undefined;
    formMethod?: string | undefined;
    formNoValidate?: boolean | undefined;
    formTarget?: string | undefined;
    height?: number | string | undefined;
    list?: string | undefined;
    max?: number | string | undefined;
    maxLength?: number | undefined;
    min?: number | string | undefined;
    minLength?: number | undefined;
    multiple?: boolean | undefined;
    name?: string | undefined;
    pattern?: string | undefined;
    placeholder?: string | undefined;
    readOnly?: boolean | undefined;
    required?: boolean | undefined;
    size?: number | undefined;
    src?: string | undefined;
    step?: number | string | undefined;
    type?: HTMLInputTypeAttribute | undefined;
    value?: string | ReadonlyArray<string> | number | undefined;
    width?: number | string | undefined;
  }

  interface KeygenHTMLAttributes<T> extends HTMLAttributes<T> {
    autoFocus?: boolean | undefined;
    challenge?: string | undefined;
    disabled?: boolean | undefined;
    form?: string | undefined;
    keyType?: string | undefined;
    keyParams?: string | undefined;
    name?: string | undefined;
  }

  interface LabelHTMLAttributes<T> extends HTMLAttributes<T> {
    form?: string | undefined;
    htmlFor?: string | undefined;
  }

  interface LiHTMLAttributes<T> extends HTMLAttributes<T> {
    value?: string | ReadonlyArray<string> | number | undefined;
  }

  interface LinkHTMLAttributes<T> extends HTMLAttributes<T> {
    as?: string | undefined;
    crossOrigin?: string | undefined;
    href?: string | undefined;
    hrefLang?: string | undefined;
    integrity?: string | undefined;
    media?: string | undefined;
    imageSrcSet?: string | undefined;
    imageSizes?: string | undefined;
    referrerPolicy?: HTMLAttributeReferrerPolicy | undefined;
    rel?: string | undefined;
    sizes?: string | undefined;
    type?: string | undefined;
    charSet?: string | undefined;
  }

  interface MapHTMLAttributes<T> extends HTMLAttributes<T> {
    name?: string | undefined;
  }

  interface MenuHTMLAttributes<T> extends HTMLAttributes<T> {
    type?: string | undefined;
  }

  interface MediaHTMLAttributes<T> extends HTMLAttributes<T> {
    autoPlay?: boolean | undefined;
    controls?: boolean | undefined;
    controlsList?: string | undefined;
    crossOrigin?: string | undefined;
    loop?: boolean | undefined;
    mediaGroup?: string | undefined;
    muted?: boolean | undefined;
    playsInline?: boolean | undefined;
    preload?: string | undefined;
    src?: string | undefined;
  }

  interface MetaHTMLAttributes<T> extends HTMLAttributes<T> {
    charSet?: string | undefined;
    content?: string | undefined;
    httpEquiv?: string | undefined;
    name?: string | undefined;
    media?: string | undefined;
  }

  interface MeterHTMLAttributes<T> extends HTMLAttributes<T> {
    form?: string | undefined;
    high?: number | undefined;
    low?: number | undefined;
    max?: number | string | undefined;
    min?: number | string | undefined;
    optimum?: number | undefined;
    value?: string | ReadonlyArray<string> | number | undefined;
  }

  interface QuoteHTMLAttributes<T> extends HTMLAttributes<T> {
    cite?: string | undefined;
  }

  interface ObjectHTMLAttributes<T> extends HTMLAttributes<T> {
    classID?: string | undefined;
    data?: string | undefined;
    form?: string | undefined;
    height?: number | string | undefined;
    name?: string | undefined;
    type?: string | undefined;
    useMap?: string | undefined;
    width?: number | string | undefined;
    wmode?: string | undefined;
  }

  interface OlHTMLAttributes<T> extends HTMLAttributes<T> {
    reversed?: boolean | undefined;
    start?: number | undefined;
    type?: '1' | 'a' | 'A' | 'i' | 'I' | undefined;
  }

  interface OptgroupHTMLAttributes<T> extends HTMLAttributes<T> {
    disabled?: boolean | undefined;
    label?: string | undefined;
  }

  interface OptionHTMLAttributes<T> extends HTMLAttributes<T> {
    disabled?: boolean | undefined;
    label?: string | undefined;
    selected?: boolean | undefined;
    value?: string | ReadonlyArray<string> | number | undefined;
  }

  interface OutputHTMLAttributes<T> extends HTMLAttributes<T> {
    form?: string | undefined;
    htmlFor?: string | undefined;
    name?: string | undefined;
  }

  interface ParamHTMLAttributes<T> extends HTMLAttributes<T> {
    name?: string | undefined;
    value?: string | ReadonlyArray<string> | number | undefined;
  }

  interface ProgressHTMLAttributes<T> extends HTMLAttributes<T> {
    max?: number | string | undefined;
    value?: string | ReadonlyArray<string> | number | undefined;
  }

  interface SlotHTMLAttributes<T> extends HTMLAttributes<T> {
    name?: string | undefined;
  }

  interface ScriptHTMLAttributes<T> extends HTMLAttributes<T> {
    async?: boolean | undefined;
    /** @deprecated */
    charSet?: string | undefined;
    crossOrigin?: string | undefined;
    defer?: boolean | undefined;
    integrity?: string | undefined;
    noModule?: boolean | undefined;
    nonce?: string | undefined;
    referrerPolicy?: HTMLAttributeReferrerPolicy | undefined;
    src?: string | undefined;
    type?: string | undefined;
  }

  interface SelectHTMLAttributes<T> extends HTMLAttributes<T> {
    autoComplete?: string | undefined;
    autoFocus?: boolean | undefined;
    disabled?: boolean | undefined;
    form?: string | undefined;
    multiple?: boolean | undefined;
    name?: string | undefined;
    required?: boolean | undefined;
    size?: number | undefined;
    value?: string | ReadonlyArray<string> | number | undefined;
  }

  interface SourceHTMLAttributes<T> extends HTMLAttributes<T> {
    height?: number | string | undefined;
    media?: string | undefined;
    sizes?: string | undefined;
    src?: string | undefined;
    srcSet?: string | undefined;
    type?: string | undefined;
    width?: number | string | undefined;
  }

  interface StyleHTMLAttributes<T> extends HTMLAttributes<T> {
    media?: string | undefined;
    nonce?: string | undefined;
    scoped?: boolean | undefined;
    type?: string | undefined;
  }

  interface TableHTMLAttributes<T> extends HTMLAttributes<T> {
    align?: 'left' | 'center' | 'right' | undefined;
    bgcolor?: string | undefined;
    border?: number | undefined;
    cellPadding?: number | string | undefined;
    cellSpacing?: number | string | undefined;
    frame?: boolean | undefined;
    rules?: 'none' | 'groups' | 'rows' | 'columns' | 'all' | undefined;
    summary?: string | undefined;
    width?: number | string | undefined;
  }

  interface TextareaHTMLAttributes<T> extends HTMLAttributes<T> {
    autoComplete?: string | undefined;
    autoFocus?: boolean | undefined;
    cols?: number | undefined;
    dirName?: string | undefined;
    disabled?: boolean | undefined;
    form?: string | undefined;
    maxLength?: number | undefined;
    minLength?: number | undefined;
    name?: string | undefined;
    placeholder?: string | undefined;
    readOnly?: boolean | undefined;
    required?: boolean | undefined;
    rows?: number | undefined;
    value?: string | ReadonlyArray<string> | number | undefined;
    wrap?: string | undefined;
  }

  interface TdHTMLAttributes<T> extends HTMLAttributes<T> {
    align?: 'left' | 'center' | 'right' | 'justify' | 'char' | undefined;
    colSpan?: number | undefined;
    headers?: string | undefined;
    rowSpan?: number | undefined;
    scope?: string | undefined;
    abbr?: string | undefined;
    height?: number | string | undefined;
    width?: number | string | undefined;
    valign?: 'top' | 'middle' | 'bottom' | 'baseline' | undefined;
  }

  interface ThHTMLAttributes<T> extends HTMLAttributes<T> {
    align?: 'left' | 'center' | 'right' | 'justify' | 'char' | undefined;
    colSpan?: number | undefined;
    headers?: string | undefined;
    rowSpan?: number | undefined;
    scope?: string | undefined;
    abbr?: string | undefined;
  }

  interface TimeHTMLAttributes<T> extends HTMLAttributes<T> {
    dateTime?: string | undefined;
  }

  interface TrackHTMLAttributes<T> extends HTMLAttributes<T> {
    default?: boolean | undefined;
    kind?: string | undefined;
    label?: string | undefined;
    src?: string | undefined;
    srcLang?: string | undefined;
  }

  interface VideoHTMLAttributes<T> extends MediaHTMLAttributes<T> {
    height?: number | string | undefined;
    playsInline?: boolean | undefined;
    poster?: string | undefined;
    width?: number | string | undefined;
    disablePictureInPicture?: boolean | undefined;
    disableRemotePlayback?: boolean | undefined;
  }

  // this list is "complete" in that it contains every SVG attribute
  //
  // The three broad type categories are (in order of restrictiveness):
  //   - "number | string"
  //   - "string"
  //   - union of string literals
  interface SVGAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    // Attributes which also defined in HTMLAttributes
    // See comment in SVGDOMPropertyConfig.js
    className?: string | undefined;
    color?: string | undefined;
    height?: number | string | undefined;
    id?: string | undefined;
    lang?: string | undefined;
    max?: number | string | undefined;
    media?: string | undefined;
    method?: string | undefined;
    min?: number | string | undefined;
    name?: string | undefined;
    style?: any;
    target?: string | undefined;
    type?: string | undefined;
    width?: number | string | undefined;

    // Other HTML properties supported by SVG elements in browsers
    role?: AriaRole | undefined;
    tabIndex?: number | undefined;
    crossOrigin?: 'anonymous' | 'use-credentials' | '' | undefined;

    // SVG Specific attributes
    accentHeight?: number | string | undefined;
    accumulate?: 'none' | 'sum' | undefined;
    additive?: 'replace' | 'sum' | undefined;
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
    allowReorder?: 'no' | 'yes' | undefined;
    alphabetic?: number | string | undefined;
    amplitude?: number | string | undefined;
    arabicForm?: 'initial' | 'medial' | 'terminal' | 'isolated' | undefined;
    ascent?: number | string | undefined;
    attributeName?: string | undefined;
    attributeType?: string | undefined;
    autoReverse?: Booleanish | undefined;
    azimuth?: number | string | undefined;
    baseFrequency?: number | string | undefined;
    baselineShift?: number | string | undefined;
    baseProfile?: number | string | undefined;
    bbox?: number | string | undefined;
    begin?: number | string | undefined;
    bias?: number | string | undefined;
    by?: number | string | undefined;
    calcMode?: number | string | undefined;
    capHeight?: number | string | undefined;
    clip?: number | string | undefined;
    clipPath?: string | undefined;
    clipPathUnits?: number | string | undefined;
    clipRule?: number | string | undefined;
    colorInterpolation?: number | string | undefined;
    colorInterpolationFilters?: 'auto' | 'sRGB' | 'linearRGB' | 'inherit' | undefined;
    colorProfile?: number | string | undefined;
    colorRendering?: number | string | undefined;
    contentScriptType?: number | string | undefined;
    contentStyleType?: number | string | undefined;
    cursor?: number | string | undefined;
    cx?: number | string | undefined;
    cy?: number | string | undefined;
    d?: string | undefined;
    decelerate?: number | string | undefined;
    descent?: number | string | undefined;
    diffuseConstant?: number | string | undefined;
    direction?: number | string | undefined;
    display?: number | string | undefined;
    divisor?: number | string | undefined;
    dominantBaseline?: number | string | undefined;
    dur?: number | string | undefined;
    dx?: number | string | undefined;
    dy?: number | string | undefined;
    edgeMode?: number | string | undefined;
    elevation?: number | string | undefined;
    enableBackground?: number | string | undefined;
    end?: number | string | undefined;
    exponent?: number | string | undefined;
    externalResourcesRequired?: Booleanish | undefined;
    fill?: string | undefined;
    fillOpacity?: number | string | undefined;
    fillRule?: 'nonzero' | 'evenodd' | 'inherit' | undefined;
    filter?: string | undefined;
    filterRes?: number | string | undefined;
    filterUnits?: number | string | undefined;
    floodColor?: number | string | undefined;
    floodOpacity?: number | string | undefined;
    focusable?: Booleanish | 'auto' | undefined;
    fontFamily?: string | undefined;
    fontSize?: number | string | undefined;
    fontSizeAdjust?: number | string | undefined;
    fontStretch?: number | string | undefined;
    fontStyle?: number | string | undefined;
    fontVariant?: number | string | undefined;
    fontWeight?: number | string | undefined;
    format?: number | string | undefined;
    fr?: number | string | undefined;
    from?: number | string | undefined;
    fx?: number | string | undefined;
    fy?: number | string | undefined;
    g1?: number | string | undefined;
    g2?: number | string | undefined;
    glyphName?: number | string | undefined;
    glyphOrientationHorizontal?: number | string | undefined;
    glyphOrientationVertical?: number | string | undefined;
    glyphRef?: number | string | undefined;
    gradientTransform?: string | undefined;
    gradientUnits?: string | undefined;
    hanging?: number | string | undefined;
    horizAdvX?: number | string | undefined;
    horizOriginX?: number | string | undefined;
    href?: string | undefined;
    ideographic?: number | string | undefined;
    imageRendering?: number | string | undefined;
    in2?: number | string | undefined;
    in?: string | undefined;
    intercept?: number | string | undefined;
    k1?: number | string | undefined;
    k2?: number | string | undefined;
    k3?: number | string | undefined;
    k4?: number | string | undefined;
    k?: number | string | undefined;
    kernelMatrix?: number | string | undefined;
    kernelUnitLength?: number | string | undefined;
    kerning?: number | string | undefined;
    keyPoints?: number | string | undefined;
    keySplines?: number | string | undefined;
    keyTimes?: number | string | undefined;
    lengthAdjust?: number | string | undefined;
    letterSpacing?: number | string | undefined;
    lightingColor?: number | string | undefined;
    limitingConeAngle?: number | string | undefined;
    local?: number | string | undefined;
    markerEnd?: string | undefined;
    markerHeight?: number | string | undefined;
    markerMid?: string | undefined;
    markerStart?: string | undefined;
    markerUnits?: number | string | undefined;
    markerWidth?: number | string | undefined;
    mask?: string | undefined;
    maskContentUnits?: number | string | undefined;
    maskUnits?: number | string | undefined;
    mathematical?: number | string | undefined;
    mode?: number | string | undefined;
    numOctaves?: number | string | undefined;
    offset?: number | string | undefined;
    opacity?: number | string | undefined;
    operator?: number | string | undefined;
    order?: number | string | undefined;
    orient?: number | string | undefined;
    orientation?: number | string | undefined;
    origin?: number | string | undefined;
    overflow?: number | string | undefined;
    overlinePosition?: number | string | undefined;
    overlineThickness?: number | string | undefined;
    paintOrder?: number | string | undefined;
    panose1?: number | string | undefined;
    path?: string | undefined;
    pathLength?: number | string | undefined;
    patternContentUnits?: string | undefined;
    patternTransform?: number | string | undefined;
    patternUnits?: string | undefined;
    pointerEvents?: number | string | undefined;
    points?: string | undefined;
    pointsAtX?: number | string | undefined;
    pointsAtY?: number | string | undefined;
    pointsAtZ?: number | string | undefined;
    preserveAlpha?: Booleanish | undefined;
    preserveAspectRatio?: string | undefined;
    primitiveUnits?: number | string | undefined;
    r?: number | string | undefined;
    radius?: number | string | undefined;
    refX?: number | string | undefined;
    refY?: number | string | undefined;
    renderingIntent?: number | string | undefined;
    repeatCount?: number | string | undefined;
    repeatDur?: number | string | undefined;
    requiredExtensions?: number | string | undefined;
    requiredFeatures?: number | string | undefined;
    restart?: number | string | undefined;
    result?: string | undefined;
    rotate?: number | string | undefined;
    rx?: number | string | undefined;
    ry?: number | string | undefined;
    scale?: number | string | undefined;
    seed?: number | string | undefined;
    shapeRendering?: number | string | undefined;
    slope?: number | string | undefined;
    spacing?: number | string | undefined;
    specularConstant?: number | string | undefined;
    specularExponent?: number | string | undefined;
    speed?: number | string | undefined;
    spreadMethod?: string | undefined;
    startOffset?: number | string | undefined;
    stdDeviation?: number | string | undefined;
    stemh?: number | string | undefined;
    stemv?: number | string | undefined;
    stitchTiles?: number | string | undefined;
    stopColor?: string | undefined;
    stopOpacity?: number | string | undefined;
    strikethroughPosition?: number | string | undefined;
    strikethroughThickness?: number | string | undefined;
    string?: number | string | undefined;
    stroke?: string | undefined;
    strokeDasharray?: string | number | undefined;
    strokeDashoffset?: string | number | undefined;
    strokeLinecap?: 'butt' | 'round' | 'square' | 'inherit' | undefined;
    strokeLinejoin?: 'miter' | 'round' | 'bevel' | 'inherit' | undefined;
    strokeMiterlimit?: number | string | undefined;
    strokeOpacity?: number | string | undefined;
    strokeWidth?: number | string | undefined;
    surfaceScale?: number | string | undefined;
    systemLanguage?: number | string | undefined;
    tableValues?: number | string | undefined;
    targetX?: number | string | undefined;
    targetY?: number | string | undefined;
    textAnchor?: string | undefined;
    textDecoration?: number | string | undefined;
    textLength?: number | string | undefined;
    textRendering?: number | string | undefined;
    to?: number | string | undefined;
    transform?: string | undefined;
    u1?: number | string | undefined;
    u2?: number | string | undefined;
    underlinePosition?: number | string | undefined;
    underlineThickness?: number | string | undefined;
    unicode?: number | string | undefined;
    unicodeBidi?: number | string | undefined;
    unicodeRange?: number | string | undefined;
    unitsPerEm?: number | string | undefined;
    vAlphabetic?: number | string | undefined;
    values?: string | undefined;
    vectorEffect?: number | string | undefined;
    version?: string | undefined;
    vertAdvY?: number | string | undefined;
    vertOriginX?: number | string | undefined;
    vertOriginY?: number | string | undefined;
    vHanging?: number | string | undefined;
    vIdeographic?: number | string | undefined;
    viewBox?: string | undefined;
    viewTarget?: number | string | undefined;
    visibility?: number | string | undefined;
    vMathematical?: number | string | undefined;
    widths?: number | string | undefined;
    wordSpacing?: number | string | undefined;
    writingMode?: number | string | undefined;
    x1?: number | string | undefined;
    x2?: number | string | undefined;
    x?: number | string | undefined;
    xChannelSelector?: string | undefined;
    xHeight?: number | string | undefined;
    xlinkActuate?: string | undefined;
    xlinkArcrole?: string | undefined;
    xlinkHref?: string | undefined;
    xlinkRole?: string | undefined;
    xlinkShow?: string | undefined;
    xlinkTitle?: string | undefined;
    xlinkType?: string | undefined;
    xmlBase?: string | undefined;
    xmlLang?: string | undefined;
    xmlns?: string | undefined;
    xmlnsXlink?: string | undefined;
    xmlSpace?: string | undefined;
    y1?: number | string | undefined;
    y2?: number | string | undefined;
    y?: number | string | undefined;
    yChannelSelector?: string | undefined;
    z?: number | string | undefined;
    zoomAndPan?: string | undefined;
  }

  interface WebViewHTMLAttributes<T> extends HTMLAttributes<T> {
    allowFullScreen?: boolean | undefined;
    allowpopups?: boolean | undefined;
    autoFocus?: boolean | undefined;
    autosize?: boolean | undefined;
    blinkfeatures?: string | undefined;
    disableblinkfeatures?: string | undefined;
    disableguestresize?: boolean | undefined;
    disablewebsecurity?: boolean | undefined;
    guestinstance?: string | undefined;
    httpreferrer?: string | undefined;
    nodeintegration?: boolean | undefined;
    partition?: string | undefined;
    plugins?: boolean | undefined;
    preload?: string | undefined;
    src?: string | undefined;
    useragent?: string | undefined;
    webpreferences?: string | undefined;
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
    // tslint:disable-next-line:no-empty-interface
    type Element = Inferno.InfernoElement<any> | Inferno.InfernoNode;
    interface ElementClass extends IComponent<any, any> {
      render(nextProps, nextState, nextContext): Inferno.InfernoNode;
    }
    interface ElementAttributesProperty {
      props: {};
    }
    interface ElementChildrenAttribute {
      children: {};
    }

    type LibraryManagedAttributes<C, P> = InfernoManagedAttributes<C, P>;

    // tslint:disable-next-line:no-empty-interface
    // interface IntrinsicAttributes extends Inferno.Attributes { }
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
    }
  }
}
