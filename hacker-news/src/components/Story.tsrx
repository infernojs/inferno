// Single row in the story list. The HN PWA API gives us a pre-shaped record
// per item: `{ id, title, url, domain, points, user, time_ago, comments_count, type }`.

export function Story(props) @{
  <li class={'story-item' + (props.story.type === 'job' ? ' job' : '')}>
    <span class='score'>{(props.story.points != null ? props.story.points : '-') as string}</span>
    <p class='title'>
      @if (props.story.url) {
        <a href={props.story.url} target='_blank' rel='noopener'>{props.story.title as string}</a>
      } @else {
        <a href={'/stories/' + props.story.id}>{props.story.title as string}</a>
      }
      @if (props.story.domain) {
        <span class='host'>{('(' + props.story.domain + ')') as string}</span>
      }
    </p>
    <p class='meta'>
      @if (props.story.type !== 'job') {
        <>
          <span>{'by '}</span>
          <a href={'/users/' + props.story.user}>{props.story.user as string}</a>
          <span>{(' ' + props.story.time_ago + ' | ') as string}</span>
          <a href={'/stories/' + props.story.id}>
            {((props.story.comments_count || 0) + ' comments') as string}
          </a>
        </>
      } @else {
        <span>{props.story.time_ago as string}</span>
      }
    </p>
  </li>
}
