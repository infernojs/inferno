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
    return t7`
      <table class="table table-striped latest-data">
        <tbody>
          ${ this.dbs.map(this._renderDatabase) }
        </tbody>
      </table>
    `;
  }
  _renderDatabase(db) {
    return t7`
      <tr>
        <td class="dbname">${ db.name }</td>
        <td class="query-count"><span class=${ getCountClassName(db) }>${ db.queries.length }</span></td>
        ${ db.getTopFiveQueries().map(this._renderQuery) }
      </tr>
    `;
  }
  _renderQuery(query) {
    return t7`
      <td class=${ 'Query ' + elapsedClassName(query.elapsed) }>
        <span class="foo">${ formatElapsed(query.elapsed) }</span>
        <div class="popover left">
          <div class="popover-content">${ query.query }</div>
          <div class="arrow"></div>
        </div>
      </td>
    `;
  }
};

Inferno.register("App", App);

var app = document.getElementById("app");

Inferno.render(t7`<App />`, app);
