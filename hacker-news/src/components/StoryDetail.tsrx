import { use } from 'inferno-next';
import { fetchItem } from '../api.js';
import { Comment } from './Comment.tsrx';

export function StoryDetail(props) @{
  <>
    @try {
      const item = use(fetchItem(props.id));
      <div>
        <div class='item-view-header'>
          @if (item.url) {
            <h1><a href={item.url} target='_blank' rel='noopener'>{item.title as string}</a></h1>
          } @else {
            <h1>{item.title as string}</h1>
          }
          @if (item.domain) {
            <span class='host'>{('(' + item.domain + ')') as string}</span>
          }
          <p class='meta'>
            {((item.points || 0) + ' points | by ') as string}
            <a href={'/users/' + item.user}>{item.user as string}</a>
            {(' ' + item.time_ago) as string}
          </p>
        </div>
        <div class='item-view-comments'>
          <p class='item-view-comments-header'>
            {(item.comments_count > 0 ? item.comments_count + ' comments' : 'No comments yet.') as string}
          </p>
          @if (item.comments && item.comments.length > 0) {
            <ul class='comment-children'>
              @for (const c of item.comments; key c.id) {
                <Comment comment={c} />
              }
            </ul>
          }
        </div>
      </div>
    } @pending {
      <main class='view'>
        <div class='loading'><span class='spinner'></span><span>{'Loading story…'}</span></div>
      </main>
    } @catch (err, reset) {
      <main class='view'>
        <div class='error-view'>
          <h2>{'Could not load this story'}</h2>
          <p>{err.message as string}</p>
          <button onClick={reset}>{'Retry'}</button>
        </div>
      </main>
    }
  </>
}
