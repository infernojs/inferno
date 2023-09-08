import { Component, render } from 'inferno';
import { inject, observer, Provider } from 'inferno-mobx';
import { Route, Router } from 'inferno-router';
import { createMemoryHistory } from 'history';
import { action, observable } from 'mobx';

describe('Github #1236', () => {
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

  it('Should not patch twice', () => {
    /*
       This is pre-compiled from old decorator pattern
     */
    const _createClass = (function () {
      function defineProperties(target, props) {
        for (let i = 0; i < props.length; i++) {
          const descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ('value' in descriptor) descriptor.writable = true;
          Object.defineProperty(target, descriptor.key, descriptor);
        }
      }
      return function (Constructor, protoProps, staticProps = undefined) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);
        if (staticProps) defineProperties(Constructor, staticProps);
        return Constructor;
      };
    })();

    function _initDefineProp(target, property, descriptor, context) {
      if (!descriptor) return;
      Object.defineProperty(target, property, {
        configurable: descriptor.configurable,
        enumerable: descriptor.enumerable,
        value: descriptor.initializer
          ? descriptor.initializer.call(context)
          : void 0,
        writable: descriptor.writable,
      });
    }

    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError('Cannot call a class as a function');
      }
    }

    function _applyDecoratedDescriptor(
      target,
      property,
      decorators,
      descriptor,
      context?,
    ) {
      let desc: any = {};
      Object['ke' + 'ys'](descriptor).forEach(function (key) {
        desc[key] = descriptor[key];
      });
      desc.enumerable = !!desc.enumerable;
      desc.configurable = !!desc.configurable;

      if ('value' in desc || desc.initializer) {
        desc.writable = true;
      }

      desc = decorators
        .slice()
        .reverse()
        .reduce(function (descIn, decorator) {
          return decorator(target, property, descIn) || descIn;
        }, desc);

      if (context && desc.initializer !== void 0) {
        desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
        desc.initializer = undefined;
      }

      if (desc.initializer === void 0) {
        Object['define' + 'Property'](target, property, desc);
        desc = null;
      }

      return desc;
    }
    let _class;
    let _descriptor;
    const SearchStore =
      ((_class = (function () {
        function TestSearchStore() {
          _classCallCheck(this, TestSearchStore);

          _initDefineProp(this, 'query', _descriptor, this);
        }

        _createClass(TestSearchStore, [
          {
            key: 'doSearch',
            value: function doSearch(search) {
              this.query = search;
            },
          },
        ]);

        return TestSearchStore;
      })()),
      ((_descriptor = _applyDecoratedDescriptor(
        _class.prototype,
        'query',
        [observable],
        {
          enumerable: true,
          initializer: function initializer() {
            return undefined;
          },
        },
      )),
      _applyDecoratedDescriptor(
        _class.prototype,
        'doSearch',
        [action],
        Object.getOwnPropertyDescriptor(_class.prototype, 'doSearch'),
        _class.prototype,
      )),
      _class);

    let SearchPage = observer(
      class TestSearchPage extends Component {
        constructor(props) {
          super(props);
          this.doSearch = this.doSearch.bind(this);
        }

        public componentWillReceiveProps(nextProps) {
          nextProps.searchStore.doSearch(nextProps.location.search);
        }

        public doSearch(e) {
          e.preventDefault();
          const nextLoc =
            this.context.router.history.location.pathname + '?q=test';
          this.context.router.history.push(nextLoc);
        }

        public render({ searchStore: searchStoreIn }: any) {
          const showView = searchStoreIn.query ? 'results' : 'default';

          return (
            <div key="search-container">
              <a key="asd" id="test-btn" href="#front" onClick={this.doSearch}>
                link
              </a>
              {showView === 'default' && (
                <div key="search-default">default</div>
              )}
              {showView === 'results' && <SearchResult key="search-results" />}
            </div>
          );
        }
      },
    );

    SearchPage = inject('searchStore')(SearchPage);

    class SearchResult extends Component {
      public render() {
        return <div>results</div>;
      }
    }

    /**
     * Routing
     */
    const searchStore = new SearchStore();
    const memHistory = createMemoryHistory();

    const appRoutes = (
      <Provider searchStore={searchStore}>
        <Router history={memHistory}>
          <Route component={SearchPage} />
        </Router>
      </Provider>
    );

    render(appRoutes, container);

    expect(container.innerHTML).toEqual(
      '<div><a id="test-btn" href="#front">link</a><div>default</div></div>',
    );

    const btn = container.querySelector('#test-btn');

    btn.click();

    expect(container.innerHTML).toEqual(
      '<div><a id="test-btn" href="#front">link</a><div>results</div></div>',
    );
  });
});
