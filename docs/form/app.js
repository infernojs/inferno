import { render, linkEvent } from 'inferno';
import { h } from 'inferno-hyperscript';

let firstName = 'Dominic';
let lastName = null;
let age = 28;
let description = null;

// special input values
let id = 'test';
let testValue = 11;
function changeTestValue(event) {
  testValue = event.target.value;

  console.log(event.type, testValue);

  renderForm();
}

function linkedTextHandler(data, e) {
  const val = e.target.value;

  firstName = val;
  renderForm();
}

function textHandler(e) {
  const val = e.target.value;

  lastName = val;
  renderForm();
}

function numberHandler(e) {
  const val = e.target.value;

  age = val;
  renderForm();
}

function descHandler(e) {
  const val = e.target.value;

  description = val;
  renderForm();
}

function handleToggle(e) {
  console.log('Checkbox clicked!');
}

function renderForm() {
  render(
    h('form.form', [
      h('div.form-group', [
        h('label', 'Please enter your first name name:'),
        h('input', {
          type: 'text',
          placeholder: 'Joe',
          value: firstName,
          onInput: linkEvent({ data: '123' }, linkedTextHandler)
        })
      ]),
      h('div.form-group', [
        h('label', 'Please enter your first last name:'),
        h('input', {
          type: 'text',
          placeholder: 'Bloggs',
          defaultValue: 'Gannaway',
          onInput: textHandler
        })
      ]),
      h('div.form-group', [h('label', 'Please enter your age:'), h('input', { type: 'number', value: age, min: 0, max: 99, onInput: numberHandler })]),
      h('div.form-group', [
        h('label', 'What is your favourite food:'),
        h('div.inline', [h('input', { type: 'radio', name: 'food', defaultChecked: false, onClick: handleToggle }), h('span', 'Pizza')]),
        h('div.inline', [h('input', { type: 'radio', name: 'food', defaultChecked: true, onClick: handleToggle }), h('span', 'Pasta')])
      ]),
      h('div.form-group', [
        h('label', 'Please enter your location:'),
        h('select', { value: 'United Kingdom' }, [
          h('option', { selected: false }, 'United States'),
          h('option', { selected: true }, 'United Kingdom'),
          h('option', { selected: false }, 'France')
        ])
      ]),
      h('div.form-group', [
        h('label', 'Please enter a description:'),
        h('textarea', {
          defaultValue: "I don't know?",
          value: description,
          onInput: descHandler
        })
      ]),
      h('div.form-group', [h('label', 'Color picker (html5):'), h('input', { type: 'color' })]),
      h('label', { for: 'test' }, [
        'Label',
        h('input#test', {
          id: id,
          name: id,
          value: testValue,
          onChange: changeTestValue,
          onInput: changeTestValue,
          onKeyup: changeTestValue,
          type: 'number',
          pattern: '[0-9]+([,.][0-9]+)?',
          inputMode: 'numeric',
          min: 10
        })
      ])
    ]),
    document.getElementById('app')
  );
}
renderForm();
