import { Component } from 'inferno';
import PageTemplate from './PageTemplate';
import { useLoaderData } from 'inferno-router';

import './AboutPage.scss';
import { useLoaderError } from 'inferno-router';

// const env: any = (typeof window === 'undefined' ? process.env : (window as any).__env__)
// const { FRONTEND_BASE_URI } = env

const BACKEND_HOST = 'http://localhost:1234';

interface IProps {
  fetchData: any;
}

export default class AboutPage extends Component<IProps> {
  static async fetchData(params) {
    const pageSlug = params.id;

    const fetchOptions: RequestInit = {
      headers: {
        Accept: 'application/json',
      },
    };

    const res = await fetch(new URL('/api/about', BACKEND_HOST), fetchOptions);

    if (res.ok) {
      try {
        const data = await res.json();
        return data;
      } catch (err) {
        return {
          title: `Error: ${err.message}`,
        };
      }
    }

    return {
      title: 'Error: Backend not responding',
    };
  }

  render(props, state, context) {
    const data = useLoaderData(props) as any;
    const err = useLoaderError(props) as any;

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
