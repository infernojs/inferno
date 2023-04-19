import { Component, render } from 'inferno';
import { isNullOrUndef } from 'inferno-shared';
import Spy = jasmine.Spy;

describe('Columns like tests - (JSX)', () => {
  let container;

  beforeEach(function () {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(function () {
    render(null, container);
    container.innerHTML = '';
    document.body.removeChild(container);
  });

  describe('Column-like tests', () => {
    function buildTestCases(row, item, suffix) {
      return [
        {
          initial: [row(1, item(1, 1), item(2, 2)), row(2, item(3, 3), item(4, 4))],
          name: 'add one column -' + suffix,
          update: [row(1, item(1, 1), item(2, 2)), row(2, item(3, 3), item(4, 4)), row(3, item(5, 5))]
        },
        {
          initial: [row(1, item(1, 1), item(2, 2)), row(2, item(3, 3), item(4, 4))],
          name: 'add one item -' + suffix,
          update: [row(1, item(1, 1), item(2, 2), item(5, 5)), row(2, item(3, 3), item(4, 4))]
        },
        {
          initial: [row(1, item(1, 1), item(2, 2)), row(2, item(3, 3), item(4, 4))],
          name: 'add one column and item -' + suffix,
          update: [row(1, item(1, 1), item(2, 2)), row(2, item(3, 3), item(4, 4), item(6, 6)), row(3, item(5, 5))]
        },
        {
          initial: [row(1, item(1, 1), item(2, 2)), row(2, item(3, 3), item(4, 4))],
          name: 'swap all items -' + suffix,
          update: [row(1, item(2, 2), item(1, 1)), row(2, item(4, 4), item(3, 3))]
        },
        {
          initial: [row(1, item(1, 1), item(2, 2)), row(2, item(3, 3), item(4, 4))],
          name: 'remove first item -' + suffix,
          update: [row(1, item(2, 2)), row(2, item(4, 4))]
        },
        {
          initial: [row(1, item(1, 1), item(2, 2)), row(2, item(3, 3), item(4, 4))],
          name: 'remove last item -' + suffix,
          update: [row(1, item(1, 1)), row(2, item(3, 3))]
        },
        {
          initial: [row(1, item(1, 1), item(2, 2)), row(2, item(3, 3), item(4, 4))],
          name: 'remove all items-' + suffix,
          update: [row(1), row(2)]
        },
        {
          initial: [row(1, item(1, 1), item(2, 2)), row(2, item(3, 3), item(4, 4))],
          name: 'remove all columns-' + suffix,
          update: []
        }
      ];
    }

    function filterPlaceholders(_nodes) {
      const nodes = [].slice.apply(_nodes);
      let len = nodes.length;
      let i = 0;

      while (i < len) {
        const node = nodes[i];

        if (node.nodeType === 3 && node.nodeValue === '') {
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
        expect(columnRoot.firstChild.innerHTML).toBe('column');

        // Verify items
        // Skip first - its hardcoded
        for (let j = 1; j < columnChildNodes.length; j++) {
          const itemRoot = columnChildNodes[j];
          expect(itemRoot.innerHTML).toBe(columns[i].items[j - 1].text.toString());
        }
      }
    }

    function getDifferentObjects(arr1, arr2) {
      return arr1.filter(function (obj) {
        return !arr2.some(function (obj2) {
          return obj._testKey === obj2._testKey;
        });
      });
    }

    function getSameObjects(arr1, arr2) {
      return arr1.filter(function (obj) {
        return arr2.some(function (obj2) {
          return obj._testKey === obj2._testKey;
        });
      });
    }

    describe('columns KEYED', () => {
      // Item Keyed
      function BuildItemKeyed(key, text) {
        return { _testKey: key, id: key, text };
      }

      // Row Keyed
      function BuildRowKeyed(key, ...items) {
        return { _testKey: key, id: key, items };
      }

      const keyedTests = buildTestCases(BuildRowKeyed, BuildItemKeyed, 'KEYED');

      interface ItemKeyedProps {
        text?: string;
      }

      class ItemKeyed extends Component<ItemKeyedProps> {
        constructor(props) {
          super(props);
        }

        public componentWillUpdate() {}

        public componentWillMount() {}

        public componentWillUnmount() {}

        public render() {
          return <div>{this.props.text}</div>;
        }
      }

      interface ColumnKeyedProps {
        items: { id: string; text: string }[];
      }

      class ColumnKeyed extends Component<ColumnKeyedProps> {
        constructor(props) {
          super(props);
        }

        public componentWillUpdate() {}

        public componentWillMount() {}

        public componentWillUnmount() {}

        public render() {
          const items = this.props.items;

          return (
            <div>
              <span key="column">column</span>
              {items.map((item) => (
                <ItemKeyed key={item.id} text={item.text} />
              ))}
            </div>
          );
        }
      }

      const ViewKeyed = ({ columns }) => (
        <div>
          {columns.map((column) => (
            <ColumnKeyed key={column.id} items={column.items} />
          ))}
        </div>
      );

      let mountedColumnSpy: Spy = null as unknown as Spy;
      let unmountColumnSpy = null as unknown as Spy;
      let updateColumnSpy = null as unknown as Spy;
      let mountedItemSpy = null as unknown as Spy;
      let unmountItemSpy = null as unknown as Spy;
      let updateItemSpy = null as unknown as Spy;

      beforeEach(function () {
        mountedColumnSpy = spyOn(ColumnKeyed.prototype, 'componentWillMount');
        unmountColumnSpy = spyOn(ColumnKeyed.prototype, 'componentWillUnmount');
        updateColumnSpy = spyOn(ColumnKeyed.prototype, 'componentWillUpdate');
        mountedItemSpy = spyOn(ItemKeyed.prototype, 'componentWillMount');
        unmountItemSpy = spyOn(ItemKeyed.prototype, 'componentWillUnmount');
        updateItemSpy = spyOn(ItemKeyed.prototype, 'componentWillUpdate');
      });

      afterEach(function () {
        mountedColumnSpy.calls.reset();
        unmountColumnSpy.calls.reset();
        updateColumnSpy.calls.reset();
        mountedItemSpy.calls.reset();
        unmountItemSpy.calls.reset();
        updateItemSpy.calls.reset();
      });

      keyedTests.forEach((testCase) => {
        it('Should ' + testCase.name, () => {
          const columnsToBeAdded = getDifferentObjects(testCase.update, testCase.initial);
          const columnsToUpdate = getSameObjects(testCase.update, testCase.initial);
          const columnsToRemove = getDifferentObjects(testCase.initial, testCase.update);

          let itemsToBeAdded = [];
          let itemsToUpdate = [];
          let itemsToRemove = [];
          let initialItemsCount = 0;

          for (let i = 0; i < testCase.update.length || i < testCase.initial.length; i++) {
            const updateColumns = testCase.update[i];
            const intialColumns = testCase.initial[i];

            if (!isNullOrUndef(updateColumns)) {
              if (!isNullOrUndef(intialColumns)) {
                itemsToBeAdded = itemsToBeAdded.concat(getDifferentObjects(updateColumns.items, intialColumns.items));
                itemsToRemove = itemsToRemove.concat(getDifferentObjects(intialColumns.items, updateColumns.items));
                itemsToUpdate = itemsToUpdate.concat(getSameObjects(updateColumns.items, intialColumns.items));
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
          expect(mountedColumnSpy.calls.count()).toBe(testCase.initial.length); // Initial all mounted
          expect(unmountColumnSpy.calls.count()).toBe(0); // Initial render none unmounted
          expect(updateColumnSpy.calls.count()).toBe(0); // Initial render none to update

          expect(mountedItemSpy.calls.count()).toBe(initialItemsCount); // Initial render - mount all items once
          expect(updateItemSpy.calls.count()).toBe(0); // Initial render none to update
          expect(unmountItemSpy.calls.count()).toBe(0); // Initial render none unmounted

          // reset call counts
          mountedColumnSpy.calls.reset();
          unmountColumnSpy.calls.reset();
          updateColumnSpy.calls.reset();
          mountedItemSpy.calls.reset();
          updateItemSpy.calls.reset();
          unmountItemSpy.calls.reset();

          // Do update
          render(<ViewKeyed columns={testCase.update} />, container);
          verifyRenderResult(testCase.update, container);

          expect(mountedColumnSpy.calls.count()).toBe(columnsToBeAdded.length); // mount count should equal to added count
          expect(unmountColumnSpy.calls.count()).toBe(columnsToRemove.length); // Initial render none unmounted
          expect(updateColumnSpy.calls.count()).toBe(columnsToUpdate.length); // Initial render none unmounted
          expect(mountedItemSpy.calls.count()).toBe(itemsToBeAdded.length); // Initial render - mount all items once
          expect(updateItemSpy.calls.count()).toBe(itemsToUpdate.length); // Initial render none to update
          expect(unmountItemSpy.calls.count()).toBe(itemsToRemove.length); // Initial render none unmounted
        });
      });
    });

    describe('columns NON-KEYED', () => {
      // Item Keyed
      function BuildItem(key, text) {
        return { _testKey: key, text };
      }

      // Row Keyed
      function BuildRow(key, ...items) {
        return { _testKey: key, items };
      }

      const nonKeyedTestCases = buildTestCases(BuildRow, BuildItem, 'NON-KEYED');

      interface ItemProps {
        text: string;
      }

      class Item extends Component<ItemProps> {
        constructor(props) {
          super(props);
        }

        public componentWillUpdate() {}

        public componentWillMount() {}

        public componentWillUnmount() {}

        public render() {
          return <div>{this.props.text}</div>;
        }
      }

      interface ColumnProps {
        items: { text: string }[];
      }

      class Column extends Component<ColumnProps> {
        constructor(props) {
          super(props);
        }

        public componentWillUpdate() {}

        public componentWillMount() {}

        public componentWillUnmount() {}

        public render() {
          const items = this.props.items;

          return (
            <div>
              <span>column</span>
              {items.map((item) => (
                <Item text={item.text} />
              ))}
            </div>
          );
        }
      }

      const View = ({ columns }) => (
        <div>
          {columns.map((column) => (
            <Column items={column.items} />
          ))}
        </div>
      );

      let mountedColumnSpy = null as unknown as Spy;
      let unmountColumnSpy = null as unknown as Spy;
      let updateColumnSpy = null as unknown as Spy;
      let mountedItemSpy = null as unknown as Spy;
      let unmountItemSpy = null as unknown as Spy;
      let updateItemSpy = null as unknown as Spy;

      beforeEach(function () {
        mountedColumnSpy = spyOn(Column.prototype, 'componentWillMount');
        unmountColumnSpy = spyOn(Column.prototype, 'componentWillUnmount');
        updateColumnSpy = spyOn(Column.prototype, 'componentWillUpdate');
        mountedItemSpy = spyOn(Item.prototype, 'componentWillMount');
        unmountItemSpy = spyOn(Item.prototype, 'componentWillUnmount');
        updateItemSpy = spyOn(Item.prototype, 'componentWillUpdate');
      });

      afterEach(function () {
        mountedColumnSpy.calls.reset();
        unmountColumnSpy.calls.reset();
        updateColumnSpy.calls.reset();
        mountedItemSpy.calls.reset();
        unmountItemSpy.calls.reset();
        updateItemSpy.calls.reset();
      });

      nonKeyedTestCases.forEach((testCase) => {
        it('Should ' + testCase.name, () => {
          const columnsToBeAdded = getDifferentObjects(testCase.update, testCase.initial);
          const columnsToUpdate = getSameObjects(testCase.update, testCase.initial);
          const columnsToRemove = getDifferentObjects(testCase.initial, testCase.update);

          let itemsToBeAdded = [];
          let itemsToUpdate = [];
          let itemsToRemove = [];
          let initialItemsCount = 0;

          for (let i = 0; i < testCase.update.length || i < testCase.initial.length; i++) {
            const updateColumns = testCase.update[i];
            const intialColumns = testCase.initial[i];

            if (!isNullOrUndef(updateColumns)) {
              if (!isNullOrUndef(intialColumns)) {
                itemsToBeAdded = itemsToBeAdded.concat(getDifferentObjects(updateColumns.items, intialColumns.items));
                itemsToRemove = itemsToRemove.concat(getDifferentObjects(intialColumns.items, updateColumns.items));
                itemsToUpdate = itemsToUpdate.concat(getSameObjects(updateColumns.items, intialColumns.items));
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
          expect(mountedColumnSpy.calls.count()).toBe(testCase.initial.length); // Initial all mounted
          expect(unmountColumnSpy.calls.count()).toBe(0); // Initial render none unmounted
          expect(updateColumnSpy.calls.count()).toBe(0); // Initial render none to update

          expect(mountedItemSpy.calls.count()).toBe(initialItemsCount); // Initial render - mount all items once
          expect(updateItemSpy.calls.count()).toBe(0); // Initial render none to update
          expect(unmountItemSpy.calls.count()).toBe(0); // Initial render none unmounted

          // reset call counts
          mountedColumnSpy.calls.reset();
          unmountColumnSpy.calls.reset();
          updateColumnSpy.calls.reset();
          mountedItemSpy.calls.reset();
          updateItemSpy.calls.reset();
          unmountItemSpy.calls.reset();

          // Do update
          render(<View columns={testCase.update} />, container);
          verifyRenderResult(testCase.update, container);

          expect(mountedColumnSpy.calls.count()).toBe(columnsToBeAdded.length); // mount count should equal to added count
          expect(unmountColumnSpy.calls.count()).toBe(columnsToRemove.length); // Initial render none unmounted
          expect(updateColumnSpy.calls.count()).toBe(columnsToUpdate.length); // Initial render none unmounted
          expect(mountedItemSpy.calls.count()).toBe(itemsToBeAdded.length); // Initial render - mount all items once
          expect(updateItemSpy.calls.count()).toBe(itemsToUpdate.length); // Initial render none to update
          expect(unmountItemSpy.calls.count()).toBe(itemsToRemove.length); // Initial render none unmounted
        });
      });
    });
  });
});
