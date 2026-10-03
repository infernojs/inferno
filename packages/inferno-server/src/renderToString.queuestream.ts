import { EMPTY_OBJ } from 'inferno';
import {
  isFunction,
  isInvalid,
  isNull,
  isNullOrUndef,
  isNumber,
  isString,
  throwError,
} from 'inferno-shared';
import { ChildFlags, VNodeFlags } from 'inferno-vnode-flags';
import { Readable } from 'stream';
import { renderStyleAttribute } from './prop-renderers';
import {
  arrayToFragment,
  createDerivedState,
  escapeText,
  getChildContext,
  getChildSelectValue,
  getTextareaContent,
  isAttributeNameSafe,
  isEmptyFragment,
  isSelectedOption,
  renderFunctionalComponent,
  usesNewAPI,
  validateTagName,
  voidElements,
} from './utils';
import { mergePendingState } from './stream/streamUtils';

export class RenderQueueStream extends Readable {
  public collector: any[] = [Infinity]; // Infinity marks the end of the stream
  public promises: any[] = [];

  constructor(initNode) {
    super();
    this.pushQueue = this.pushQueue.bind(this);
    if (initNode) {
      this.renderVNodeToQueue(initNode, {}, null);
    }
  }

  public _read(): void {
    setTimeout(this.pushQueue, 0);
  }

  public addToQueue(node, position): void {
    // Positioning defined, stack it
    if (!isNullOrUndef(position)) {
      const lastSlot = this.promises[position].length - 1;
      // Combine as array or push into promise collector
      if (isString(this.promises[position][lastSlot]) && isString(node)) {
        this.promises[position][lastSlot] += node;
      } else {
        this.promises[position].push(node);
      }
      // Collector is empty push to stream
    } else if (isString(node) && this.collector.length - 1 === 0) {
      this.push(node);
      // Last element in collector and incoming are same then concat
    } else if (
      isString(node) &&
      isString(this.collector[this.collector.length - 2])
    ) {
      this.collector[this.collector.length - 2] += node;
      // Push the element to collector (before Infinity)
    } else {
      this.collector.splice(-1, 0, node);
    }
  }

  public pushQueue(): void {
    const chunk = this.collector[0];
    // Output strings directly
    if (isString(chunk)) {
      this.push(chunk);
      this.collector.shift();
      // For fulfilled promises, merge into collector
    } else if (
      !!chunk &&
      (typeof chunk === 'object' || isFunction(chunk)) &&
      isFunction(chunk.then)
    ) {
      chunk.then((index) => {
        this.collector.splice(0, 1, ...this.promises[index]);
        this.promises[index] = null;

        setTimeout(this.pushQueue, 0);
      });
      this.collector[0] = null;
      // End of content
    } else if (chunk === Infinity) {
      // Removed so that a pushQueue call that is already scheduled does not push after the end
      this.collector.shift();
      this.push(null);
    }
  }

  public renderVNodeToQueue(
    vNode,
    context,
    position,
    selectValue?: unknown,
  ): void {
    vNode = arrayToFragment(vNode);
    const flags = vNode.flags;
    const type = vNode.type;
    const props = vNode.props || EMPTY_OBJ;
    const children = vNode.children;

    // Handles a component render
    if ((flags & VNodeFlags.Component) > 0) {
      const isClass = flags & VNodeFlags.ComponentClass;
      // Render the
      if (isClass) {
        const instance = new type(props, context);
        const hasNewAPI = usesNewAPI(type, instance);
        instance.$BS = false;
        instance.$SSR = true;
        if (instance.props === EMPTY_OBJ) {
          instance.props = props;
        }
        instance.context = context;
        // Trigger lifecycle hook
        if (!hasNewAPI && isFunction(instance.componentWillMount)) {
          instance.$BR = true;
          instance.componentWillMount();
          mergePendingState(instance);
        }
        // Trigger extra promise-based lifecycle hook
        if (isFunction(instance.getInitialProps)) {
          const initialProps = instance.getInitialProps(
            instance.props,
            instance.context,
          );
          if (initialProps) {
            if (Promise.resolve(initialProps) === initialProps) {
              const promisePosition = this.promises.push([]) - 1;
              this.addToQueue(
                initialProps.then((dataForContext) => {
                  if (typeof dataForContext === 'object') {
                    instance.props = { ...instance.props, ...dataForContext };
                  }
                  if (hasNewAPI) {
                    instance.state = createDerivedState(
                      instance,
                      instance.props,
                      instance.state,
                    );
                  }

                  const renderOut = instance.render(
                    instance.props,
                    instance.state,
                    instance.context,
                  );
                  const childContext = getChildContext(instance, context);
                  if (isInvalid(renderOut)) {
                    this.addToQueue('<!--!-->', promisePosition);
                  } else if (isString(renderOut)) {
                    this.addToQueue(escapeText(renderOut), promisePosition);
                  } else if (isNumber(renderOut)) {
                    this.addToQueue(renderOut + '', promisePosition);
                  } else {
                    this.renderVNodeToQueue(
                      renderOut,
                      childContext,
                      promisePosition,
                      selectValue,
                    );
                  }

                  setTimeout(this.pushQueue, 0);
                  return promisePosition;
                }),
                position,
              );
              return;
            } else {
              instance.props = { ...instance.props, ...initialProps };
            }
          }
        }
        if (hasNewAPI) {
          // instance.props include the props from getInitialProps, the component renders with them
          instance.state = createDerivedState(
            instance,
            instance.props,
            instance.state,
          );
        }
        const renderOutput = instance.render(
          instance.props,
          instance.state,
          instance.context,
        );
        const childContext = getChildContext(instance, context);

        if (isInvalid(renderOutput)) {
          this.addToQueue('<!--!-->', position);
        } else if (isString(renderOutput)) {
          this.addToQueue(escapeText(renderOutput), position);
        } else if (isNumber(renderOutput)) {
          this.addToQueue(renderOutput + '', position);
        } else {
          this.renderVNodeToQueue(
            renderOutput,
            childContext,
            position,
            selectValue,
          );
        }
      } else {
        const renderOutput = renderFunctionalComponent(vNode, context);

        if (isInvalid(renderOutput)) {
          this.addToQueue('<!--!-->', position);
        } else if (isString(renderOutput)) {
          this.addToQueue(escapeText(renderOutput), position);
        } else if (isNumber(renderOutput)) {
          this.addToQueue(renderOutput + '', position);
        } else {
          this.renderVNodeToQueue(renderOutput, context, position, selectValue);
        }
      }
      // If an element
    } else if ((flags & VNodeFlags.Element) > 0) {
      validateTagName(type);

      let renderedString = `<${type}`;
      let html;
      const isVoidElement = voidElements.has(type);
      const isTextarea = type === 'textarea';
      const className = vNode.className;

      if (isString(className)) {
        renderedString += ` class="${escapeText(className)}"`;
      } else if (isNumber(className)) {
        renderedString += ` class="${className}"`;
      }

      if (!isNull(props)) {
        for (const prop in props) {
          const value = props[prop];

          if (isTextarea && (prop === 'value' || prop === 'defaultValue')) {
            continue; // Rendered as the content
          }
          switch (prop) {
            case 'dangerouslySetInnerHTML':
              html = value?.__html;
              break;
            case 'style':
              if (!isNullOrUndef(props.style)) {
                renderedString += renderStyleAttribute(props.style);
              }
              break;
            case 'children':
            case 'className':
              // Ignore
              break;
            case 'defaultValue':
              // Use default values if normal values are not present
              if (isNullOrUndef(props.value)) {
                renderedString += ` value="${
                  isString(value) ? escapeText(value) : value
                }"`;
              }
              break;
            case 'defaultChecked':
              // Use default values if normal values are not present
              if (isNullOrUndef(props.checked) && value === true) {
                renderedString += ` checked="${value}"`;
              }
              break;
            default:
              if (isAttributeNameSafe(prop)) {
                if (isString(value)) {
                  renderedString += ` ${prop}="${escapeText(value)}"`;
                } else if (isNumber(value)) {
                  renderedString += ` ${prop}="${value}"`;
                } else if (value === true) {
                  renderedString += ` ${prop}`;
                }
              }
              break;
          }
        }
        if (isSelectedOption(type, props, selectValue)) {
          renderedString += ` selected`;
        }
        if (isTextarea) {
          html = getTextareaContent(props) ?? html;
        }
      }
      renderedString += `>`;

      // Voided element, push directly to queue
      if (isVoidElement) {
        this.addToQueue(renderedString, position);
        // Regular element with content
      } else {
        // Element has children, build them in
        const childFlags = vNode.childFlags;
        const childSelectValue = getChildSelectValue(type, props, selectValue);

        // The html wins over children, as on the client
        if (html) {
          this.addToQueue(renderedString + html + '</' + type + '>', position);
          return;
        }
        if (childFlags === ChildFlags.HasVNodeChildren) {
          this.addToQueue(renderedString, position);
          this.renderVNodeToQueue(
            children,
            context,
            position,
            childSelectValue,
          );
          this.addToQueue('</' + type + '>', position);
          return;
        } else if (childFlags === ChildFlags.HasTextChildren) {
          this.addToQueue(renderedString, position);
          this.addToQueue(
            children === '' ? ' ' : escapeText(children + ''),
            position,
          );
          this.addToQueue('</' + type + '>', position);
          return;
        } else if (childFlags & ChildFlags.MultipleChildren) {
          this.addToQueue(renderedString, position);
          for (let i = 0, len = children.length; i < len; ++i) {
            const child = children[i];
            this.renderVNodeToQueue(child, context, position, childSelectValue);
          }
          this.addToQueue('</' + type + '>', position);
          return;
        }
        // Close element if it's not void
        if (!isVoidElement) {
          this.addToQueue(renderedString + '</' + type + '>', position);
        }
      }
      // Push text directly to queue
    } else if ((flags & VNodeFlags.Text) > 0) {
      this.addToQueue(
        children === '' ? ' ' : escapeText(children + ''),
        position,
      );
      // Handle fragments
    } else if ((flags & VNodeFlags.Fragment) !== 0) {
      if (isEmptyFragment(vNode)) {
        this.addToQueue('<!--!-->', position);
      } else if (vNode.childFlags === ChildFlags.HasVNodeChildren) {
        this.renderVNodeToQueue(children, context, position, selectValue);
      } else {
        for (let i = 0, len = children.length; i < len; ++i) {
          const child = children[i];
          this.renderVNodeToQueue(child, context, position, selectValue);
        }
      }
      // Handle errors
    } else {
      if (process.env.NODE_ENV !== 'production') {
        if (typeof vNode === 'object') {
          throwError(
            `renderToString() received an object that's not a valid VNode, you should stringify it first. Object: "${JSON.stringify(
              vNode,
            )}".`,
          );
        } else {
          throwError(
            `renderToString() expects a valid VNode, instead it received an object with the type "${typeof vNode}".`,
          );
        }
      }
      throwError();
    }
  }
}

export function streamQueueAsString(node): RenderQueueStream {
  return new RenderQueueStream(node);
}
