!function(){"use strict";function e(){return e=Object.assign?Object.assign.bind():function(e){for(var n=1;n<arguments.length;n++){var t=arguments[n];for(var r in t)({}).hasOwnProperty.call(t,r)&&(e[r]=t[r])}return e},e.apply(null,arguments)}var n=Array.isArray;function t(e){var n=typeof e;return"string"===n||"number"===n}function r(e){return void 0===e||null===e}function l(e){return null===e||!1===e||!0===e||void 0===e}function o(e){return"function"===typeof e}function i(e){return"string"===typeof e}function a(e){return null===e}function u(e,n){if(o(n))return{data:e,event:n};return null}function c(e){return!a(e)&&"object"===typeof e}var f={},s=function(){this.componentDidAppear=[],this.componentWillDisappear=[],this.componentWillMove=[]};function d(e){return e.substring(2).toLowerCase()}function p(e,n){e.appendChild(n)}function v(e,n,t){a(t)?p(e,n):e.insertBefore(n,t)}function h(e,n){if(n)return document.createElementNS("http://www.w3.org/2000/svg",e);return document.createElement(e)}function m(e,n,t){e.replaceChild(n,t)}function g(e,n){e.removeChild(n)}function b(e){for(var n=0;n<e.length;n++)e[n]()}function k(e,n,t){var r=e.children;if(0!==(4&t))return r.$LI;if(0!==(8192&t))return 2===e.childFlags?r:r[n?0:r.length-1];return r}function y(e,n){for(var t,l=e;!r(l);){if(0!==(1521&(t=l.flags)))return l.dom;l=k(l,n,t)}return null}function C(e,n){for(var t,r=e.length;void 0!==(t=e.pop());)t((function(){--r<=0&&o(n)&&n()}))}function w(e){for(var n=0;n<e.length;n++)e[n].fn();for(var t=0;t<e.length;t++){var r=e[t];v(r.parent,r.dom,r.next)}e.splice(0,e.length)}function $(e,n,t){for(;!r(e);){var l=e.flags;if(0!==(1521&l))return void(t&&e.dom.parentNode!==n||g(n,e.dom));var o=e.children;if(0!==(4&l)&&(e=o.$LI),0!==(8&l)&&(e=o),0!==(8192&l)){if(2!==e.childFlags){for(var i=0,a=o.length;i<a;++i)$(o[i],n,!1);return}e=o}}}function D(e,n){return function(){$(e,n,!0)}}function F(e,n,t){t.componentWillDisappear.length>0?C(t.componentWillDisappear,D(e,n)):$(e,n,!1)}function x(e,n,t,r,l,o,i,a){e.componentWillMove.push({dom:r,fn:function(){0!==(4&i)?t.componentWillMove(n,l,r):0!==(8&i)&&t.onComponentWillMove(n,l,r,a)},next:o,parent:l})}function W(e,n,t,l,i){for(var a,u,c=n.flags;!r(n);){var f=n.flags;if(0!==(1521&f))return void(r(a)||!o(a.componentWillMove)&&!o(a.onComponentWillMove)?v(t,n.dom,l):x(i,e,a,n.dom,t,l,c,u));var s=n.children;if(0!==(4&f))a=n.children,u=n.props,n=s.$LI;else if(0!==(8&f))a=n.ref,u=n.props,n=s;else if(0!==(8192&f)){if(2!==n.childFlags){for(var d=0,p=s.length;d<p;++d)W(e,s[d],t,l,i);return}n=s}}}function A(n,t,r){if(o(n.constructor.getDerivedStateFromProps))return e({},r,n.constructor.getDerivedStateFromProps(t,r));return r}var P={createVNode:null};function L(e,n){e.textContent=n}function M(e,n){return c(e)&&e.event===n.event&&e.data===n.data}function V(e,n){for(var t in n)void 0===e[t]&&(e[t]=n[t]);return e}function N(e,n){return o(e)&&(e(n),!0)}var S="$";function I(e,n,t,r,l,o,i,a){this.childFlags=e,this.children=n,this.className=t,this.dom=null,this.flags=r,this.key=void 0===l?null:l,this.props=void 0===o?null:o,this.ref=void 0===i?null:i,this.type=a}function U(e,n,t,r,l,o,i,a){var u=void 0===l?1:l,c=new I(u,r,t,e,i,o,a,n);return 0===u&&q(c,c.children),c}function T(e,n,t){if(4&e)return t;var l=(32768&e?n.render:n).defaultHooks;if(r(l))return t;if(r(t))return l;return V(t,l)}function B(n,t,l){var o=(32768&n?t.render:t).defaultProps;if(r(o))return l;if(r(l))return e({},o);return V(l,o)}function E(e,n){var t;if(12&e)return e;if(null!=(t=n.prototype)&&t.render)return 4;if(n.render)return 32776;return 8}function O(e,n,t,r,l){var i=new I(1,null,null,e=E(e,n),r,B(e,n,t),T(e,n,l),n);return o(P.createVNode)&&P.createVNode(i),i}function H(e,n){return new I(1,r(e)||!0===e||!1===e?"":e,null,16,n,null,null,null)}function j(e,n,t){var r=U(8192,8192,null,e,n,null,t,null);switch(r.childFlags){case 1:r.children=_(),r.childFlags=2;break;case 16:r.children=[H(e)],r.childFlags=4}return r}function R(e){var n=e.children,t=e.childFlags;return j(2===t?X(n):n.map(X),t,e.key)}function X(e){var n=-16385&e.flags,t=e.props;if(14&n&&!a(t)){var r=t;for(var l in t={},r)t[l]=r[l]}if(0===(8192&n))return new I(e.childFlags,e.children,e.className,n,e.key,t,e.ref,e.type);return R(e)}function _(){return H("",null)}function K(e,r,o,u){for(var c=e.length;o<c;o++){var f=e[o];if(!l(f)){var s=u+S+o;if(n(f))K(f,r,0,s);else{if(t(f))f=H(f,s);else{var d=f.key,p=i(d)&&d[0]===S;(81920&f.flags||p)&&(f=X(f)),f.flags|=65536,p?d.substring(0,u.length)!==u&&(f.key=u+d):a(d)?f.key=s:f.key=u+d}r.push(f)}}}}function q(e,r){var o,u=1;if(l(r))o=r;else if(t(r))u=16,o=r;else if(n(r)){for(var c=r.length,f=0;f<c;++f){var s=r[f];if(l(s)||n(s)){o=o||r.slice(0,f),K(r,o,f,"");break}if(t(s))(o=o||r.slice(0,f)).push(H(s,S+f));else{var d=s.key,p=(81920&s.flags)>0,v=a(d),h=i(d)&&d[0]===S;p||v||h?(o=o||r.slice(0,f),(p||h)&&(s=X(s)),(v||h)&&(s.key=S+f),o.push(s)):o&&o.push(s),s.flags|=65536}}u=0===(o=o||r).length?1:8}else(o=r).flags|=65536,81920&r.flags&&(o=X(r)),u=2;return e.children=o,e.childFlags=u,e}function G(e){if(l(e)||t(e))return H(e,null);if(n(e))return j(e,0,null);return 16384&e.flags?X(e):e}var J="http://www.w3.org/1999/xlink",z="http://www.w3.org/XML/1998/namespace",Q={"xlink:actuate":J,"xlink:arcrole":J,"xlink:href":J,"xlink:role":J,"xlink:show":J,"xlink:title":J,"xlink:type":J,"xml:base":z,"xml:lang":z,"xml:space":z};function Y(e){return{onClick:e,onDblClick:e,onFocusIn:e,onFocusOut:e,onKeyDown:e,onKeyPress:e,onKeyUp:e,onMouseDown:e,onMouseMove:e,onMouseUp:e,onTouchEnd:e,onTouchMove:e,onTouchStart:e}}var Z=Y(0),ee=Y(null),ne=Y(!0);function te(e,n){var t=n.$EV;return t||(t=n.$EV=Y(null)),t[e]||1===++Z[e]&&(ee[e]=de(e)),t}function re(e,n){var t=n.$EV;null!=t&&t[e]&&(0===--Z[e]&&(document.removeEventListener(d(e),ee[e]),ee[e]=null),t[e]=null)}function le(e,n,t,r){if(o(t))te(e,r)[e]=t;else if(c(t)){if(M(n,t))return;te(e,r)[e]=t}else re(e,r)}function oe(e){return o(e.composedPath)?e.composedPath()[0]:e.target}function ie(e,n,t,l){var o=oe(e);do{if(n&&o.disabled)return;var i=o.$EV;if(!r(i)){var u=i[t];if(u&&(l.dom=o,u.event?u.event(u.data,e):u(e),e.cancelBubble))return}o=o.parentNode}while(!a(o))}function ae(){this.cancelBubble=!0,this.immediatePropagationStopped||this.stopImmediatePropagation()}function ue(){return this.defaultPrevented}function ce(){return this.cancelBubble}function fe(e){var n={dom:document};return e.isDefaultPrevented=ue,e.isPropagationStopped=ce,e.stopPropagation=ae,Object.defineProperty(e,"currentTarget",{configurable:!0,get:function(){return n.dom}}),n}function se(e){var n="onClick"===e||"onDblClick"===e;return function(t){ie(t,n,e,fe(t))}}function de(e){var n=se(e);return document.addEventListener(d(e),n),n}function pe(e,n){var t=document.createElement("i");return t.innerHTML=n,t.innerHTML===e.innerHTML}function ve(e,n,t){var r=e[n];if(r)r.event?r.event(r.data,t):r(t);else{var l=n.toLowerCase();o(e[l])&&e[l](t)}}function he(e,n){var t=function(t){var l,a=this.$V;if(r(a))return;var u=null!=(l=a.props)?l:f,c=a.dom;if(i(e))ve(u,e,t);else for(var s=0;s<e.length;++s)ve(u,e[s],t);if(o(n)){var d,p=this.$V,v=null!=(d=p.props)?d:f;n(v,c,!1,p)}};return Object.defineProperty(t,"wrapped",{configurable:!1,enumerable:!1,value:!0,writable:!1}),t}function me(e,n,t){var r="$"+n,l=e[r];if(l){if(l[1].wrapped)return;e.removeEventListener(l[0],l[1]),e[r]=null}o(t)&&(e.addEventListener(n,t),e[r]=[n,t])}function ge(e){return"checkbox"===e||"radio"===e}var be=he("onInput",we),ke=he(["onClick","onChange"],we);function ye(e){e.stopPropagation()}function Ce(e,n){ge(n.type)?(me(e,"change",ke),me(e,"click",ye)):me(e,"input",be)}function we(e,n){var t=e.type,l=e.value,o=e.checked,i=e.multiple,a=e.defaultValue,u=!r(l);null!=t&&t!==n.type&&n.setAttribute("type",t),r(i)||i===n.multiple||(n.multiple=i),r(a)||u||(n.defaultValue=a+""),ge(t)?(u&&(n.value=l),r(o)||(n.checked=o)):u&&n.value!==l?(n.defaultValue=l,n.value=l):r(o)||(n.checked=o)}function $e(e,n){if("option"===e.type)De(e,n);else{var t=e.children,r=e.flags;if(0!==(4&r))$e(t.$LI,n);else if(0!==(8&r))$e(t,n);else if(2===e.childFlags)$e(t,n);else if(0!==(12&e.childFlags))for(var l=0,o=t.length;l<o;++l)$e(t[l],n)}}function De(e,t){var l,o=null!=(l=e.props)?l:f,i=o.value,a=e.dom;a.value=i,i===t||n(t)&&t.includes(i)?a.selected=!0:r(t)&&r(o.selected)||(a.selected=Boolean(o.selected))}ye.wrapped=!0;var Fe=he("onChange",We);function xe(e){me(e,"change",Fe)}function We(e,n,t,l){var o=Boolean(e.multiple);r(e.multiple)||o===n.multiple||(n.multiple=o);var i=e.selectedIndex;if(-1===i&&(n.selectedIndex=-1),1!==l.childFlags){var a=e.value;"number"===typeof i&&i>-1&&!r(n.options[i])&&(a=n.options[i].value),t&&r(a)&&(a=e.defaultValue),$e(l,a)}}var Ae,Pe,Le=he("onInput",Ne),Me=he("onChange");function Ve(e,n){me(e,"input",Le),o(n.onChange)&&me(e,"change",Me)}function Ne(e,n,t){var l=e.value,o=n.value;if(r(l)){if(t){var i=e.defaultValue;r(i)||i===o||(n.defaultValue=i,n.value=i)}}else o!==l&&(n.defaultValue=l,n.value=l)}function Se(e,n,t,r,l,o){0!==(64&e)?we(r,t):0!==(256&e)?We(r,t,l,n):0!==(128&e)&&Ne(r,t,l),o&&(t.$V=n)}function Ie(e,n,t){0!==(64&e)?Ce(n,t):0!==(256&e)?xe(n):0!==(128&e)&&Ve(n,t)}function Ue(e){return ge(e.type)?!r(e.checked):!r(e.value)}function Te(e){r(e)||!N(e,null)&&e.current&&(e.current=null)}function Be(e,n,t){r(e)||!o(e)&&void 0===e.current||t.push((function(){N(e,n)||void 0===e.current||(e.current=n)}))}function Ee(e,n,t){Oe(e,t),F(e,n,t)}function Oe(e,n){var t,l=e.flags,i=e.children;if(0!==(481&l)){t=e.ref;var u=e.props;Te(t);var c=e.childFlags;if(!a(u))for(var d=Object.keys(u),p=0,v=d.length;p<v;p++){var h=d[p];ne[h]&&re(h,e.dom)}12&c?He(i,n):2===c&&Oe(i,n)}else if(i)if(4&l){o(i.componentWillUnmount)&&i.componentWillUnmount();var m=n;o(i.componentWillDisappear)&&(m=new s,_e(n,i,i.$LI.dom,l,void 0)),Te(e.ref),i.$UN=!0,Oe(i.$LI,m)}else if(8&l){var g=n;if(!r(t=e.ref)){var b=null;o(t.onComponentWillUnmount)&&(b=y(e,!0),t.onComponentWillUnmount(b,e.props||f)),o(t.onComponentWillDisappear)&&(g=new s,_e(n,t,b=b||y(e,!0),l,e.props))}Oe(i,g)}else 1024&l?Ee(i,e.ref,n):8192&l&&12&e.childFlags&&He(i,n)}function He(e,n){for(var t=0,r=e.length;t<r;++t)Oe(e[t],n)}function je(e,n){return function(){if(n)for(var t=0;t<e.length;t++)$(e[t],n,!1)}}function Re(e,n,t){t.componentWillDisappear.length>0?C(t.componentWillDisappear,je(n,e)):e.textContent=""}function Xe(e,n,t,r){He(t,r),8192&n.flags?F(n,e,r):Re(e,t,r)}function _e(e,n,t,r,l){e.componentWillDisappear.push((function(e){4&r?n.componentWillDisappear(t,e):8&r&&n.onComponentWillDisappear(t,l,e)}))}function Ke(e){var n=e.event;return function(t){n(e.data,t)}}function qe(e,n,t,r){if(c(t)){if(M(n,t))return;t=Ke(t)}me(r,d(e),t)}function Ge(e,n,t){if(r(n))return void t.removeAttribute("style");var l,o,a=t.style;if(i(n))return void(a.cssText=n);if(r(e)||i(e))for(l in n)o=n[l],a.setProperty(l,o);else{for(l in n)(o=n[l])!==e[l]&&a.setProperty(l,o);for(l in e)r(n[l])&&a.removeProperty(l)}}function Je(e,n,t,l,o){var i=(null==e?void 0:e.__html)||"",u=(null==n?void 0:n.__html)||"";i!==u&&(r(u)||pe(l,u)||(a(t)||(12&t.childFlags?He(t.children,o):2===t.childFlags&&Oe(t.children,o),t.children=null,t.childFlags=1),l.innerHTML=u))}function ze(e,n,t){var l=r(e)?"":e;n[t]!==l&&(n[t]=l)}function Qe(e,n,t,l,o,i,a,u){switch(e){case"children":case"childrenType":case"className":case"defaultValue":case"key":case"multiple":case"ref":case"selectedIndex":break;case"autoFocus":l.autofocus=!!t;break;case"allowfullscreen":case"autoplay":case"capture":case"checked":case"controls":case"default":case"disabled":case"hidden":case"indeterminate":case"loop":case"muted":case"novalidate":case"open":case"readOnly":case"required":case"reversed":case"scoped":case"seamless":case"selected":l[e]=!!t;break;case"defaultChecked":case"value":case"volume":if(i&&"value"===e)break;ze(t,l,e);break;case"style":Ge(n,t,l);break;case"dangerouslySetInnerHTML":Je(n,t,a,l,u);break;default:ne[e]?le(e,n,t,l):111===e.charCodeAt(0)&&110===e.charCodeAt(1)?qe(e,n,t,l):r(t)?l.removeAttribute(e):o&&Q[e]?l.setAttributeNS(Q[e],e,t):l.setAttribute(e,t)}}function Ye(e,n,t,r,l,o){var i=!1,a=(448&n)>0;for(var u in a&&(i=Ue(t))&&Ie(n,r,t),t)Qe(u,null,t[u],r,l,i,null,o);a&&Se(n,e,r,t,!0,i)}function Ze(n,t,r){var l=G(n.render(t,n.state,r)),i=r;return o(n.getChildContext)&&(i=e({},r,n.getChildContext())),n.$CX=i,l}function en(e,n,t,r,l,i){var u=new n(t,r),c=u.$N=Boolean(n.getDerivedStateFromProps||u.getSnapshotBeforeUpdate);if(u.$SVG=l,u.$L=i,e.children=u,u.$BS=!1,u.context=r,u.props===f&&(u.props=t),c)u.state=A(u,t,u.state);else if(o(u.componentWillMount)){u.$BR=!0,u.componentWillMount();var s=u.$PS;if(!a(s)){var d=u.state;if(a(d))u.state=s;else for(var p in s)d[p]=s[p];u.$PS=null}u.$BR=!1}return u.$LI=Ze(u,t,r),u}function nn(e,n){var t=e.props||f;return 32768&e.flags?e.type.render(t,e.ref,n):e.type(t,n)}function tn(e,n,t,r,l,o,i){var a=e.flags|=16384;0!==(481&a)?an(e,n,t,r,l,o,i):0!==(4&a)?cn(e,n,t,r,l,o,i):8&a?fn(e,n,t,r,l,o,i):16&a?on(e,n,l):8192&a?ln(e,t,n,r,l,o,i):1024&a&&rn(e,t,n,l,o,i)}function rn(e,n,t,r,l,o){tn(e.children,e.ref,n,!1,null,l,o);var i=_();on(i,t,r),e.dom=i.dom}function ln(e,n,t,r,l,o,i){var a=e.children,u=e.childFlags;12&u&&0===a.length&&(u=e.childFlags=2,a=e.children=_()),2===u?tn(a,t,n,r,l,o,i):un(a,t,n,r,l,o,i)}function on(e,n,t){var r=e.dom=document.createTextNode(e.children);a(n)||v(n,r,t)}function an(e,n,t,l,o,i,u){var c=e.flags,f=e.props,s=e.className,d=e.childFlags,p=e.dom=h(e.type,l=l||(32&c)>0),m=e.children;if(r(s)||""===s||(l?p.setAttribute("class",s):p.className=s),16===d)L(p,m);else if(1!==d){var g=l&&"foreignObject"!==e.type;2===d?(16384&m.flags&&(e.children=m=X(m)),tn(m,p,t,g,null,i,u)):8!==d&&4!==d||un(m,p,t,g,null,i,u)}a(n)||v(n,p,o),a(f)||Ye(e,c,f,p,l,u),Be(e.ref,p,i)}function un(e,n,t,r,l,o,i){for(var a=0;a<e.length;++a){var u=e[a];16384&u.flags&&(e[a]=u=X(u)),tn(u,n,t,r,l,o,i)}}function cn(e,n,t,r,l,i,a){var u=en(e,e.type,e.props||f,t,r,i),c=a;o(u.componentDidAppear)&&(c=new s),tn(u.$LI,n,u.$CX,r,l,i,c),vn(e.ref,u,i,a)}function fn(e,n,t,l,i,a,u){var c=e.ref,f=u;!r(c)&&o(c.onComponentDidAppear)&&(f=new s),tn(e.children=G(nn(e,t)),n,t,l,i,a,f),mn(e,a,u)}function sn(e){return function(){e.componentDidMount()}}function dn(e,n,t){e.componentDidAppear.push((function(){n.componentDidAppear(t)}))}function pn(e,n,t,r){e.componentDidAppear.push((function(){n.onComponentDidAppear(t,r)}))}function vn(e,n,t,r){Be(e,n,t),o(n.componentDidMount)&&t.push(sn(n)),o(n.componentDidAppear)&&dn(r,n,n.$LI.dom)}function hn(e,n){return function(){e.onComponentDidMount(y(n,!0),n.props||f)}}function mn(e,n,t){var l=e.ref;r(l)||(N(l.onComponentWillMount,e.props||f),o(l.onComponentDidMount)&&n.push(hn(l,e)),o(l.onComponentDidAppear)&&pn(t,l,y(e,!0),e.props))}function gn(e,n,t,r,l,o,i){Oe(e,i),0!==(n.flags&e.flags&1521)?(tn(n,null,r,l,null,o,i),m(t,n.dom,e.dom)):(tn(n,t,r,l,y(e,!0),o,i),F(e,t,i))}function bn(e,n,t,r,l,o,i,a){var u=n.flags|=16384;e.flags!==u||e.type!==n.type||e.key!==n.key||2048&u?16384&e.flags?gn(e,n,t,r,l,i,a):tn(n,t,r,l,o,i,a):481&u?$n(e,n,r,l,i,a):4&u?Pn(e,n,t,r,l,o,i,a):8&u?Ln(e,n,t,r,l,o,i,a):16&u?Mn(e,n):8192&u?Cn(e,n,t,r,l,i,a):wn(e,n,r,i,a)}function kn(e,n,t){e!==n&&(""!==e?t.firstChild.nodeValue=n:L(t,n))}function yn(e,n){e.textContent!==n&&(e.textContent=n)}function Cn(e,n,t,r,l,o,i){var a=e.children,u=n.children,c=e.childFlags,f=n.childFlags,s=null;12&f&&0===u.length&&(f=n.childFlags=2,u=n.children=_());var d=0!==(2&f);if(12&c){var p=a.length;(8&c&&8&f||d||!d&&u.length>p)&&(s=y(a[p-1],!1).nextSibling)}xn(c,f,a,u,t,r,l,s,e,o,i)}function wn(e,n,t,r,o){var i=e.ref,a=n.ref,u=n.children;if(xn(e.childFlags,n.childFlags,e.children,u,i,t,!1,null,e,r,o),n.dom=e.dom,i!==a&&!l(u)){var c=u.dom;g(i,c),p(a,c)}}function $n(e,n,t,l,o,i){var a,u=n.dom=e.dom,c=e.props,s=n.props,d=n.flags,p=!1,v=!1;if(l=l||(32&d)>0,c!==s){var h=c||f;if((a=s||f)!==f)for(var m in(p=(448&d)>0)&&(v=Ue(a)),a){var g=h[m],b=a[m];g!==b&&Qe(m,g,b,u,l,v,e,i)}if(h!==f)for(var k in h)r(a[k])&&!r(h[k])&&Qe(k,h[k],null,u,l,v,e,i)}var y=n.children,C=n.className;e.className!==C&&(r(C)?u.removeAttribute("class"):l?u.setAttribute("class",C):u.className=C),4096&d?yn(u,y):xn(e.childFlags,n.childFlags,e.children,y,u,t,l&&"foreignObject"!==n.type,null,e,o,i),p&&Se(d,n,u,a,!1,v);var w=n.ref,$=e.ref;$!==w&&(Te($),Be(w,u,o))}function Dn(e,n,t,r,l,o,i){Oe(e,i),un(n,t,r,l,y(e,!0),o,i),F(e,t,i)}function Fn(e,n,t,r,l,o,i,a,u,c,f){var s=0|e.length,d=0|n.length;0===s?d>0&&un(n,t,r,l,o,i,a):0===d?Xe(t,u,e,a):8===c&&8===f?Nn(e,n,t,r,l,s,d,o,u,i,a):Vn(e,n,t,r,l,s,d,o,i,a)}function xn(e,n,t,r,l,o,i,a,u,c,f){switch(e){case 2:switch(n){case 2:bn(t,r,l,o,i,a,c,f);break;case 1:Ee(t,l,f);break;case 16:Oe(t,f),L(l,r);break;default:Dn(t,r,l,o,i,c,f)}break;case 1:switch(n){case 2:tn(r,l,o,i,a,c,f);break;case 1:break;case 16:L(l,r);break;default:un(r,l,o,i,a,c,f)}break;case 16:switch(n){case 16:kn(t,r,l);break;case 2:Re(l,t,f),tn(r,l,o,i,a,c,f);break;case 1:Re(l,t,f);break;default:Re(l,t,f),un(r,l,o,i,a,c,f)}break;default:switch(n){case 16:He(t,f),L(l,r);break;case 2:Xe(l,u,t,f),tn(r,l,o,i,a,c,f);break;case 1:Xe(l,u,t,f);break;default:Fn(t,r,l,o,i,a,c,f,u,n,e)}}}function Wn(e,n,t,r,l){l.push((function(){e.componentDidUpdate(n,t,r)}))}function An(n,t,r,l,i,a,u,c,f,s){var d=n.state,p=n.props,v=Boolean(n.$N),h=o(n.shouldComponentUpdate);if(v&&(t=A(n,r,t!==d?e({},d,t):t)),!h||h&&n.shouldComponentUpdate(r,t,i)){!v&&o(n.componentWillUpdate)&&n.componentWillUpdate(r,t,i),n.props=r,n.state=t,n.context=i;var m=null,g=Ze(n,r,i);v&&o(n.getSnapshotBeforeUpdate)&&(m=n.getSnapshotBeforeUpdate(p,d)),bn(n.$LI,g,l,n.$CX,a,c,f,s),n.$LI=g,o(n.componentDidUpdate)&&Wn(n,p,d,m,f)}else n.props=r,n.state=t,n.context=i}function Pn(n,t,r,l,i,u,c,s){var d=t.children=n.children;if(a(d))return;d.$L=c;var p=t.props||f,v=t.ref,h=n.ref,m=d.state;if(!d.$N){if(o(d.componentWillReceiveProps)){if(d.$BR=!0,d.componentWillReceiveProps(p,l),d.$UN)return;d.$BR=!1}a(d.$PS)||(m=e({},m,d.$PS),d.$PS=null)}An(d,m,p,r,l,i,0,u,c,s),h!==v&&(Te(h),Be(v,d,c))}function Ln(e,n,t,l,i,a,u,c){var s=!0,d=n.props||f,p=n.ref,v=e.props,h=!r(p),m=e.children;if(h&&o(p.onComponentShouldUpdate)&&(s=p.onComponentShouldUpdate(v,d)),s){h&&o(p.onComponentWillUpdate)&&p.onComponentWillUpdate(v,d);var g=G(nn(n,l));bn(m,g,t,l,i,a,u,c),n.children=g,h&&o(p.onComponentDidUpdate)&&p.onComponentDidUpdate(v,d)}else n.children=m}function Mn(e,n){var t=n.children,r=n.dom=e.dom;t!==e.children&&(r.nodeValue=t)}function Vn(e,n,t,r,l,o,i,a,u,c){for(var f,s,d=o>i?i:o,p=0;p<d;++p)f=n[p],s=e[p],16384&f.flags&&(f=n[p]=X(f)),bn(s,f,t,r,l,a,u,c),e[p]=f;if(o<i)for(p=d;p<i;++p)16384&(f=n[p]).flags&&(f=n[p]=X(f)),tn(f,t,r,l,a,u,c);else if(o>i)for(p=d;p<o;++p)Ee(e[p],t,c)}function Nn(e,n,t,r,l,o,i,a,u,c,f){var s,d,p=o-1,v=i-1,h=0,m=e[h],g=n[h];e:{for(;m.key===g.key;){if(16384&g.flags&&(n[h]=g=X(g)),bn(m,g,t,r,l,a,c,f),e[h]=g,++h>p||h>v)break e;m=e[h],g=n[h]}for(m=e[p],g=n[v];m.key===g.key;){if(16384&g.flags&&(n[v]=g=X(g)),bn(m,g,t,r,l,a,c,f),e[p]=g,v--,h>--p||h>v)break e;m=e[p],g=n[v]}}if(h>p){if(h<=v)for(d=(s=v+1)<i?y(n[s],!0):a;h<=v;)16384&(g=n[h]).flags&&(n[h]=g=X(g)),++h,tn(g,t,r,l,d,c,f)}else if(h>v)for(;h<=p;)Ee(e[h++],t,f);else Sn(e,n,r,o,i,p,v,h,t,l,a,u,c,f)}function Sn(e,n,t,r,l,o,i,a,u,c,f,s,d,p){var v,h,m=0,g=0,b=a,k=a,C=o-a+1,$=i-a+1,D=new Int32Array($+1),F=C===r,x=!1,A=0,P=0;if(l<4||(C|$)<32)for(g=b;g<=o;++g)if(v=e[g],P<$){for(a=k;a<=i;a++)if(h=n[a],v.key===h.key){if(D[a-k]=g+1,F)for(F=!1;b<g;)Ee(e[b++],u,p);A>a?x=!0:A=a,16384&h.flags&&(n[a]=h=X(h)),bn(v,h,u,t,c,f,d,p),++P;break}!F&&a>i&&Ee(v,u,p)}else F||Ee(v,u,p);else{var L={};for(g=k;g<=i;++g)L[n[g].key]=g;for(g=b;g<=o;++g)if(v=e[g],P<$)if(void 0!==(a=L[v.key])){if(F)for(F=!1;g>b;)Ee(e[b++],u,p);D[a-k]=g+1,A>a?x=!0:A=a,16384&(h=n[a]).flags&&(n[a]=h=X(h)),bn(v,h,u,t,c,f,d,p),++P}else F||Ee(v,u,p);else F||Ee(v,u,p)}if(F)Xe(u,s,e,p),un(n,u,t,c,f,d,p);else if(x){var M=Un(D);for(a=M.length-1,g=$-1;g>=0;g--)0===D[g]?(16384&(h=n[A=g+k]).flags&&(n[A]=h=X(h)),tn(h,u,t,c,(m=A+1)<l?y(n[m],!0):f,d,p)):a<0||g!==M[a]?W(s,h=n[A=g+k],u,(m=A+1)<l?y(n[m],!0):f,p):a--;p.componentWillMove.length>0&&w(p.componentWillMove)}else if(P!==$)for(g=$-1;g>=0;g--)0===D[g]&&(16384&(h=n[A=g+k]).flags&&(n[A]=h=X(h)),tn(h,u,t,c,(m=A+1)<l?y(n[m],!0):f,d,p))}var In=0;function Un(e){var n=0,t=0,r=0,l=0,o=0,i=0,a=0,u=e.length;for(u>In&&(In=u,Ae=new Int32Array(u),Pe=new Int32Array(u));t<u;++t)if(0!==(n=e[t])){if(e[r=Ae[l]]<n){Pe[t]=r,Ae[++l]=t;continue}for(o=0,i=l;o<i;)e[Ae[a=o+i>>1]]<n?o=a+1:i=a;n<e[Ae[o]]&&(o>0&&(Pe[t]=Ae[o-1]),Ae[o]=t)}o=l+1;var c=new Int32Array(o);for(i=Ae[o-1];o-- >0;)c[o]=i,i=Pe[i],Ae[o]=0;return c}function Tn(e,n,t,l){var i=[],a=new s,u=n.$V;r(u)?r(e)||(0!==(16384&e.flags)&&(e=X(e)),tn(e,n,l,!1,null,i,a),n.$V=e,u=e):r(e)?(Ee(u,n,a),n.$V=null):(16384&e.flags&&(e=X(e)),bn(u,e,n,l,!1,null,i,a),u=n.$V=e),b(i),C(a.componentDidAppear),o(t)&&t()}function Bn(e,n,t,r){void 0===t&&(t=null),void 0===r&&(r=f),Tn(e,n,t,r)}"undefined"!==typeof document&&window.Node&&(Node.prototype.$EV=null,Node.prototype.$V=null),Promise.resolve().then.bind(Promise.resolve()),uibench.init("Inferno","9.0.0-alpha.4");var En={onComponentShouldUpdate:function(e,n){return e!==n}};function On(e){return U(1,"li","TreeLeaf",e.children,16,null,null,null)}function Hn(e){for(var n=e.data,t=n.children.length,r=new Array(t),l=0;l<t;l++){var o=n.children[l],i=o.id;o.container?r[l]=O(2,Hn,{data:o},i,null):r[l]=O(2,On,{children:i},i,null)}return U(1,"ul","TreeNode",r,8,null,null,null)}function jn(e){return U(1,"div","Tree",O(2,Hn,{data:e.root},null,null),2,null,null,null)}function Rn(e){var n=e.data,t=n.time%10,r="border-radius:"+t+"px;background:rgba(0,0,0,"+(.5+t/10)+")";return U(1,"div","AnimBox",null,1,{"data-id":n.id,style:r},null,null)}function Xn(e){for(var n=e.items,t=n.length,r=[],l=0;l<t;l++){var o=n[l];r.push(O(2,Rn,{data:o},o.id,null))}return U(1,"div","Anim",r,8,null,null,null)}function _n(e,n){console.log("Clicked",e),n.stopPropagation()}function Kn(e){var n=e.children;return U(1,"td","TableCell",n,16,{onClick:u(n,_n)},null,null)}function qn(e){var n=e.data,t="TableRow";n.active&&(t="TableRow active");for(var r=n.props,l=r.length+1,o=[O(2,Kn,{children:"#"+n.id},null,null)],i=1;i<l;i++)o.push(O(2,Kn,{children:r[i-1]},null,null));return U(1,"tr",t,o,4,{"data-id":n.id},null,null)}function Gn(e){for(var n=e.items,t=n.length,r=[],l=0;l<t;l++){var o=n[l];r.push(O(2,qn,{data:o},o.id,null))}return U(1,"table","Table",r,8,null,null,null)}On.defaultHooks=En,Hn.defaultHooks=En,Rn.defaultHooks=En,Kn.defaultHooks=En,qn.defaultHooks=En,document.addEventListener("DOMContentLoaded",(function(e){var n=document.querySelector("#App");uibench.run((function(e){var t,r,l;Bn(("table"===(l=(t=e).location)?r=Gn(t.table):"anim"===l?r=Xn(t.anim):"tree"===l&&(r=jn(t.tree)),U(1,"div","Main",r,2,null,null,null)),n)}),(function(e){Bn(U(1,"pre",null,JSON.stringify(e,null," "),16,null,null,null),n)}))}))}();
