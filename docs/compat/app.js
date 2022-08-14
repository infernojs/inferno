'use strict';
import { render, Component } from 'inferno-compat';
import { createElement } from 'inferno-create-element';
var h = createElement;

/*
 Example of using context and setState callback function
 */

function checkParams(state, props, context) {
  console.log(state, props, context);
}

class Button extends Component {
  constructor(props) {
    super(props);
    this.state = {
      btnstate: 'btnstate'
    };
  }

  click() {
    this.setState(checkParams);
  }

  render() {
    return h(
      'button',
      {
        onClick: this.click.bind(this),
        style: { background: this.context.color }
      },
      this.props.children
    );
  }
}

class Message extends Component {
  render() {
    return h('div', null, [this.props.text, h(Button, { buttonProp: 'magic' }, 'btn')]);
  }
}

class MessageList extends Component {
  getChildContext() {
    return { color: 'purple' };
  }

  render() {
    const children = this.props.messages.map(function (message) {
      return h(Message, { text: message.text });
    });

    return h('div', null, children);
  }
}

render(h(MessageList, { messages: [{ text: 'first' }, { text: 'second' }] }), document.getElementById('app1'));

let testValue = 11;
function changeTestValue(event) {
  testValue = event.target.value;

  console.log(event.type, testValue);

  renderLabels();
}

function renderLabels() {
  render(
    h('div', null, [
      h('label', { for: 'test' }, [
        'label for input',
        h('input', {
          id: 'test',
          name: 'testing_radio',
          value: 'first',
          onChange: changeTestValue,
          type: 'radio',
          pattern: '[0-9]+([,.][0-9]+)?',
          inputMode: 'numeric'
        })
      ]),
      h('label', { for: 'test2' }, [
        'label for input2',
        h('input', {
          id: 'test2',
          name: 'testing_radio',
          value: 'second',
          onChange: changeTestValue,
          type: 'radio',
          pattern: '[0-9]+([,.][0-9]+)?',
          inputMode: 'numeric'
        })
      ]),
      h('label', { htmlFor: 'test3' }, [
        'label for input3',
        h('input', {
          id: 'test3',
          name: 'test3',
          value: testValue,
          onChange: changeTestValue,
          type: 'number',
          pattern: '[0-9]+([,.][0-9]+)?',
          inputMode: 'numeric'
        })
      ])
    ]),
    document.getElementById('app2')
  );
}
renderLabels();

// Cursor should not move ....
class NameForm extends Component {
  constructor(props) {
    super(props);
    this.state = { value: 'ASYNC', radio: 'first', text: 'f', selectValue: 'second' };

    this.handleChange = this.handleChange.bind(this);
    this.radioChange = this.radioChange.bind(this);
    this.textChange = this.textChange.bind(this);
    this.selectChange = this.selectChange.bind(this);
  }

  handleChange(event) {
    this.setState({ value: event.target.value });
  }

  radioChange(event) {
    this.setState({ radio: event.target.value });
  }

  textChange(event) {
    this.setState({ text: event.target.value });
  }

  selectChange(event) {
    this.setState({ selectValue: event.target.value });
  }

  render() {
    return h('div', null, [
      h('label', { for: 'testasync' }, [
        'async label for input',
        h('input', {
          id: 'testasync',
          name: 'testing_radio_async',
          value: 'first',
          onClick: this.radioChange,
          checked: this.state.radio === 'first',
          type: 'radio'
        })
      ]),
      h('label', { for: 'test2async' }, [
        'async label for input2',
        h('input', {
          id: 'test2async',
          name: 'testing_radio_async',
          value: 'second',
          onClick: this.radioChange,
          checked: this.state.radio === 'second',
          type: 'radio'
        })
      ]),
      h('label', { htmlFor: 'test3as' }, [
        'Async Name',
        h('input', {
          id: 'test3as',
          name: 'test3as',
          value: this.state.value,
          onInput: this.handleChange,
          type: 'text'
        })
      ]),
      h('label', { htmlFor: 'textarea_async' }, [
        'async texxt',
        h('textarea', {
          id: 'textarea_async',
          name: 'textarea_async',
          value: this.state.text,
          onInput: this.textChange
        })
      ]),
      h(
        'select',
        {
          onChange: this.selectChange,
          value: this.state.selectValue
        },
        [
          h('option', {
            value: 'first',
            children: 'first'
          }),
          h('option', {
            value: 'second',
            children: 'second'
          }),
          h('option', {
            value: 'third',
            children: 'third'
          })
        ]
      )
    ]);
  }
}

let hoisted = h('input', {
  id: 'test3sync',
  name: 'test3sync',
  value: '100',
  type: 'text'
});
let i = 0;
// Cursor should not move ....
class NameForm2 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: 'SYNC',
      radio: 'first',
      text: 'f',
      selectValue: 'second'
    };

    this.handleChange = this.handleChange.bind(this);
    this.radioChange = this.radioChange.bind(this);
    this.textChange = this.textChange.bind(this);
    this.selectChange = this.selectChange.bind(this);
  }

  handleChange(event) {
    hoisted.props.value = 200;
    this.setState({ value: event.target.value });
  }

  radioChange(event) {
    this.setState({ radio: event.target.value });
  }

  textChange(event) {
    this.setState({ text: event.target.value });
  }

  selectChange(event) {
    this.setState({ selectValue: event.target.value });
  }

  render() {
    return h('div', null, [
      h('label', { for: 'testsync' }, [
        'sync label for input',
        h('input', {
          id: 'testsync',
          name: 'testing_radio_sync',
          value: 'first',
          onClick: this.radioChange,
          checked: this.state.radio === 'first',
          type: 'radio'
        })
      ]),
      h('label', { for: 'test2sync' }, [
        'sync label for input2',
        h('input', {
          id: 'test2sync',
          name: 'testing_radio_sync',
          value: 'second',
          onClick: this.radioChange,
          checked: this.state.radio === 'second',
          type: 'radio'
        })
      ]),
      h('label', { htmlFor: 'test3sync' }, [
        'sync Name',
        h('input', {
          id: 'test3sync',
          name: 'test3sync',
          value: this.state.value,
          onInput: this.handleChange,
          type: 'text'
        })
      ]),
      h('label', { htmlFor: 'textarea_sync' }, [
        'sync text',
        h('textarea', {
          id: 'textarea_sync',
          name: 'textarea_sync',
          value: this.state.text,
          onInput: this.textChange
        })
      ]),
      h(
        'select',
        {
          onChange: this.selectChange,
          value: this.state.selectValue
        },
        [
          h('option', {
            value: 'first',
            children: 'first'
          }),
          h('option', {
            value: 'second',
            children: 'second'
          }),
          h('option', {
            value: 'third',
            children: 'third'
          })
        ]
      )
    ]);
  }
}

// render an instance of Clock into <body>:
renderLabels(h(NameForm, {}), document.getElementById('app3'));
renderLabels(h(NameForm2, {}), document.getElementById('app4'));
