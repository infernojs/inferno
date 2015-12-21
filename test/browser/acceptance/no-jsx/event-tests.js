import Inferno from '../../../../src';

describe('DOM event tests (no-jsx)', () => {
  
      let container = document.createElement('div');

    beforeEach(() => {
        document.body.appendChild(container);
    });

    afterEach(() => {
       document.body.removeChild(container);
    });

   describe('should render element with click event listener added', () => {
        it('Initial render (creation)', () => {
            let worked = false;
            const template = Inferno.createTemplate((handler) => ({
                tag: 'div',
                attrs: {
                    onClick: handler
                },
                children: 'Hello world!'
            }));
            Inferno.render(template(() => {
                worked = true;
            }), container);
            const event = new Event('click', {
                bubbles: true,
                cancelable: true
            });
            //or this won't work
            container.firstChild.dispatchEvent(event);
            expect(worked).to.equal(true);
            expect(container.innerHTML).to.equal('<div>Hello world!</div>');
        });
    });

   describe('should listen to a click event on a textarea, and return its value', () => {
        it('Initial render (creation)', () => {
            let worked;
            const template = Inferno.createTemplate((handler) => ({
                tag: 'textarea',
                attrs: {
                    onClick: handler
                },
                children: 'Hello world!'
            }));
            Inferno.render(template((e, value) => {
                worked = value;
				e.stopPropagation();
            }), container);
            const event = new Event('click', {
                bubbles: true,
                cancelable: true
            });
            //or this won't work
            container.firstChild.dispatchEvent(event);
            expect(worked).to.equal('Hello world!');
            expect(container.innerHTML).to.equal('<textarea>Hello world!</textarea>');
        });

    });


   describe('should listen to a click event on a checkbox, and return its true value', () => {

            let worked, val, event;
            const template = Inferno.createTemplate((handler) => ({
                tag: 'input',
                attrs: {
					type: "checkbox",
                    checked: "checked",
                    onClick: handler
                },
                children: 'Hello world!'
            }));

        it('Initial render (creation)', () => {
            Inferno.render(template((e, value) => {
                worked = value;
				val = e.currentTarget.getElementsByTagName("input")[0].getAttribute("checked");
				e.stopPropagation();
            }), container);
             event = new Event('click', {
                bubbles: true,
                cancelable: true
            });
            //or this won't work
            container.firstChild.dispatchEvent(event);
            expect(worked).to.equal(true);
            expect(val).to.equal('checked');
            expect(container.innerHTML).to.equal('<input type="checkbox" checked="checked"></input>');

            Inferno.render(template((e, value) => {
                worked = value;
				val = e.currentTarget.getElementsByTagName("input")[0].getAttribute("checked");
				e.stopPropagation();
            }), container);
             event = new Event('click', {
                bubbles: true,
                cancelable: true
            });
            //or this won't work
            container.firstChild.dispatchEvent(event);
            expect(worked).to.equal(true);
            expect(val).to.equal('checked');
            expect(container.innerHTML).to.equal('<input type="checkbox" checked="checked"></input>');
        });

        it('Second render (update)', () => {
            Inferno.render(template((e, value) => {
                worked = value;
				val = e.currentTarget.getElementsByTagName("input")[0].getAttribute("checked");
				e.stopPropagation();
            }), container);
            const event = new Event('click', {
                bubbles: true,
                cancelable: true
            });
            //or this won't work
            container.firstChild.dispatchEvent(event);
            expect(worked).to.equal(true);
            expect(val).to.equal('checked');
            expect(container.innerHTML).to.equal('<input type="checkbox" checked="checked"></input>');
        });
    });
	
	
	 describe('should listen to a click event on a checkbox, and return its true value', () => {
        it('Initial render (creation)', () => {
            let worked, val;
            const template = Inferno.createTemplate((handler) => ({
                tag: 'input',
                attrs: {
					type: "checkbox",
                    checked: "checked",
                    onClick: handler
                },
                children: 'Hello world!'
            }));
            Inferno.render(template((e, value) => {
                worked = value;
				val = e.currentTarget.getElementsByTagName("input")[0].getAttribute("checked");
				e.stopPropagation();
            }), container);
            const event = new Event('click', {
                bubbles: true,
                cancelable: true
            });
            //or this won't work
            container.firstChild.dispatchEvent(event);
            expect(worked).to.equal(true);
            expect(val).to.equal('checked');
            expect(container.innerHTML).to.equal('<input type="checkbox" checked="checked"></input>');
        });

    });

    describe('should listen to a click event on a radio button, and return its true value', () => {
            let worked, val, event;
            const template = Inferno.createTemplate((handler) => ({
                tag: 'input',
                attrs: {
					type: "radio",
                    checked: "checked",
                    onClick: handler
                },
                children: 'Hello world!'
            }));

        it('Initial render (creation)', () => {
            Inferno.render(template((e, value) => {
                worked = value;
				val = e.currentTarget.getElementsByTagName("input")[0].getAttribute("checked");
				e.stopPropagation();
            }), container);
            event = new Event('click', {
                bubbles: true,
                cancelable: true
            });
            //or this won't work
            container.firstChild.dispatchEvent(event);
            expect(worked).to.equal(true);
            expect(val).to.equal('checked');
            expect(container.innerHTML).to.equal('<input type="radio" checked="checked"></input>');

            Inferno.render(template((e, value) => {
                worked = value;
				val = e.currentTarget.getElementsByTagName("input")[0].getAttribute("checked");
				e.stopPropagation();
            }), container);
            event = new Event('click', {
                bubbles: true,
                cancelable: true
            });
            //or this won't work
            container.firstChild.dispatchEvent(event);
            expect(worked).to.equal(true);
            expect(val).to.equal('checked');
            expect(container.innerHTML).to.equal('<input type="radio" checked="checked"></input>');

        });

        it('Second render (update)', () => {
            Inferno.render(template((e, value) => {
                worked = value;
				val = e.currentTarget.getElementsByTagName("input")[0].getAttribute("checked");
				e.stopPropagation();
            }), container);
            event = new Event('click', {
                bubbles: true,
                cancelable: true
            });
            //or this won't work
            container.firstChild.dispatchEvent(event);
            expect(worked).to.equal(true);
            expect(val).to.equal('checked');
            expect(container.innerHTML).to.equal('<input type="radio" checked="checked"></input>');
        });

    });

    describe('should listen to a click event on a select, and return its value', () => {
        it('Initial render (creation)', () => {
            let worked;
            const template = Inferno.createTemplate((handler) => ({
                tag: 'select',
                attrs: {
					value: 'bar',
                    onClick: handler
                },
                children: [
				
				{ tag: 'option', attrs: { value: "foo" }, text:'foo' },
				{ tag: 'option', attrs: { value: "bar" }, text:'bar' }				
				]
            }));
            Inferno.render(template((e, value) => {
                worked = value;
				e.stopPropagation();
            }), container);
            const event = new Event('click', {
                bubbles: true,
                cancelable: true
            });
            //or this won't work
            container.firstChild.dispatchEvent(event);
            expect(worked).to.equal('foo');
            expect(container.innerHTML).to.equal('<select><option>foo</option><option>bar</option></select>');
        });

    });

    describe('should listen to a click event on a multiple select, and return its value', () => {
        it('Initial render (creation)', () => {
            let worked;
            const template = Inferno.createTemplate((handler) => ({
                tag: 'select',
                attrs: {
					multiple: true, 
					value: "bar",
                    onClick: handler
                },
                children: [
				
				{ tag: 'option', attrs: { value: "foo" }, text:'foo' },
				{ tag: 'option', attrs: { value: "bar" }, text:'bar' }				
				]
            }));
            Inferno.render(template((e, value) => {
                worked = value;
				e.stopPropagation();
            }), container);
            const event = new Event('click', {
                bubbles: true,
                cancelable: true
            });
            //or this won't work
            container.firstChild.dispatchEvent(event);
//            expect(worked).to.equal([]); // Need a fix
            expect(container.innerHTML).to.equal('<select multiple="multiple"><option>foo</option><option>bar</option></select>');
        });

    });
});