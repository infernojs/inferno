"use strict";

var data = {Database: Database};
var I = 0;
var N = 100;

function getCountClassName(db) {
  var count = db.queries.length;
  var className = 'label';
  if (count >= 20) {
      className += ' label-important';
  }
  else if (count >= 10) {
      className += ' label-warning';
  }
  else {
      className += ' label-success';
  }
  return className;
}

function elapsedClassName(elapsed) {
  var className = 'Query elapsed';
  if (elapsed >= 10.0) {
      className += ' warn_long';
  }
  else if (elapsed >= 1.0) {
      className += ' warn';
  }
  else {
      className += ' short';
  }
  return className;
}

function formatElapsed(value) {
  if (!value) return '';
  var str = parseFloat(value).toFixed(2);
  if (value > 60) {
      var minutes = Math.floor(value / 60);
      var comps = (value % 60).toFixed(2).split('.');
      var seconds = comps[0].lpad('0', 2);
      var ms = comps[1];
      str = minutes + ":" + seconds + "." + ms;
  }
  return str;
}


class App extends Inferno.Component {
  constructor() {
    super();
    this.dbs = [];
    this._updateDbs = this._updateDbs.bind(this)
    this._renderDatabase = this._renderDatabase.bind(this);
    this._renderQuery = this._renderQuery.bind(this);
    this._updateDbs();
  }
  _updateDbs() {
    this.dbs = [];
    for (var i = 0; i < N; i++) {
      this.dbs.push(new data.Database('cluster' + i));
      this.dbs.push(new data.Database('cluster' + i + 'slave'));
    }
    this.forceUpdate();
    Monitoring.renderRate.ping();
    setTimeout(this._updateDbs, 0);
  }
  render() {
    return t7.precompile({template: __JMePv,templateKey: -1358868373, values: [this.dbs.map(this._renderDatabase)]});
  }
  _renderDatabase(db) {
    return t7.precompile({template: __GmVyP,templateKey: 1445654744, values: [db.name, getCountClassName(db), db.queries.length, db.getTopFiveQueries().map(this._renderQuery)]});
  }
  _renderQuery(query) {
    return t7.precompile({template: __R22ur,templateKey: 986839472, values: ['Query ' + elapsedClassName(query.elapsed), formatElapsed(query.elapsed), query.query]});
  }
};

Inferno.register("App", App);

var app = document.getElementById("app");

Inferno.render(
  t7.precompile({template: __7j6La,templateKey: -616655958, values: []}),
  app
);

//t7 precompiled templates
;function __R22ur(){"use strict";var __$props__ = arguments[0];return {tag: 'td',attrs: [{name:'class',value:Inferno.createValueNode(__$props__[0],0)}],children: [{tag: 'span',attrs: [{name:'class',value:'foo'}],children: Inferno.createValueNode(__$props__[1],1)},{tag: 'div',attrs: [{name:'class',value:'popover left'}],children: [{tag: 'div',attrs: [{name:'class',value:'popover-content'}],children: Inferno.createValueNode(__$props__[2],2)},{tag: 'div',attrs: [{name:'class',value:'arrow'}],children: []}]}]}};
;function __GmVyP(){"use strict";var __$props__ = arguments[0];return {tag: 'tr',attrs: [],children: [{tag: 'td',attrs: [{name:'class',value:'dbname'}],children: Inferno.createValueNode(__$props__[0],0)},{tag: 'td',attrs: [{name:'class',value:'query-count'}],children: [{tag: 'span',attrs: [{name:'class',value:Inferno.createValueNode(__$props__[1],1)}],children: Inferno.createValueNode(__$props__[2],2)}]},Inferno.createValueNode(__$props__[3],3)]}};
;function __JMePv(){"use strict";var __$props__ = arguments[0];return {tag: 'table',attrs: [{name:'class',value:'table table-striped latest-data'}],children: [{tag: 'tbody',attrs: [],children: Inferno.createValueNode(__$props__[0],0)}]}};
;function __7j6La(){"use strict";var __$props__ = arguments[0];return {tag: t7.loadComponent('App'),attrs: [],children: []}};
