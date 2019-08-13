import { Component, render } from 'inferno';
import { inject, observer, Provider } from 'inferno-mobx';
import { Route, Router } from 'inferno-router';
import createMemoryHistory from 'history/createMemoryHistory';
import { action, observable } from 'mobx';

describe('Github #1236', () => {
  let container;

  beforeEach(function() {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(function() {
    render(null, container);
    container.innerHTML = '';
    document.body.removeChild(container);
  });

  it('Should not patch twice', () => {
    /*
       This is pre-compiled from old decorator pattern
     */
    var _createClass = (function() {
      function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ('value' in descriptor) descriptor.writable = true;
          Object.defineProperty(target, descriptor.key, descriptor);
        }
      }
      return function(Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);
        if (staticProps) defineProperties(Constructor, staticProps);
        return Constructor;
      };
    })();

    function _initDefineProp(target, property, descriptor, context) {
      if (!descriptor) return;
      Object.defineProperty(target, property, {
        enumerable: descriptor.enumerable,
        configurable: descriptor.configurable,
        writable: descriptor.writable,
        value: descriptor.initializer ? descriptor.initializer.call(context) : void 0
      });
    }

    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError('Cannot call a class as a function');
      }
    }

    function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
      var desc = {};
      Object['ke' + 'ys'](descriptor).forEach(function(key) {
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
        .reduce(function(desc, decorator) {
          return decorator(target, property, desc) || desc;
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
    var _desc, _value, _class, _descriptor;
    var SearchStore =
      ((_class = (function() {
        function SearchStore() {
          _classCallCheck(this, SearchStore);

          _initDefineProp(this, 'query', _descriptor, this);
        }

        _createClass(SearchStore, [
          {
            key: 'doSearch',
            value: function doSearch(search) {
              this.query = search;
            }
          }
        ]);

        return SearchStore;
      })()),
      ((_descriptor = _applyDecoratedDescriptor(_class.prototype, 'query', [observable], {
        enumerable: true,
        initializer: function initializer() {
          return undefined;
        }
      })),
      _applyDecoratedDescriptor(_class.prototype, 'doSearch', [action], Object.getOwnPropertyDescriptor(_class.prototype, 'doSearch'), _class.prototype)),
      _class);

    let SearchPage = observer(
      class SearchPage extends Component {
        constructor(props) {
          super(props);
          this.doSearch = this.doSearch.bind(this);
        }

        componentWillReceiveProps(nextProps) {
          nextProps.searchStore.doSearch(nextProps.location.search);
        }

        doSearch(e) {
          e.preventDefault();
          const nextLoc = this.context.router.history.location.pathname + '?q=test';
          this.context.router.history.push(nextLoc);
        }

        render({ searchStore }) {
          let showView = searchStore['query'] ? 'results' : 'default';

          return (
            <div key="search-container">
              <a key="asd" id="test-btn" href="#front" onClick={this.doSearch}>
                link
              </a>
              {showView === 'default' && <div key="search-default">default</div>}
              {showView === 'results' && <SearchResult key="search-results" />}
            </div>
          );
        }
      }
    );

    SearchPage = inject('searchStore')(SearchPage);

    class SearchResult extends Component {
      render() {
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

    expect(container.innerHTML).toEqual('<div><a id="test-btn" href="#front">link</a><div>default</div></div>');

    const btn = container.querySelector('#test-btn');

    btn.click();

    expect(container.innerHTML).toEqual('<div><a id="test-btn" href="#front">link</a><div>results</div></div>');
  });
});
