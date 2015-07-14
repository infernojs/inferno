//document.RegisterElement polyfill
/*! (C) WebReflection Mit Style License */
(function(e,t,n,r){"use strict";function rt(e,t){for(var n=0,r=e.length;n<r;n++)dt(e[n],t)}function it(e){for(var t=0,n=e.length,r;t<n;t++)r=e[t],nt(r,b[ot(r)])}function st(e){return function(t){j(t)&&(dt(t,e),rt(t.querySelectorAll(w),e))}}function ot(e){var t=e.getAttribute("is"),n=e.nodeName.toUpperCase(),r=S.call(y,t?v+t.toUpperCase():d+n);return t&&-1<r&&!ut(n,t)?-1:r}function ut(e,t){return-1<w.indexOf(e+'[is="'+t+'"]')}function at(e){var t=e.currentTarget,n=e.attrChange,r=e.prevValue,i=e.newValue;Q&&t.attributeChangedCallback&&e.attrName!=="style"&&t.attributeChangedCallback(e.attrName,n===e[a]?null:r,n===e[l]?null:i)}function ft(e){var t=st(e);return function(e){X.push(t,e.target)}}function lt(e){K&&(K=!1,e.currentTarget.removeEventListener(h,lt)),rt((e.target||t).querySelectorAll(w),e.detail===o?o:s),B&&pt()}function ct(e,t){var n=this;q.call(n,e,t),G.call(n,{target:n})}function ht(e,t){D(e,t),et?et.observe(e,z):(J&&(e.setAttribute=ct,e[i]=Z(e),e.addEventListener(p,G)),e.addEventListener(c,at)),e.createdCallback&&Q&&(e.created=!0,e.createdCallback(),e.created=!1)}function pt(){for(var e,t=0,n=F.length;t<n;t++)e=F[t],E.contains(e)||(F.splice(t,1),dt(e,o))}function dt(e,t){var n,r=ot(e);-1<r&&(tt(e,b[r]),r=0,t===s&&!e[s]?(e[o]=!1,e[s]=!0,r=1,B&&S.call(F,e)<0&&F.push(e)):t===o&&!e[o]&&(e[s]=!1,e[o]=!0,r=1),r&&(n=e[t+"Callback"])&&n.call(e))}if(r in t)return;var i="__"+r+(Math.random()*1e5>>0),s="attached",o="detached",u="extends",a="ADDITION",f="MODIFICATION",l="REMOVAL",c="DOMAttrModified",h="DOMContentLoaded",p="DOMSubtreeModified",d="<",v="=",m=/^[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)+$/,g=["ANNOTATION-XML","COLOR-PROFILE","FONT-FACE","FONT-FACE-SRC","FONT-FACE-URI","FONT-FACE-FORMAT","FONT-FACE-NAME","MISSING-GLYPH"],y=[],b=[],w="",E=t.documentElement,S=y.indexOf||function(e){for(var t=this.length;t--&&this[t]!==e;);return t},x=n.prototype,T=x.hasOwnProperty,N=x.isPrototypeOf,C=n.defineProperty,k=n.getOwnPropertyDescriptor,L=n.getOwnPropertyNames,A=n.getPrototypeOf,O=n.setPrototypeOf,M=!!n.__proto__,_=n.create||function vt(e){return e?(vt.prototype=e,new vt):this},D=O||(M?function(e,t){return e.__proto__=t,e}:L&&k?function(){function e(e,t){for(var n,r=L(t),i=0,s=r.length;i<s;i++)n=r[i],T.call(e,n)||C(e,n,k(t,n))}return function(t,n){do e(t,n);while((n=A(n))&&!N.call(n,t));return t}}():function(e,t){for(var n in t)e[n]=t[n];return e}),P=e.MutationObserver||e.WebKitMutationObserver,H=(e.HTMLElement||e.Element||e.Node).prototype,B=!N.call(H,E),j=B?function(e){return e.nodeType===1}:function(e){return N.call(H,e)},F=B&&[],I=H.cloneNode,q=H.setAttribute,R=H.removeAttribute,U=t.createElement,z=P&&{attributes:!0,characterData:!0,attributeOldValue:!0},W=P||function(e){J=!1,E.removeEventListener(c,W)},X,V=e.requestAnimationFrame||e.webkitRequestAnimationFrame||e.mozRequestAnimationFrame||e.msRequestAnimationFrame||function(e){setTimeout(e,10)},$=!1,J=!0,K=!0,Q=!0,G,Y,Z,et,tt,nt;O||M?(tt=function(e,t){N.call(t,e)||ht(e,t)},nt=ht):(tt=function(e,t){e[i]||(e[i]=n(!0),ht(e,t))},nt=tt),B?(J=!1,function(){var e=k(H,"addEventListener"),t=e.value,n=function(e){var t=new CustomEvent(c,{bubbles:!0});t.attrName=e,t.prevValue=this.getAttribute(e),t.newValue=null,t[l]=t.attrChange=2,R.call(this,e),this.dispatchEvent(t)},r=function(e,t){var n=this.hasAttribute(e),r=n&&this.getAttribute(e),i=new CustomEvent(c,{bubbles:!0});q.call(this,e,t),i.attrName=e,i.prevValue=n?r:null,i.newValue=t,n?i[f]=i.attrChange=1:i[a]=i.attrChange=0,this.dispatchEvent(i)},s=function(e){var t=e.currentTarget,n=t[i],r=e.propertyName,s;n.hasOwnProperty(r)&&(n=n[r],s=new CustomEvent(c,{bubbles:!0}),s.attrName=n.name,s.prevValue=n.value||null,s.newValue=n.value=t[r]||null,s.prevValue==null?s[a]=s.attrChange=0:s[f]=s.attrChange=1,t.dispatchEvent(s))};e.value=function(e,o,u){e===c&&this.attributeChangedCallback&&this.setAttribute!==r&&(this[i]={className:{name:"class",value:this.className}},this.setAttribute=r,this.removeAttribute=n,t.call(this,"propertychange",s)),t.call(this,e,o,u)},C(H,"addEventListener",e)}()):P||(E.addEventListener(c,W),E.setAttribute(i,1),E.removeAttribute(i),J&&(G=function(e){var t=this,n,r,s;if(t===e.target){n=t[i],t[i]=r=Z(t);for(s in r){if(!(s in n))return Y(0,t,s,n[s],r[s],a);if(r[s]!==n[s])return Y(1,t,s,n[s],r[s],f)}for(s in n)if(!(s in r))return Y(2,t,s,n[s],r[s],l)}},Y=function(e,t,n,r,i,s){var o={attrChange:e,currentTarget:t,attrName:n,prevValue:r,newValue:i};o[s]=e,at(o)},Z=function(e){for(var t,n,r={},i=e.attributes,s=0,o=i.length;s<o;s++)t=i[s],n=t.name,n!=="setAttribute"&&(r[n]=t.value);return r})),t[r]=function(n,r){p=n.toUpperCase(),$||($=!0,P?(et=function(e,t){function n(e,t){for(var n=0,r=e.length;n<r;t(e[n++]));}return new P(function(r){for(var i,s,o=0,u=r.length;o<u;o++)i=r[o],i.type==="childList"?(n(i.addedNodes,e),n(i.removedNodes,t)):(s=i.target,Q&&s.attributeChangedCallback&&i.attributeName!=="style"&&s.attributeChangedCallback(i.attributeName,i.oldValue,s.getAttribute(i.attributeName)))})}(st(s),st(o)),et.observe(t,{childList:!0,subtree:!0})):(X=[],V(function E(){while(X.length)X.shift().call(null,X.shift());V(E)}),t.addEventListener("DOMNodeInserted",ft(s)),t.addEventListener("DOMNodeRemoved",ft(o))),t.addEventListener(h,lt),t.addEventListener("readystatechange",lt),t.createElement=function(e,n){var r=U.apply(t,arguments),i=""+e,s=S.call(y,(n?v:d)+(n||i).toUpperCase()),o=-1<s;return n&&(r.setAttribute("is",n=n.toLowerCase()),o&&(o=ut(i.toUpperCase(),n))),Q=!t.createElement.innerHTMLHelper,o&&nt(r,b[s]),r},H.cloneNode=function(e){var t=I.call(this,!!e),n=ot(t);return-1<n&&nt(t,b[n]),e&&it(t.querySelectorAll(w)),t});if(-2<S.call(y,v+p)+S.call(y,d+p))throw new Error("A "+n+" type is already registered");if(!m.test(p)||-1<S.call(g,p))throw new Error("The type "+n+" is invalid");var i=function(){return f?t.createElement(l,p):t.createElement(l)},a=r||x,f=T.call(a,u),l=f?r[u].toUpperCase():p,c=y.push((f?v:d)+p)-1,p;return w=w.concat(w.length?",":"",f?l+'[is="'+n.toLowerCase()+'"]':l),i.prototype=b[c]=T.call(a,"prototype")?a.prototype:_(H),rt(t.querySelectorAll(w),s),i}})(window,document,Object,"registerElement");

var Inferno = (function() {
  "use strict";

  var supportsTextContent = 'textContent' in document;
  var registeredComponents = {};

  var events = {
    "onClick": "click"
  };

  function ValueNode(value, valueKey) {
    //detect if the value is actually a new node tree
    if(value && value.tag != null) {
      this.isRoot = true;
    }
    //if its an array, this is due to a function returining an array (for example: a map)
    else if(value && value instanceof Array) {
      this.isRoot = true;
    }
    this.value = value;
    this.valueKey = valueKey;
  }

  function RenderList(array, constructor) {
    this.lastValue = null;
    this.array = array;
    this.constructor = constructor;
  }

  var Inferno = {};

  class Component {
    constructor() {}
    render() {}
    forceUpdate() {}
  }

  Inferno.Component = Component;

  class WebComponent {
    constructor() {}
    render() {}
    forceUpdate() {}
  }

  Inferno.WebComponent = WebComponent;

  function registerCustomElement(elementName, Component) {
    var element = Object.create(HTMLElement.prototype);
    var instances = new WeakMap();

    element.createdCallback = function() {
      var component = new Component();
      var listeners = addRootDomEventListerners(this);

      instances.set(this, {
        component: component,
        hasAttached: false,
        props: {},
        listeners: listeners,
        lastProps: {}
      })
      component.forceUpdate = Inferno.render.bind(null, component.render.bind(component), this, listeners, component);
    };

    element.sendData = function(data) {
      var instance = instances.get(this);

      instance.lastProps = instance.props;
      instance.props = data;
      if(instance.hasAttached === true) {
        if(instance.component.beforeRender && Object.keys(data).length > 0) {
          //TODO check if the props are the same and skip this
          instance.component.beforeRender(instance.props);
          Inferno.render(instance.component.render.bind(instance.component), this, instance.listeners, instance.component);
          if(instance.component.afterRender) {
            instance.component.afterRender();
          }
        }
      }
    };

    element.attachedCallback = function() {
      var instance = instances.get(this);
      instance.component.element = this;
      instance.hasAttached = true;
      if(instance.component.attached) {
        instance.component.attached(instance.props);
      }
      //initial render
      Inferno.render(instance.component.render.bind(instance.component), this, instance.listeners, instance.component);
      if(instance.component.afterRender) {
        instance.component.afterRender();
      }
    };

    element.detachedCallback = function() {
      var instance = instances.get(this);
      instance.hasAttached = false;
      //TODO remove listeners
      if(instance.component.detached) {
        instance.component.detached();
      }
    };

    registeredComponents[elementName] = Component;
    document.registerElement(elementName, {prototype: element});
  };

  function createComponentInstance(Component, parentDom, props) {
    var component = new Component(props);
    var listeners = addRootDomEventListerners(parentDom);
    component.forceUpdate = Inferno.render.bind(null, component.render.bind(component), parentDom, listeners, component);
    return component;
  };

  function registerComponent(elementName, Component) {
    t7.registerComponent(elementName, createComponentInstance.bind(null, Component));
  };

  Inferno.createValueNode = function(value, valueKey) {
    return new ValueNode(value, valueKey);
  };

  Inferno.register = function(elementName, Component) {
    if(elementName[0].toLowerCase() === elementName[0] && elementName.indexOf("-") === -1) {
      throw Error("Invalid element name '" + elementName + "' used for Inferno.register(). Custom elements must be lower-case and contain a hyphon.");
    } else if(elementName[0].toLowerCase() === elementName[0] && elementName.indexOf("-") > -1) {
      registerCustomElement(elementName, Component);
    } else if(elementName[0].toLowerCase() !== elementName[0] && elementName.indexOf("-") === -1) {
      registerComponent(elementName, Component);
    }
  };

  Inferno.render = function(render, dom, listeners, component) {
    var rootNode = null;
    var values = [];
    //we check if we have a root on the dom node, if not we need to build up the render
    if(dom.rootNode == null) {
      if(typeof render === "function") {
        values = render();
        rootNode = t7.getTemplateFromCache(values.templateKey, values.values);
      } else if(render.templateKey) {
        values = render;
        rootNode = t7.getTemplateFromCache(values.templateKey, values.values);
      }
      createNode(rootNode, null, dom, values, null, null, listeners, component);
      dom.rootNode = [rootNode];
    }
    //otherwise we progress with an update
    else {
      if(typeof render === "function") {
        values = render();
      } else if(render.templateKey) {
        values = render;
      }
      updateNode(dom.rootNode[0], dom.rootNode, dom, values, 0, listeners, component);
    }
  };

  // TODO find solution without empty text placeholders
  function emptyTextNode() {
      return document.createTextNode('');
  };

  function isInputProperty(tag, attrName) {
    switch (tag) {
      case 'input':
        return attrName === 'value' || attrName === 'checked';
      case 'textarea':
        return attrName === 'value';
      case 'select':
        return attrName === 'value' || attrName === 'selectedIndex';
      case 'option':
        return attrName === 'selected';
    }
  };

  function updateAttribute(domElement, name, value) {
    if (value === false) {
      domElement.removeAttribute(name);
    } else {
      if (value === true) {
        value = '';
      }
      var colonIndex = name.indexOf(':'), ns;
      if (colonIndex !== -1) {
        var prefix = name.substr(0, colonIndex);
        switch (prefix) {
          case 'xlink':
            ns = 'http://www.w3.org/1999/xlink';
            break;
        }
      }
      domElement.setAttribute(name, value);
    }
  };

  function setTextContent(domElement, text, update) {
    //if (text) {
      if(update && domElement.firstChild) {
        domElement.firstChild.nodeValue = text;
      } else {
        if (supportsTextContent) {
          domElement.textContent = text;
        } else {
          domElement.innerText = text;
        }
      }
  };

  function handleNodeAttributes(tag, domElement, attrName, attrValue) {
    if (attrName === 'style') {
      updateStyle(domElement, oldAttrValue, attrs, attrValue);
    } else if (isInputProperty(tag, attrName)) {
      if (domElement[attrName] !== attrValue) {
        domElement[attrName] = attrValue;
      }
    } else if (attrName === 'class') {
      domElement.className = attrValue;
    } else {
      updateAttribute(domElement, attrName, attrValue);
    }
  };

  function convertAttrsToProps(attrs, values) {
    var props = {};
    var val = null;
    for(var i = 0; i < attrs.length; i = i + 1 | 0) {
      if(attrs[i].value instanceof ValueNode) {
        val = values[attrs[i].value.valueKey];
        if(val.templateKey) {
          props[attrs[i].name] = val.values;
        } else {
          props[attrs[i].name] = val;
        }

      } else {
        props[attrs[i].name] = attrs[i].value;
      }

    }
    return props;
  };

  function addRootDomEventListerners(domNode) {
    var listeners = {
      click: []
    };
    domNode.addEventListener("click", function(e) {
      for(var i = 0; i < listeners.click.length; i = i + 1 | 0) {
        if(listeners.click[i].target === e.target) {
          listeners.click[i].callback.call(listeners.click[i].component, e);
          listeners.click[i].component.forceUpdate();
        }
      }
    });
    return listeners;
  };

  //we want to build a value tree, rather than a node tree, ideally, for faster lookups
  function createNode(node, parentNode, parentDom, values, index, insertAtIndex, listeners, component) {
    var i = 0, l = 0, ii = 0,
        subNode = null,
        val = null,
        textNode = null,
        hasDynamicAttrs = false,
        wasChildDynamic = false;

    //we need to get the actual values and the templatekey
    if(!(values instanceof Array)) {
      node.templateKey = values.templateKey;
      values = values.values;
    }

    if(node.tag != null) {
      //if its a component, we make a new instance
      if(typeof node.tag === "function") {
        node.dom = document.createDocumentFragment();
        if(index != null) {
          node.tag = node.tag(node.dom, convertAttrsToProps(node.attrs, values[index].values));
        } else {
          node.tag = node.tag(node.dom, convertAttrsToProps(node.attrs, values.values));
        }
        node.tag.forceUpdate();
        parentDom.appendChild(node.dom);
      }
      //if this is a
      if(node.tag instanceof Component) {
        if(node.tag.beforeRender) {
          if(index != null) {
            node.tag.beforeRender(convertAttrsToProps(node.attrs, values[index].values));
          } else {
            node.tag.beforeRender(convertAttrsToProps(node.attrs, values.values));
          }
        }
        node.tag.forceUpdate();
        return;
      }
      node.dom = document.createElement(node.tag);
      if(registeredComponents[node.tag] != null) {
        node.isComponent = true;
        node.isDynamic = true;
        //we also give the element some props
        if(node.attrs != null && node.attrs.length > 0) {
          if(index != null) {
            node.dom.sendData(convertAttrsToProps(node.attrs, values[index].values));
          } else {
            node.dom.sendData(convertAttrsToProps(node.attrs, values));
          }
        }
      }
      if(!insertAtIndex) {
        parentDom.appendChild(node.dom);
      } else {
        parentDom.insertBefore(node.dom, parentDom.childNodes[insertAtIndex]);
      }
    }

    if(!node.isComponent) {
      if(node.attrs != null) {
        for(i = 0; i < node.attrs.length; i = i + 1 | 0) {
          //check if the name matches an event type
          if(events[node.attrs[i].name] != null) {
            node.attrs[i].value.lastValue = values[node.attrs[i].value.valueKey];
            listeners[events[node.attrs[i].name]].push({
              target: node.dom,
              callback: node.attrs[i].value.value,
              component: component
            })
            node.hasDynamicAttrs = true;
            node.isDynamic = true;
          } else {
            //check if this is a dynamic attribute
            if(node.attrs[i].value instanceof ValueNode) {
              node.hasDynamicAttrs = true;
              node.isDynamic = true;
              //assign the last value
              node.attrs[i].value.lastValue = values[node.attrs[i].value.valueKey];
              handleNodeAttributes(node.tag, node.dom, node.attrs[i].name, node.attrs[i].value.value);
            } else {
              handleNodeAttributes(node.tag, node.dom, node.attrs[i].name, node.attrs[i].value);
            }
          }
        }
      }
    }

    if(node.children != null) {
      if(node.children instanceof Array) {
        for(i = 0; i < node.children.length; i = i + 1 | 0) {
          if(typeof node.children[i] === "string" || typeof node.children[i] === "number" || typeof node.children[i] === "undefined") {
            textNode = document.createTextNode(node.children[i]);
            node.dom.appendChild(textNode);
          } else if(node.children[i] instanceof ValueNode) {
            node.children[i].lastValue = values[node.children[i].valueKey];
            if(node.children[i].lastValue != null && node.children[i].lastValue.templateKey != null) {
              node.children[i].templateKey = node.children[i].lastValue.templateKey;
              node.children[i].lastValue = node.children[i].lastValue.values;
            }
            node.isDynamic = true;
            node.children[i].isDynamic = true;
            //check if we're dealing with a root node
            if(node.children[i].isRoot === true) {
              node.children[i].isDynamic = true;
              if(node.children[i].value instanceof Array) {
                if(node.children[i].templateKey != null) {
                  for(ii = 0; ii < node.children[i].value.length; ii = ii + 1 | 0) {
                    createNode(node.children[i].value[ii], node.children[i], node.dom, values[node.children[i].valueKey].values, ii, null, listeners, component);
                  }
                } else {
                  for(ii = 0; ii < node.children[i].value.length; ii = ii + 1 | 0) {
                    createNode(node.children[i].value[ii], node.children[i], node.dom, values[node.children[i].valueKey], ii, null, listeners, component);
                  }
                }
              } else {
                createNode(node.children[i].value, node.children[i], node.dom, values[node.children[i].valueKey], null, null, listeners, component);
              }
            } else if(node.children[i] instanceof ValueNode) {
              node.children[i].lastValue = values[node.children[i].valueKey];
              textNode = document.createTextNode(node.children[i].lastValue);
              node.dom.appendChild(textNode);
            } else {
              textNode = document.createTextNode(node.children[i].value);
              node.dom.appendChild(textNode);
            }
          } else {
            wasChildDynamic = createNode(node.children[i], node, node.dom, values, i, null, listeners, component);
            if(wasChildDynamic === true ) {
              node.children[i].isDynamic = true;
              node.isDynamic = true;
            }
          }
        }
      } else if(typeof node.children === "string") {
        textNode = document.createTextNode(node.children);
        node.dom.appendChild(textNode);
      } else if(node.children instanceof ValueNode && node.children.isRoot === true) {
        //we are on a new root node, so we'll need to go through its children and apply the values
        //based off the valueKey index
        if(node.children.value instanceof Array) {
          for(i = 0; i < node.children.value.length; i = i + 1 | 0) {
            createNode(node.children.value[i], node, node.dom, values[node.children.valueKey], i, null, listeners, component);
          }
        } else {
          createNode(node.children.value, node, node.dom, values[node.children.valueKey], null, null, listeners, component);
        }
        node.children.isDynamic = true;
        node.children.lastValue = values[node.children.valueKey];
        return true;
      } else if(node.children instanceof ValueNode) {
        //if it has a valueKey then it means that its dynamic
        node.children.lastValue = values[node.children.valueKey];
        textNode = document.createTextNode(node.children.lastValue);
        node.dom.appendChild(textNode);
        node.isDynamic = true;
      }
    }

    if(!node.isDynamic) {
      return false;
    }
    return true;
  };

  function cloneAttrs(attrs) {
    var cloneAttrs = [];
    //TODO: need to actually do this
    return cloneAttrs;
  };

  function cloneNode(node, parentDom) {
    var i = 0;
    var textNode = null;
    var clonedNode = {
      tag: node.tag,
      dom: node.dom.cloneNode(false),
      attrs: cloneAttrs(node.attrs)
    }

    if(node.isDynamic === true) {
      clonedNode.isDynamic = true;
    }

    if(node.children instanceof ValueNode) {
      clonedNode.children = new ValueNode(node.children.value, node.children.valueKey);
    } else if(node.children instanceof Array) {
      clonedNode.children = [];
      //TODO: need to actually finish this
      for(i = 0; i < node.children.length; i = i + 1 | 0) {
        if(node.children[i] instanceof ValueNode) {
          textNode = document.createTextNode(node.children[i].value);
          clonedNode.dom.appendChild(textNode);
          clonedNode.children.push(new ValueNode(node.children[i].value, node.children[i].valueKey));
        } else if (typeof node.children[i] === "string" || typeof node.children[i] === "number") {
          textNode = document.createTextNode(node.children[i]);
          clonedNode.dom.appendChild(textNode);
          clonedNode.children.push(node.children[i]);
        } else {
          cloneNode(node.children[i], clonedNode.dom);
        }
        if(node.children[i].isDynamic === true) {
          clonedNode.children[i].isDynamic = true;
        }
      }
    }

    //append the new cloned DOM node to its parentDom
    parentDom.appendChild(clonedNode.dom);
    return clonedNode;
  };

  function removeNode(node, parentDom) {
    parentDom.removeChild(node.dom);
  };

  function updateNode(node, parentNode, parentDom, values, index, listeners, component) {
    var i = 0, s = 0, l = 0, val = "", childNode = null;

    if(node.isDynamic === false) {
      return;
    }

    //we need to get the actual values and the templatekey
    if(!(values instanceof Array)) {
      if(node.templateKey !== values.templateKey) {
        //remove node
        removeNode(node, parentDom);
        //and then we want to create the new node (we can simply get it from t7 cache)
        node = t7.getTemplateFromCache(values.templateKey, values.values);
        createNode(node, parentNode, parentDom, values.values, null, null, listeners, component);
        parentNode[index] = node;
        node.templateKey = values.templateKey;
      }
      values = values.values;
    }

    if(node.isComponent === true) {
      //get the attrs for this element and pass it over
      if(node.attrs != null && node.attrs.length > 0) {
        node.dom.sendData(convertAttrsToProps(node.attrs, values));
      }
    }

    if(!node.isComponent) {
      if(node.attrs != null && node.hasDynamicAttrs === true) {
        for(i = 0; i < node.attrs.length; i = i + 1 | 0) {
          if(node.attrs[i].value instanceof ValueNode) {
            val = values[node.attrs[i].value.valueKey];
            if(val !== node.attrs[i].value.lastValue) {
              node.attrs[i].value.lastValue = val;
              handleNodeAttributes(node.tag, node.dom, node.attrs[i].name, val);
            }
          }
        }
      }
    }

    if(node instanceof ValueNode && node.isRoot) {
      val = values[node.valueKey];
      if(val != null && val.templateKey != null) {
        if(node.templateKey !== val.templateKey) {
          //we want to remove the DOM current node
          //TODO for optimisation do we want to clone this? and if possible, re-use the clone rather than
          //asking t7 for a fresh template??
          removeNode(node.value, parentDom);
          //and then we want to create the new node (we can simply get it from t7 cache)
          node.value = t7.getTemplateFromCache(val.templateKey, val.values);
          createNode(node.value, node, parentDom, val, null, index, listeners, component);
          node.templateKey = val.templateKey;
          node.lastValue = val.values;
        }
        val = val.values;
      }
      //if(val !== node.lastValue) {
        if(node.value.children instanceof Array) {
          for(i = 0; i < node.value.children.length; i = i + 1 | 0) {
            if(typeof node.value.children[i] !== "string") {
              updateNode(node.value.children[i], node.value, node.value.dom, val, i, listeners, component);
            }
          }
        }
        node.lastValue = val;
      //}
    } else if(node.children != null) {
      if(node.children instanceof Array) {
        for(i = 0; i < node.children.length; i = i + 1 | 0) {
          if(node.children[i].isDynamic === true) {
            if(node.children[i] instanceof ValueNode && !node.children[i].isRoot) {
              val = values[node.children[i].valueKey];
              if(val != null && val.templateKey != null) {
                node.children[i].templateKey = val.templateKey;
                val = values;
              }
              if(val !== node.children[i].lastValue) {
                node.children[i].lastValue = val;
                //update the text
                setTextContent(node.dom.childNodes[i], val, true);
              }
            } else {
              updateNode(node.children[i], node, node.dom, values, i, listeners, component);
            }
          }
        }
      } else if(node.children instanceof ValueNode && node.children.isRoot === true) {
        //check if the value has changed
        val = values[node.children.valueKey];
        if(val != null && val.templateKey != null) {
          if(node.children.templateKey !== val.templateKey) {
            //we want to remove the DOM current node
            //TODO for optimisation do we want to clone this? and if possible, re-use the clone rather than
            //asking t7 for a fresh template??
            removeNode(node.children.value, node.dom);
            //and then we want to create the new node (we can simply get it from t7 cache)
            node.children.value = t7.getTemplateFromCache(val.templateKey, val.values);
            createNode(node.children.value, node.children, node.dom, val, null, i, listeners, component);
            //then we want to set the new templatekey
            node.children.templateKey = val.templateKey;
            node.children.lastValue = val.values;
          }
          val = val.values;
        }
        if(val !== node.children.lastValue) {
          if(val instanceof Array) {
            //check if the sizes have changed
            //in this case, our new array has more items so we'll need to add more children
            if(val.length > node.children.lastValue.length) {
              //easiest way to add another child is to clone the node, so let's clone the first child
              //TODO check the templates coming back have the same code?
              for(s = 0; s < val.length - node.children.lastValue.length; s = s + 1 | 0) {
                childNode = cloneNode(node.children.value[0], node.dom);
                node.children.value.push(childNode);
              }
            } else if(val.length < node.children.lastValue.length) {
              //we need to remove the last node here (unless we add in index functionality)
              for(s = 0; s < node.children.lastValue.length - val.length; s = s + 1 | 0) {
                removeNode(node.children.value[node.children.value.length - 1], node.dom);
                node.children.value.pop();
              }
            }
            for(i = 0; i < node.children.value.length; i = i + 1 | 0) {
              if(typeof node.children.value[i] !== "string") {
                updateNode(node.children.value[i], node.children.value, node.dom, val[i], i, listeners, component);
              }
            }
          }
          node.children.lastValue = val;
        }
      } else if(node.children instanceof ValueNode) {
        val = values[node.children.valueKey];
        if(val != null && val.templateKey != null) {
          node.templateKey = val.templateKey;
          val = values;
        }
        if(val !== node.children.lastValue) {
          node.children.lastValue = val;
          if(typeof val === "string" || typeof val === "number" || val instanceof Date) {
            setTextContent(node.dom, val, true);
          }
        }
      }
    }
  };

  return Inferno;
})();
