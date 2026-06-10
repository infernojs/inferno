component NavLink(props) {
  <a href={props.to} class={props.active ? 'active' : ''}>{text props.label}</a>
}

export component Nav(props) {
  <header class='header'>
    <nav class='header-inner'>
      <a href='/' class='logo'><span class='logo-mark'>{text 'N'}</span>{text 'Inferno • HN'}</a>
      <NavLink to='/news'   active={props.kind === 'news'}   label='Top' />
      <NavLink to='/newest' active={props.kind === 'newest'} label='New' />
      <NavLink to='/show'   active={props.kind === 'show'}   label='Show' />
      <NavLink to='/ask'    active={props.kind === 'ask'}    label='Ask' />
      <NavLink to='/jobs'   active={props.kind === 'jobs'}   label='Jobs' />
      if (props.pending) {
        <span class='pending'>{text 'loading…'}</span>
      }
      <a class='github' href='https://github.com/infernojs/inferno' target='_blank' rel='noopener'>{text 'inferno-next'}</a>
    </nav>
  </header>
}
