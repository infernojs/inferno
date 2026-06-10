function NavLink(props) @{
  <a href={props.to} class={props.active ? 'active' : ''}>{props.label as string}</a>
}

export function Nav(props) @{
  <header class='header'>
    <nav class='header-inner'>
      <a href='/' class='logo'><span class='logo-mark'>{'N'}</span>{'Inferno • HN'}</a>
      <NavLink to='/news'   active={props.kind === 'news'}   label='Top' />
      <NavLink to='/newest' active={props.kind === 'newest'} label='New' />
      <NavLink to='/show'   active={props.kind === 'show'}   label='Show' />
      <NavLink to='/ask'    active={props.kind === 'ask'}    label='Ask' />
      <NavLink to='/jobs'   active={props.kind === 'jobs'}   label='Jobs' />
      @if (props.pending) {
        <span class='pending'>{'loading…'}</span>
      }
      <a class='github' href='https://github.com/infernojs/inferno' target='_blank' rel='noopener'>{'inferno-next'}</a>
    </nav>
  </header>
}
