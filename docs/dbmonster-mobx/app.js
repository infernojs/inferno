// import { startFPSMonitor, startMemMonitor, initProfiler, startProfile, endProfile } from 'perf-monitor';
import { createVNode, createComponentVNode, createFragment, render, Component } from 'inferno';
import { observerWrap, observerPatch, observer } from 'inferno-mobx';
import { action, observable } from 'mobx';
import { VNodeFlags } from 'inferno-vnode-flags';

let counter = 0;
const data = (() => {
  const generate = () => {
    const nbQueries = Math.floor(Math.random() * 10 + 1);
    const queries = [];
    for (let l = 0; l < 12; l++) {
      queries.push(
        updateQuery({
          query: '***',
          formatElapsed: '',
          elapsedClassName: '',
          elapsed: null,
          waiting: null
        })
      );
    }
    return {
      nbQueries,
      countClassName: countClassName(nbQueries),
      queries: queries
    };
  };
  const temp = [];
  for (let i = 1; i <= 50; i++) {
    temp.push({
      dbname: 'cluster' + i,
      lastSample: generate()
    });
    temp.push({
      dbname: 'cluster' + i + ' replica',
      lastSample: generate()
    });
  }
  for (const row of temp) {
    counter = counter + 1;
    generateRow(row, counter, 12);
  }
  return observable(temp);
})();

function formatElapsed(value) {
  var comps;

  if (value > 60) {
    comps = (value % 60).toFixed(2).split('.');

    return Math.floor(value / 60) + ':' + comps[0].lpad('0', 2) + '.' + comps[1];
  }

  return parseFloat(value).toFixed(2);
}

function getElapsedClassName(elapsed) {
  var className = 'Query elapsed';
  if (elapsed >= 10.0) {
    className += ' warn_long';
  } else if (elapsed >= 1.0) {
    className += ' warn';
  } else {
    className += ' short';
  }
  return className;
}

function countClassName(queries) {
  var countClassName = 'label';
  if (queries >= 20) {
    countClassName += ' label-important';
  } else if (queries >= 10) {
    countClassName += ' label-warning';
  } else {
    countClassName += ' label-success';
  }
  return countClassName;
}

function updateQuery(object) {
  const elapsed = Math.random() * 15;
  object.elapsed = elapsed;
  object.formatElapsed = formatElapsed(elapsed);
  object.elapsedClassName = getElapsedClassName(elapsed);
  object.query = 'SELECT blah FROM something';
  object.waiting = Math.random() < 0.5;
  if (Math.random() < 0.2) {
    object.query = '<IDLE> in transaction';
  }
  if (Math.random() < 0.1) {
    object.query = 'vacuum';
  }
  return object;
}

function cleanQuery(value) {
  value.formatElapsed = '';
  value.elapsedClassName = '';
  value.query = '';
  value.elapsed = null;
  value.waiting = null;
}

function generateRow(object, counter, nbQueries) {
  object.lastMutationId = counter;
  for (let j = 0; j < 12; j++) {
    const value = object.lastSample.queries[j];
    if (j <= nbQueries) {
      updateQuery(value);
    } else {
      cleanQuery(value);
    }
  }
  object.lastSample.nbQueries = nbQueries;
  object.lastSample.countClassName = countClassName(nbQueries);
  return object;
}

function updateData() {
  for (let row of data) {
    if (Math.random() < mutations()) {
      counter = counter + 1;
      generateRow(row, counter, Math.floor(Math.random() * 10 + 1));
    }
  }
}

var mutationsValue = 0.5;

function mutations(value) {
  if (value) {
    mutationsValue = value;
    return mutationsValue;
  } else {
    return mutationsValue;
  }
}

const app = document.getElementById('app');

var body = document.querySelector('body');
var theFirstChild = body.firstChild;

var sliderContainer = document.createElement('div');
sliderContainer.style.cssText = 'display: flex';
var slider = document.createElement('input');
var text = document.createElement('label');
text.innerHTML = 'mutations : ' + (mutationsValue * 100).toFixed(0) + '%';
text.id = 'ratioval';
slider.setAttribute('type', 'range');
slider.style.cssText = 'margin-bottom: 10px; margin-top: 5px';
slider.addEventListener('change', function (e) {
  mutations(e.target.value / 100);
  document.querySelector('#ratioval').innerHTML = 'mutations : ' + (mutations() * 100).toFixed(0) + '%';
});
sliderContainer.appendChild(text);
sliderContainer.appendChild(slider);
body.insertBefore(sliderContainer, theFirstChild);

class QueryObserver extends Component {
  render({ query }) {
    return createVNode(
      1,
      'td',
      query.elapsedClassName,
      [
        createVNode(1, 'div', null, query.formatElapsed, 16, null, null, null),
        createVNode(
          1,
          'div',
          'popover left',
          [createVNode(1, 'div', 'popover-content', query.query, 16, null, null, null), createVNode(1, 'div', 'arrow', null, 1, null, null, null)],
          4,
          null,
          null,
          null
        )
      ],
      4,
      null,
      null,
      null
    );
  }
}

observer(QueryObserver);

class QueriesObserver extends Component {
  render({ top }) {
    return createFragment(
      top.slice(0, 5).map((query) => {
        return createComponentVNode(VNodeFlags.ComponentClass, QueryObserver, { query });
      }),
      4
    );
  }
}

observer(QueriesObserver);

class RowObserver extends Component {
  render({ db }) {
    const lastSample = db.lastSample;
    const children = [
      createVNode(1, 'td', 'dbname', db.dbname, 16, null, null, null),
      createVNode(1, 'td', 'query-count', createVNode(1, 'span', lastSample.countClassName, lastSample.nbQueries, 16, null, null, null), 2, null, null, null),
      createComponentVNode(VNodeFlags.ComponentClass, QueriesObserver, { top: lastSample.queries })
    ];
    return createVNode(1, 'tr', null, children, 4, null, null, null);
  }
}

observer(RowObserver);

class TableObserver extends Component {
  render({ list }) {
    const children = [];
    for (const db of list) {
      children.push(createComponentVNode(VNodeFlags.ComponentClass, RowObserver, { db }));
    }
    return createVNode(
      1,
      'table',
      'table table-striped',
      [createVNode(1, 'caption', null, 'inferno-mobx observer', 16, null, null, null), createVNode(1, 'tbody', null, children, 4, null, null, null)],
      4,
      null,
      null,
      null
    );
  }
}

observer(TableObserver);

class QueryClass extends Component {
  render({ query }) {
    return createVNode(
      1,
      'td',
      query.elapsedClassName,
      [
        createVNode(1, 'div', null, query.formatElapsed, 16, null, null, null),
        createVNode(
          1,
          'div',
          'popover left',
          [createVNode(1, 'div', 'popover-content', query.query, 16, null, null, null), createVNode(1, 'div', 'arrow', null, 1, null, null, null)],
          4,
          null,
          null,
          null
        )
      ],
      4,
      null,
      null,
      null
    );
  }
  shouldComponentUpdate({ query }) {
    return query !== this.props.query;
  }
}

observerPatch(QueryClass);

class QueriesClass extends Component {
  render({ top }) {
    return createFragment(
      top.slice(0, 5).map((query) => {
        return createComponentVNode(VNodeFlags.ComponentClass, QueryClass, { query });
      }),
      4
    );
  }
  shouldComponentUpdate({ top }) {
    return top !== this.props.top;
  }
}

observerPatch(QueriesClass);

class RowClass extends Component {
  render({ db }) {
    const lastSample = db.lastSample;
    const children = [
      createVNode(1, 'td', 'dbname', db.dbname, 16, null, null, null),
      createVNode(1, 'td', 'query-count', createVNode(1, 'span', lastSample.countClassName, lastSample.nbQueries, 16, null, null, null), 2, null, null, null),
      createComponentVNode(VNodeFlags.ComponentClass, QueriesClass, { top: lastSample.queries })
    ];
    return createVNode(1, 'tr', null, children, 4, null, null, null);
  }
  shouldComponentUpdate({ db }) {
    return db !== this.props.db;
  }
}

observerPatch(RowClass);

class TableClass extends Component {
  render({ list }) {
    const children = [];
    for (const db of list) {
      children.push(createComponentVNode(VNodeFlags.ComponentClass, RowClass, { db }));
    }
    return createVNode(
      1,
      'table',
      'table table-striped',
      [createVNode(1, 'caption', null, 'inferno-mobx observerPatch', 16, null, null, null), createVNode(1, 'tbody', null, children, 4, null, null, null)],
      4,
      null,
      null,
      null
    );
  }
  shouldComponentUpdate({ list }) {
    return list !== this.props.list;
  }
}

observerPatch(TableClass);

function QueryComponent({ query }) {
  return createVNode(
    1,
    'td',
    query.elapsedClassName,
    [
      createVNode(1, 'div', null, query.formatElapsed, 16, null, null, null),
      createVNode(
        1,
        'div',
        'popover left',
        [createVNode(1, 'div', 'popover-content', query.query, 16, null, null, null), createVNode(1, 'div', 'arrow', null, 1, null, null, null)],
        4,
        null,
        null,
        null
      )
    ],
    4,
    null,
    null,
    null
  );
}

QueryComponent.defaultHooks = {
  onComponentShouldUpdate: ({ query: prev }, { query: next }) => prev !== next
};

const Query = observerWrap(QueryComponent);

function QueriesComponent({ top }) {
  return createFragment(
    top.slice(0, 5).map((query) => {
      return createComponentVNode(VNodeFlags.ComponentFunction, Query, { query });
    }),
    4
  );
}

QueriesComponent.defaultHooks = {
  onComponentShouldUpdate: ({ top: prev }, { top: next }) => prev !== next
};

const Queries = observerWrap(QueriesComponent);

function RowComponent({ db }) {
  const lastSample = db.lastSample;
  const children = [
    createVNode(1, 'td', 'dbname', db.dbname, 16, null, null, null),
    createVNode(1, 'td', 'query-count', createVNode(1, 'span', lastSample.countClassName, lastSample.nbQueries, 16, null, null, null), 2, null, null, null),
    createComponentVNode(VNodeFlags.ComponentFunction, Queries, { top: lastSample.queries })
  ];
  return createVNode(1, 'tr', null, children, 4, null, null, null);
}

RowComponent.defaultHooks = {
  onComponentShouldUpdate: ({ db: prev }, { db: next }) => prev !== next
};

const Row = observerWrap(RowComponent);

function TableComponent({ list }) {
  const children = [];
  for (const db of list) {
    children.push(createComponentVNode(VNodeFlags.ComponentFunction, Row, { db }));
  }
  return createVNode(
    1,
    'table',
    'table table-striped',
    [createVNode(1, 'caption', null, 'inferno-mobx observerWrap', 16, null, null, null), createVNode(1, 'tbody', null, children, 4, null, null, null)],
    4,
    null,
    null,
    null
  );
}

TableComponent.defaultHooks = {
  onComponentShouldUpdate: ({ list: prev }, { list: next }) => prev !== next
};

const Table = observerWrap(TableComponent);

const update = action(() => {
  updateData();
  // startProfile('view update');
});

function loop() {
  update();
  // endProfile('view update');
}

// startFPSMonitor();
// startMemMonitor();
// initProfiler('view update');

// functional components with observerWrap
render(createComponentVNode(VNodeFlags.ComponentFunction, Table, { list: data }), app);

// class components with observerPatch
//render(createComponentVNode(VNodeFlags.ComponentClass, TableClass, { list: data }), app);

// class components with observer
//render(createComponentVNode(VNodeFlags.ComponentClass, TableObserver, { list: data }), app);

setInterval(loop, 0);
