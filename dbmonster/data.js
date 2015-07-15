// Copied and adjusted from https://github.com/localvoid/kivi-dbmonster

'use strict';

function Query(elapsed, waiting, query) {
    this.elapsed = elapsed;
    this.waiting = waiting;
    this.query = query;
}

Query.rand = function() {
    var elapsed = Math.random() * 15;
    var waiting = Math.random() < 0.5;
    var query = 'SELECT blah FROM something';

    if (Math.random() < 0.2) {
        query = '<IDLE> in transaction';
    }

    if (Math.random() < 0.1) {
        query = 'vacuum';
    }

    return new Query(elapsed, waiting, query);
};

var _nextId = 0;
function Database(name) {
    this.id = _nextId++;
    this.name = name;
    this.queries = null;

    this.update();
}

Database.prototype.update = function() {
    var queries = [];

    var r = Math.floor((Math.random() * 10) + 1);
    for (var j = 0; j < r; j++) {
        queries.push(Query.rand());
    }

    this.queries = queries;
};

Database.prototype.getTopFiveQueries = function() {
    var qs = this.queries.slice();
    qs.sort(function(a, b) {
        return a.elapsed - b.elapsed;
    });
    qs = qs.slice(0, 5);
    while (qs.length < 5) {
        qs.push(new Query(0.0, false, ''));
    }
    return qs;
};
