import { use } from 'inferno-next';
import { fetchItem } from '../api.js';
import { Comment } from './Comment.tsrx';

export component StoryDetail(props) {
  try {
    const item = use(fetchItem(props.id));
    <div>
      <div class='item-view-header'>
        if (item.url) {
          <h1><a href={item.url} target='_blank' rel='noopener'>{text item.title}</a></h1>
        } else {
          <h1>{text item.title}</h1>
        }
        if (item.domain) {
          <span class='host'>{text '(' + item.domain + ')'}</span>
        }
        <p class='meta'>
          {text (item.points || 0) + ' points | by '}
          <a href={'/users/' + item.user}>{text item.user}</a>
          {text ' ' + item.time_ago}
        </p>
      </div>
      <div class='item-view-comments'>
        <p class='item-view-comments-header'>
          {text (item.comments_count > 0 ? item.comments_count + ' comments' : 'No comments yet.')}
        </p>
        if (item.comments && item.comments.length > 0) {
          <ul class='comment-children'>
            for (const c of item.comments; key c.id) {
              <Comment comment={c} />
            }
          </ul>
        }
      </div>
    </div>
  } pending {
    <main class='view'>
      <div class='loading'><span class='spinner'></span><span>{text 'Loading story…'}</span></div>
    </main>
  } catch (err, reset) {
    <main class='view'>
      <div class='error-view'>
        <h2>{text 'Could not load this story'}</h2>
        <p>{text err.message}</p>
        <button onClick={reset}>{text 'Retry'}</button>
      </div>
    </main>
  }
}
