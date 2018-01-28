import { Component, render } from 'inferno';
import { inject, observer, Provider } from 'inferno-mobx';
import { IndexRoute, Route, Router } from 'inferno-router';
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
    class SearchStore {
      @observable query = undefined;

      @action
      doSearch(search) {
        this.query = search;
      }
    }

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
          <IndexRoute component={SearchPage} />
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
