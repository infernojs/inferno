// Maps generator trees to Inferno vNodes through the raw API, exercising
// explicit child flags (keyed / non-keyed / text) as well as the normalization
// path (ChildFlags.UnknownChildren with holes, nested arrays and strings).
import { Component, createComponentVNode, createFragment, createTextVNode, createVNode, getFlagsForElementVnode } from 'inferno';

const HasInvalidChildren = 1;
const HasNonKeyedChildren = 4;
const HasKeyedChildren = 8;
const HasTextChildren = 16;
const UnknownChildren = 0;

function listFlags(kids, keyed) {
  if (kids.length === 0) {
    return HasInvalidChildren;
  }
  return keyed ? HasKeyedChildren : HasNonKeyedChildren;
}

function FuzzFn({ node }) {
  return createVNode(1, 'div', 'fn tint' + node.tint, node.kids.map(toVNode), listFlags(node.kids, false), null, null, null);
}

const fnHooks = {
  onComponentShouldUpdate(last, next) {
    return last.node !== next.node;
  },
};

class FuzzClass extends Component {
  shouldComponentUpdate(next) {
    return next.node !== this.props.node;
  }

  render() {
    const kids = this.props.node.kids;
    return createFragment(kids.map(toVNode), kids.length ? HasKeyedChildren : HasInvalidChildren);
  }
}

/** Deliberately irregular children for the normalization path. */
function unknownChildren(kids) {
  const out = [];
  for (let i = 0; i < kids.length; i++) {
    const v = toVNode(kids[i]);
    if (i % 4 === 1) {
      out.push([v, null]);
    } else if (i % 5 === 2) {
      out.push(null, v);
    } else {
      out.push(v);
    }
  }
  return out;
}

export function toVNode(n) {
  switch (n.k) {
    case 'text':
      return createTextVNode(n.v, n.key);
    case 'fn':
      return createComponentVNode(8, FuzzFn, { node: n }, n.key, fnHooks);
    case 'cls':
      return createComponentVNode(4, FuzzClass, { node: n }, n.key, null);
    case 'frag':
      return createFragment(n.kids.map(toVNode), HasKeyedChildren, n.key);
    case 'el': {
      let props = null;
      if (n.attrs || n.style) {
        props = { ...n.attrs };
        if (n.style) {
          props.style = n.style;
        }
      }
      let children;
      let childFlags;
      if (n.mode === 'text') {
        children = n.text;
        childFlags = HasTextChildren;
      } else if (n.mode === 'unknown') {
        children = n.kids.length ? unknownChildren(n.kids) : null;
        childFlags = UnknownChildren;
      } else {
        children = n.kids.map(toVNode);
        childFlags = listFlags(n.kids, n.mode === 'keyed');
      }
      return createVNode(getFlagsForElementVnode(n.tag), n.tag, n.cls, children, childFlags, props, n.key, null);
    }
  }
  throw new Error(`Unknown fuzz node kind ${n.k}`);
}
