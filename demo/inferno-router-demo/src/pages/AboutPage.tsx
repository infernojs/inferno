import { Component } from 'inferno';
import PageTemplate from './PageTemplate';
import { useLoaderData } from 'inferno-router';

import './AboutPage.scss';
import { useLoaderError } from 'inferno-router';

const BACKEND_HOST = 'http://localhost:1234';

export default class AboutPage extends Component {
  static async fetchData({ request }) {
    const fetchOptions: RequestInit = {
      headers: {
        Accept: 'application/json',
      },
      signal: request?.signal,
    };

    return fetch(new URL('/api/about', BACKEND_HOST), fetchOptions);
  }

  render(props) {
    const data = useLoaderData<{ title: string, body: string}>(props);
    const err = useLoaderError<{ message: string }>(props);

    return (
      <PageTemplate>
        <article>
          <h1>{data?.title}</h1>
          <p>{data?.body || err?.message}</p>
        </article>
      </PageTemplate>
    );
  }
}
