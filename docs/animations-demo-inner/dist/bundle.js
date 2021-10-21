!function(){"use strict";function e(e,t){e.prototype=Object.create(t.prototype),e.prototype.constructor=e,n(e,t)}function n(e,t){return n=Object.setPrototypeOf||function(e,n){return e.__proto__=n,e},n(e,t)}!function(){var n=Inferno.Component,t=Inferno.createElement,r=Inferno.createRef,o=Inferno.Animation;o.AnimatedComponent;var i=o.componentDidAppear,p=o.componentWillDisappear,s=o.utils;s.addClassName,s.removeClassName,s.forceReflow,s.registerTransitionListener;var a=function(n){function r(){return n.apply(this,arguments)||this}e(r,n);var o=r.prototype;return o.componentDidAppear=function(e){this._innerEl=this.props.innerRef.current,i(this._innerEl,{prefix:"inner"})},o.componentWillDisappear=function(e,n){p(this._innerEl,{prefix:"inner"},n)},o.render=function(){var e=this;return t("div",{className:"page"},t("div",{className:"random-wrapper"},[t("img",{width:"120px",height:"120px",src:"avatar.png"}),t("div",{ref:this.props.innerRef,className:"inner"},[t("h2",null,"Step "+this.props.step),t("button",{onClick:function(n){n.preventDefault(),e.props.onNext()}},"Next")])]))},r}(n),c=function(n){function o(){var e;(e=n.call(this)||this).doGoNext=function(){e.setState({showStepIndex:(e.state.showStepIndex+1)%3})},e._innerAnimRefs=[];for(var t=0;t<3;t++)e._innerAnimRefs.push(r());return e.state={showStepIndex:0},e}return e(o,n),o.prototype.render=function(){var e=this.state.showStepIndex;return t(a,{key:"page_"+e,step:e+1,innerRef:this._innerAnimRefs[e],onNext:this.doGoNext})},o}(n);document.addEventListener("DOMContentLoaded",(function(){var e=document.querySelector("#App1");Inferno.render(t(c),e)}))}()}();
