import { Component } from 'inferno'
import { Route } from 'inferno-router'

/**
 * Pages
 */
import StartPage from './pages/StartPage'
import AboutPage from './pages/AboutPage'

/**
 * The Application
 */
export class App extends Component {
  render(props) {
    return props.children;
  }
};

export function appFactory () {

  return (
      <App>
        {/* Public Pages */}
        <Route exact path={`/`} component={ StartPage } />
        <Route exact path={`/about`} component={ AboutPage } loader={AboutPage.fetchData} />
      </App>
  )
}
