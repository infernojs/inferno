import {createComponentVNode, linkEvent, render} from "inferno";

function hoistedEvent(e) {
  console.log("ok", e);
}

function hoistedNonSyntheticEvents() {
  const listItems = [];

  for (let i = 0; i < numberOfNodes; i++) {
    listItems.push(<li onclick={hoistedEvent} $HasTextChildren>${i}</li>)
  }

  return (
    <ul $HasNonKeyedChildren>
      {listItems}
    </ul>
  );
}

function hoistedLinkEventNonSynthetic() {
  const listItems = [];

  for (let i = 0; i < numberOfNodes; i++) {
    listItems.push(<li onclick={linkEvent(i, hoistedEvent)} $HasTextChildren>${i}</li>)
  }

  return (
    <ul $HasNonKeyedChildren>
      {listItems}
    </ul>
  );
}

function hoistedSyntheticEvents() {
  const listItems = [];

  for (let i = 0; i < numberOfNodes; i++) {
    listItems.push(<li onClick={hoistedEvent} $HasTextChildren>${i}</li>)
  }

  return (
    <ul $HasNonKeyedChildren>
      {listItems}
    </ul>
  );
}

function newFuncsNonSyntheticEvents() {
  const listItems = [];

  for (let i = 0; i < numberOfNodes; i++) {
    listItems.push(<li onclick={() => {console.log("ok")}} $HasTextChildren>${i}</li>)
  }

  return (
    <ul $HasNonKeyedChildren>
      {listItems}
    </ul>
  );
}

const numberOfNodes = 500;
const waitMs = 30;
const patchCounter = 7;
const iterations = 10;
const warmUpIterations = 3;

const roots = [hoistedNonSyntheticEvents, hoistedLinkEventNonSynthetic, hoistedSyntheticEvents, newFuncsNonSyntheticEvents];
const names = ['hoistedNonSyntheticEvents', 'hoistedLinkEventNonSynthetic', 'hoistedSyntheticEvents', 'newFuncsNonSyntheticEvents'];

const getAvg = arr => arr.reduce((a,b) => a + b, 0) / arr.length;
const getMin = arr => Math.min(...arr);
const getMax = arr => Math.max(...arr);


function Results({results}) {
  const rows = [];

  for (let i = 0; i < results.length; i++) {
    const testData = results[i];
    const testCases = ['mount', 'patch', 'unmount'];

    rows.push(<div className="test-name">{testData.name}</div>);

    for (let j = 0; j  < testCases.length; j++) {
      const testCase = testCases[j];
      const result = testData[testCase];

      rows.push(<div className="test-part">{testCase}</div>);
      rows.push(<div className="test-result">Avg: {result.avg}</div>);
      rows.push(<div className="test-result">Min: {result.min}</div>);
      rows.push(<div className="test-result">Max: {result.max}</div>);
    }
  }

  return (
    <div className="results" $HasNonKeyedChildren>{rows}</div>
  )
}

document.addEventListener('DOMContentLoaded', function(e) {
  const container = document.querySelector('#App');
  const result = [];
  let mountTimes = [];
  let patchTimes = [];
  let unmountTimes = [];

  let i = 0;

  for (let q = 0; q < warmUpIterations; q++) {
    for (let qw = 0; qw < roots.length; qw++) {
      render(createComponentVNode(1 << 3, roots[qw]), container);
    }
  }

  render(null, container);

  function mountTest(finishCallback) {
    const start = performance.now();
    // Mount
    render(createComponentVNode(1 << 3, roots[i]), container);

    const end = performance.now();

    mountTimes.push(end - start);

    setTimeout(patchTest, waitMs, finishCallback);
  }

  function patchTest(finishCallback) {
    const start = performance.now();

    // Patch loop
    for (let p = 0; p < patchCounter; p++) {
      render(createComponentVNode(1 << 3, roots[i]), container);
    }

    const end = performance.now();

    patchTimes.push(end - start);

    setTimeout(unmountTest, waitMs, finishCallback);
  }

  function unmountTest(finishCallback) {
    const start = performance.now();
    // Mount
    render(null, container);

    const end = performance.now();

    unmountTimes.push(end - start);

    setTimeout(finishCallback, waitMs);
  }

  let iterationCounter = 0;

  function startRound() {
    if (iterationCounter < iterations && i < roots.length) {
      iterationCounter++;
      setTimeout(mountTest, waitMs, startRound);
    } else if (i < roots.length) {
      result.push({
        name: names[i],
        mount: {
          min: getMin(mountTimes),
          avg: getAvg(mountTimes),
          max: getMax(mountTimes)
        },
        patch: {
          min: getMin(patchTimes),
          avg: getAvg(patchTimes),
          max: getMax(patchTimes)
        },
        unmount: {
          min: getMin(unmountTimes),
          avg: getAvg(unmountTimes),
          max: getMax(unmountTimes)
        }
      });

      mountTimes = [];
      patchTimes = [];
      unmountTimes = [];

      i++;
      iterationCounter = 0;

      startRound(); // Go next
    } else {
      // Finished!
      setTimeout(function () {
        render(
          <Results results={result}/>
        , container);
      }, 1000);
    }
  }

  startRound();
});
