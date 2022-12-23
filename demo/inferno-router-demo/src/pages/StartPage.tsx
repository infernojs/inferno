import { Component } from 'inferno'
import PageTemplate from './PageTemplate'
import './StartPage.scss'

// const env: any = (typeof window === 'undefined' ? process.env : (window as any).__env__)
// const { FRONTEND_BASE_URI } = env

interface IProps {
  fetchData: any;
}

export default class StartPage extends Component<IProps> {
  static async fetchData({ registry, match, location }) {
    const pageSlug = match.params.id

    // new IPageManager({ registry }).setMetaData({
    //   title: 'Influence CMS Demo',
    //   description: 'This is a demo site.',
    //   url: FRONTEND_BASE_URI + location.pathname
    // })

    return [];
  }

  render({ fetchData }, state, { router }) {
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
