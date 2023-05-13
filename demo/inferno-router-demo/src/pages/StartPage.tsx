import { Component } from 'inferno'
import PageTemplate from './PageTemplate'
import './StartPage.scss'

interface IProps {
  fetchData: any;
}

export default class StartPage extends Component<IProps> {
  static async fetchData({ match }) {
    const pageSlug = match.params.id
    return [];
  }

  render() {
    return (
      <PageTemplate>
        <article>
          <h1>Start Page</h1>
          <p>Some content</p>
        </article>
      </PageTemplate>
    )
  }
}
