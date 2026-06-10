import { useState } from 'inferno-next';

// Recursive comment renderer. The HN API returns comments as a nested tree
// with HTML-formatted `content`. We render the HTML verbatim via the
// `innerHTML` attribute (replaces the old `{html ...}` child intrinsic).
// A collapse toggle hides children.

export function Comment(props) @{
  const [open, setOpen] = useState(true);
  <li class='comment'>
    <div class='by'>
      <a href={'/users/' + props.comment.user}>{props.comment.user as string}</a>
      <span>{(' ' + props.comment.time_ago) as string}</span>
    </div>
    <div class={'toggle' + (open ? ' open' : '')} onClick={() => setOpen(!open)}>
      @if (open) {
        <span>{'[-]'}</span>
      } @else {
        <span>{('[+] ' + (props.comment.comments && props.comment.comments.length ? props.comment.comments.length + ' replies collapsed' : 'collapsed')) as string}</span>
      }
    </div>
    @if (open) {
      <>
        <div class='text' innerHTML={props.comment.content} />
        @if (props.comment.comments && props.comment.comments.length > 0) {
          <ul class='comment-children'>
            @for (const c of props.comment.comments; key c.id) {
              <Comment comment={c} />
            }
          </ul>
        }
      </>
    }
  </li>
}
