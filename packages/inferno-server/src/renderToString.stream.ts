/**
 * @module Inferno-Server
 */ /** TypeDoc Comment */

import {
  combineFrom,
  isArray,
  isFunction,
  isInvalid,
  isNullOrUndef,
  isNumber,
  isString,
  isStringOrNumber
} from "inferno-shared";
import VNodeFlags from "inferno-vnode-flags";
import { Readable } from "stream";
import { renderAttributes, renderStylesToString } from "./prop-renderers";
import { escapeText, voidElements } from "./utils";

const resolvedPromise = Promise.resolve();

export class RenderStream extends Readable {
  public initNode: any;
  public staticMarkup: any;
  public started: boolean = false;

  constructor(initNode, staticMarkup) {
    super();
    this.initNode = initNode;
    this.staticMarkup = staticMarkup;
  }

  public _read() {
    if (this.started) {
      return;
    }
    this.started = true;

    resolvedPromise
      .then(() => {
        return this.renderNode(this.initNode, null, this.staticMarkup);
      })
      .then(() => {
        this.push(null);
      })
      .catch(err => {
        this.emit("error", err);
      });
  }

  public renderNode(vNode, context, isRoot) {
    if (isInvalid(vNode)) {
      return;
    } else {
      const flags = vNode.flags;

      if ((flags & VNodeFlags.Component) > 0) {
        return this.renderComponent(
          vNode,
          isRoot,
          context,
          flags & VNodeFlags.ComponentClass
        );
      }
      if ((flags & VNodeFlags.Element) > 0) {
        return this.renderElement(vNode, isRoot, context);
      }

      return this.renderText(vNode);
    }
  }

  public renderComponent(vComponent, isRoot, context, isClass) {
    const type = vComponent.type;
    const props = vComponent.props;

    if (!isClass) {
      return this.renderNode(type(props), context, isRoot);
    }

    const instance = new type(props);
    instance._blockSetState = false;
    let childContext;
    if (isFunction(instance.getChildContext)) {
      childContext = instance.getChildContext();
    }

    if (!isNullOrUndef(childContext)) {
      context = combineFrom(context, childContext);
    }
    instance.context = context;
    instance._blockRender = true;

    return Promise.resolve(
      instance.componentWillMount && instance.componentWillMount()
    ).then(() => {
      if (instance._pendingSetState) {
        const state = instance.state;
        const pending = instance._pendingState;

        if (state === null) {
          instance.state = pending;
        } else {
          for (const key in pending) {
            state[key] = pending[key];
          }
        }
        instance._pendingSetState = false;
        instance._pendingState = null;
      }

      instance._blockRender = false;

      const node = instance.render(
        instance.props,
        instance.state,
        instance.context
      );
      instance._pendingSetState = false;
      return this.renderNode(node, context, isRoot);
    });
  }

  public renderChildren(children: any, context?: any) {
    if (isString(children)) {
      return this.push(escapeText(children));
    }
    if (isNumber(children)) {
      return this.push(children + "");
    }
    if (!children) {
      return;
    }

    const childrenIsArray = isArray(children);
    if (!childrenIsArray && !isInvalid(children)) {
      return this.renderNode(children, context, false);
    }
    if (!childrenIsArray) {
      throw new Error("invalid component");
    }
    return children.reduce((p, child) => {
      return p.then(insertComment => {
        const isTextOrNumber = isStringOrNumber(child);

        if (isTextOrNumber) {
          if (insertComment === true) {
            this.push("<!---->");
          }
          if (isString(child)) {
            this.push(escapeText(child));
          } else {
            this.push(child + "");
          }
          return true;
        } else if (isArray(child)) {
          this.push("<!---->");
          return Promise.resolve(this.renderChildren(child)).then(() => {
            this.push("<!--!-->");
            return true;
          });
        } else if (!isInvalid(child)) {
          if ((child.flags & VNodeFlags.Text) > 0) {
            if (insertComment) {
              this.push("<!---->");
            }
          }
          return Promise.resolve(this.renderNode(child, context, false)).then(
            () => !!(child.flags & VNodeFlags.Text)
          );
        }
      });
    }, Promise.resolve(false));
  }

  public renderText(vNode) {
    return resolvedPromise.then(insertComment => {
      this.push(vNode.children);
      return insertComment;
    });
  }

  public renderElement(vElement, isRoot, context) {
    const tag = vElement.type;
    const props = vElement.props;

    const outputAttrs = renderAttributes(props);

    let html = "";
    const className = vElement.className;

    if (isString(className)) {
      outputAttrs.push(`class="${escapeText(className)}"`);
    } else if (isNumber(className)) {
      outputAttrs.push(`class="${className}"`);
    }

    if (props) {
      const style = props.style;
      if (style) {
        outputAttrs.push('style="' + renderStylesToString(style) + '"');
      }

      if (props.dangerouslySetInnerHTML) {
        html = props.dangerouslySetInnerHTML.__html;
      }
    }

    if (isRoot) {
      outputAttrs.push("data-infernoroot");
    }
    this.push(
      `<${tag}${outputAttrs.length > 0 ? " " + outputAttrs.join(" ") : ""}>`
    );
    if (voidElements.has(tag)) {
      return;
    }
    if (html) {
      this.push(html);
      this.push(`</${tag}>`);
      return;
    }
    return Promise.resolve(
      this.renderChildren(vElement.children, context)
    ).then(() => {
      this.push(`</${tag}>`);
    });
  }
}

export default function streamAsString(node) {
  return new RenderStream(node, false);
}

export function streamAsStaticMarkup(node) {
  return new RenderStream(node, true);
}
