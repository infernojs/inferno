import {EMPTY_OBJ} from 'inferno';
import {
  combineFrom,
  isFunction,
  isInvalid,
  isNull,
  isNullOrUndef,
  isNumber,
  isString,
  isUndefined,
  throwError
} from 'inferno-shared';
import {ChildFlags, VNodeFlags} from 'inferno-vnode-flags';
import {Readable} from 'stream';
import {renderStylesToString} from './prop-renderers';
import {createDerivedState, escapeText, isAttributeNameSafe, voidElements} from './utils';

export class RenderQueueStream extends Readable {
  public collector: any[] = [Infinity]; // Infinity marks the end of the stream
  public promises: any[] = [];

  constructor(initNode) {
    super();
    this.pushQueue = this.pushQueue.bind(this);
    if (initNode) {
      this.renderVNodeToQueue(initNode, null, null);
    }
  }

  public _read() {
    setTimeout(this.pushQueue, 0);
  }

  public addToQueue(node, position) {
    // Positioning defined, stack it
    if (!isNullOrUndef(position)) {
      const lastSlot = this.promises[position].length - 1;
      // Combine as array or push into promise collector
      if (typeof this.promises[position][lastSlot] === 'string' && typeof node === 'string') {
        this.promises[position][lastSlot] += node;
      } else {
        this.promises[position].push(node);
      }
      // Collector is empty push to stream
    } else if (typeof node === 'string' && this.collector.length - 1 === 0) {
      this.push(node);
      // Last element in collector and incoming are same then concat
    } else if (typeof node === 'string' && typeof this.collector[this.collector.length - 2] === 'string') {
      this.collector[this.collector.length - 2] += node;
      // Push the element to collector (before Infinity)
    } else {
      this.collector.splice(-1, 0, node);
    }
  }

  public pushQueue() {
    const chunk = this.collector[0];
    // Output strings directly
    if (typeof chunk === 'string') {
      this.push(chunk);
      this.collector.shift();
      // For fulfilled promises, merge into collector
    } else if (!!chunk && (typeof chunk === 'object' || isFunction(chunk)) && isFunction(chunk.then)) {
      const self = this;
      chunk.then(index => {
        self.collector.splice(0, 1, ...self.promises[index]);
        self.promises[index] = null;
        setTimeout(self.pushQueue, 0);
      });
      this.collector[0] = null;
      // End of content
    } else if (chunk === Infinity) {
      this.emit('end');
    }
  }

  public renderVNodeToQueue(vNode, context, position) {
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
        const hasNewAPI = Boolean(type.getDerivedStateFromProps);
        instance.$BS = false;
        instance.$SSR = true;
        let childContext;
        if (!isUndefined(instance.getChildContext)) {
          childContext = instance.getChildContext();
        }
        if (!isNullOrUndef(childContext)) {
          context = combineFrom(context, childContext);
        }
        if (instance.props === EMPTY_OBJ) {
          instance.props = props;
        }
        instance.context = context;
        // Trigger lifecycle hook
        if (!hasNewAPI && isFunction(instance.componentWillMount)) {
          instance.$BR = true;
          instance.componentWillMount();
          const pending = instance.$PS;

          if (pending) {
            const state = instance.state;

            if (state === null) {
              instance.state = pending;
            } else {
              for (const key in pending) {
                state[key] = pending[key];
              }
            }
            instance.$PS = null;
          }
          instance.$BR = false;
        }
        // Trigger extra promise-based lifecycle hook
        if (isFunction(instance.getInitialProps)) {
          const initialProps = instance.getInitialProps(instance.props, instance.context);
          if (initialProps) {
            if (Promise.resolve(initialProps) === initialProps) {
              const promisePosition = this.promises.push([]) - 1;
              this.addToQueue(
                initialProps.then(dataForContext => {
                  if (typeof dataForContext === 'object') {
                    instance.props = combineFrom(instance.props, dataForContext);
                  }

                  const renderOut = instance.render(instance.props, instance.state, instance.context);
                  if (isInvalid(renderOut)) {
                    this.addToQueue('<!--!-->', promisePosition);
                  } else if (isString(renderOut)) {
                    this.addToQueue(escapeText(renderOut), promisePosition);
                  } else if (isNumber(renderOut)) {
                    this.addToQueue(renderOut + '', promisePosition);
                  } else {
                    this.renderVNodeToQueue(renderOut, instance.context, promisePosition);
                  }

                  setTimeout(this.pushQueue, 0);
                  return promisePosition;
                }),
                position
              );
              return;
            } else {
              instance.props = combineFrom(instance.props, initialProps);
            }
          }
        }
        if (hasNewAPI) {
          instance.state = createDerivedState(instance, props, instance.state);
        }
        const renderOutput = instance.render(instance.props, instance.state, instance.context);

        if (isInvalid(renderOutput)) {
          this.addToQueue('<!--!-->', position);
        } else if (isString(renderOutput)) {
          this.addToQueue(escapeText(renderOutput), position);
        } else if (isNumber(renderOutput)) {
          this.addToQueue(renderOutput + '', position);
        } else {
          this.renderVNodeToQueue(renderOutput, context, position);
        }
      } else {
        const renderOutput = type(props, context);

        if (isInvalid(renderOutput)) {
          this.addToQueue('<!--!-->', position);
        } else if (isString(renderOutput)) {
          this.addToQueue(escapeText(renderOutput), position);
        } else if (isNumber(renderOutput)) {
          this.addToQueue(renderOutput + '', position);
        } else {
          this.renderVNodeToQueue(renderOutput, context, position);
        }
      }
      // If an element
    } else if ((flags & VNodeFlags.Element) > 0) {
      let renderedString = `<${type}`;
      let html;
      const isVoidElement = voidElements.has(type);
      const className = vNode.className;

      if (isString(className)) {
        renderedString += ` class="${escapeText(className)}"`;
      } else if (isNumber(className)) {
        renderedString += ` class="${className}"`;
      }

      if (!isNull(props)) {
        for (const prop in props) {
          const value = props[prop];

          switch (prop) {
            case 'dangerouslySetInnerHTML':
              html = value.__html;
              break;
            case 'style':
              if (!isNullOrUndef(props.style)) {
                renderedString += ` style="${renderStylesToString(props.style)}"`;
              }
              break;
            case 'children':
            case 'className':
              // Ignore
              break;
            case 'defaultValue':
              // Use default values if normal values are not present
              if (!props.value) {
                renderedString += ` value="${isString(value) ? escapeText(value) : value}"`;
              }
              break;
            case 'defaultChecked':
              // Use default values if normal values are not present
              if (!props.checked) {
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
      }
      renderedString += `>`;

      if (String(type).match(/[\s\n\/='"\0<>]/)) {
        throw renderedString;
      }

      // Voided element, push directly to queue
      if (isVoidElement) {
        this.addToQueue(renderedString, position);
        // Regular element with content
      } else {
        // Element has children, build them in
        const childFlags = vNode.childFlags;

        if (childFlags === ChildFlags.HasVNodeChildren) {
          this.addToQueue(renderedString, position);
          this.renderVNodeToQueue(children, context, position);
          this.addToQueue('</' + type + '>', position);
          return;
        } else if (childFlags === ChildFlags.HasTextChildren) {
          this.addToQueue(renderedString, position);
          this.addToQueue(children === '' ? ' ' : escapeText(children + ''), position);
          this.addToQueue('</' + type + '>', position);
          return;
        } else if (childFlags & ChildFlags.MultipleChildren) {
          this.addToQueue(renderedString, position);
          for (let i = 0, len = children.length; i < len; ++i) {
            this.renderVNodeToQueue(children[i], context, position);
          }
          this.addToQueue('</' + type + '>', position);
          return;
        }
        if (html) {
          this.addToQueue(renderedString + html + '</' + type + '>', position);
          return;
        }
        // Close element if it's not void
        if (!isVoidElement) {
          this.addToQueue(renderedString + '</' + type + '>', position);
        }
      }
      // Push text directly to queue
    } else if ((flags & VNodeFlags.Text) > 0) {
      this.addToQueue(children === '' ? ' ' : escapeText(children), position);
      // Handle errors
    } else {
      if (process.env.NODE_ENV !== 'production') {
        if (typeof vNode === 'object') {
          throwError(`renderToString() received an object that's not a valid VNode, you should stringify it first. Object: "${JSON.stringify(vNode)}".`);
        } else {
          throwError(`renderToString() expects a valid VNode, instead it received an object with the type "${typeof vNode}".`);
        }
      }
      throwError();
    }
  }
}

export function streamQueueAsString(node) {
  return new RenderQueueStream(node);
}
