import { render } from 'inferno';

// Browsers only autofocus an element that has the autofocus attribute when it is inserted into the document.
// jsdom does not implement autofocus, so these tests check that the attribute is never added to an element that
// is already in the document: the MutationObserver on the container sees exactly those changes.
describe('autoFocus', () => {
  let container;
  let observer;

  beforeEach(function () {
    container = document.createElement('div');
    document.body.appendChild(container);
    observer = new MutationObserver(() => {});
    observer.observe(container, {
      attributes: true,
      attributeFilter: ['autofocus'],
      subtree: true,
    });
  });

  afterEach(function () {
    observer.disconnect();
    render(null, container);
    container.innerHTML = '';
    document.body.removeChild(container);
  });

  function autofocusSetInDocument() {
    return observer.takeRecords().map((record) => record.target.nodeName);
  }

  it('Should set autofocus before inserting an element inside the mounted tree', () => {
    render(
      <form>
        <input autoFocus />
      </form>,
      container,
    );

    expect(container.querySelector('input').hasAttribute('autofocus')).toBe(true);
    expect(autofocusSetInDocument()).toEqual([]);
  });

  it('Should set autofocus before inserting the root element of render', () => {
    render(<input autoFocus />, container);

    expect(container.querySelector('input').hasAttribute('autofocus')).toBe(true);
    expect(autofocusSetInDocument()).toEqual([]);
  });

  it('Should set autofocus before inserting an element mounted by an update', () => {
    render(<form>{null}</form>, container);
    render(
      <form>
        <input autoFocus />
      </form>,
      container,
    );

    expect(container.querySelector('input').hasAttribute('autofocus')).toBe(true);
    expect(autofocusSetInDocument()).toEqual([]);
  });

  it('Should set autofocus before inserting the root element of a component', () => {
    function SearchBox() {
      return <input autoFocus />;
    }

    render(<form>{null}</form>, container);
    render(
      <form>
        <SearchBox />
      </form>,
      container,
    );

    expect(container.querySelector('input').hasAttribute('autofocus')).toBe(true);
    expect(autofocusSetInDocument()).toEqual([]);
  });
});
