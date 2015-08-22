"use strict";

t7.module(function(t7) {

  class InfernoExample extends Inferno.Component {
      constructor(props) {
        super(props);
        this.state = {
          visible: true,
          counter: 0,
          formShow: true,
          foo: "single!",
          isOn: false,
          className: "foo",
          name: "test",
          textFieldValue: "Text!"
        };
        this.handleCounter();
      }
      render() {
        if(this.state.visible) {
          return ({dom: null, key: null, template: __0292331807, templateValues: [
                  this.hide,
                  this.state.counter,
                  this.state.name,
                  this.props.time.toString(),
                  this.renderForm(),
                  this.state.name,
                  (this.state.isOn === false ? ({dom: null, key: null, template: __1149231429, }) : ({dom: null, key: null, template: __944087704, templateValue: this.props.time.toString(), templateElements: null, templateTypes: null})),
                  this.clickSwitch,
                  ({dom: null, key: null, template: __1024510217, templateValue: this.state.foo, templateElements: null, templateTypes: null}),
                  this.props.people != null ? this.props.people.map(this.renderPerson.bind(this)) : null,
                  this.state.className
          ], templateElements: Array(11), templateTypes: Array(11)});
        } else {
          return ({dom: null, key: null, template: __1417139913, templateValue: this.show, templateElements: null, templateTypes: null});
        }
      }
      renderPerson(person) {
        if(this.state.counter % 3 === 1) {
          return ({dom: null, key: null, template: __1630775210, templateValues: [person, this.state.counter], templateElements: Array(2), templateTypes: Array(2)});
        } else {
          return ({dom: null, key: null, template: __1505306658, templateValues: [person, this.state.counter], templateElements: Array(2), templateTypes: Array(2)});
        }
      }
      renderForm() {
        if(this.state.formShow) {
          return ({dom: null, key: null, template: __1647030613, templateValues: [this.state.textFieldValue, this.turnOffForm], templateElements: Array(2), templateTypes: Array(2)});
        } else {
          return ({dom: null, key: null, template: __1788624329, templateValue: this.turnOnForm, templateElements: null, templateTypes: null});
        }
      }
      turnOffForm(e) {
        this.setState({
          formShow: false
        });
        e.preventDefault();
      }
      turnOnForm(e) {
        this.setState({
          formShow: true
        });
        e.preventDefault();
      }
      hide(e) {
        this.setState({
          visible: false
        });
      }
      show(e) {
        this.setState({
          visible: true
        });
      }
      clickSwitch(e) {
        this.setState({
          isOn: !this.state.isOn
        });
      }
      handleCounter() {
        this.setState({
          counter: this.state.counter + 1
        });
        setTimeout(this.handleCounter.bind(this), 2000);
      }
  }

  t7.assign("App", InfernoExample);

  var odd = true;

  function update() {
    var date = new Date();
    var people = [];
    odd = !odd;
    if(!odd) {
      people = [
        "Bob",
        "Dominic",
        "John",
        "Edward"
      ]
    } else {
      people = [
        "Jemma",
        "Charlie",
        "Harry",
        "Kieria",
        "Paul",
        "Ken"
      ]
    }

    Inferno.render(
      ({dom: null, component: t7.loadComponent("App"), props:  {'time':date,'people':people}, key: null, template: null}),
      document.getElementById("app")
    );
    setTimeout(update, 1000);
  }

  update();

});

/*t7 precompiled templates*/
;function __944087704(fragment, component){"use strict";var root = Inferno.dom.createElement('div');var n_0 = Inferno.dom.createText('Switch is on! ');root.appendChild(n_0);var n_2 = Inferno.dom.createElement('span');if(typeof fragment.templateValue === 'string' || typeof fragment.templateValue === 'number') {n_2.textContent=fragment.templateValue;fragment.templateType = Inferno.Type.TEXT;} else {fragment.templateType = (fragment.templateValue.constructor === Array ? Inferno.Type.LIST : Inferno.Type.FRAGMENT);}fragment.templateElement = n_2;root.appendChild(n_2);fragment.dom = root;};__944087704.key=944087704;
;function __1024510217(fragment, component){"use strict";var root = Inferno.dom.createElement('div');if(typeof fragment.templateValue === 'string' || typeof fragment.templateValue === 'number') {root.textContent=fragment.templateValue;fragment.templateType = Inferno.Type.TEXT;} else {fragment.templateType = (fragment.templateValue.constructor === Array ? Inferno.Type.LIST : Inferno.Type.FRAGMENT);}fragment.templateElement = root;fragment.dom = root;};__1024510217.key=1024510217;
;function __1149231429(fragment, component){"use strict";var root = Inferno.dom.createElement('div');root.textContent='Switch is off!';fragment.dom = root;};__1149231429.key=1149231429;
;function __1417139913(fragment, component){"use strict";var root = Inferno.dom.createElement('div');var n_0 = Inferno.dom.createElement('button');n_0.textContent='Show';Inferno.dom.addAttributes(n_0, {'onClick':fragment.templateValue}, component);root.appendChild(n_0);var n_1 = Inferno.dom.createElement('div');n_1.textContent='Hidden!';root.appendChild(n_1);fragment.dom = root;};__1417139913.key=1417139913;
;function __1505306658(fragment, component){"use strict";var root = Inferno.dom.createElement('li');var n_0;if(typeof fragment.templateValues[0] === 'string' || typeof fragment.templateValues[0] === 'number') {n_0 = Inferno.dom.createText(fragment.templateValues[0]);fragment.templateTypes[0] = Inferno.Type.TEXT_DIRECT;} else {n_0 = Inferno.dom.createEmpty();fragment.templateTypes[0] = (fragment.templateValues[0].constructor === Array ? Inferno.Type.LIST_REPLACE : Inferno.Type.FRAGMENT_REPLACE);}fragment.templateElements[0] = n_0;root.appendChild(n_0);var n_1 = Inferno.dom.createText(', the magical number is ');root.appendChild(n_1);var n_2;if(typeof fragment.templateValues[1] === 'string' || typeof fragment.templateValues[1] === 'number') {n_2 = Inferno.dom.createText(fragment.templateValues[1]);fragment.templateTypes[1] = Inferno.Type.TEXT_DIRECT;} else {n_2 = Inferno.dom.createEmpty();fragment.templateTypes[1] = (fragment.templateValues[1].constructor === Array ? Inferno.Type.LIST_REPLACE : Inferno.Type.FRAGMENT_REPLACE);}fragment.templateElements[1] = n_2;root.appendChild(n_2);var n_4 = Inferno.dom.createElement('div');n_4.textContent='foo';root.appendChild(n_4);fragment.dom = root;};__1505306658.key=1505306658;
;function __1630775210(fragment, component){"use strict";var root = Inferno.dom.createElement('li');var n_0;if(typeof fragment.templateValues[0] === 'string' || typeof fragment.templateValues[0] === 'number') {n_0 = Inferno.dom.createText(fragment.templateValues[0]);fragment.templateTypes[0] = Inferno.Type.TEXT_DIRECT;} else {n_0 = Inferno.dom.createEmpty();fragment.templateTypes[0] = (fragment.templateValues[0].constructor === Array ? Inferno.Type.LIST_REPLACE : Inferno.Type.FRAGMENT_REPLACE);}fragment.templateElements[0] = n_0;root.appendChild(n_0);var n_1 = Inferno.dom.createText(', the number is ');root.appendChild(n_1);var n_2;if(typeof fragment.templateValues[1] === 'string' || typeof fragment.templateValues[1] === 'number') {n_2 = Inferno.dom.createText(fragment.templateValues[1]);fragment.templateTypes[1] = Inferno.Type.TEXT_DIRECT;} else {n_2 = Inferno.dom.createEmpty();fragment.templateTypes[1] = (fragment.templateValues[1].constructor === Array ? Inferno.Type.LIST_REPLACE : Inferno.Type.FRAGMENT_REPLACE);}fragment.templateElements[1] = n_2;root.appendChild(n_2);var n_4 = Inferno.dom.createElement('div');n_4.textContent='foo';root.appendChild(n_4);fragment.dom = root;};__1630775210.key=1630775210;
;function __1647030613(fragment, component){"use strict";var root = Inferno.dom.createElement('form');var n_0 = Inferno.dom.createElement('input');Inferno.dom.addAttributes(n_0, {'type':'text','value':fragment.templateValues[0]}, component);root.appendChild(n_0);var n_1 = Inferno.dom.createElement('button');n_1.textContent='Turn off form';Inferno.dom.addAttributes(n_1, {'onClick':fragment.templateValues[1]}, component);root.appendChild(n_1);fragment.dom = root;};__1647030613.key=1647030613;
;function __1788624329(fragment, component){"use strict";var root = Inferno.dom.createElement('div');var n_0 = Inferno.dom.createElement('h2');n_0.textContent='No form!';root.appendChild(n_0);var n_1 = Inferno.dom.createElement('button');n_1.textContent='Turn on form';Inferno.dom.addAttributes(n_1, {'onClick':fragment.templateValue}, component);root.appendChild(n_1);fragment.dom = root;};__1788624329.key=1788624329;
;function __0292331807(fragment, component){"use strict";var root = Inferno.dom.createElement('div');Inferno.dom.addAttributes(root, {'class':'main'}, component);var n_0 = Inferno.dom.createElement('button');n_0.textContent='Hide';Inferno.dom.addAttributes(n_0, {'onClick':fragment.templateValues[0]}, component);root.appendChild(n_0);var n_1 = Inferno.dom.createElement('div');var n_1_0 = Inferno.dom.createText('Count is at ');n_1.appendChild(n_1_0);var n_1_1;if(typeof fragment.templateValues[1] === 'string' || typeof fragment.templateValues[1] === 'number') {n_1_1 = Inferno.dom.createText(fragment.templateValues[1]);fragment.templateTypes[1] = Inferno.Type.TEXT_DIRECT;} else {n_1_1 = Inferno.dom.createEmpty();fragment.templateTypes[1] = (fragment.templateValues[1].constructor === Array ? Inferno.Type.LIST_REPLACE : Inferno.Type.FRAGMENT_REPLACE);}fragment.templateElements[1] = n_1_1;n_1.appendChild(n_1_1);root.appendChild(n_1);var n_2 = Inferno.dom.createElement('div');var n_2_0 = Inferno.dom.createElement('span');if(typeof fragment.templateValues[2] === 'string' || typeof fragment.templateValues[2] === 'number') {n_2_0.textContent=fragment.templateValues[2];fragment.templateTypes[2] = Inferno.Type.TEXT;} else {fragment.templateTypes[2] = (fragment.templateValues[2].constructor === Array ? Inferno.Type.LIST : Inferno.Type.FRAGMENT);}fragment.templateElements[2] = n_2_0;Inferno.dom.addAttributes(n_2_0, {'id':'bar'}, component);n_2.appendChild(n_2_0);var n_2_1 = Inferno.dom.createElement('div');var n_2_1_0 = Inferno.dom.createText('The time is ');n_2_1.appendChild(n_2_1_0);var n_2_1_1;if(typeof fragment.templateValues[3] === 'string' || typeof fragment.templateValues[3] === 'number') {n_2_1_1 = Inferno.dom.createText(fragment.templateValues[3]);fragment.templateTypes[3] = Inferno.Type.TEXT_DIRECT;} else {n_2_1_1 = Inferno.dom.createEmpty();fragment.templateTypes[3] = (fragment.templateValues[3].constructor === Array ? Inferno.Type.LIST_REPLACE : Inferno.Type.FRAGMENT_REPLACE);}fragment.templateElements[3] = n_2_1_1;n_2_1.appendChild(n_2_1_1);Inferno.dom.addAttributes(n_2_1, {'id':'time'}, component);n_2.appendChild(n_2_1);var n_2_2;if(typeof fragment.templateValues[4] === 'string' || typeof fragment.templateValues[4] === 'number') {n_2_2 = Inferno.dom.createText(fragment.templateValues[4]);fragment.templateTypes[4] = Inferno.Type.TEXT_DIRECT;} else {n_2_2 = Inferno.dom.createEmpty();fragment.templateTypes[4] = (fragment.templateValues[4].constructor === Array ? Inferno.Type.LIST_REPLACE : Inferno.Type.FRAGMENT_REPLACE);}fragment.templateElements[4] = n_2_2;n_2.appendChild(n_2_2);var n_2_3;if(typeof fragment.templateValues[5] === 'string' || typeof fragment.templateValues[5] === 'number') {n_2_3 = Inferno.dom.createText(fragment.templateValues[5]);fragment.templateTypes[5] = Inferno.Type.TEXT_DIRECT;} else {n_2_3 = Inferno.dom.createEmpty();fragment.templateTypes[5] = (fragment.templateValues[5].constructor === Array ? Inferno.Type.LIST_REPLACE : Inferno.Type.FRAGMENT_REPLACE);}fragment.templateElements[5] = n_2_3;n_2.appendChild(n_2_3);var n_2_4;if(typeof fragment.templateValues[6] === 'string' || typeof fragment.templateValues[6] === 'number') {n_2_4 = Inferno.dom.createText(fragment.templateValues[6]);fragment.templateTypes[6] = Inferno.Type.TEXT_DIRECT;} else {n_2_4 = Inferno.dom.createEmpty();fragment.templateTypes[6] = (fragment.templateValues[6].constructor === Array ? Inferno.Type.LIST_REPLACE : Inferno.Type.FRAGMENT_REPLACE);}fragment.templateElements[6] = n_2_4;n_2.appendChild(n_2_4);var n_2_6 = Inferno.dom.createElement('button');n_2_6.textContent='Switch!';Inferno.dom.addAttributes(n_2_6, {'onClick':fragment.templateValues[7]}, component);n_2.appendChild(n_2_6);var n_2_7 = Inferno.dom.createElement('div');if(typeof fragment.templateValues[8] === 'string' || typeof fragment.templateValues[8] === 'number') {n_2_7.textContent=fragment.templateValues[8];fragment.templateTypes[8] = Inferno.Type.TEXT;} else {fragment.templateTypes[8] = (fragment.templateValues[8].constructor === Array ? Inferno.Type.LIST : Inferno.Type.FRAGMENT);}fragment.templateElements[8] = n_2_7;n_2.appendChild(n_2_7);var n_2_8 = Inferno.dom.createElement('ul');if(typeof fragment.templateValues[9] === 'string' || typeof fragment.templateValues[9] === 'number') {n_2_8.textContent=fragment.templateValues[9];fragment.templateTypes[9] = Inferno.Type.TEXT;} else {fragment.templateTypes[9] = (fragment.templateValues[9].constructor === Array ? Inferno.Type.LIST : Inferno.Type.FRAGMENT);}fragment.templateElements[9] = n_2_8;n_2.appendChild(n_2_8);Inferno.dom.addAttributes(n_2, {'class':fragment.templateValues[10]}, component);root.appendChild(n_2);fragment.dom = root;};__0292331807.key=-292331807;
