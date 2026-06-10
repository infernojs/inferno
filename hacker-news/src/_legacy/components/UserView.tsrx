import { use } from 'inferno-next';
import { fetchUser } from '../api.js';

export component UserView(props) {
  try {
    const u = use(fetchUser(props.id));
    if (u) {
      <main class='view'>
        <div class='user-view'>
          <h1>{text 'User: ' + u.id}</h1>
          <ul class='meta'>
            <li><span class='label'>{text 'Created:'}</span>{text new Date(u.created * 1000).toLocaleDateString()}</li>
            <li><span class='label'>{text 'Karma:'}</span>{text u.karma}</li>
            if (u.about) {
              <li><span class='label'>{text 'About:'}</span><span class='about'>{html u.about}</span></li>
            }
          </ul>
          <p class='links'>
            <a href={'https://news.ycombinator.com/submitted?id=' + u.id} target='_blank' rel='noopener'>{text 'submissions'}</a>
            <span>{text ' | '}</span>
            <a href={'https://news.ycombinator.com/threads?id=' + u.id} target='_blank' rel='noopener'>{text 'comments'}</a>
          </p>
        </div>
      </main>
    } else {
      <main class='view'>
        <div class='error-view'>
          <h2>{text 'No such user'}</h2>
          <p>{text 'User "' + props.id + '" does not exist.'}</p>
        </div>
      </main>
    }
  } pending {
    <main class='view'>
      <div class='loading'><span class='spinner'></span><span>{text 'Loading user…'}</span></div>
    </main>
  } catch (err, reset) {
    <main class='view'>
      <div class='error-view'>
        <h2>{text 'Could not load user'}</h2>
        <p>{text err.message}</p>
        <button onClick={reset}>{text 'Retry'}</button>
      </div>
    </main>
  }
}
