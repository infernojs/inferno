import { render } from "inferno";
import Component from "inferno-component";
import { isNullOrUndef } from "inferno-shared";
import sinon from "sinon";

describe("Columns like tests - (JSX)", () => {
  let container;

  beforeEach(function() {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(function() {
    render(null, container);
    container.innerHTML = "";
    document.body.removeChild(container);
  });

  describe("Column-like tests", () => {
    function buildTestCases(row, item, suffix) {
      return [
        {
          name: "add one column -" + suffix,
          initial: [
            row(1, item(1, 1), item(2, 2)),
            row(2, item(3, 3), item(4, 4))
          ],
          update: [
            row(1, item(1, 1), item(2, 2)),
            row(2, item(3, 3), item(4, 4)),
            row(3, item(5, 5))
          ]
        },
        {
          name: "add one item -" + suffix,
          initial: [
            row(1, item(1, 1), item(2, 2)),
            row(2, item(3, 3), item(4, 4))
          ],
          update: [
            row(1, item(1, 1), item(2, 2), item(5, 5)),
            row(2, item(3, 3), item(4, 4))
          ]
        },
        {
          name: "add one column and item -" + suffix,
          initial: [
            row(1, item(1, 1), item(2, 2)),
            row(2, item(3, 3), item(4, 4))
          ],
          update: [
            row(1, item(1, 1), item(2, 2)),
            row(2, item(3, 3), item(4, 4), item(6, 6)),
            row(3, item(5, 5))
          ]
        },
        {
          name: "swap all items -" + suffix,
          initial: [
            row(1, item(1, 1), item(2, 2)),
            row(2, item(3, 3), item(4, 4))
          ],
          update: [
            row(1, item(2, 2), item(1, 1)),
            row(2, item(4, 4), item(3, 3))
          ]
        },
        {
          name: "remove first item -" + suffix,
          initial: [
            row(1, item(1, 1), item(2, 2)),
            row(2, item(3, 3), item(4, 4))
          ],
          update: [row(1, item(2, 2)), row(2, item(4, 4))]
        },
        {
          name: "remove last item -" + suffix,
          initial: [
            row(1, item(1, 1), item(2, 2)),
            row(2, item(3, 3), item(4, 4))
          ],
          update: [row(1, item(1, 1)), row(2, item(3, 3))]
        },
        {
          name: "remove all items-" + suffix,
          initial: [
            row(1, item(1, 1), item(2, 2)),
            row(2, item(3, 3), item(4, 4))
          ],
          update: [row(1), row(2)]
        },
        {
          name: "remove all columns-" + suffix,
          initial: [
            row(1, item(1, 1), item(2, 2)),
            row(2, item(3, 3), item(4, 4))
          ],
          update: []
        }
      ];
    }

    function filterPlaceholders(_nodes) {
      const nodes = [].slice.apply(_nodes);
      let len = nodes.length,
        i = 0;

      while (i < len) {
        const node = nodes[i];

        if (node.nodeType === 3 && node.nodeValue === "") {
          nodes.splice(i, 1);
          len--;
        }
        i++;
      }
      return nodes;
    }

    function verifyRenderResult(columns, _container) {
      // Verify root
      const root = _container.firstChild;
      const rootChildNodes = filterPlaceholders(root.childNodes);

      expect(rootChildNodes.length).toBe(columns.length);
      // Verify columns
      for (let i = 0; i < rootChildNodes.length; i++) {
        const columnRoot = rootChildNodes[i];
        const columnChildNodes = filterPlaceholders(columnRoot.childNodes);

        expect(columnChildNodes.length).toBe(columns[i].items.length + 1);
        expect(columnRoot.firstChild.innerHTML).toBe("column");

        // Verify items
        // Skip first - its hardcoded
        for (let j = 1; j < columnChildNodes.length; j++) {
          const itemRoot = columnChildNodes[j];
          expect(itemRoot.innerHTML).toBe(
            columns[i].items[j - 1].text.toString()
          );
        }
      }
    }

    function getDifferentObjects(arr1, arr2) {
      return arr1.filter(function(obj) {
        return !arr2.some(function(obj2) {
          return obj._testKey === obj2._testKey;
        });
      });
    }

    function getSameObjects(arr1, arr2) {
      return arr1.filter(function(obj) {
        return arr2.some(function(obj2) {
          return obj._testKey === obj2._testKey;
        });
      });
    }

    describe("columns KEYED", () => {
      // Item Keyed
      function BuildItemKeyed(key, text) {
        return { _testKey: key, id: key, text };
      }

      // Row Keyed
      function BuildRowKeyed(key, ...items) {
        return { _testKey: key, id: key, items };
      }

      const keyedTests = buildTestCases(BuildRowKeyed, BuildItemKeyed, "KEYED");

      class ItemKeyed extends Component {
        constructor(props) {
          super(props);
        }

        componentWillUpdate() {}

        componentWillMount() {}

        componentWillUnmount() {}

        render() {
          return (
            <div>
              {this.props.text}
            </div>
          );
        }
      }

      class ColumnKeyed extends Component {
        constructor(props) {
          super(props);
        }

        componentWillUpdate() {}

        componentWillMount() {}

        componentWillUnmount() {}

        render() {
          const items = this.props.items;

          return (
            <div>
              <span key="column">column</span>
              {items.map(item => <ItemKeyed key={item.id} text={item.text} />)}
            </div>
          );
        }
      }

      const ViewKeyed = ({ columns }) =>
        <div>
          {columns.map(column =>
            <ColumnKeyed key={column.id} items={column.items} />
          )}
        </div>;

      let mountedColumnSpy = null;
      let unmountColumnSpy = null;
      let updateColumnSpy = null;
      let mountedItemSpy = null;
      let unmountItemSpy = null;
      let updateItemSpy = null;

      beforeEach(function() {
        mountedColumnSpy = sinon.spy(
          ColumnKeyed.prototype,
          "componentWillMount"
        );
        unmountColumnSpy = sinon.spy(
          ColumnKeyed.prototype,
          "componentWillUnmount"
        );
        updateColumnSpy = sinon.spy(
          ColumnKeyed.prototype,
          "componentWillUpdate"
        );
        mountedItemSpy = sinon.spy(ItemKeyed.prototype, "componentWillMount");
        unmountItemSpy = sinon.spy(ItemKeyed.prototype, "componentWillUnmount");
        updateItemSpy = sinon.spy(ItemKeyed.prototype, "componentWillUpdate");
      });

      afterEach(function() {
        mountedColumnSpy.restore();
        unmountColumnSpy.restore();
        updateColumnSpy.restore();
        mountedItemSpy.restore();
        unmountItemSpy.restore();
        updateItemSpy.restore();
      });

      keyedTests.forEach(testCase => {
        it("Should " + testCase.name, () => {
          const columnsToBeAdded = getDifferentObjects(
            testCase.update,
            testCase.initial
          );
          const columnsToUpdate = getSameObjects(
            testCase.update,
            testCase.initial
          );
          const columnsToRemove = getDifferentObjects(
            testCase.initial,
            testCase.update
          );

          let itemsToBeAdded = [];
          let itemsToUpdate = [];
          let itemsToRemove = [];
          let initialItemsCount = 0;

          for (
            let i = 0;
            i < testCase.update.length || i < testCase.initial.length;
            i++
          ) {
            const updateColumns = testCase.update[i];
            const intialColumns = testCase.initial[i];

            if (!isNullOrUndef(updateColumns)) {
              if (!isNullOrUndef(intialColumns)) {
                itemsToBeAdded = itemsToBeAdded.concat(
                  getDifferentObjects(updateColumns.items, intialColumns.items)
                );
                itemsToRemove = itemsToRemove.concat(
                  getDifferentObjects(intialColumns.items, updateColumns.items)
                );
                itemsToUpdate = itemsToUpdate.concat(
                  getSameObjects(updateColumns.items, intialColumns.items)
                );
                initialItemsCount += intialColumns.items.length;
              } else {
                itemsToBeAdded = itemsToBeAdded.concat(updateColumns.items);
              }
            } else {
              if (!isNullOrUndef(intialColumns)) {
                initialItemsCount += intialColumns.items.length;
                itemsToRemove = itemsToRemove.concat(intialColumns.items);
              } else {
                // Do nothing
              }
            }
          }

          // Do initial render
          render(<ViewKeyed columns={testCase.initial} />, container);
          verifyRenderResult(testCase.initial, container);
          expect(mountedColumnSpy.callCount).toBe(testCase.initial.length); // Initial all mounted
          expect(unmountColumnSpy.callCount).toBe(0); // Initial render none unmounted
          expect(updateColumnSpy.callCount).toBe(0); // Initial render none to update

          expect(mountedItemSpy.callCount).toBe(initialItemsCount); // Initial render - mount all items once
          expect(updateItemSpy.callCount).toBe(0); // Initial render none to update
          expect(unmountItemSpy.callCount).toBe(0); // Initial render none unmounted

          // reset call counts
          mountedColumnSpy.reset();
          unmountColumnSpy.reset();
          updateColumnSpy.reset();
          mountedItemSpy.reset();
          updateItemSpy.reset();
          unmountItemSpy.reset();

          // Do update
          render(<ViewKeyed columns={testCase.update} />, container);
          verifyRenderResult(testCase.update, container);

          expect(mountedColumnSpy.callCount).toBe(columnsToBeAdded.length); // mount count should equal to added count
          expect(unmountColumnSpy.callCount).toBe(columnsToRemove.length); // Initial render none unmounted
          expect(updateColumnSpy.callCount).toBe(columnsToUpdate.length); // Initial render none unmounted
          expect(mountedItemSpy.callCount).toBe(itemsToBeAdded.length); // Initial render - mount all items once
          expect(updateItemSpy.callCount).toBe(itemsToUpdate.length); // Initial render none to update
          expect(unmountItemSpy.callCount).toBe(itemsToRemove.length); // Initial render none unmounted
        });
      });
    });

    describe("columns NON-KEYED", () => {
      // Item Keyed
      function BuildItem(key, text) {
        return { _testKey: key, text };
      }

      // Row Keyed
      function BuildRow(key, ...items) {
        return { _testKey: key, items };
      }

      const nonKeyedTestCases = buildTestCases(
        BuildRow,
        BuildItem,
        "NON-KEYED"
      );

      class Item extends Component {
        constructor(props) {
          super(props);
        }

        componentWillUpdate() {}

        componentWillMount() {}

        componentWillUnmount() {}

        render() {
          return (
            <div>
              {this.props.text}
            </div>
          );
        }
      }

      class Column extends Component {
        constructor(props) {
          super(props);
        }

        componentWillUpdate() {}

        componentWillMount() {}

        componentWillUnmount() {}

        render() {
          const items = this.props.items;

          return (
            <div>
              <span>column</span>
              {items.map(item => <Item text={item.text} />)}
            </div>
          );
        }
      }

      const View = ({ columns }) =>
        <div>
          {columns.map(column => <Column items={column.items} />)}
        </div>;

      let mountedColumnSpy = null;
      let unmountColumnSpy = null;
      let updateColumnSpy = null;
      let mountedItemSpy = null;
      let unmountItemSpy = null;
      let updateItemSpy = null;

      beforeEach(function() {
        mountedColumnSpy = sinon.spy(Column.prototype, "componentWillMount");
        unmountColumnSpy = sinon.spy(Column.prototype, "componentWillUnmount");
        updateColumnSpy = sinon.spy(Column.prototype, "componentWillUpdate");
        mountedItemSpy = sinon.spy(Item.prototype, "componentWillMount");
        unmountItemSpy = sinon.spy(Item.prototype, "componentWillUnmount");
        updateItemSpy = sinon.spy(Item.prototype, "componentWillUpdate");
      });

      afterEach(function() {
        mountedColumnSpy.restore();
        unmountColumnSpy.restore();
        updateColumnSpy.restore();
        mountedItemSpy.restore();
        unmountItemSpy.restore();
        updateItemSpy.restore();
      });

      nonKeyedTestCases.forEach(testCase => {
        it("Should " + testCase.name, () => {
          const columnsToBeAdded = getDifferentObjects(
            testCase.update,
            testCase.initial
          );
          const columnsToUpdate = getSameObjects(
            testCase.update,
            testCase.initial
          );
          const columnsToRemove = getDifferentObjects(
            testCase.initial,
            testCase.update
          );

          let itemsToBeAdded = [];
          let itemsToUpdate = [];
          let itemsToRemove = [];
          let initialItemsCount = 0;

          for (
            let i = 0;
            i < testCase.update.length || i < testCase.initial.length;
            i++
          ) {
            const updateColumns = testCase.update[i];
            const intialColumns = testCase.initial[i];

            if (!isNullOrUndef(updateColumns)) {
              if (!isNullOrUndef(intialColumns)) {
                itemsToBeAdded = itemsToBeAdded.concat(
                  getDifferentObjects(updateColumns.items, intialColumns.items)
                );
                itemsToRemove = itemsToRemove.concat(
                  getDifferentObjects(intialColumns.items, updateColumns.items)
                );
                itemsToUpdate = itemsToUpdate.concat(
                  getSameObjects(updateColumns.items, intialColumns.items)
                );
                initialItemsCount += intialColumns.items.length;
              } else {
                itemsToBeAdded = itemsToBeAdded.concat(updateColumns.items);
              }
            } else {
              if (!isNullOrUndef(intialColumns)) {
                initialItemsCount += intialColumns.items.length;
                itemsToRemove = itemsToRemove.concat(intialColumns.items);
              } else {
                // Do nothing
              }
            }
          }

          // Do initial render
          render(<View columns={testCase.initial} />, container);
          verifyRenderResult(testCase.initial, container);
          expect(mountedColumnSpy.callCount).toBe(testCase.initial.length); // Initial all mounted
          expect(unmountColumnSpy.callCount).toBe(0); // Initial render none unmounted
          expect(updateColumnSpy.callCount).toBe(0); // Initial render none to update

          expect(mountedItemSpy.callCount).toBe(initialItemsCount); // Initial render - mount all items once
          expect(updateItemSpy.callCount).toBe(0); // Initial render none to update
          expect(unmountItemSpy.callCount).toBe(0); // Initial render none unmounted

          // reset call counts
          mountedColumnSpy.reset();
          unmountColumnSpy.reset();
          updateColumnSpy.reset();
          mountedItemSpy.reset();
          updateItemSpy.reset();
          unmountItemSpy.reset();

          // Do update
          render(<View columns={testCase.update} />, container);
          verifyRenderResult(testCase.update, container);

          expect(mountedColumnSpy.callCount).toBe(columnsToBeAdded.length); // mount count should equal to added count
          expect(unmountColumnSpy.callCount).toBe(columnsToRemove.length); // Initial render none unmounted
          expect(updateColumnSpy.callCount).toBe(columnsToUpdate.length); // Initial render none unmounted
          expect(mountedItemSpy.callCount).toBe(itemsToBeAdded.length); // Initial render - mount all items once
          expect(updateItemSpy.callCount).toBe(itemsToUpdate.length); // Initial render none to update
          expect(unmountItemSpy.callCount).toBe(itemsToRemove.length); // Initial render none unmounted
        });
      });
    });
  });
});
