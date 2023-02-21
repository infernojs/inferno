import { Component } from 'inferno';
import PageTemplate from './PageTemplate';
import { useLoaderData } from 'inferno-router';

import './AboutPage.scss';
import { useLoaderError } from 'inferno-router';

const BACKEND_HOST = 'http://localhost:1234';

export default class ContentPage extends Component {
  static async fetchData({ params, request }) {
    const pageSlug = params.id;

    const fetchOptions: RequestInit = {
      headers: {
        Accept: 'application/json',
      },
      signal: request?.signal
    };

    return fetch(new URL(`/api/page/${params.slug}`, BACKEND_HOST), fetchOptions);
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
