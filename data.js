"use strict";

var ENV = {
  rows: 200,
  timeout: 0
};

var data = null;
var data2 = null;

function getTopFiveQueries(db) {
  var arr = db.samples[db.samples.length - 1].queries.slice(0, 5);
  while (arr.length < 5) {
    arr[arr.length] = { query: '', elapsed: 0 };
  }
  return arr;
}

function assignDb(dbname) {
  var info = data.databases[dbname];
  var r = Math.floor((Math.random() * 10) + 1);

  for (var i = 0; i < r; i++) {
    var q = {
      canvas_action: null,
      canvas_context_id: null,
      canvas_controller: null,
      canvas_hostname: null,
      canvas_job_tag: null,
      canvas_pid: null,
      elapsed: Math.random() * 15,
      query: "SELECT blah FROM something",
      waiting: Math.random() < 0.5
    };

    if (Math.random() < 0.2) {
      q.query = "<IDLE> in transaction";
    }

    if (Math.random() < 0.1) {
      q.query = "vacuum";
    }

    info.queries[info.queries.length] = q;
  }

  info.queries = info.queries.sort(function(a, b) {
    return formatElapsed(b.elapsed - a.elapsed);
  });

  var samples = [];

  samples[samples.length] = {
    time: data.start_at,
    queries: info.queries
  };

  if (samples.length > 5) {
    samples.splice(0, samples.length - 5);
  }

  var db = {
    name: dbname,
    queries: info.queries,
    samples: samples,
  }

  db.topFiveQueries = getTopFiveQueries(db);

  data2[data2.length] = db;
};

function getData() {
  // generate some dummy data

  data = {
    start_at: new Date().getTime() / 1000,
    databases: {}
  };

  for (var i = 1; i <= ENV.rows; i++) {
    data.databases["cluster" + i] = {
      queries: []
    };

    data.databases["cluster" + i + "slave"] = {
      queries: []
    };
  }

  data2 = [];

  Object.keys(data.databases).forEach(assignDb);

  return data2;
}


function getLastSample(db) {
  return db.samples[db.samples.length - 1];
}

function getCountClassName(db) {
  var count = getLastSample(db).queries.length;
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
