/**
 * @module Inferno-Server
 */ /** TypeDoc Comment */

import { combineFrom, isFunction, isInvalid, isNull, isNullOrUndef, isNumber, isString, isTrue } from 'inferno-shared';
import { ChildFlags, VNodeFlags } from 'inferno-vnode-flags';
import { Readable } from 'stream';
import { renderStylesToString } from './prop-renderers';
import { escapeText, voidElements } from './utils';
import { VNode } from 'inferno';

const resolvedPromise = Promise.resolve();

export class RenderStream extends Readable {
  public initNode: any;
  public started: boolean = false;

  constructor(initNode) {
    super();
    this.initNode = initNode;
  }

  public _read() {
    if (this.started) {
      return;
    }
    this.started = true;

    resolvedPromise
      .then(() => {
        return this.renderNode(this.initNode, null, false);
      })
      .then(() => {
        this.push(null);
      })
      .catch(err => {
        this.emit('error', err);
      });
  }

  public renderNode(vNode, context, insertComment: boolean) {
    const flags = vNode.flags;

    if ((flags & VNodeFlags.Component) > 0) {
      return this.renderComponent(vNode, context, flags & VNodeFlags.ComponentClass);
    }
    if ((flags & VNodeFlags.Element) > 0) {
      return this.renderElement(vNode, context);
    }

    return this.renderText(vNode, insertComment);
  }

  public renderComponent(vComponent, context, isClass) {
    const type = vComponent.type;
    const props = vComponent.props;

    if (!isClass) {
      const renderOutput = type(props, context);

      if (isInvalid(renderOutput)) {
        return this.push('<!--!-->');
      }
      if (isString(renderOutput)) {
        return this.push(escapeText(renderOutput));
      }
      if (isNumber(renderOutput)) {
        return this.push(renderOutput + '');
      }

      return this.renderNode(renderOutput, context, false);
    }

    const instance = new type(props, context);
    instance.$BS = false;
    let childContext;
    if (isFunction(instance.getChildContext)) {
      childContext = instance.getChildContext();
    }

    if (!isNullOrUndef(childContext)) {
      context = combineFrom(context, childContext);
    }
    instance.context = context;
    instance.$BR = true;

    return Promise.resolve(instance.componentWillMount && instance.componentWillMount()).then(() => {
      if (instance.$PSS) {
        const state = instance.state;
        const pending = instance.$PS;

        if (state === null) {
          instance.state = pending;
        } else {
          for (const key in pending) {
            state[key] = pending[key];
          }
        }
        instance.$PSS = false;
        instance.$PS = null;
      }

      instance.$BR = false;

      const renderOutput = instance.render(instance.props, instance.state, instance.context);
      instance.$PSS = false;

      if (isInvalid(renderOutput)) {
        return this.push('<!--!-->');
      }
      if (isString(renderOutput)) {
        return this.push(escapeText(renderOutput));
      }
      if (isNumber(renderOutput)) {
        return this.push(renderOutput + '');
      }

      return this.renderNode(renderOutput, context, false);
    });
  }

  public renderChildren(children: VNode[] | VNode, context: any, childFlags: ChildFlags) {
    if (childFlags & ChildFlags.HasVNodeChildren) {
      return this.renderNode(children, context, false);
    }
    if (childFlags & ChildFlags.MultipleChildren) {
      return (children as VNode[]).reduce((p, child) => {
        return p.then(insertComment => {
          if ((child.flags & VNodeFlags.Text) > 0) {
            if (insertComment) {
              this.push('<!---->');
            }
          }
          return Promise.resolve(this.renderNode(child, context, false)).then(() => !!(child.flags & VNodeFlags.Text));
        });
      }, Promise.resolve(false));
    }
  }

  public renderText(vNode, insertComment) {
    this.push((insertComment ? '<!---->' : '') + (vNode.children === '' ? ' ' : escapeText(vNode.children)));
  }

  public renderElement(vNode, context) {
    const type = vNode.type;
    const props = vNode.props;
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

        if (prop === 'dangerouslySetInnerHTML') {
          html = value.__html;
        } else if (prop === 'style' && !isNullOrUndef(props.style)) {
          renderedString += ` style="${renderStylesToString(props.style)}"`;
        } else if (prop === 'children') {
          // Ignore children as prop.
        } else if (prop === 'defaultValue') {
          // Use default values if normal values are not present
          if (!props.value) {
            renderedString += ` value="${isString(value) ? escapeText(value) : value}"`;
          }
        } else if (prop === 'defaultChecked') {
          // Use default values if normal values are not present
          if (!props.checked) {
            renderedString += ` checked="${value}"`;
          }
        } else {
          if (isString(value)) {
            renderedString += ` ${prop}="${escapeText(value)}"`;
          } else if (isNumber(value)) {
            renderedString += ` ${prop}="${value}"`;
          } else if (isTrue(value)) {
            renderedString += ` ${prop}`;
          }
        }
      }
    }
    if (isVoidElement) {
      renderedString += `>`;
      this.push(renderedString);
      return;
    } else {
      renderedString += `>`;
      this.push(renderedString);
      if (html) {
        this.push(html);
        this.push(`</${type}>`);
        return;
      }
    }
    const childFlags = vNode.childFlags;

    if (childFlags & ChildFlags.HasInvalidChildren) {
      this.push(`</${type}>`);
      return;
    }
    return Promise.resolve(this.renderChildren(vNode.children, context, childFlags)).then(() => {
      this.push(`</${type}>`);
    });
  }
}

export function streamAsString(node) {
  return new RenderStream(node);
}
