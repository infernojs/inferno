import Inferno from '../../../../src';

function createDataModels() {
    let dataModels = [];

    dataModels.push(addGroupSingleChild(500));
    dataModels.push(addGroupSingleChild(500));

    return dataModels;
}

function addGroupSingleChild(count) {
    let dataModel = [];
    for(let i = 0; i < count; i++) {
        dataModel.push({
            key: i,
            children: null
        });
    }
    return dataModel;
}

function shuffle(dataModel) {
    for (var e, t, n = dataModel.length; 0 !== n; ) {
        e = Math.floor(Math.random() * n--);
        t = dataModel[n];
        dataModel[n] = dataModel[e];
        dataModel[e] = t;
    }
}

function createExpectedChildren(nodes) {
    var children = [];
    var j;
    var c;
    var i;
    var e;
    var n;

    for (i = 0; i < nodes.length; i++) {
      n = nodes[i];
      if (n.children !== null) {
        e = document.createElement('div');
        c = render(n.children);
        for (j = 0; j < c.length; j++) {
          e.appendChild(c[j]);
        }
        children.push(e);
      } else {
        e = document.createElement('span');
        e.textContent = n.key.toString();
        children.push(e);
      }
    }

    return children;
}

function createExpected(nodes) {
    var c = document.createElement('div');
    var e = document.createElement('div');
    var children = createExpectedChildren(nodes);
    for (var i = 0; i < children.length; i++) {
        e.appendChild(children[i]);
    }
    c.appendChild(e);
    return c.innerHTML;
}


//these are replicas of the vdom benchmark test
    describe('vdom benchmark tests (perf is in console)', () => {
        let container = document.createElement('div');
        let dataModels = null;

        beforeEach(() => {
            dataModels = createDataModels();
        });

        afterEach(() => {
            dataModels = null;
        });

        describe('using the Inferno functional API (vdom tests)', () => {
            var t1 = Inferno.createTemplate(function(key, children) {
                return {
                    tag: 'div',
                    key: key,
                    children: children
                }
            });

            var t2 = Inferno.createTemplate(function(key) {
                return {
                    tag: 'span',
                    key: key,
                    text: key
                }
            });

            function renderTree(nodes) {
                var children = new Array(nodes.length);
                var i;
                var n;

                for (i = 0; i < nodes.length; i++) {
                    n = nodes[i];
                    if (n.children !== null) {
                        children[i] = t1(n.key, renderTree(n.children));
                    } else {
                        children[i] = t2(n.key);
                    }
                }
                return children;
            }

            function render(dataModel) {
                Inferno.render(t1(null, renderTree(dataModel)), container);
            }

            it('vdom benchmark: render - insertFirst(500)', () => {
                //we use the first dataModel for this
                let dataModel = dataModels[0];

                console.time("keyed list: insertFirst(500)");
                render(dataModel);
                console.timeEnd("keyed list: insertFirst(500)");

                expect(container.innerHTML).to.equal(
                    createExpected(dataModel)
                );
            });

            it('vdom benchmark: update - reverse(500)', () => {
                //we use the first dataModel for this
                let dataModel = dataModels[0];
                dataModel.reverse();

                console.time("keyed list: reverse(500)");
                render(dataModel);
                console.timeEnd("keyed list: reverse(500)");

                expect(container.innerHTML).to.equal(
                    createExpected(dataModel)
                );

                //clear down after the update
                Inferno.render(null, container);
            });

            it('vdom benchmark: render - insertFirst(500)', () => {
                //we use the first dataModel for this
                let dataModel = dataModels[1];

                console.time("keyed list: insertFirst(500)");
                render(dataModel);
                console.timeEnd("keyed list: insertFirst(500)");

                expect(container.innerHTML).to.equal(
                    createExpected(dataModel)
                );
            });

            it('vdom benchmark: update - shuffle(500)', () => {
                //we use the first dataModel for this
                let dataModel = dataModels[1];
                shuffle(dataModel);

                console.time("keyed list: reverse(500)");
                render(dataModel);
                console.timeEnd("keyed list: reverse(500)");

                expect(container.innerHTML).to.equal(
                    createExpected(dataModel)
                );

                //clear down after the update
                Inferno.render(null, container);
            });
        });
    });
