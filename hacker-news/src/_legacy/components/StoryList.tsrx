import { use, useDeferredValue } from 'inferno-next';
import { fetchStories } from '../api.js';
import { Story } from './Story.tsrx';

// `useDeferredValue` keeps the PRIOR list visible while a new page or
// category loads — combined with `try`/`pending` we get React's "show old
// data while new loads" pattern automatically. The first render shows old
// data with `stale` styling; once the new promise resolves the deferred
// value commits and fresh data lands.
export component StoryList(props) {
  const deferredKind = useDeferredValue(props.kind);
  const deferredPage = useDeferredValue(props.page);
  const isStale = deferredKind !== props.kind || deferredPage !== props.page;
  <main class='view'>
    <nav class='list-nav'>
      if (deferredPage > 1) {
        <a href={'/' + deferredKind + '?page=' + (deferredPage - 1)}>{text '< prev'}</a>
      } else {
        <span class='disabled'>{text '< prev'}</span>
      }
      <span class='page-num'>{text 'page ' + deferredPage + ' / 10'}</span>
      if (deferredPage < 10) {
        <a href={'/' + deferredKind + '?page=' + (deferredPage + 1)}>{text 'more >'}</a>
      } else {
        <span class='disabled'>{text 'more >'}</span>
      }
    </nav>
    try {
      const stories = use(fetchStories(deferredKind, deferredPage));
      <ul class={'story-list list' + (isStale ? ' stale' : '')}>
        for (const s of stories; key s.id) {
          <Story story={s} />
        }
      </ul>
    } pending {
      <div class='loading'><span class='spinner'></span><span>{text 'Loading stories…'}</span></div>
    } catch (err, reset) {
      <div class='error-view'>
        <h2>{text 'Could not load stories'}</h2>
        <p>{text err.message}</p>
        <button onClick={reset}>{text 'Retry'}</button>
      </div>
    }
  </main>
}
