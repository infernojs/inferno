import {isNullOrUndef} from 'inferno-shared';
import {createWrappedFunction} from './wrapper';
import {attachEvent} from '../events/attachEvent';

export function isCheckedType(type): boolean {
  return type === 'checkbox' || type === 'radio';
}

const onTextInputChange = createWrappedFunction('onInput', applyValueInput);

const wrappedOnChange = createWrappedFunction(['onClick', 'onChange'], applyValueInput);

/* tslint:disable-next-line:no-empty */
function emptywrapper(event) {
  event.stopPropagation();
}
(emptywrapper as any).wrapped = true;

export function inputEvents(dom, nextPropsOrEmpty) {
  if (isCheckedType(nextPropsOrEmpty.type)) {
    attachEvent(dom, 'change', wrappedOnChange);
    attachEvent(dom, 'click', emptywrapper);
  } else {
    attachEvent(dom, 'input', onTextInputChange);
  }
}

export function applyValueInput(nextPropsOrEmpty, dom) {
  const type = nextPropsOrEmpty.type;
  const value = nextPropsOrEmpty.value;
  const checked = nextPropsOrEmpty.checked;
  const multiple = nextPropsOrEmpty.multiple;
  const defaultValue = nextPropsOrEmpty.defaultValue;
  const hasValue = !isNullOrUndef(value);

  if (type && type !== dom.type) {
    dom.setAttribute('type', type);
  }
  if (!isNullOrUndef(multiple) && multiple !== dom.multiple) {
    dom.multiple = multiple;
  }
  if (!isNullOrUndef(defaultValue) && !hasValue) {
    dom.defaultValue = defaultValue + '';
  }
  if (isCheckedType(type)) {
    if (hasValue) {
      dom.value = value;
    }
    if (!isNullOrUndef(checked)) {
      dom.checked = checked;
    }
  } else {
    if (hasValue && dom.value !== value) {
      dom.defaultValue = value;
      dom.value = value;
    } else if (!isNullOrUndef(checked)) {
      dom.checked = checked;
    }
  }
}
