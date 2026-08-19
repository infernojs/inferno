import { Component, render } from 'inferno';
import { inject, observer, Provider } from 'inferno-mobx';
import { Route, Router } from 'inferno-router';
import { createMemoryHistory } from 'history';
import { action, makeObservable, observable } from 'mobx';

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
       Regression for #1236: `observer` must not patch a component twice.
       Originally this store was pasted in as legacy-decorator output; mobx 7
       dropped legacy decorators, so it is declared with makeObservable instead.
     */
    class SearchStore {
      public query: string | undefined = undefined;

      constructor() {
        makeObservable(this, {
          query: observable,
          doSearch: action,
        });
      }

      public doSearch(search) {
        this.query = search;
      }
    }

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
