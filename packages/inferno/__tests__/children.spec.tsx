import { Component, InfernoNode, Key, render } from 'inferno';

describe('Children - (JSX)', () => {
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

  describe('keyed - children', function () {
    it('Should push to correct location when it keyed list has siblings', function () {
      const _tabs = [{ title: 'Item A' }, { title: 'Item B' }];
      interface TabProps {
        title?: string,
        onSelect?: () => void,
        key?: Key,
        id?: string
      }

      function Tab({ title, onSelect, key, id }: TabProps) {
        return (
          <div id={id} key={key} onClick={onSelect}>
            {title}
          </div>
        );
      }

      function TabGroup({ tabs }) {
        function create() {
          tabs.push({ title: 'New ' + tabs.length });
          renderIt();
        }

        return (
          <div className="tab-group">
            {tabs.map((tab, i) => (
              <Tab key={'Item ' + i} title={tab.title} onSelect={() => undefined} />
            ))}
            <Tab onSelect={create} id="add" title="Add" />
          </div>
        );
      }

      function renderIt() {
        render(<TabGroup tabs={_tabs} />, container);
      }

      renderIt();

      expect(container.innerHTML).toBe('<div class="tab-group"><div>Item A</div><div>Item B</div><div id="add">Add</div></div>');
      let addTab = container.querySelector('#add');
      addTab.click();
      expect(container.innerHTML).toBe('<div class="tab-group"><div>Item A</div><div>Item B</div><div>New 2</div><div id="add">Add</div></div>');
      addTab = container.querySelector('#add');
      addTab.click();
      expect(container.innerHTML).toBe(
        '<div class="tab-group"><div>Item A</div><div>Item B</div><div>New 2</div><div>New 3</div><div id="add">Add</div></div>'
      );
      addTab = container.querySelector('#add');
      addTab.click();
      expect(container.innerHTML).toBe(
        '<div class="tab-group"><div>Item A</div><div>Item B</div><div>New 2</div><div>New 3</div><div>New 4</div><div id="add">Add</div></div>'
      );
      addTab = container.querySelector('#add');
      addTab.click();
      expect(container.innerHTML).toBe(
        '<div class="tab-group"><div>Item A</div><div>Item B</div><div>New 2</div><div>New 3</div><div>New 4</div><div>New 5</div><div id="add">Add</div></div>'
      );
    });

    it('Should append child node to correct location when its empty at the beginning ', function () {
      const _tabs: {title:string}[] = [];
      interface TabProps {
        title?: string,
        onSelect?: () => void,
        key?: Key,
        id?: string
      }

      function Tab({ title, onSelect, key, id }: TabProps) {
        return (
          <div id={id} key={key} onClick={onSelect}>
            {title}
          </div>
        );
      }

      function TabGroup({ tabs }) {
        function create() {
          tabs.push({ title: 'New ' + tabs.length });
          renderIt();
        }

        return (
          <div className="tab-group">
            {tabs.map((tab, i) => (
              <Tab key={'Item ' + i} title={tab.title} onSelect={() => undefined} />
            ))}
            <Tab onSelect={create} id="add" title="Add" />
          </div>
        );
      }

      function renderIt() {
        render(<TabGroup tabs={_tabs} />, container);
      }

      renderIt();
      expect(container.innerHTML).toBe('<div class="tab-group"><div id="add">Add</div></div>');
      let addTab = container.querySelector('#add');
      addTab.click();
      expect(container.innerHTML).toBe('<div class="tab-group"><div>New 0</div><div id="add">Add</div></div>');
      addTab = container.querySelector('#add');
      addTab.click();
      expect(container.innerHTML).toBe('<div class="tab-group"><div>New 0</div><div>New 1</div><div id="add">Add</div></div>');
    });

    it('Should append child node to correct location when its empty at the beginning ', function () {
      const _tabs: {title:string}[] = [];

      interface TabProps {
        title?: string,
        onSelect?: () => void,
        key?: Key,
        id?: string
      }

      function Tab({ title, onSelect, key, id }: TabProps) {
        return (
          <div id={id} key={key} onClick={onSelect}>
            {title}
          </div>
        );
      }

      function TabGroup({ tabs }) {
        function create() {
          tabs.push({ title: 'New ' + tabs.length });
          renderIt();
        }

        return (
          <div className="tab-group">
            <Tab onSelect={create} id="add" title="Add" />
            {tabs.map((tab, i) => (
              <Tab key={'Item ' + i} title={tab.title} onSelect={() => undefined} />
            ))}
          </div>
        );
      }

      function renderIt() {
        render(<TabGroup tabs={_tabs} />, container);
      }

      renderIt();
      expect(container.innerHTML).toBe('<div class="tab-group"><div id="add">Add</div></div>');
      let addTab = container.querySelector('#add');
      addTab.click();
      expect(container.innerHTML).toBe('<div class="tab-group"><div id="add">Add</div><div>New 0</div></div>');
      addTab = container.querySelector('#add');
      addTab.click();
      expect(container.innerHTML).toBe('<div class="tab-group"><div id="add">Add</div><div>New 0</div><div>New 1</div></div>');
    });

    it('Should append child node to correct location when its empty at the beginning ', function () {
      const _tabs: {title:string}[] = [];
      interface TabProps {
        title?: string,
        onSelect?: () => void,
        key?: Key,
        id?: string
      }

      function Tab({ title, onSelect, key, id }: TabProps) {
        return (
          <div id={id} key={key} onClick={onSelect}>
            {title}
          </div>
        );
      }

      function TabGroup({ tabs }) {
        function create() {
          tabs.push({ title: 'New ' + tabs.length });
          renderIt();
        }

        return (
          <div className="tab-group">
            {tabs.map((tab, i) => (
              <Tab key={'Item ' + i} title={tab.title} onSelect={() => undefined} />
            ))}
            <Tab onSelect={create} id="add" title="Add" />
            {tabs.map((tab, i) => (
              <Tab key={'Item ' + i} title={tab.title} onSelect={() => undefined} />
            ))}
          </div>
        );
      }

      function renderIt() {
        render(<TabGroup tabs={_tabs} />, container);
      }

      renderIt();

      expect(container.innerHTML).toBe('<div class="tab-group"><div id="add">Add</div></div>');
      let addTab = container.querySelector('#add');
      addTab.click();
      expect(container.innerHTML).toBe('<div class="tab-group"><div>New 0</div><div id="add">Add</div><div>New 0</div></div>');
      addTab = container.querySelector('#add');
      addTab.click();
      expect(container.innerHTML).toBe('<div class="tab-group"><div>New 0</div><div>New 1</div><div id="add">Add</div><div>New 0</div><div>New 1</div></div>');
    });

    it('Should appendx3 to correct location when it keyed list has siblings', function () {
      const _tabs = [{ title: 'Item A' }, { title: 'Item B' }];
      interface TabProps {
        title?: string,
        onSelect?: () => void,
        key?: Key,
        id?: string
      }

      function Tab({ title, onSelect, key, id }: TabProps) {
        return (
          <div id={id} key={key} onClick={onSelect}>
            {title}
          </div>
        );
      }

      function TabGroup({ tabs }) {
        function create() {
          tabs.push({ title: 'New ' + tabs.length });
          tabs.push({ title: 'New ' + tabs.length });
          tabs.push({ title: 'New ' + tabs.length });
          renderIt();
        }

        return (
          <div className="tab-group">
            {tabs.map((tab, i) => (
              <Tab key={'Item ' + i} title={tab.title} onSelect={() => undefined} />
            ))}
            <Tab onSelect={create} id="add" title="Add" />
          </div>
        );
      }

      function renderIt() {
        render(<TabGroup tabs={_tabs} />, container);
      }

      renderIt();

      expect(container.innerHTML).toBe('<div class="tab-group"><div>Item A</div><div>Item B</div><div id="add">Add</div></div>');
      const addTab = container.querySelector('#add');
      addTab.click();
      expect(container.innerHTML).toBe(
        '<div class="tab-group"><div>Item A</div><div>Item B</div><div>New 2</div><div>New 3</div><div>New 4</div><div id="add">Add</div></div>'
      );
    });

    it('Should unshiftx3 to correct location when it keyed list has siblings', function () {
      const _tabs = [{ title: 'Item A' }, { title: 'Item B' }];
      interface TabProps {
        title?: string,
        onSelect?: () => void,
        key?: Key,
        id?: string
      }

      function Tab({ title, onSelect, key, id }: TabProps) {
        return (
          <div id={id} key={key} onClick={onSelect}>
            {title}
          </div>
        );
      }

      function TabGroup({ tabs }) {
        function create() {
          tabs.unshift({ title: 'New ' + tabs.length });
          tabs.unshift({ title: 'New ' + tabs.length });
          tabs.unshift({ title: 'New ' + tabs.length });
          renderIt();
        }

        return (
          <div className="tab-group">
            {tabs.map((tab, i) => (
              <Tab key={'Item ' + i} title={tab.title} onSelect={() => undefined} />
            ))}
            <Tab onSelect={create} id="add" title="Add" />
          </div>
        );
      }

      function renderIt() {
        render(<TabGroup tabs={_tabs} />, container);
      }

      renderIt();

      expect(container.innerHTML).toBe('<div class="tab-group"><div>Item A</div><div>Item B</div><div id="add">Add</div></div>');
      const addTab = container.querySelector('#add');
      addTab.click();
      expect(container.innerHTML).toBe(
        '<div class="tab-group"><div>New 4</div><div>New 3</div><div>New 2</div><div>Item A</div><div>Item B</div><div id="add">Add</div></div>'
      );
    });

    it('Inline text element before array list', function () {
      const _tabs: {title:string}[] = [];

      interface TabProps {
        title?: string,
        key?: Key,
      }

      function Tab({ title, key }: TabProps) {
        return <div key={key}>{title}</div>;
      }

      function TabGroup({ tabs }) {
        return (
          <div className="tab-group">
            inlineText
            {tabs.map((tab, i) => (
              <Tab key={'Item ' + i} title={tab.title} />
            ))}
          </div>
        );
      }

      function renderIt() {
        render(<TabGroup tabs={_tabs} />, container);
      }

      renderIt();

      expect(container.innerHTML).toBe('<div class="tab-group">inlineText</div>');

      _tabs.push({ title: 'New ' + _tabs.length });
      renderIt();

      expect(container.innerHTML).toBe('<div class="tab-group">inlineText<div>New 0</div></div>');
    });

    it('Inline text element after array list', function () {
      const _tabs: {title:string}[] = [];
      interface TabProps {
        title?: string,
        key?: Key,
      }

      function Tab({ title, key }: TabProps) {
        return <div key={key}>{title}</div>;
      }

      function TabGroup({ tabs }) {
        return (
          <div className="tab-group">
            {tabs.map((tab, i) => (
              <Tab key={'Item ' + i} title={tab.title} />
            ))}
            inlineText
          </div>
        );
      }

      function renderIt() {
        render(<TabGroup tabs={_tabs} />, container);
      }

      renderIt();

      expect(container.innerHTML).toBe('<div class="tab-group">inlineText</div>');

      _tabs.push({ title: 'New ' + _tabs.length });
      renderIt();

      expect(container.innerHTML).toBe('<div class="tab-group"><div>New 0</div>inlineText</div>');
    });
  });

  describe('nonKeyed - children', function () {
    it('Should push to correct location when it keyed list has siblings', function () {
      const _tabs = [{ title: 'Item A' }, { title: 'Item B' }];

      interface TabProps {
        title?: string,
        id?: string,
        onSelect?: () => void;
      }

      function Tab({ title, id, onSelect }: TabProps) {
        return (
          <div id={id} onClick={onSelect}>
            {title}
          </div>
        );
      }

      function TabGroup({ tabs }) {
        function create() {
          tabs.push({ title: 'New ' + tabs.length });
          renderIt();
        }

        return (
          <div className="tab-group">
            {tabs.map((tab) => (
              <Tab title={tab.title} onSelect={() => undefined} />
            ))}
            <Tab onSelect={create} id="add" title="Add" />
          </div>
        );
      }

      function renderIt() {
        render(<TabGroup tabs={_tabs} />, container);
      }

      renderIt();

      expect(container.innerHTML).toBe('<div class="tab-group"><div>Item A</div><div>Item B</div><div id="add">Add</div></div>');
      let addTab = container.querySelector('#add');
      addTab.click();
      expect(container.innerHTML).toBe('<div class="tab-group"><div>Item A</div><div>Item B</div><div>New 2</div><div id="add">Add</div></div>');
      addTab = container.querySelector('#add');
      addTab.click();
      expect(container.innerHTML).toBe(
        '<div class="tab-group"><div>Item A</div><div>Item B</div><div>New 2</div><div>New 3</div><div id="add">Add</div></div>'
      );
      addTab = container.querySelector('#add');
      addTab.click();
      expect(container.innerHTML).toBe(
        '<div class="tab-group"><div>Item A</div><div>Item B</div><div>New 2</div><div>New 3</div><div>New 4</div><div id="add">Add</div></div>'
      );
      addTab = container.querySelector('#add');
      addTab.click();
      expect(container.innerHTML).toBe(
        '<div class="tab-group"><div>Item A</div><div>Item B</div><div>New 2</div><div>New 3</div><div>New 4</div><div>New 5</div><div id="add">Add</div></div>'
      );
    });

    it('Should append child node to correct location when its empty at the beginning ', function () {
      const _tabs: {title:string}[] = [];

      interface TabProps {
        title?: string,
        id?: string,
        onSelect?: () => void;
      }

      function Tab({ title, id, onSelect }: TabProps) {
        return (
          <div id={id} onClick={onSelect}>
            {title}
          </div>
        );
      }

      function TabGroup({ tabs }) {
        function create() {
          tabs.push({ title: 'New ' + tabs.length });
          renderIt();
        }

        return (
          <div className="tab-group">
            {tabs.map((tab) => (
              <Tab title={tab.title} onSelect={() => undefined} />
            ))}
            <Tab onSelect={create} id="add" title="Add" />
          </div>
        );
      }

      function renderIt() {
        render(<TabGroup tabs={_tabs} />, container);
      }

      renderIt();
      expect(container.innerHTML).toBe('<div class="tab-group"><div id="add">Add</div></div>');
      let addTab = container.querySelector('#add');
      addTab.click();
      expect(container.innerHTML).toBe('<div class="tab-group"><div>New 0</div><div id="add">Add</div></div>');
      addTab = container.querySelector('#add');
      addTab.click();
      expect(container.innerHTML).toBe('<div class="tab-group"><div>New 0</div><div>New 1</div><div id="add">Add</div></div>');
    });

    it('Should append child node to correct location when its empty at the beginning ', function () {
      const _tabs: {title:string}[] = [];

      interface TabProps {
        title?: string,
        id?: string,
        onSelect?: () => void;
      }

      function Tab({ title, id, onSelect }: TabProps) {
        return (
          <div id={id} onClick={onSelect}>
            {title}
          </div>
        );
      }

      function TabGroup({ tabs }) {
        function create() {
          tabs.push({ title: 'New ' + tabs.length });
          renderIt();
        }

        return (
          <div className="tab-group">
            <Tab onSelect={create} id="add" title="Add" />
            {tabs.map((tab) => (
              <Tab title={tab.title} onSelect={() => undefined} />
            ))}
          </div>
        );
      }

      function renderIt() {
        render(<TabGroup tabs={_tabs} />, container);
      }

      renderIt();

      expect(container.innerHTML).toBe('<div class="tab-group"><div id="add">Add</div></div>');
      const addTab = container.querySelector('#add');
      addTab.click();
      expect(container.innerHTML).toBe('<div class="tab-group"><div id="add">Add</div><div>New 0</div></div>');
      addTab.click();
      expect(container.innerHTML).toBe('<div class="tab-group"><div id="add">Add</div><div>New 0</div><div>New 1</div></div>');
    });

    it('Should append child node to correct location when its empty at the beginning ', function () {
      const _tabs: {title:string}[] = [];

      interface TabProps {
        title?: string,
        id?: string,
        onSelect?: () => void;
      }

      function Tab({ title, id, onSelect }: TabProps) {
        return (
          <div id={id} onClick={onSelect}>
            {title}
          </div>
        );
      }

      function TabGroup({ tabs }) {
        function create() {
          tabs.push({ title: 'New ' + tabs.length });
          renderIt();
        }

        return (
          <div className="tab-group">
            {tabs.map((tab) => (
              <Tab title={tab.title} onSelect={() => undefined} />
            ))}
            <Tab onSelect={create} id="add" title="Add" />
            {tabs.map((tab) => (
              <Tab title={tab.title} onSelect={() => undefined} />
            ))}
          </div>
        );
      }

      function renderIt() {
        render(<TabGroup tabs={_tabs} />, container);
      }

      renderIt();

      expect(container.innerHTML).toBe('<div class="tab-group"><div id="add">Add</div></div>');
      let addTab = container.querySelector('#add');
      addTab.click();
      expect(container.innerHTML).toBe('<div class="tab-group"><div>New 0</div><div id="add">Add</div><div>New 0</div></div>');
      addTab = container.querySelector('#add');
      addTab.click();
      expect(container.innerHTML).toBe('<div class="tab-group"><div>New 0</div><div>New 1</div><div id="add">Add</div><div>New 0</div><div>New 1</div></div>');
    });

    it('Should appendx3 to correct location when it list has siblings', function () {
      const _tabs = [{ title: 'Item A' }, { title: 'Item B' }];

      interface TabProps {
        title?: string,
        id?: string,
        onSelect?: () => void;
      }

      function Tab({ title, id, onSelect }: TabProps) {
        return (
          <div id={id} onClick={onSelect}>
            {title}
          </div>
        );
      }

      function TabGroup({ tabs }) {
        function create() {
          tabs.push({ title: 'New ' + tabs.length });
          tabs.push({ title: 'New ' + tabs.length });
          tabs.push({ title: 'New ' + tabs.length });
          renderIt();
        }

        return (
          <div className="tab-group">
            {tabs.map((tab) => (
              <Tab title={tab.title} onSelect={() => undefined} />
            ))}
            <Tab onSelect={create} id="add" title="Add" />
          </div>
        );
      }

      function renderIt() {
        render(<TabGroup tabs={_tabs} />, container);
      }

      renderIt();

      expect(container.innerHTML).toBe('<div class="tab-group"><div>Item A</div><div>Item B</div><div id="add">Add</div></div>');
      const addTab = container.querySelector('#add');
      addTab.click();
      expect(container.innerHTML).toBe(
        '<div class="tab-group"><div>Item A</div><div>Item B</div><div>New 2</div><div>New 3</div><div>New 4</div><div id="add">Add</div></div>'
      );
    });

    it('Should unshiftx3 to correct location when it list has siblings', function () {
      const _tabs = [{ title: 'Item A' }, { title: 'Item B' }];

      interface TabProps {
        title?: string,
        id?: string,
        onSelect?: () => void;
      }

      function Tab({ title, id, onSelect }: TabProps) {
        return (
          <div id={id} onClick={onSelect}>
            {title}
          </div>
        );
      }

      function TabGroup({ tabs }) {
        function create() {
          tabs.unshift({ title: 'New ' + tabs.length });
          tabs.unshift({ title: 'New ' + tabs.length });
          tabs.unshift({ title: 'New ' + tabs.length });
          renderIt();
        }

        return (
          <div className="tab-group">
            {tabs.map((tab) => (
              <Tab title={tab.title} onSelect={() => undefined} />
            ))}
            <Tab onSelect={create} id="add" title="Add" />
          </div>
        );
      }

      function renderIt() {
        render(<TabGroup tabs={_tabs} />, container);
      }

      renderIt();

      expect(container.innerHTML).toBe('<div class="tab-group"><div>Item A</div><div>Item B</div><div id="add">Add</div></div>');
      const addTab = container.querySelector('#add');
      addTab.click();
      expect(container.innerHTML).toBe(
        '<div class="tab-group"><div>New 4</div><div>New 3</div><div>New 2</div><div>Item A</div><div>Item B</div><div id="add">Add</div></div>'
      );
    });

    it('Inline text element before array list', function () {
      const _tabs: {title:string}[] = [];

      function Tab({ title }) {
        return <div>{title}</div>;
      }

      function TabGroup({ tabs }) {
        return (
          <div className="tab-group">
            inlineText
            {tabs.map((tab) => (
              <Tab title={tab.title} />
            ))}
          </div>
        );
      }

      function renderIt() {
        render(<TabGroup tabs={_tabs} />, container);
      }

      renderIt();

      expect(container.innerHTML).toBe('<div class="tab-group">inlineText</div>');

      _tabs.push({ title: 'New ' + _tabs.length });
      renderIt();

      expect(container.innerHTML).toBe('<div class="tab-group">inlineText<div>New 0</div></div>');
    });

    it('Inline text element after array list', function () {
      const _tabs: {title:string}[] = [];

      function Tab({ title }) {
        return <div>{title}</div>;
      }

      function TabGroup({ tabs }) {
        return (
          <div className="tab-group">
            {tabs.map((tab) => (
              <Tab title={tab.title} />
            ))}
            inlineText
          </div>
        );
      }

      function renderIt() {
        render(<TabGroup tabs={_tabs} />, container);
      }

      renderIt();

      expect(container.innerHTML).toBe('<div class="tab-group">inlineText</div>');

      _tabs.push({ title: 'New ' + _tabs.length });
      renderIt();

      expect(container.innerHTML).toBe('<div class="tab-group"><div>New 0</div>inlineText</div>');
    });
  });

  describe('mixed children edge cases', function () {
    it('NONKEYED - should remove children from correct location when there is dynamic static item', function () {
      const items = ['a', 'b', 'c'];
      const emptyArray = [];
      const items3 = ['v', 'a'];
      let visible = false;
      let activeOne;

      function Loop({ text }) {
        return <p>{text}</p>;
      }

      function Looper({ collectionOne, visibleStatic }) {
        return (
          <div className="c">
            {visibleStatic ? <Loop text="static" /> : null}
            {collectionOne.map((text) => (
              <Loop text={text} />
            ))}
          </div>
        );
      }

      function renderIt() {
        render(<Looper collectionOne={activeOne} visibleStatic={visible} />, container);
      }

      visible = true;
      activeOne = items;
      renderIt();
      expect(container.innerHTML).toBe('<div class="c"><p>static</p><p>a</p><p>b</p><p>c</p></div>');

      visible = false;
      activeOne = items3;
      renderIt();
      expect(container.innerHTML).toBe('<div class="c"><p>v</p><p>a</p></div>');

      visible = true;
      activeOne = items3;
      renderIt();
      expect(container.innerHTML).toBe('<div class="c"><p>static</p><p>v</p><p>a</p></div>');

      visible = true;
      activeOne = emptyArray;
      renderIt();
      expect(container.innerHTML).toBe('<div class="c"><p>static</p></div>');
    });

    it('NONKEYED - should remove children from correct location when there is 2 dynamic static items and 2 lists', function () {
      const items = ['a', 'b', 'c'];
      const emptyArray = [];
      const items3 = ['v', 'a'];

      let activeOne;
      let activeTwo;
      let visibleOne = false;
      let visibleTwo = false;

      function Loop({ text }) {
        return <p>{text}</p>;
      }

      function Looper({ collectionOne, visibleStaticOne, collectionTwo, visibleStaticTwo }) {
        return (
          <div className="c">
            {visibleStaticOne ? <Loop text="static" /> : null}
            {collectionOne.map((text) => (
              <Loop text={text} />
            ))}
            {visibleStaticTwo ? <Loop text="static" /> : null}
            {collectionTwo.map((text) => (
              <Loop text={text} />
            ))}
          </div>
        );
      }

      function renderIt() {
        render(<Looper collectionOne={activeOne} visibleStaticOne={visibleOne} collectionTwo={activeTwo} visibleStaticTwo={visibleTwo} />, container);
      }

      visibleOne = true;
      activeOne = items;
      visibleTwo = false;
      activeTwo = emptyArray;
      renderIt();
      expect(container.innerHTML).toBe('<div class="c"><p>static</p><p>a</p><p>b</p><p>c</p></div>');

      visibleOne = true;
      activeOne = emptyArray;
      visibleTwo = true;
      activeTwo = items;
      renderIt();
      expect(container.innerHTML).toBe('<div class="c"><p>static</p><p>static</p><p>a</p><p>b</p><p>c</p></div>');

      visibleOne = false;
      activeOne = items3;
      visibleTwo = false;
      activeTwo = emptyArray;
      renderIt();
      expect(container.innerHTML).toBe('<div class="c"><p>v</p><p>a</p></div>');

      visibleOne = true;
      activeOne = items;
      visibleTwo = true;
      activeTwo = emptyArray;
      renderIt();
      expect(container.innerHTML).toBe('<div class="c"><p>static</p><p>a</p><p>b</p><p>c</p><p>static</p></div>');
    });

    it('KEYED - should remove children from correct location when there is dynamic static item', function () {
      const items = ['a', 'b', 'c'];
      const emptyArray = [];
      const items3 = ['v', 'a'];
      let visible = false;

      let activeOne;

      function Loop({ text }) {
        return <p>{text}</p>;
      }

      function Looper({ collectionOne, visibleStatic }) {
        return (
          <div className="c">
            {visibleStatic ? <Loop text="static" /> : null}
            {collectionOne.map((text, i) => (
              <Loop key={i} text={text} />
            ))}
          </div>
        );
      }

      function renderIt() {
        render(<Looper collectionOne={activeOne} visibleStatic={visible} />, container);
      }

      visible = true;
      activeOne = items;
      renderIt();
      expect(container.innerHTML).toBe('<div class="c"><p>static</p><p>a</p><p>b</p><p>c</p></div>');

      visible = false;
      activeOne = items3;
      renderIt();
      expect(container.innerHTML).toBe('<div class="c"><p>v</p><p>a</p></div>');

      visible = true;
      activeOne = items3;
      renderIt();
      expect(container.innerHTML).toBe('<div class="c"><p>static</p><p>v</p><p>a</p></div>');

      visible = true;
      activeOne = emptyArray;
      renderIt();
      expect(container.innerHTML).toBe('<div class="c"><p>static</p></div>');
    });
  });

  describe('Functions non keyed', () => {
    it('Should render correctly functions and nodes mixed', () => {
      let updaterFirst: (() => void) | null = null;
      let updaterSecond: (() => void) | null = null;

      interface AState {
        first: boolean
        second: boolean
      }

      class A extends Component<unknown, AState> {
        public state: Readonly<AState>;

        constructor(props) {
          super(props);

          this.state = {
            first: true,
            second: true
          };

          updaterFirst = () => this.setState({ first: !this.state.first });
          updaterSecond = () => this.setState({ second: !this.state.second });
        }

        public render() {
          return (
            <div>
              <p>1</p>
              {function () {
                if (this.state.first) {
                  return <span>abc</span>;
                }
                return null;
              }.call(this)}
              <p>2</p>
              {function () {
                if (this.state.second) {
                  return <span>def</span>;
                }
                return null;
              }.call(this)}
              <p>3</p>
            </div>
          );
        }
      }

      render(<A />, container);
      expect(container.innerHTML).toBe('<div><p>1</p><span>abc</span><p>2</p><span>def</span><p>3</p></div>');
      updaterFirst!();
      expect(container.innerHTML).toBe('<div><p>1</p><p>2</p><span>def</span><p>3</p></div>');
      updaterSecond!();
      expect(container.innerHTML).toBe('<div><p>1</p><p>2</p><p>3</p></div>');
      updaterSecond!();
      expect(container.innerHTML).toBe('<div><p>1</p><p>2</p><span>def</span><p>3</p></div>');
      updaterFirst!();
      expect(container.innerHTML).toBe('<div><p>1</p><span>abc</span><p>2</p><span>def</span><p>3</p></div>');
    });
  });

  describe('JSX plugin', () => {
    it('Should not have undefined properties', () => {
      class A extends Component {
        constructor(props) {
          super(props);
        }

        public render() {
          return <div>{this.props.children}</div>;
        }
      }

      class B extends Component {
        constructor(props) {
          super(props);
        }

        public callback() {}

        public render() {
          return (
            <A>
              <div onclick={this.callback}>B</div>
            </A>
          );
        }
      }

      render(<B />, container);
    });
  });

  describe('Rendering null on child node', () => {
    it('Should trigger unmount', () => {
      interface AProps {
        test: InfernoNode
      }
      class A extends Component<AProps> {
        constructor(props) {
          super(props);
        }

        public render() {
          return <div>{this.props.test}</div>;
        }
      }

      class B extends Component {
        constructor(props) {
          super(props);
        }

        public componentWillUnmount() {}

        public render() {
          return <p>B</p>;
        }
      }

      const unmountSpy = spyOn(B.prototype, 'componentWillUnmount');
      render(<A test={<B />} />, container);
      expect(container.innerHTML).toBe('<div><p>B</p></div>');
      render(<A test={null} />, container);
      expect(container.innerHTML).toBe('<div></div>');
      expect(unmountSpy.calls.count()).toBe(1);
    });
  });

  describe('VFragment within other nodes', () => {
    it('Should not clear nodes when non keyed', () => {
      const Nodes = ({ items }) => (
        <div>
          <div>test</div>
          {items.map((item) => (
            <span>{item}</span>
          ))}
          <div>end</div>
        </div>
      );

      render(<Nodes items={[1, 2, 3]} />, container);
      expect(container.innerHTML).toBe('<div><div>test</div><span>1</span><span>2</span><span>3</span><div>end</div></div>');

      render(<Nodes items={[3, 2, 1]} />, container);
      expect(container.innerHTML).toBe('<div><div>test</div><span>3</span><span>2</span><span>1</span><div>end</div></div>');

      render(<Nodes items={[9, 8, 7]} />, container);
      expect(container.innerHTML).toBe('<div><div>test</div><span>9</span><span>8</span><span>7</span><div>end</div></div>');

      render(<Nodes items={[]} />, container);
      expect(container.innerHTML).toBe('<div><div>test</div><div>end</div></div>');
    });

    it('Should not clear nodes when keyed inside vFragment', () => {
      const Nodes = ({ items }) => (
        <div>
          <div>test</div>
          {items.map((item) => (
            <span key={item}>{item}</span>
          ))}
          <div>end</div>
        </div>
      );

      render(<Nodes items={[1, 2, 3]} />, container);
      expect(container.innerHTML).toBe('<div><div>test</div><span>1</span><span>2</span><span>3</span><div>end</div></div>');

      render(<Nodes items={[3, 2, 1]} />, container);
      expect(container.innerHTML).toBe('<div><div>test</div><span>3</span><span>2</span><span>1</span><div>end</div></div>');

      render(<Nodes items={[9, 8, 7]} />, container);
      expect(container.innerHTML).toBe('<div><div>test</div><span>9</span><span>8</span><span>7</span><div>end</div></div>');

      render(<Nodes items={[]} />, container);
      expect(container.innerHTML).toBe('<div><div>test</div><div>end</div></div>');
    });

    it('Should not clear nodes when keyed inside vFragment #2', () => {
      const Nodes = ({ items }) => (
        <div>
          <div>test</div>
          {items.map((item) => (
            <span key={item}>{item}</span>
          ))}
          <div>end</div>
        </div>
      );

      render(<Nodes items={[1]} />, container);
      expect(container.innerHTML).toBe('<div><div>test</div><span>1</span><div>end</div></div>');

      render(<Nodes items={[]} />, container);
      expect(container.innerHTML).toBe('<div><div>test</div><div>end</div></div>');

      render(null, container);
      expect(container.innerHTML).toBe('');

      render(<Nodes items={[1, 2, 3]} />, container);
      expect(container.innerHTML).toBe('<div><div>test</div><span>1</span><span>2</span><span>3</span><div>end</div></div>');
    });
  });

  describe('Forced keyed children', () => {
    it('Should always go keyed algorithm when parent has $HasKeyedChildren', () => {
      const Collection = ({ children }) => <div $HasKeyedChildren>{children}</div>;

      render(
        <Collection>
          <div key="1">1</div>
          <div key="2">2</div>
          <div key="3">3</div>
        </Collection>,
        container
      );

      expect(container.innerHTML).toEqual('<div><div>1</div><div>2</div><div>3</div></div>');

      render(
        <Collection>
          <div key="3">3</div>
          <div key="2">2</div>
          <div key="1">1</div>
        </Collection>,
        container
      );

      expect(container.innerHTML).toEqual('<div><div>3</div><div>2</div><div>1</div></div>');

      render(
        <Collection>
          <div key="3">3</div>
          <div key="2">2</div>
          <div key="11">11</div>
        </Collection>,
        container
      );

      expect(container.innerHTML).toEqual('<div><div>3</div><div>2</div><div>11</div></div>');
    });

    it('Should be able to swap from keyed to nonkeyed when nextNode no longer is keyed', () => {
      const CollectionKeyed = ({ children }) => <div $HasKeyedChildren>{children}</div>;

      const CollectionNonKeyed = ({ children }) => <div $HasNonKeyedChildren>{children}</div>;

      render(
        <CollectionKeyed>
          <div key="1">1</div>
          <div key="2">2</div>
          <div key="3">3</div>
        </CollectionKeyed>,
        container
      );

      expect(container.innerHTML).toEqual('<div><div>1</div><div>2</div><div>3</div></div>');

      render(
        <CollectionNonKeyed>
          <div>3</div>
          <div>2</div>
        </CollectionNonKeyed>,
        container
      );

      expect(container.innerHTML).toEqual('<div><div>3</div><div>2</div></div>');

      render(
        <CollectionKeyed>
          <div key="3">3</div>
          <div key="2">2</div>
          <div key="11">11</div>
        </CollectionKeyed>,
        container
      );

      expect(container.innerHTML).toEqual('<div><div>3</div><div>2</div><div>11</div></div>');
    });

    it('Should handle previous being empty array', () => {
      const CollectionKeyed = ({ children }) => <div $HasKeyedChildren>{children}</div>;

      const child = [];
      render(<CollectionKeyed>{child}</CollectionKeyed>, container);

      expect(container.innerHTML).toEqual('<div></div>');

      render(
        <CollectionKeyed>
          <div key="1">1</div>
          <div key="2">2</div>
          <div key="3">3</div>
        </CollectionKeyed>,
        container
      );

      expect(container.innerHTML).toEqual('<div><div>1</div><div>2</div><div>3</div></div>');
    });

    it('Should handle next being empty array', () => {
      const CollectionKeyed = ({ children }) => <div $HasKeyedChildren>{children}</div>;

      render(
        <CollectionKeyed>
          <div key="1">1</div>
          <div key="2">2</div>
          <div key="3">3</div>
        </CollectionKeyed>,
        container
      );

      expect(container.innerHTML).toEqual('<div><div>1</div><div>2</div><div>3</div></div>');

      const child = [];
      render(<CollectionKeyed>{child}</CollectionKeyed>, container);

      expect(container.innerHTML).toEqual('<div></div>');
    });

    it('Should handle last/next being empty', () => {
      const CollectionKeyed = ({ children }) => <div $HasKeyedChildren>{children}</div>;

      const child = [];
      render(<CollectionKeyed>{child}</CollectionKeyed>, container);

      expect(container.innerHTML).toEqual('<div></div>');

      const childB = [];

      render(<CollectionKeyed>{childB}</CollectionKeyed>, container);

      expect(container.innerHTML).toEqual('<div></div>');
    });
  });

  describe('Unmount behavior in lists', () => {
    it('Should not call unmount when changing list length', () => {
      class UnMountTest extends Component {
        public componentWillUnmount() {
          // Should not be here
        }

        public render() {
          return <span>1</span>;
        }
      }

      interface ParentProps {
        firstClassCitizenIsBack?: boolean
      }

      class Parent extends Component<ParentProps> {
        public render() {
          let firstClassCitizen = null;
          if (this.props.firstClassCitizenIsBack) {
            firstClassCitizen = <div>b</div>;
          }

          // variable for debugging
          const node = (
            <div>
              <div>a</div>
              {firstClassCitizen}
              <UnMountTest />
              <div>C</div>
            </div>
          );

          return node;
        }
      }

      const spyUnmount = spyOn(UnMountTest.prototype, 'componentWillUnmount');

      render(<Parent firstClassCitizenIsBack={false} />, container); // initial render
      expect(container.innerHTML).toEqual('<div><div>a</div><span>1</span><div>C</div></div>');
      expect(spyUnmount).not.toHaveBeenCalled();

      render(<Parent firstClassCitizenIsBack={true} />, container);
      expect(container.innerHTML).toEqual('<div><div>a</div><div>b</div><span>1</span><div>C</div></div>');
      expect(spyUnmount).not.toHaveBeenCalled();
    });
  });

  describe('Children lifecycle with fastUnmount', () => {
    it('Should call componentWillUnmount for children', (done) => {
      let toggle;

      interface WrapperState {
        bool: boolean
      }

      class Wrapper extends Component<unknown, WrapperState> {
        public state: WrapperState;

        constructor(props) {
          super(props);

          this.state = {
            bool: true
          };

          toggle = () => {
            this.setState({
              bool: !this.state.bool
            });
          };
        }

        public render() {
          return (
            <div>
              <span>foobar</span>
              {this.state.bool ? <FooBar /> : null}
            </div>
          );
        }
      }

      interface FoobarState {
        text: string
      }

      class FooBar extends Component<unknown, FoobarState> {
        public state: FoobarState;

        constructor(props) {
          super(props);

          this.state = {
            text: 'initial'
          };
        }

        public componentWillUnmount() {}

        public componentWillMount() {}

        public render() {
          return <span>{this.state.text}</span>;
        }
      }

      render(<Wrapper />, container);

      const unMountSpy = spyOn(FooBar.prototype, 'componentWillUnmount');
      const mountSpy = spyOn(FooBar.prototype, 'componentWillMount');

      expect(container.innerHTML).toEqual('<div><span>foobar</span><span>initial</span></div>');

      mountSpy.calls.reset();
      unMountSpy.calls.reset();

      toggle(); // Unmount child component
      setTimeout(() => {
        expect(container.innerHTML).toEqual('<div><span>foobar</span></div>');

        expect(unMountSpy).toHaveBeenCalledTimes(1);
        expect(mountSpy).not.toHaveBeenCalled();
        done();
      }, 10);
    });

    it('Should call componentWillUnmount for nested children', (done) => {
      let toggle;

      interface WrapperState {
        bool: boolean
      }

      class Wrapper extends Component<unknown, WrapperState> {
        public state: WrapperState;
        constructor(props) {
          super(props);

          this.state = {
            bool: true
          };

          toggle = () => {
            this.setState({
              bool: !this.state.bool
            });
          };
        }

        public render() {
          return (
            <div>
              <span>foobar</span>
              {this.state.bool ? <FooBar /> : null}
            </div>
          );
        }
      }

      class FooBar extends Component {
        public render() {
          return (
            <span>
              <Test />
            </span>
          );
        }
      }

      class Test extends Component {
        public componentWillUnmount() {}

        public componentWillMount() {}

        public render() {
          return <em>f</em>;
        }
      }

      render(<Wrapper />, container);

      const unMountSpy = spyOn(Test.prototype, 'componentWillUnmount');
      const mountSpy = spyOn(Test.prototype, 'componentWillMount');

      expect(container.innerHTML).toEqual('<div><span>foobar</span><span><em>f</em></span></div>');

      mountSpy.calls.reset();
      unMountSpy.calls.reset();

      toggle(); // Unmount child component
      setTimeout(() => {
        expect(container.innerHTML).toEqual('<div><span>foobar</span></div>');

        expect(unMountSpy).toHaveBeenCalledTimes(1);
        expect(mountSpy).not.toHaveBeenCalled();
        done();
      }, 10);
    });

    it('Should call componentWillUnmount for nested children #2', (done) => {
      let toggle;

      interface WrapperState {
        bool: boolean
      }

      class Wrapper extends Component<unknown, WrapperState> {
        public state: WrapperState;
        constructor(props) {
          super(props);

          this.state = {
            bool: true
          };

          toggle = () => {
            this.setState({
              bool: !this.state.bool
            });
          };
        }

        public render() {
          return (
            <div>
              <span>foobar</span>
              {this.state.bool ? <FooBar /> : null}
            </div>
          );
        }
      }

      class FooBar extends Component {
        public render() {
          return (
            <span>
              <Test />
              <Foo />
            </span>
          );
        }
      }

      class Test extends Component {
        public componentWillUnmount() {}

        public render() {
          return <em>f</em>;
        }
      }

      class Foo extends Component {
        public componentWillUnmount() {}

        public render() {
          return <em>f</em>;
        }
      }

      render(<Wrapper />, container);

      const unMountSpy = spyOn(Test.prototype, 'componentWillUnmount');
      const unMountSpy2 = spyOn(Foo.prototype, 'componentWillUnmount');

      expect(container.innerHTML).toEqual('<div><span>foobar</span><span><em>f</em><em>f</em></span></div>');

      unMountSpy2.calls.reset();
      unMountSpy.calls.reset();

      toggle(); // Unmount child component
      setTimeout(() => {
        expect(container.innerHTML).toEqual('<div><span>foobar</span></div>');
        expect(unMountSpy2).toHaveBeenCalledTimes(1);
        expect(unMountSpy).toHaveBeenCalledTimes(1);
        done();
      }, 10);
    });

    it('Should call componentWillUnmount for deeply nested children', (done) => {
      let toggle;

      interface WrapperState {
        bool: boolean
      }

      class Wrapper extends Component<unknown, WrapperState> {
        public state: WrapperState;
        constructor(props) {
          super(props);

          this.state = {
            bool: true
          };

          toggle = () => {
            this.setState({
              bool: !this.state.bool
            });
          };
        }

        public render() {
          return (
            <div>
              <span>foobar</span>
              {this.state.bool ? <FooBar /> : null}
            </div>
          );
        }
      }

      class FooBar extends Component {
        public render() {
          return (
            <span>
              <span>
                <span>
                  <span>
                    <Test />
                  </span>
                </span>
              </span>
            </span>
          );
        }
      }

      class Test extends Component {
        public render() {
          return <Test2 />;
        }
      }

      class Test2 extends Component {
        public render() {
          return <Test4 />;
        }
      }

      class Test4 extends Component {
        public render() {
          return (
            <div>
              <span />
              <Test5 />
              <span />
            </div>
          );
        }
      }

      class Test5 extends Component {
        public componentWillUnmount() {}

        public render() {
          return <h1>ShouldUnMountMe</h1>;
        }
      }

      render(<Wrapper />, container);

      const unMountSpy = spyOn(Test5.prototype, 'componentWillUnmount');

      expect(container.innerHTML).toEqual(
        '<div><span>foobar</span><span><span><span><span><div><span></span><h1>ShouldUnMountMe</h1><span></span></div></span></span></span></span></div>'
      );

      unMountSpy.calls.reset();

      toggle(); // Unmount child component
      setTimeout(() => {
        expect(container.innerHTML).toEqual('<div><span>foobar</span></div>');
        expect(unMountSpy).toHaveBeenCalledTimes(1);
        done();
      }, 10);
    });

    it('Should call componentWillUnmount for parent when children dont have componentWIllUnmount', (done) => {
      class Wrapper extends Component {
        constructor(props) {
          super(props);
        }

        public componentWillUnmount() {}

        public render() {
          return (
            <div>
              <span>foobar</span>
              <FooBar />
            </div>
          );
        }
      }

      class FooBar extends Component {
        public componentWillUnmount() {}

        public render() {
          return (
            <span>
              <Test />
            </span>
          );
        }
      }

      class Test extends Component {
        public render() {
          return <em>f</em>;
        }
      }

      render(<Wrapper />, container);

      const unMountSpy = spyOn(Wrapper.prototype, 'componentWillUnmount');
      const unMountSpy2 = spyOn(FooBar.prototype, 'componentWillUnmount');

      expect(container.innerHTML).toEqual('<div><span>foobar</span><span><em>f</em></span></div>');

      unMountSpy.calls.reset();
      unMountSpy2.calls.reset();

      render(null, container);
      setTimeout(() => {
        expect(container.innerHTML).toEqual('');

        expect(unMountSpy).toHaveBeenCalledTimes(1);
        expect(unMountSpy2).toHaveBeenCalledTimes(1);
        done();
      }, 10);
    });

    it('Should fastUnmount child component when only parent has unmount callback', (done) => {
      interface WrapperProps {
        kill: boolean
      }

      class Wrapper extends Component<WrapperProps> {
        constructor(props) {
          super(props);
        }

        public componentWillUnmount() {}

        public render() {
          return (
            <div>
              <span>foobar</span>
              <FooBar kill={this.props.kill} />
            </div>
          );
        }
      }

      interface FoobarProps {
        kill: boolean
      }

      class FooBar extends Component<FoobarProps> {
        public componentWillUnmount() {}

        public render() {
          return <span>{!this.props.kill ? <Test /> : null}</span>;
        }
      }

      class Test extends Component {
        public render() {
          return (
            <em>
              <FastUnMountThis />
            </em>
          );
        }
      }

      let dirtyReference: FastUnMountThis | null = null;
      let updateFastUnmountedComponent: (() => void) | null = null;

      interface FastUnMountThisState {
        text: string
      }

      class FastUnMountThis extends Component<unknown, FastUnMountThisState> {
        public state: FastUnMountThisState;

        constructor(props) {
          super(props);

          this.state = {
            text: 'aa'
          };

          dirtyReference = this;
          updateFastUnmountedComponent = () => {
            this.changeText();
          };
        }

        public changeText() {
          this.setState({
            text: 'foo'
          });
        }

        public render() {
          return <pre onclick={function () {}}>{this.state.text}</pre>;
        }
      }

      render(<Wrapper kill={false} />, container);

      const unMountSpy = spyOn(Wrapper.prototype, 'componentWillUnmount');
      const unMountSpy2 = spyOn(FooBar.prototype, 'componentWillUnmount');

      expect(container.innerHTML).toEqual('<div><span>foobar</span><span><em><pre>aa</pre></em></span></div>');

      render(<Wrapper kill={true} />, container);

      setTimeout(() => {
        expect(container.innerHTML).toEqual('<div><span>foobar</span><span></span></div>');

        expect(unMountSpy).not.toHaveBeenCalled();
        expect(unMountSpy2).not.toHaveBeenCalled();

        // This component is actually unmounted but fastUnmount skips unmount loop so unmounted remains false
        expect(dirtyReference!.$UN).toEqual(true);
        // Try to do setState and verify it doesn't fail
        updateFastUnmountedComponent!();

        setTimeout(() => {
          expect(dirtyReference!.$UN).toEqual(true);
          expect(container.innerHTML).toEqual('<div><span>foobar</span><span></span></div>');

          done();
        }, 10);
      }, 10);
    });

    it('Should render call componentWillUnmount for children when later sibling has no lifecycle', () => {
      class Parent extends Component {
        constructor(props) {
          super(props);
        }

        public componentWillUnmount() {}

        public render() {
          return (
            <div>
              <HasLife />
              <NoLife />
            </div>
          );
        }
      }

      // This should be able to fastUnmount
      class NoLife extends Component {
        public render() {
          return <span>nolife</span>;
        }
      }

      // This should have fastUnmount false
      class HasLife extends Component {
        public componentWillUnmount() {}

        public render() {
          return <span>haslife</span>;
        }
      }

      const unMountSpy = spyOn(Parent.prototype, 'componentWillUnmount');
      const unMountSpy2 = spyOn(HasLife.prototype, 'componentWillUnmount');

      render(<Parent />, container);

      expect(unMountSpy).not.toHaveBeenCalled();
      expect(unMountSpy2).not.toHaveBeenCalled();

      expect(container.innerHTML).toEqual('<div><span>haslife</span><span>nolife</span></div>');

      render(null, container);

      expect(unMountSpy).toHaveBeenCalledTimes(1);
      expect(unMountSpy2).toHaveBeenCalledTimes(1);
    });
  });

  describe('Children lifecycle with fastUnmount Functional Components', () => {
    it('Should call componentWillUnmount for children', () => {
      let mountCalls = 0;
      let unMountCalls = 0;
      const foobarLifecycle = {
        componentWillMount: () => {
          mountCalls++;
        },
        componentWillUnmount: () => {
          unMountCalls++;
        }
      };

      function Wrapper({ bool }) {
        return (
          <div>
            <span>foobar</span>
            {bool ? <FooBar onComponentWillMount={foobarLifecycle.componentWillMount} onComponentWillUnmount={foobarLifecycle.componentWillUnmount} /> : null}
          </div>
        );
      }

      function FooBar() {
        return <span>initial</span>;
      }

      render(<Wrapper bool={true} />, container);

      expect(container.innerHTML).toEqual('<div><span>foobar</span><span>initial</span></div>');

      expect(mountCalls).toEqual(1);
      expect(unMountCalls).toEqual(0);

      render(<Wrapper bool={false} />, container); // Unmount child component
      expect(container.innerHTML).toEqual('<div><span>foobar</span></div>');

      expect(mountCalls).toEqual(1);
      expect(unMountCalls).toEqual(1);
    });

    it('Should call componentWillUnmount for nested children', () => {
      let unMountCalls = 0;
      let mountCalls = 0;

      const testLifeCycle = {
        componentWillMount: () => {
          mountCalls++;
        },
        componentWillUnmount: () => {
          unMountCalls++;
        }
      };

      function Wrapper({ bool }) {
        return (
          <div>
            <span>foobar</span>
            {bool ? <FooBar /> : null}
          </div>
        );
      }

      function FooBar() {
        return (
          <span>
            <Test onComponentWillMount={testLifeCycle.componentWillMount} onComponentWillUnmount={testLifeCycle.componentWillUnmount} />
          </span>
        );
      }

      function Test() {
        return <em>f</em>;
      }

      render(<Wrapper bool={true} />, container);

      expect(container.innerHTML).toEqual('<div><span>foobar</span><span><em>f</em></span></div>');

      expect(mountCalls).toEqual(1);
      expect(unMountCalls).toEqual(0);

      render(<Wrapper bool={false} />, container); // Unmount child component
      expect(container.innerHTML).toEqual('<div><span>foobar</span></div>');

      expect(mountCalls).toEqual(1);
      expect(unMountCalls).toEqual(1);
    });

    it('Should call componentWillUnmount for nested children #2', () => {
      let unMountTest = 0;
      let unMountFoo = 0;

      const testLifeCycle = {
        componentWillUnmount: () => {
          unMountTest++;
        }
      };

      const fooLifecycle = {
        componentWillUnmount: () => {
          unMountFoo++;
        }
      };

      function Wrapper({ bool }) {
        return (
          <div>
            <span>foobar</span>
            {bool ? <FooBar /> : null}
          </div>
        );
      }

      function FooBar() {
        return (
          <span>
            <Test onComponentWillUnmount={testLifeCycle.componentWillUnmount} />
            <Foo onComponentWillUnmount={fooLifecycle.componentWillUnmount} />
          </span>
        );
      }

      function Test() {
        return <em>f</em>;
      }

      function Foo() {
        return <em>f</em>;
      }

      render(<Wrapper bool={true} />, container);

      expect(container.innerHTML).toEqual('<div><span>foobar</span><span><em>f</em><em>f</em></span></div>');

      render(<Wrapper bool={false} />, container);
      expect(container.innerHTML).toEqual('<div><span>foobar</span></div>');
      expect(unMountTest).toEqual(1);
      expect(unMountFoo).toEqual(1);
    });

    it('Should call componentWillUnmount for deeply nested children', () => {
      let unMountTest = 0;

      const testLifecycle = {
        componentWillUnmount: () => {
          unMountTest++;
        }
      };

      function Wrapper({ bool }) {
        return (
          <div>
            <span>foobar</span>
            {bool ? <FooBar /> : null}
          </div>
        );
      }

      function FooBar() {
        return (
          <span>
            <span>
              <span>
                <span>
                  <Test />
                </span>
              </span>
            </span>
          </span>
        );
      }

      function Test() {
        return <Test2 />;
      }

      function Test2() {
        return <Test4 />;
      }

      function Test4() {
        return (
          <div>
            <span />
            <Test5 onComponentWillUnmount={testLifecycle.componentWillUnmount} />
            <span />
          </div>
        );
      }

      function Test5() {
        return <h1>ShouldUnMountMe</h1>;
      }

      render(<Wrapper bool={true} />, container);

      expect(container.innerHTML).toEqual(
        '<div><span>foobar</span><span><span><span><span><div><span></span><h1>ShouldUnMountMe</h1><span></span></div></span></span></span></span></div>'
      );

      render(<Wrapper bool={false} />, container);
      expect(container.innerHTML).toEqual('<div><span>foobar</span></div>');

      expect(unMountTest).toEqual(1);
    });

    it('Should call componentWillUnmount for parent when children dont have componentWIllUnmount', (done) => {
      let unMountTest = 0;
      let unMountTwoTest = 0;

      const testLifecycle = {
        componentWillUnmount: () => {
          unMountTest++;
        },
        componentWillUnmountTwo: () => {
          unMountTwoTest++;
        }
      };

      function Wrapper() {
        return (
          <div>
            <span>foobar</span>
            <FooBar onComponentWillUnmount={testLifecycle.componentWillUnmountTwo} />
          </div>
        );
      }

      function FooBar() {
        return (
          <span>
            <Test />
          </span>
        );
      }

      function Test() {
        return <em>f</em>;
      }

      render(<Wrapper onComponentWillUnmount={testLifecycle.componentWillUnmount} />, container);

      expect(container.innerHTML).toEqual('<div><span>foobar</span><span><em>f</em></span></div>');

      render(null, container);
      setTimeout(() => {
        expect(container.innerHTML).toEqual('');

        expect(unMountTest).toEqual(1);
        expect(unMountTwoTest).toEqual(1);
        done();
      }, 10);
    });
  });
});
