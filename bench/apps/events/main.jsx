// Port of docs/event-test/app.js: four event-handler strategies on N list items.
// Cases are `<phase>:<strategy>` where phase is mount | patch | unmount | dispatch.
// The dispatch op is a real click on one list item, so it measures Inferno's
// delegated vs native event paths end to end. Handlers bump a counter instead
// of logging, keeping console work out of the measurement.
import { createComponentVNode, linkEvent, render } from 'inferno';
import { createOpButton, installHarness } from '../shared/harness.js';

const numberOfNodes = Number(new URLSearchParams(location.search).get('nodes') ?? 500);
let handled = 0;

function hoistedEvent() {
  handled++;
}

function hoistedNonSyntheticEvents() {
  const listItems = [];
  for (let i = 0; i < numberOfNodes; i++) {
    listItems.push(
      <li onclick={hoistedEvent} $HasTextChildren>
        {i}
      </li>,
    );
  }
  return <ul $HasNonKeyedChildren>{listItems}</ul>;
}

function hoistedLinkEventNonSynthetic() {
  const listItems = [];
  for (let i = 0; i < numberOfNodes; i++) {
    listItems.push(
      <li onclick={linkEvent(i, hoistedEvent)} $HasTextChildren>
        {i}
      </li>,
    );
  }
  return <ul $HasNonKeyedChildren>{listItems}</ul>;
}

function hoistedSyntheticEvents() {
  const listItems = [];
  for (let i = 0; i < numberOfNodes; i++) {
    listItems.push(
      <li onClick={hoistedEvent} $HasTextChildren>
        {i}
      </li>,
    );
  }
  return <ul $HasNonKeyedChildren>{listItems}</ul>;
}

function linkEventSynthetic() {
  const listItems = [];
  for (let i = 0; i < numberOfNodes; i++) {
    listItems.push(
      <li onClick={linkEvent(i, hoistedEvent)} $HasTextChildren>
        {i}
      </li>,
    );
  }
  return <ul $HasNonKeyedChildren>{listItems}</ul>;
}

function newFuncsNonSyntheticEvents() {
  const listItems = [];
  for (let i = 0; i < numberOfNodes; i++) {
    listItems.push(
      <li
        onclick={() => {
          handled++;
        }}
        $HasTextChildren
      >
        {i}
      </li>,
    );
  }
  return <ul $HasNonKeyedChildren>{listItems}</ul>;
}

function newFuncsSyntheticEvents() {
  const listItems = [];
  for (let i = 0; i < numberOfNodes; i++) {
    listItems.push(
      <li
        onClick={() => {
          handled++;
        }}
        $HasTextChildren
      >
        {i}
      </li>,
    );
  }
  return <ul $HasNonKeyedChildren>{listItems}</ul>;
}

const strategies = {
  'native-hoisted': hoistedNonSyntheticEvents,
  'native-linkEvent': hoistedLinkEventNonSynthetic,
  'native-newFuncs': newFuncsNonSyntheticEvents,
  'synthetic-hoisted': hoistedSyntheticEvents,
  'synthetic-linkEvent': linkEventSynthetic,
  'synthetic-newFuncs': newFuncsSyntheticEvents,
};

const container = document.getElementById('App');
const show = (strategy) => render(createComponentVNode(1 << 3, strategies[strategy]), container);

let pending = null;
const opSelector = createOpButton(() => pending());
const cases = Object.keys(strategies).flatMap((s) => ['mount', 'patch', 'unmount', 'dispatch'].map((p) => `${p}:${s}`));

installHarness({
  root: () => container,
  cases,
  prepare(name) {
    const [phase, strategy] = name.split(':');
    if (!strategies[strategy]) {
      throw new Error(`Unknown events case ${name}`);
    }
    if (phase === 'mount') {
      render(null, container);
      pending = () => show(strategy);
    } else if (phase === 'patch') {
      show(strategy);
      pending = () => show(strategy);
    } else if (phase === 'unmount') {
      show(strategy);
      pending = () => render(null, container);
    } else if (phase === 'dispatch') {
      show(strategy);
      pending = null;
      // Middle item: the click walks the whole ancestor chain like any real click.
      return `#App li:nth-child(${Math.ceil(numberOfNodes / 2)})`;
    } else {
      throw new Error(`Unknown events phase ${phase}`);
    }
    return opSelector;
  },
  op: opSelector,
  extra: { handled: () => handled },
});
