(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
      (factory((global.uibench = global.uibench || {})));
}(this, function (exports) { 'use strict';

  var TableAlphabetLength = 10;
  var TableAlphabets = [
    "0123456789",
    "3057846291",
    "8356294107",
    "0861342795",
  ];
  var HomeState = (function () {
    function HomeState() {
    }
    HomeState.prototype.clone = function () {
      return this;
    };
    return HomeState;
  }());
  var TableItemState = (function () {
    function TableItemState(id, active, props) {
      this.id = id;
      this.active = active;
      this.props = props;
    }
    TableItemState.prototype.clone = function () {
      return new TableItemState(this.id, this.active, this.props.slice(0));
    };
    TableItemState.create = function (active, props) {
      return new TableItemState(TableItemState._nextId++, active, props);
    };
    TableItemState._nextId = 0;
    return TableItemState;
  }());
  var TableState = (function () {
    function TableState(items) {
      this.items = items;
    }
    TableState.prototype.clone = function () {
      return new TableState(this.items.map(function (i) { return i.clone(); }));
    };
    TableState.create = function (rows, cols) {
      var items = [];
      for (var i = 0; i < rows; i++) {
        var props = [];
        for (var j = 0; j < cols; j++) {
          var str = "";
          var n = i;
          var alphabet = TableAlphabets[j];
          while (n >= TableAlphabetLength) {
            str += alphabet[n % TableAlphabetLength];
            n = n / TableAlphabetLength | 0;
          }
          str += alphabet[n % TableAlphabetLength];
          props.push(str);
        }
        items.push(TableItemState.create(false, props));
      }
      return new TableState(items);
    };
    return TableState;
  }());
  var AnimBoxState = (function () {
    function AnimBoxState(id, time) {
      this.id = id;
      this.time = time;
    }
    AnimBoxState.prototype.clone = function () {
      return new AnimBoxState(this.id, this.time);
    };
    AnimBoxState.create = function (time) {
      return new AnimBoxState(AnimBoxState._nextId++, time);
    };
    AnimBoxState._nextId = 0;
    return AnimBoxState;
  }());
  var AnimState = (function () {
    function AnimState(items) {
      this.items = items;
    }
    AnimState.prototype.clone = function () {
      return new AnimState(this.items.map(function (i) { return i.clone(); }));
    };
    AnimState.create = function (count) {
      var items = [];
      for (var i = 0; i < count; i++) {
        items.push(AnimBoxState.create(0));
      }
      return new AnimState(items);
    };
    return AnimState;
  }());
  var TreeNodeState = (function () {
    function TreeNodeState(id, container, children) {
      this.id = id;
      this.container = container;
      this.children = children;
    }
    TreeNodeState.prototype.clone = function () {
      return new TreeNodeState(this.id, this.container, this.children ? this.children.map(function (i) { return i.clone(); }) : this.children);
    };
    TreeNodeState.create = function (container, children) {
      return new TreeNodeState(TreeNodeState._nextId++, container, children);
    };
    TreeNodeState._nextId = 0;
    return TreeNodeState;
  }());
  var TreeState = (function () {
    function TreeState(root) {
      this.root = root;
    }
    TreeState.prototype.clone = function () {
      return new TreeState(this.root.clone());
    };
    TreeState.create = function (hierarchy) {
      function _create(depth) {
        var count = hierarchy[depth];
        var children = [];
        if (depth === (hierarchy.length - 1)) {
          for (var i = 0; i < count; i++) {
            children.push(TreeNodeState.create(false, null));
          }
        }
        else {
          for (var i = 0; i < count; i++) {
            children.push(TreeNodeState.create(true, _create(depth + 1)));
          }
        }
        return children;
      }
      return new TreeState(TreeNodeState.create(true, _create(0)));
    };
    return TreeState;
  }());
  var AppState = (function () {
    function AppState(location, home, table, anim, tree) {
      this.location = location;
      this.home = home;
      this.table = table;
      this.anim = anim;
      this.tree = tree;
    }
    AppState.prototype.clone = function () {
      return new AppState(this.location, this.home.clone(), this.table.clone(), this.anim.clone(), this.tree.clone());
    };
    return AppState;
  }());

  function switchTo(state, location) {
    if (state.location === location) {
      return state;
    }
    else {
      return new AppState(location, state.home, state.table, state.anim, state.tree);
    }
  }
  function tableCreate(state, rows, cols) {
    return new AppState(state.location, state.home, TableState.create(rows, cols), state.anim, state.tree);
  }
  function tableFilterBy(state, nth) {
    return new AppState(state.location, state.home, new TableState(state.table.items.filter(function (item, i) { return (i + 1) % nth; })), state.anim, state.tree);
  }
  function tableSortBy(state, i) {
    var newItems = state.table.items.slice();
    newItems.sort(function (a, b) { return a.props[i].localeCompare(b.props[i]); });
    return new AppState(state.location, state.home, new TableState(newItems), state.anim, state.tree);
  }
  function tableActivateEach(state, nth) {
    return new AppState(state.location, state.home, new TableState(state.table.items.map(function (item, i) { return (i + 1) % nth ?
      item :
      new TableItemState(item.id, true, item.props); })), state.anim, state.tree);
  }
  function animAdvanceEach(state, nth) {
    return new AppState(state.location, state.home, state.table, new AnimState(state.anim.items.map(function (item, i) { return (i + 1) % nth ? item : new AnimBoxState(item.id, item.time + 1); })), state.tree);
  }
  function treeCreate(state, hierarchy) {
    return new AppState(state.location, state.home, state.table, state.anim, TreeState.create(hierarchy));
  }
  function treeTransform(state, transformers) {
    function transform(node, depth) {
      var t = transformers[depth];
      if (node.children !== null) {
        var children = t(node.children);
        if (depth < (transformers.length - 1)) {
          children.map(function (item) { return transform(item, depth + 1); });
        }
        return new TreeNodeState(node.id, node.container, children);
      }
      return new TreeNodeState(node.id, node.container, null);
    }
    return new AppState(state.location, state.home, state.table, state.anim, new TreeState(transform(state.tree.root, 0)));
  }

  function reverse(children) {
    var r = children.slice();
    r.reverse();
    return r;
  }
  function snabbdomWorstCase(children) {
    var r = children.slice();
    var a = r.shift();
    var b = r.splice(r.length - 2, 1);
    r.push(a, b[0]);
    return r;
  }
  function insertFirst(n) {
    return function (children) {
      children = children.slice();
      for (var i = 0; i < n; i++) {
        children.unshift(TreeNodeState.create(false, null));
      }
      return children;
    };
  }
  function insertLast(n) {
    return function (children) {
      children = children.slice();
      for (var i = 0; i < n; i++) {
        children.push(TreeNodeState.create(false, null));
      }
      return children;
    };
  }
  function removeFirst(n) {
    return function (children) {
      children = children.slice();
      for (var i = 0; i < n; i++) {
        children.shift();
      }
      return children;
    };
  }
  function removeLast(n) {
    return function (children) {
      children = children.slice();
      for (var i = 0; i < n; i++) {
        children.pop();
      }
      return children;
    };
  }
  function moveFromEndToStart(n) {
    return function (children) {
      children = children.slice();
      for (var i = 0; i < n; i++) {
        children.unshift(children.pop());
      }
      return children;
    };
  }
  function moveFromStartToEnd(n) {
    return function (children) {
      children = children.slice();
      for (var i = 0; i < n; i++) {
        children.push(children.shift());
      }
      return children;
    };
  }

  function tableTests(onUpdate) {
    var state = tableActivateEach(new AppState("table", new HomeState(), TableState.create(2, 2), AnimState.create(0), TreeState.create([0])), 2);
    state.table.items[0].id = 300;
    state.table.items[1].id = 301;
    onUpdate(state, "update");
    // var table = document.getElementsByClassName("Table");
    // if (table.length !== 1) {
    //   throw new Error("Spec test failed: table with Table className doesn't exists");
    // }
    // var rows = document.getElementsByClassName("TableRow");
    // if (rows.length !== 2) {
    //   throw new Error("Spec test failed: invalid number of TableRows");
    // }
    // if (rows[0].getAttribute("data-id") !== "300") {
    //   throw new Error("Spec test failed: invalid data-id attribute in the TableRow");
    // }
    // if (rows[1].className.indexOf("active") === -1) {
    //   throw new Error("Spec test failed: TableRow should have active className when it is activated");
    // }
    // var cells = document.getElementsByClassName("TableCell");
    // if (cells.length !== 6) {
    //   throw new Error("Spec test failed: invalid number of TableCells");
    // }
    // if (cells[0].textContent !== "#300") {
    //   throw new Error("Spec test failed: invalid textContent in the id TableCell");
    // }
    // if (cells[1].textContent !== "0") {
    //   throw new Error("Spec test failed: invalid textContent in the data TableCell");
    // }
    // if (cells[2].textContent !== "3") {
    //   throw new Error("Spec test failed: invalid textContent in the data TableCell");
    // }
    // var logFn = console.log;
    // var clicked = false;
    // console.log = function () {
    //   clicked = true;
    // };
    // cells[1].click();
    // console.log = logFn;
    // if (clicked === false) {
    //   throw new Error("Spec test failed: TableCell doesn't have onClick event listener that prints to the console");
    // }
  }
  function animTests(onUpdate) {
    var state = new AppState("anim", new HomeState(), TableState.create(0, 0), AnimState.create(2), TreeState.create([0]));
    state.anim.items[0].id = 100;
    state.anim.items[1].id = 101;
    state = animAdvanceEach(state, 2);
    onUpdate(state, "update");
    // var anim = document.getElementsByClassName("Anim");
    // if (anim.length !== 1) {
    //   throw new Error("Spec test failed: div with Anim className doesn't exists");
    // }
    // var boxes = document.getElementsByClassName("AnimBox");
    // if (boxes.length !== 2) {
    //   throw new Error("Spec test failed: invalid number of AnimBoxes");
    // }
    // if (boxes[0].getAttribute("data-id") !== "100") {
    //   throw new Error("Spec test failed: invalid data-id attribute in the AnimBox");
    // }
    // if (boxes[0].style.borderRadius !== "0px") {
    //   throw new Error("Spec test failed: invalid borderRadius style in the AnimBox");
    // }
    // if (boxes[1].style.borderRadius !== "1px") {
    //   throw new Error("Spec test failed: invalid borderRadius style in the AnimBox");
    // }
    // if (!boxes[0].style.background) {
    //   throw new Error("Spec test failed: invalid background style in the AnimBox");
    // }
  }
  function treeTests(onUpdate) {
    var state = new AppState("tree", new HomeState(), TableState.create(0, 0), AnimState.create(0), TreeState.create([1, 2]));
    state.tree.root.children[0].children[0].id = 2081;
    state.tree.root.children[0].children[1].id = 2082;
    onUpdate(state, "update");
    // var tree = document.getElementsByClassName("Tree");
    // if (tree.length !== 1) {
    //   throw new Error("Spec test failed: div with Tree className doesn't exists");
    // }
    // var treeNodes = document.getElementsByClassName("TreeNode");
    // if (treeNodes.length !== 2) {
    //   throw new Error("Spec test failed: invalid number of TreeNodes");
    // }
    // var treeLeafs = document.getElementsByClassName("TreeLeaf");
    // if (treeLeafs.length !== 2) {
    //   throw new Error("Spec test failed: invalid number of TreeLeafs");
    // }
    // if (treeLeafs[0].textContent !== "2081") {
    //   throw new Error("Spec test failed: invalid textContent in the TreeLeaf");
    // }
    // if (treeLeafs[1].textContent !== "2082") {
    //   throw new Error("Spec test failed: invalid textContent in the TreeLeaf");
    // }
  }
  function specTest(onUpdate) {
    var state = new AppState("table", new HomeState(), TableState.create(0, 0), AnimState.create(0), TreeState.create([0]));
    onUpdate(state, "init");
    var mainTag = document.getElementsByClassName("Main");
    // if (mainTag.length !== 1) {
    //   throw new Error("Spec test failed: div tag with Main className doesn\"t exists");
    // }
    tableTests(onUpdate);
    animTests(onUpdate);
    treeTests(onUpdate);
  }
  function scuTest(onUpdate, onFinish) {
    var state = new AppState("table", new HomeState(), TableState.create(1, 1), AnimState.create(0), TreeState.create([0]));
    state.table.items[0].props[0] = "a";
    onUpdate(state, "init");
    // var node = document.getElementsByClassName("TableCell")[1];
    // if (!node || node.textContent !== "a") {
    //   throw new Error("SCU test failed");
    // }
    // state.table.items[0].props[0] = "b";
    // onUpdate(state, "update");
    // node = document.getElementsByClassName("TableCell")[1];
    // if (!node) {
    //   throw new Error("SCU test failed");
    // }
    // var result = true;
    // if (node.textContent !== "a") {
    //   if (node.textContent === "b") {
    //     result = false;
    //   }
    //   else {
    //     throw new Error("SCU test failed");
    //   }
    // }
    window.requestAnimationFrame(function () {
      onFinish(true);
    });
  }
  function recyclingTest(onUpdate, onFinish) {
    // var initialState = new AppState("tree", new HomeState(), TableState.create(0, 0), AnimState.create(0), TreeState.create([0]));
    // var toState = treeCreate(initialState, [1]);
    // onUpdate(initialState, "init");
    // onUpdate(toState, "update");
    // var a = document.getElementsByClassName("TreeLeaf")[0];
    // onUpdate(initialState, "init");
    // onUpdate(toState, "update");
    // var b = document.getElementsByClassName("TreeLeaf")[0];
    // if (!a || !b) {
    //   throw new Error("recycling test failed");
    // }
    // var result = (a === b);
    window.requestAnimationFrame(function () {
      onFinish(false);
    });
  }
  function preserveStateTest(onUpdate, onFinish) {
    // var state = "uibench_" + Math.random();
    // // Check tables
    // var tableInit = new AppState("table", new HomeState(), TableState.create(3, 1), AnimState.create(0), TreeState.create([0]));
    // var tableUpdate = tableFilterBy(tableInit, 2);
    // onUpdate(tableInit, "init");
    // var tableRows = document.getElementsByClassName("TableRow");
    // tableRows[2]._uibenchState = state;
    // onUpdate(tableUpdate, "init");
    // tableRows = document.getElementsByClassName("TableRow");
    // var result = tableRows[1]._uibenchState === state;
    // // Check trees
    // var treeInit = new AppState("tree", new HomeState(), TableState.create(0, 0), AnimState.create(0), TreeState.create([2]));
    // var treeUpdate = treeTransform(treeInit, [reverse]);
    // onUpdate(treeInit, "init");
    // var treeLeafs = document.getElementsByClassName("TreeLeaf");
    // treeLeafs[0]._uibenchState = state;
    // onUpdate(treeUpdate, "update");
    // treeLeafs = document.getElementsByClassName("TreeLeaf");
    // result = result && (treeLeafs[1]._uibenchState === state);
    window.requestAnimationFrame(function () {
      onFinish(true);
    });
  }

  // performance.now() polyfill
  // https://gist.github.com/paulirish/5438650
  // prepare base perf object
  if (typeof window.performance === "undefined") {
    window.performance = {};
  }
  if (!window.performance.now) {
    var nowOffset_1 = Date.now();
    if (window.performance.timing && window.performance.timing.navigationStart) {
      nowOffset_1 = window.performance.timing.navigationStart;
    }
    window.performance.now = function now() {
      return Date.now() - nowOffset_1;
    };
  }
  var TestCase = (function () {
    function TestCase(name, from, to) {
      this.name = name;
      this.from = from;
      this.to = to;
    }
    return TestCase;
  }());
  function testCase(name, from, to) {
    return new TestCase(name, from, to);
  }
  var config = {
    tests: null,
    iterations: 5,
    name: "unnamed",
    version: "0.0.0",
    report: false,
    mobile: false,
    disableSCU: false,
    enableDOMRecycling: false,
    filter: null,
    fullRenderTime: false,
    timelineMarks: false,
    disableChecks: false,
    startDelay: 0,
  };
  var timing = {
    start: 0,
    run: 0,
    firstRender: 0,
  };
  var memory = {
    initial: performance.memory === undefined ? 0 : performance.memory.usedJSHeapSize,
    start: 0,
    max: 0,
  };
  function parseQueryString(a) {
    if (a.length === 0) {
      return {};
    }
    var b = {};
    for (var i = 0; i < a.length; ++i) {
      var p = a[i].split("=", 2);
      if (p.length === 1) {
        b[p[0]] = "";
      }
      else {
        b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
      }
    }
    return b;
  }
  function scuClone(state) {
    if (config.disableSCU) {
      state = state.clone();
    }
    return state;
  }
  function init(name, version) {
    config.name = name;
    config.version = version;
    var qs = parseQueryString(window.location.search.substr(1).split("&"));
    if (qs["i"] !== undefined) {
      config.iterations = parseInt(qs["i"], 10);
    }
    if (qs["name"] !== undefined) {
      config.name = qs["name"];
    }
    if (qs["version"] !== undefined) {
      config.version = qs["version"];
    }
    if (qs["report"] !== undefined) {
      config.report = true;
    }
    if (qs["mobile"] !== undefined) {
      config.mobile = true;
    }
    if (qs["disableSCU"] !== undefined) {
      config.disableSCU = true;
    }
    if (qs["enableDOMRecycling"] !== undefined) {
      config.enableDOMRecycling = true;
    }
    if (qs["filter"] !== undefined) {
      config.filter = qs["filter"];
    }
    if (qs["fullRenderTime"] !== undefined) {
      config.fullRenderTime = true;
    }
    if (qs["timelineMarks"] !== undefined) {
      config.timelineMarks = true;
    }
    if (qs["disableChecks"] !== undefined) {
      config.disableChecks = true;
    }
    if (qs["startDelay"] !== undefined) {
      config.startDelay = parseInt(qs["startDelay"], 10);
    }
    return config;
  }
  function initTests() {
    var initial = new AppState("home", new HomeState(), TableState.create(0, 0), AnimState.create(config.mobile ? 30 : 100), TreeState.create([0]));
    var initialTable = switchTo(initial, "table");
    var initialAnim = switchTo(initial, "anim");
    var initialTree = switchTo(initial, "tree");
    if (config.disableSCU) {
      initialTable = initialTable.clone();
      initialAnim = initialAnim.clone();
      initialTree = initialTree.clone();
    }
    if (config.mobile) {
      var table30_4 = tableCreate(initialTable, 30, 4);
      var table15_4 = tableCreate(initialTable, 15, 4);
      var table30_2 = tableCreate(initialTable, 30, 2);
      var table15_2 = tableCreate(initialTable, 15, 2);
      var tree50 = treeCreate(initialTree, [50]);
      var tree5_10 = treeCreate(initialTree, [5, 10]);
      var tree10_5 = treeCreate(initialTree, [10, 5]);
      var tree10_10_10_2 = treeCreate(initialTree, [10, 10, 10, 2]);
      var tree2__9 = treeCreate(initialTree, [2, 2, 2, 2, 2, 2, 2, 2, 2]);
      if (config.disableSCU) {
        table30_4 = table30_4.clone();
        table15_4 = table15_4.clone();
        table30_2 = table30_2.clone();
        table15_2 = table15_2.clone();
        tree50 = tree50.clone();
        tree5_10 = tree5_10.clone();
        tree10_5 = tree10_5.clone();
      }
      config.tests = [
        testCase("table/[30,4]/render", initialTable, scuClone(table30_4)),
        testCase("table/[15,4]/render", initialTable, scuClone(table15_4)),
        testCase("table/[30,2]/render", initialTable, scuClone(table30_2)),
        testCase("table/[15,2]/render", initialTable, scuClone(table15_2)),
        testCase("table/[30,4]/removeAll", table30_4, scuClone(initialTable)),
        testCase("table/[15,4]/removeAll", table15_4, scuClone(initialTable)),
        testCase("table/[30,2]/removeAll", table30_2, scuClone(initialTable)),
        testCase("table/[15,2]/removeAll", table15_2, scuClone(initialTable)),
        testCase("table/[30,4]/sort/0", table30_4, scuClone(tableSortBy(table30_4, 0))),
        testCase("table/[15,4]/sort/0", table15_4, scuClone(tableSortBy(table15_4, 0))),
        testCase("table/[30,2]/sort/0", table30_2, scuClone(tableSortBy(table30_2, 0))),
        testCase("table/[15,2]/sort/0", table15_2, scuClone(tableSortBy(table15_2, 0))),
        testCase("table/[30,4]/sort/1", table30_4, scuClone(tableSortBy(table30_4, 1))),
        testCase("table/[15,4]/sort/1", table15_4, scuClone(tableSortBy(table15_4, 1))),
        testCase("table/[30,2]/sort/1", table30_2, scuClone(tableSortBy(table30_2, 1))),
        testCase("table/[15,2]/sort/1", table15_2, scuClone(tableSortBy(table15_2, 1))),
        testCase("table/[30,4]/filter/8", table30_4, scuClone(tableFilterBy(table30_4, 8))),
        testCase("table/[15,4]/filter/8", table15_4, scuClone(tableFilterBy(table15_4, 8))),
        testCase("table/[30,2]/filter/8", table30_2, scuClone(tableFilterBy(table30_2, 8))),
        testCase("table/[15,2]/filter/8", table15_2, scuClone(tableFilterBy(table15_2, 8))),
        testCase("table/[30,4]/filter/4", table30_4, scuClone(tableFilterBy(table30_4, 4))),
        testCase("table/[15,4]/filter/4", table15_4, scuClone(tableFilterBy(table15_4, 4))),
        testCase("table/[30,2]/filter/4", table30_2, scuClone(tableFilterBy(table30_2, 4))),
        testCase("table/[15,2]/filter/4", table15_2, scuClone(tableFilterBy(table15_2, 4))),
        testCase("table/[30,4]/filter/2", table30_4, scuClone(tableFilterBy(table30_4, 2))),
        testCase("table/[15,4]/filter/2", table15_4, scuClone(tableFilterBy(table15_4, 2))),
        testCase("table/[30,2]/filter/2", table30_2, scuClone(tableFilterBy(table30_2, 2))),
        testCase("table/[15,2]/filter/2", table15_2, scuClone(tableFilterBy(table15_2, 2))),
        testCase("table/[30,4]/activate/8", table30_4, scuClone(tableActivateEach(table30_4, 8))),
        testCase("table/[15,4]/activate/8", table15_4, scuClone(tableActivateEach(table15_4, 8))),
        testCase("table/[30,2]/activate/8", table30_2, scuClone(tableActivateEach(table30_2, 8))),
        testCase("table/[15,2]/activate/8", table15_2, scuClone(tableActivateEach(table15_2, 8))),
        testCase("table/[30,4]/activate/4", table30_4, scuClone(tableActivateEach(table30_4, 4))),
        testCase("table/[15,4]/activate/4", table15_4, scuClone(tableActivateEach(table15_4, 4))),
        testCase("table/[30,2]/activate/4", table30_2, scuClone(tableActivateEach(table30_2, 4))),
        testCase("table/[15,2]/activate/4", table15_2, scuClone(tableActivateEach(table15_2, 4))),
        testCase("table/[30,4]/activate/2", table30_4, scuClone(tableActivateEach(table30_4, 2))),
        testCase("table/[15,4]/activate/2", table15_4, scuClone(tableActivateEach(table15_4, 2))),
        testCase("table/[30,2]/activate/2", table30_2, scuClone(tableActivateEach(table30_2, 2))),
        testCase("table/[15,2]/activate/2", table15_2, scuClone(tableActivateEach(table15_2, 2))),
        testCase("anim/30/8", initialAnim, scuClone(animAdvanceEach(initialAnim, 8))),
        testCase("anim/30/4", initialAnim, scuClone(animAdvanceEach(initialAnim, 4))),
        testCase("anim/30/2", initialAnim, scuClone(animAdvanceEach(initialAnim, 2))),
        testCase("tree/[50]/render", initialTree, scuClone(tree50)),
        testCase("tree/[5,10]/render", initialTree, scuClone(tree5_10)),
        testCase("tree/[10,5]/render", initialTree, scuClone(tree10_5)),
        testCase("tree/[2,2,2,2,2,2,2,2,2]/render", initialTree, scuClone(tree2__9)),
        testCase("tree/[50]/removeAll", tree50, scuClone(initialTree)),
        testCase("tree/[5,10]/removeAll", tree5_10, scuClone(initialTree)),
        testCase("tree/[10,5]/removeAll", tree10_5, scuClone(initialTree)),
        testCase("tree/[2,2,2,2,2,2,2,2,2]/removeAll", tree2__9, scuClone(initialTree)),
        testCase("tree/[50]/[reverse]", tree50, scuClone(treeTransform(tree50, [reverse]))),
        testCase("tree/[5,10]/[reverse]", tree5_10, scuClone(treeTransform(tree5_10, [reverse]))),
        testCase("tree/[10,5]/[reverse]", tree10_5, scuClone(treeTransform(tree10_5, [reverse]))),
        testCase("tree/[50]/[insertFirst(1)]", tree50, scuClone(treeTransform(tree50, [insertFirst(1)]))),
        testCase("tree/[5,10]/[insertFirst(1)]", tree5_10, scuClone(treeTransform(tree5_10, [insertFirst(1)]))),
        testCase("tree/[10,5]/[insertFirst(1)]", tree10_5, scuClone(treeTransform(tree10_5, [insertFirst(1)]))),
        testCase("tree/[50]/[insertLast(1)]", tree50, scuClone(treeTransform(tree50, [insertLast(1)]))),
        testCase("tree/[5,10]/[insertLast(1)]", tree5_10, scuClone(treeTransform(tree5_10, [insertLast(1)]))),
        testCase("tree/[10,5]/[insertLast(1)]", tree10_5, scuClone(treeTransform(tree10_5, [insertLast(1)]))),
        testCase("tree/[50]/[removeFirst(1)]", tree50, scuClone(treeTransform(tree50, [removeFirst(1)]))),
        testCase("tree/[5,10]/[removeFirst(1)]", tree5_10, scuClone(treeTransform(tree5_10, [removeFirst(1)]))),
        testCase("tree/[10,5]/[removeFirst(1)]", tree10_5, scuClone(treeTransform(tree10_5, [removeFirst(1)]))),
        testCase("tree/[50]/[removeLast(1)]", tree50, scuClone(treeTransform(tree50, [removeLast(1)]))),
        testCase("tree/[5,10]/[removeLast(1)]", tree5_10, scuClone(treeTransform(tree5_10, [removeLast(1)]))),
        testCase("tree/[10,5]/[removeLast(1)]", tree10_5, scuClone(treeTransform(tree10_5, [removeLast(1)]))),
        testCase("tree/[50]/[moveFromEndToStart(1)]", tree50, scuClone(treeTransform(tree50, [moveFromEndToStart(1)]))),
        testCase("tree/[5,10]/[moveFromEndToStart(1)]", tree5_10, scuClone(treeTransform(tree5_10, [moveFromEndToStart(1)]))),
        testCase("tree/[10,5]/[moveFromEndToStart(1)]", tree10_5, scuClone(treeTransform(tree10_5, [moveFromEndToStart(1)]))),
        testCase("tree/[50]/[moveFromStartToEnd(1)]", tree50, scuClone(treeTransform(tree50, [moveFromStartToEnd(1)]))),
        testCase("tree/[5,10]/[moveFromStartToEnd(1)]", tree5_10, scuClone(treeTransform(tree5_10, [moveFromStartToEnd(1)]))),
        testCase("tree/[10,5]/[moveFromStartToEnd(1)]", tree10_5, scuClone(treeTransform(tree10_5, [moveFromStartToEnd(1)]))),
        // special use case that should trigger worst case scenario for kivi library
        testCase("tree/[50]/[kivi_worst_case]", tree50, scuClone(treeTransform(treeTransform(treeTransform(tree50, [removeFirst(1)]), [removeLast(1)]), [reverse]))),
        // special use case that should trigger worst case scenario for snabbdom library
        testCase("tree/[50]/[snabbdom_worst_case]", tree50, scuClone(treeTransform(tree50, [snabbdomWorstCase]))),
        // special use case that should trigger worst case scenario for react library
        testCase("tree/[50]/[react_worst_case]", tree50, scuClone(treeTransform(treeTransform(treeTransform(tree50, [removeFirst(1)]), [removeLast(1)]), [moveFromEndToStart(1)]))),
        // special use case that should trigger worst case scenario for virtual-dom library
        testCase("tree/[50]/[virtual_dom_worst_case]", tree50, scuClone(treeTransform(tree50, [moveFromStartToEnd(2)]))),
        // test case with large amount of vnodes to test diff overhead
        testCase("tree/[10,10,10,2]/no_change", tree10_10_10_2, scuClone(tree10_10_10_2)),
        testCase("tree/[2,2,2,2,2,2,2,2]/no_change", tree2__9, scuClone(tree2__9)),
      ];
    }
    else {
      var table100_4 = tableCreate(initialTable, 100, 4);
      var table50_4 = tableCreate(initialTable, 50, 4);
      var table100_2 = tableCreate(initialTable, 100, 2);
      var table50_2 = tableCreate(initialTable, 50, 2);
      var tree500 = treeCreate(initialTree, [500]);
      var tree50_10 = treeCreate(initialTree, [50, 10]);
      var tree10_50 = treeCreate(initialTree, [10, 50]);
      var tree5_100 = treeCreate(initialTree, [5, 100]);
      var tree10__4 = treeCreate(initialTree, [10, 10, 10, 10]);
      var tree2__10 = treeCreate(initialTree, [2, 2, 2, 2, 2, 2, 2, 2, 2, 2]);
      if (config.disableSCU) {
        table100_4 = table100_4.clone();
        table50_4 = table50_4.clone();
        table100_2 = table100_2.clone();
        table50_2 = table50_2.clone();
        tree500 = tree500.clone();
        tree50_10 = tree50_10.clone();
        tree10_50 = tree10_50.clone();
        tree5_100 = tree5_100.clone();
      }
      config.tests = [
        testCase("table/[100,4]/render", initialTable, scuClone(table100_4)),
        testCase("table/[50,4]/render", initialTable, scuClone(table50_4)),
        testCase("table/[100,2]/render", initialTable, scuClone(table100_2)),
        testCase("table/[50,2]/render", initialTable, scuClone(table50_2)),
        testCase("table/[100,4]/removeAll", table100_4, scuClone(initialTable)),
        testCase("table/[50,4]/removeAll", table50_4, scuClone(initialTable)),
        testCase("table/[100,2]/removeAll", table100_2, scuClone(initialTable)),
        testCase("table/[50,2]/removeAll", table50_2, scuClone(initialTable)),
        testCase("table/[100,4]/sort/0", table100_4, scuClone(tableSortBy(table100_4, 0))),
        testCase("table/[50,4]/sort/0", table50_4, scuClone(tableSortBy(table50_4, 0))),
        testCase("table/[100,2]/sort/0", table100_2, scuClone(tableSortBy(table100_2, 0))),
        testCase("table/[50,2]/sort/0", table50_2, scuClone(tableSortBy(table50_2, 0))),
        testCase("table/[100,4]/sort/1", table100_4, scuClone(tableSortBy(table100_4, 1))),
        testCase("table/[50,4]/sort/1", table50_4, scuClone(tableSortBy(table50_4, 1))),
        testCase("table/[100,2]/sort/1", table100_2, scuClone(tableSortBy(table100_2, 1))),
        testCase("table/[50,2]/sort/1", table50_2, scuClone(tableSortBy(table50_2, 1))),
        testCase("table/[100,4]/filter/32", table100_4, scuClone(tableFilterBy(table100_4, 32))),
        testCase("table/[50,4]/filter/32", table50_4, scuClone(tableFilterBy(table50_4, 32))),
        testCase("table/[100,2]/filter/32", table100_2, scuClone(tableFilterBy(table100_2, 32))),
        testCase("table/[50,2]/filter/32", table50_2, scuClone(tableFilterBy(table50_2, 32))),
        testCase("table/[100,4]/filter/16", table100_4, scuClone(tableFilterBy(table100_4, 16))),
        testCase("table/[50,4]/filter/16", table50_4, scuClone(tableFilterBy(table50_4, 16))),
        testCase("table/[100,2]/filter/16", table100_2, scuClone(tableFilterBy(table100_2, 16))),
        testCase("table/[50,2]/filter/16", table50_2, scuClone(tableFilterBy(table50_2, 16))),
        testCase("table/[100,4]/filter/8", table100_4, scuClone(tableFilterBy(table100_4, 8))),
        testCase("table/[50,4]/filter/8", table50_4, scuClone(tableFilterBy(table50_4, 8))),
        testCase("table/[100,2]/filter/8", table100_2, scuClone(tableFilterBy(table100_2, 8))),
        testCase("table/[50,2]/filter/8", table50_2, scuClone(tableFilterBy(table50_2, 8))),
        testCase("table/[100,4]/filter/4", table100_4, scuClone(tableFilterBy(table100_4, 4))),
        testCase("table/[50,4]/filter/4", table50_4, scuClone(tableFilterBy(table50_4, 4))),
        testCase("table/[100,2]/filter/4", table100_2, scuClone(tableFilterBy(table100_2, 4))),
        testCase("table/[50,2]/filter/4", table50_2, scuClone(tableFilterBy(table50_2, 4))),
        testCase("table/[100,4]/activate/32", table100_4, scuClone(tableActivateEach(table100_4, 32))),
        testCase("table/[50,4]/activate/32", table50_4, scuClone(tableActivateEach(table50_4, 32))),
        testCase("table/[100,2]/activate/32", table100_2, scuClone(tableActivateEach(table100_2, 32))),
        testCase("table/[50,2]/activate/32", table50_2, scuClone(tableActivateEach(table50_2, 32))),
        testCase("table/[100,4]/activate/16", table100_4, scuClone(tableActivateEach(table100_4, 16))),
        testCase("table/[50,4]/activate/16", table50_4, scuClone(tableActivateEach(table50_4, 16))),
        testCase("table/[100,2]/activate/16", table100_2, scuClone(tableActivateEach(table100_2, 16))),
        testCase("table/[50,2]/activate/16", table50_2, scuClone(tableActivateEach(table50_2, 16))),
        testCase("table/[100,4]/activate/8", table100_4, scuClone(tableActivateEach(table100_4, 8))),
        testCase("table/[50,4]/activate/8", table50_4, scuClone(tableActivateEach(table50_4, 8))),
        testCase("table/[100,2]/activate/8", table100_2, scuClone(tableActivateEach(table100_2, 8))),
        testCase("table/[50,2]/activate/8", table50_2, scuClone(tableActivateEach(table50_2, 8))),
        testCase("table/[100,4]/activate/4", table100_4, scuClone(tableActivateEach(table100_4, 4))),
        testCase("table/[50,4]/activate/4", table50_4, scuClone(tableActivateEach(table50_4, 4))),
        testCase("table/[100,2]/activate/4", table100_2, scuClone(tableActivateEach(table100_2, 4))),
        testCase("table/[50,2]/activate/4", table50_2, scuClone(tableActivateEach(table50_2, 4))),
        testCase("anim/100/32", initialAnim, scuClone(animAdvanceEach(initialAnim, 32))),
        testCase("anim/100/16", initialAnim, scuClone(animAdvanceEach(initialAnim, 16))),
        testCase("anim/100/8", initialAnim, scuClone(animAdvanceEach(initialAnim, 8))),
        testCase("anim/100/4", initialAnim, scuClone(animAdvanceEach(initialAnim, 4))),
        testCase("tree/[500]/render", initialTree, scuClone(tree500)),
        testCase("tree/[50,10]/render", initialTree, scuClone(tree50_10)),
        testCase("tree/[10,50]/render", initialTree, scuClone(tree10_50)),
        testCase("tree/[5,100]/render", initialTree, scuClone(tree5_100)),
        testCase("tree/[2,2,2,2,2,2,2,2,2,2]/render", initialTree, scuClone(tree2__10)),
        testCase("tree/[500]/removeAll", tree500, scuClone(initialTree)),
        testCase("tree/[50,10]/removeAll", tree50_10, scuClone(initialTree)),
        testCase("tree/[10,50]/removeAll", tree10_50, scuClone(initialTree)),
        testCase("tree/[5,100]/removeAll", tree5_100, scuClone(initialTree)),
        testCase("tree/[2,2,2,2,2,2,2,2,2,2]/removeAll", tree2__10, scuClone(initialTree)),
        testCase("tree/[500]/[reverse]", tree500, scuClone(treeTransform(tree500, [reverse]))),
        testCase("tree/[50,10]/[reverse]", tree50_10, scuClone(treeTransform(tree50_10, [reverse]))),
        testCase("tree/[10,50]/[reverse]", tree10_50, scuClone(treeTransform(tree10_50, [reverse]))),
        testCase("tree/[5,100]/[reverse]", tree5_100, scuClone(treeTransform(tree5_100, [reverse]))),
        testCase("tree/[500]/[insertFirst(1)]", tree500, scuClone(treeTransform(tree500, [insertFirst(1)]))),
        testCase("tree/[50,10]/[insertFirst(1)]", tree50_10, scuClone(treeTransform(tree50_10, [insertFirst(1)]))),
        testCase("tree/[10,50]/[insertFirst(1)]", tree10_50, scuClone(treeTransform(tree10_50, [insertFirst(1)]))),
        testCase("tree/[5,100]/[insertFirst(1)]", tree5_100, scuClone(treeTransform(tree5_100, [insertFirst(1)]))),
        testCase("tree/[500]/[insertLast(1)]", tree500, scuClone(treeTransform(tree500, [insertLast(1)]))),
        testCase("tree/[50,10]/[insertLast(1)]", tree50_10, scuClone(treeTransform(tree50_10, [insertLast(1)]))),
        testCase("tree/[10,50]/[insertLast(1)]", tree10_50, scuClone(treeTransform(tree10_50, [insertLast(1)]))),
        testCase("tree/[5,100]/[insertLast(1)]", tree5_100, scuClone(treeTransform(tree5_100, [insertLast(1)]))),
        testCase("tree/[500]/[removeFirst(1)]", tree500, scuClone(treeTransform(tree500, [removeFirst(1)]))),
        testCase("tree/[50,10]/[removeFirst(1)]", tree50_10, scuClone(treeTransform(tree50_10, [removeFirst(1)]))),
        testCase("tree/[10,50]/[removeFirst(1)]", tree10_50, scuClone(treeTransform(tree10_50, [removeFirst(1)]))),
        testCase("tree/[5,100]/[removeFirst(1)]", tree5_100, scuClone(treeTransform(tree5_100, [removeFirst(1)]))),
        testCase("tree/[500]/[removeLast(1)]", tree500, scuClone(treeTransform(tree500, [removeLast(1)]))),
        testCase("tree/[50,10]/[removeLast(1)]", tree50_10, scuClone(treeTransform(tree50_10, [removeLast(1)]))),
        testCase("tree/[10,50]/[removeLast(1)]", tree10_50, scuClone(treeTransform(tree10_50, [removeLast(1)]))),
        testCase("tree/[5,100]/[removeLast(1)]", tree5_100, scuClone(treeTransform(tree5_100, [removeLast(1)]))),
        testCase("tree/[500]/[moveFromEndToStart(1)]", tree500, scuClone(treeTransform(tree500, [moveFromEndToStart(1)]))),
        testCase("tree/[50,10]/[moveFromEndToStart(1)]", tree50_10, scuClone(treeTransform(tree50_10, [moveFromEndToStart(1)]))),
        testCase("tree/[10,50]/[moveFromEndToStart(1)]", tree10_50, scuClone(treeTransform(tree10_50, [moveFromEndToStart(1)]))),
        testCase("tree/[5,100]/[moveFromEndToStart(1)]", tree5_100, scuClone(treeTransform(tree5_100, [moveFromEndToStart(1)]))),
        testCase("tree/[500]/[moveFromStartToEnd(1)]", tree500, scuClone(treeTransform(tree500, [moveFromStartToEnd(1)]))),
        testCase("tree/[50,10]/[moveFromStartToEnd(1)]", tree50_10, scuClone(treeTransform(tree50_10, [moveFromStartToEnd(1)]))),
        testCase("tree/[10,50]/[moveFromStartToEnd(1)]", tree10_50, scuClone(treeTransform(tree10_50, [moveFromStartToEnd(1)]))),
        testCase("tree/[5,100]/[moveFromStartToEnd(1)]", tree5_100, scuClone(treeTransform(tree5_100, [moveFromStartToEnd(1)]))),
        // special use case that should trigger worst case scenario for kivi library
        testCase("tree/[500]/[kivi_worst_case]", tree500, scuClone(treeTransform(treeTransform(treeTransform(tree500, [removeFirst(1)]), [removeLast(1)]), [reverse]))),
        // special use case that should trigger worst case scenario for snabbdom library
        testCase("tree/[500]/[snabbdom_worst_case]", tree500, scuClone(treeTransform(tree500, [snabbdomWorstCase]))),
        // special use case that should trigger worst case scenario for react library
        testCase("tree/[500]/[react_worst_case]", tree500, scuClone(treeTransform(treeTransform(treeTransform(tree500, [removeFirst(1)]), [removeLast(1)]), [moveFromEndToStart(1)]))),
        // special use case that should trigger worst case scenario for virtual-dom library
        testCase("tree/[500]/[virtual_dom_worst_case]", tree500, scuClone(treeTransform(tree500, [moveFromStartToEnd(2)]))),
        // test case with large amount of vnodes to test diff overhead
        testCase("tree/[10,10,10,10]/no_change", tree10__4, scuClone(tree10__4)),
        testCase("tree/[2,2,2,2,2,2,2,2,2,2]/no_change", tree2__10, scuClone(tree2__10)),
      ];
    }
  }
  var macrotasks = [];
  window.addEventListener("message", function (e) {
    if (e.source === window && e.data === "uibench-macrotask") {
      var tasks = macrotasks;
      macrotasks = [];
      for (var i = 0; i < tasks.length; i++) {
        tasks[i]();
      }
    }
  });
  function scheduleMacrotask(cb) {
    if (macrotasks.length === 0) {
      window.postMessage("uibench-macrotask", "*");
    }
    macrotasks.push(cb);
  }
  var Executor = (function () {
    function Executor(iterations, groups, onUpdate, onFinish, onProgress) {
      var _this = this;
      this._next = function () {
        var group = _this.groups[_this._currentGroup];
        if (_this._state === "init") {
          if (config.timelineMarks) {
            console.timeStamp("init " + group.name);
          }
          _this.onUpdate(group.from, "init");
          _this._state = "update";
          if (memory.initial !== 0) {
            memory.max = Math.max(memory.max, performance.memory.usedJSHeapSize);
          }
          requestAnimationFrame(_this._next);
        }
        else if (_this._state === "update") {
          if (config.timelineMarks) {
            console.timeStamp("update " + group.name);
          }
          _this._startTime = window.performance.now();
          _this.onUpdate(group.to, "update");
          _this._state = "measure_time";
          if (config.fullRenderTime) {
            scheduleMacrotask(_this._next);
          }
          else {
            _this._next();
          }
        }
        else {
          var t = window.performance.now() - _this._startTime;
          if (config.timelineMarks) {
            console.timeStamp("measure_time " + group.name);
          }
          if (memory.start !== 0) {
            memory.max = Math.max(memory.max, performance.memory.usedJSHeapSize);
          }
          _this.onProgress((_this._currentIteration * _this.groups.length + _this._currentGroup) / (_this.groups.length * _this.iterations));
          var samples = _this._samples[group.name];
          if (samples === undefined) {
            samples = _this._samples[group.name] = [];
          }
          samples.push(t);
          _this._state = "init";
          _this._currentGroup++;
          if (_this._currentGroup < _this.groups.length) {
            requestAnimationFrame(_this._next);
          }
          else {
            _this._currentIteration++;
            if (_this._currentIteration < _this.iterations) {
              _this._currentGroup = 0;
              requestAnimationFrame(_this._next);
            }
            else {
              _this.onFinish(_this._samples);
              _this.onProgress(1);
            }
          }
        }
      };
      this.iterations = iterations;
      this.groups = groups;
      this.onUpdate = onUpdate;
      this.onFinish = onFinish;
      this.onProgress = onProgress;
      this._samples = {};
      this._state = "init";
      this._currentGroup = 0;
      this._currentIteration = 0;
      this._startTime = 0;
    }
    Executor.prototype.run = function () {
      this._next();
    };
    return Executor;
  }());
  function firstRenderTime(onUpdate, done) {
    var state = new AppState("table", new HomeState(), config.mobile ? TableState.create(30, 4) : TableState.create(100, 4), AnimState.create(0), TreeState.create([0]));
    var t = performance.now();
    onUpdate(state, "init");
    function finish() {
      timing.firstRender = performance.now() - t;
      done();
    }
    if (config.fullRenderTime) {
      scheduleMacrotask(finish);
    }
    else {
      finish();
    }
  }
  function run(onUpdate, onFinish, filter) {
    timing.run = performance.now();
    if (memory.initial !== 0) {
      memory.start = performance.memory.usedJSHeapSize;
    }
    firstRenderTime(onUpdate, function () {
      if (!config.disableChecks) {
        specTest(onUpdate);
      }
      scuTest(onUpdate, function (scuSupported) {
        recyclingTest(onUpdate, function (recyclingEnabled) {
          preserveStateTest(onUpdate, function (preserveState) {
            initTests();
            var tests = config.tests;
            var name = config.name;
            filter = filter || config.filter;
            if (tests && filter) {
              tests = tests.filter(function (t) { return t.name.indexOf(filter) !== -1; });
            }
            var progressBar = document.createElement("div");
            progressBar.className = "ProgressBar";
            var progressBarInner = document.createElement("div");
            progressBarInner.className = "ProgressBar_inner";
            progressBarInner.style.width = "0";
            document.body.appendChild(progressBar);
            progressBar.appendChild(progressBarInner);
            function run() {
              var e = new Executor(config.iterations, tests, onUpdate, function (samples) {
                onFinish(samples);
                if (config.report) {
                  window.opener.postMessage({
                    "type": "report",
                    "data": {
                      "name": name,
                      "version": config.version,
                      "flags": {
                        "fullRenderTime": config.fullRenderTime,
                        "preserveState": preserveState,
                        "scu": scuSupported && !config.disableSCU,
                        "recycling": recyclingEnabled,
                        "disableChecks": config.disableChecks,
                      },
                      "timing": timing,
                      "memory": memory,
                      "iterations": config.iterations,
                      "samples": samples,
                    },
                  }, "*");
                }
              }, function (progress) {
                progressBarInner.style.width = Math.round(progress * 100) + "%";
              });
              e.run();
            }
            if (tests) {
              if (config.startDelay > 0) {
                setTimeout(run, config.startDelay);
              }
              else {
                run();
              }
            }
            else {
              onFinish({});
            }
          });
        });
      });
    });
  }
  timing.start = performance.now();

  exports.config = config;
  exports.init = init;
  exports.run = run;
  exports.TestCase = TestCase;

}));
