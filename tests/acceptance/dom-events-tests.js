import Inferno from '../../src';
import events from '../../src/events/shared/events';
//import sinon from 'sinon';

function triggerEvent(name, element) {

    var eventType;

    if (name === "click" || name === "dblclick" || name === "mousedown" || name === "mouseup") {
        eventType = "MouseEvents";
    } else if (name === "focus" || name === "change" || name === "blur" || name === "select") {
        eventType = "HTMLEvents";
    } else {
        throw new Error("Unsupported `'" + name + "'`event");

    }

    var event = document.createEvent(eventType);
    event.initEvent(name, name !== "change", true);
    element.dispatchEvent(event, true);
}


function extend(dst, src){
    for (var key in src)
        dst[key] = src[key]
    return src
}

var Simulate = {
    event: function(element, eventName){
        if (document.createEvent) {
            var evt = document.createEvent("HTMLEvents")
            evt.initEvent(eventName, true, true )
            element.dispatchEvent(evt)
        }else{
            var evt = document.createEventObject()
            element.fireEvent('on' + eventName,evt)
        }
    },
    keyEvent: function(element, type, options){
        var evt,
            e = {
            bubbles: true, cancelable: true, view: window,
          	ctrlKey: false, altKey: false, shiftKey: false, metaKey: false,
          	keyCode: 0, charCode: 0
        }
        extend(e, options)
        if (document.createEvent){
            try{
                evt = document.createEvent('KeyEvents')
                evt.initKeyEvent(
                    type, e.bubbles, e.cancelable, e.view,
    				e.ctrlKey, e.altKey, e.shiftKey, e.metaKey,
    				e.keyCode, e.charCode)
    			element.dispatchEvent(evt)
    		}catch(err){
    		    evt = document.createEvent("Events")
				evt.initEvent(type, e.bubbles, e.cancelable)
				extend(evt, {
				    view: e.view,
					ctrlKey: e.ctrlKey, altKey: e.altKey,
					shiftKey: e.shiftKey, metaKey: e.metaKey,
					keyCode: e.keyCode, charCode: e.charCode
				})
				element.dispatchEvent(evt)
    		}
        }
    }
}

Simulate.keypress = function(element, chr){
    var charCode = chr.charCodeAt(0)
    this.keyEvent(element, 'keypress', {
        keyCode: charCode,
        charCode: charCode
    })
}

Simulate.keydown = function(element, chr){
    var charCode = chr.charCodeAt(0)
    this.keyEvent(element, 'keydown', {
        keyCode: charCode,
        charCode: charCode
    })
}

Simulate.keyup = function(element, chr){
    var charCode = chr.charCodeAt(0)
    this.keyEvent(element, 'keyup', {
        keyCode: charCode,
        charCode: charCode
    })
}

var eventss = [
    'click',
    'focus',
    'blur',
    'focusin',
    'focusout',
    'dblclick',
    'input',
    'change',
    'mousedown',
    'mousemove',
    'mouseout',
    'mouseover',
    'mouseup',
    'resize',
    'scroll',
    'select',
    'submit',
    'load',
    'unload'
]

for (var i = eventss.length; i--;){
    var event = eventss[i]
    Simulate[event] = (function(evt){
        return function(element){
            this.event(element, evt)
        }
    }(event))
}


export default function domOperationTests(describe, expect, spy) {
/*

describe('DOM events', () => {

    var container = document.createElement('div');

    document.body.appendChild(container)


    beforeEach(() => {
        container.innerHTML = '';
    });
    afterEach(() => {
        Inferno.clearDomElement(container);
    });

    describe('bubbleable events', () => {


        it('should properly add handler', () => {

            const spy1 = sinon.spy(),
                spy2 = sinon.spy(),
                spy3 = sinon.spy();

            let template = Inferno.createTemplate(createElement =>
                createElement('div', {
                    id: 'foo',
                    onClick: spy1
                }, createElement('div', {
                    id: 'bar',
                    onClick: spy2
                }))
            );

            Inferno.render(Inferno.createFragment(null, template), container);

            triggerEvent("click", document.getElementById('foo'));

            expect(spy1.called).to.be.true;

            triggerEvent("click", document.getElementById('bar'));

            expect(spy2.called).to.be.true;

        });

        it('should properly stop propagation', () => {
            const spy = sinon.spy();


            let template = Inferno.createTemplate(createElement =>
                createElement('div', {
                    onClick: spy
                }, createElement('div', {
                    id: 'id1',
                    onClick: function(e) {
                        e.stopPropagation();
                    }
                }))
            );

            Inferno.render(Inferno.createFragment(null, template), container);

            triggerEvent('click', document.getElementById('id1'));

            expect(spy.called).to.be.false;
        });

        it('should properly prevent default', () => {

            const spy = sinon.spy();


            let template = Inferno.createTemplate(createElement =>
                createElement('input', {
                    type: 'checkbox',
                    id: 'id1',
                    onClick: function(e) {
                        e.preventDefault();
                    }
                })
            );

            Inferno.render(Inferno.createFragment(null, template), container);

            triggerEvent('click', document.getElementById('id1'));

            expect(spy.called).to.be.false;
        });

        it('should properly replace handler for bubbleable events', () => {

            const spy1 = sinon.spy(),
                spy2 = sinon.spy();


            let template = Inferno.createTemplate(function(createElement, component, spy) {
                return createElement('div', {
                    type: 'checkbox',
                    id: 'id1',
                    onClick: spy
                })
            });

            Inferno.render(Inferno.createFragment(spy1, template), container);
            Inferno.render(Inferno.createFragment(spy2, template), container);

            triggerEvent('click', document.getElementById('id1'));
            triggerEvent('click', document.getElementById('id1'));


            expect(spy1.called).to.be.false;
            expect(spy2.called).to.be.true;
        });

        it('should properly simulate bubbling of focus event', () => {

            const spy = sinon.spy();


            let template = Inferno.createTemplate(createElement =>
                createElement('input', {
                    id: 'id1',
                    onFocus: spy
                })
            );

            Inferno.render(Inferno.createFragment(null, template), container);
            triggerEvent(isEventSupported('focusin') ? 'focusin' : 'focus', document.getElementById('id1'));

            expect(spy.called).to.be.true;
        });


        it('should properly simulate bubbling of blur event', () => {

            const spy = sinon.spy();

            let template = Inferno.createTemplate(createElement =>
                createElement('input', {
                    id: 'id1',
                    onBlur: spy
                })
            );

            Inferno.render(Inferno.createFragment(null, template), container);
            triggerEvent(isEventSupported('focusout') ? 'focusout' : 'blur', document.getElementById('id1'));

            expect(spy.called).to.be.true;
        });
    });
});
*/





    describe('DOM event tests', () => {
        let container;

        beforeEach(() => {
            container = document.createElement('div');
        });
        afterEach(() => {
            Inferno.clearDomElement(container);
        });

         it('should support common events', () => {
             expect(events.onBlur).to.eql('blur');
             expect(events.onClick).to.eql('click');
             expect(events.onMouseOver).to.eql('mouseover');			 
        });
    });
}
