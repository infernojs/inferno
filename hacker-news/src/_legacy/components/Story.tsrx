// Single row in the story list. The HN PWA API gives us a pre-shaped record
// per item: `{ id, title, url, domain, points, user, time_ago, comments_count, type }`.

export component Story(props) {
  <li class={'story-item' + (props.story.type === 'job' ? ' job' : '')}>
    <span class='score'>{text props.story.points != null ? props.story.points : '-'}</span>
    <p class='title'>
      if (props.story.url) {
        <a href={props.story.url} target='_blank' rel='noopener'>{text props.story.title}</a>
      } else {
        <a href={'/stories/' + props.story.id}>{text props.story.title}</a>
      }
      if (props.story.domain) {
        <span class='host'>{text '(' + props.story.domain + ')'}</span>
      }
    </p>
    <p class='meta'>
      if (props.story.type !== 'job') {
        <span>{text 'by '}</span>
        <a href={'/users/' + props.story.user}>{text props.story.user}</a>
        <span>{text ' ' + props.story.time_ago + ' | '}</span>
        <a href={'/stories/' + props.story.id}>
          {text (props.story.comments_count || 0) + ' comments'}
        </a>
      } else {
        <span>{text props.story.time_ago}</span>
      }
    </p>
  </li>
}
