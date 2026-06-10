import { useState } from 'inferno-next';

// Recursive comment renderer. The HN API returns comments as a nested tree
// with HTML-formatted `content`. We render the HTML verbatim via `{html ...}`
// (TSRX's innerHTML-binding syntax). A collapse toggle hides children.

export component Comment(props) {
  const [open, setOpen] = useState(true);
  <li class='comment'>
    <div class='by'>
      <a href={'/users/' + props.comment.user}>{text props.comment.user}</a>
      <span>{text ' ' + props.comment.time_ago}</span>
    </div>
    <div class={'toggle' + (open ? ' open' : '')} onClick={() => setOpen(!open)}>
      if (open) {
        {text '[-]'}
      } else {
        {text '[+] ' + (props.comment.comments && props.comment.comments.length ? props.comment.comments.length + ' replies collapsed' : 'collapsed')}
      }
    </div>
    if (open) {
      <div class='text'>{html props.comment.content}</div>
      if (props.comment.comments && props.comment.comments.length > 0) {
        <ul class='comment-children'>
          for (const c of props.comment.comments; key c.id) {
            <Comment comment={c} />
          }
        </ul>
      }
    }
  </li>
}
