import { use } from 'inferno-next';
import { fetchUser } from '../api.js';

export function UserView(props) @{
  <>
    @try {
      const u = use(fetchUser(props.id));
      @if (u) {
        <main class='view'>
          <div class='user-view'>
            <h1>{('User: ' + u.id) as string}</h1>
            <ul class='meta'>
              <li><span class='label'>{'Created:'}</span>{new Date(u.created * 1000).toLocaleDateString()}</li>
              <li><span class='label'>{'Karma:'}</span>{u.karma as string}</li>
              @if (u.about) {
                <li><span class='label'>{'About:'}</span><span class='about' innerHTML={u.about} /></li>
              }
            </ul>
            <p class='links'>
              <a href={'https://news.ycombinator.com/submitted?id=' + u.id} target='_blank' rel='noopener'>{'submissions'}</a>
              <span>{' | '}</span>
              <a href={'https://news.ycombinator.com/threads?id=' + u.id} target='_blank' rel='noopener'>{'comments'}</a>
            </p>
          </div>
        </main>
      } @else {
        <main class='view'>
          <div class='error-view'>
            <h2>{'No such user'}</h2>
            <p>{('User "' + props.id + '" does not exist.') as string}</p>
          </div>
        </main>
      }
    } @pending {
      <main class='view'>
        <div class='loading'><span class='spinner'></span><span>{'Loading user…'}</span></div>
      </main>
    } @catch (err, reset) {
      <main class='view'>
        <div class='error-view'>
          <h2>{'Could not load user'}</h2>
          <p>{err.message as string}</p>
          <button onClick={reset}>{'Retry'}</button>
        </div>
      </main>
    }
  </>
}
