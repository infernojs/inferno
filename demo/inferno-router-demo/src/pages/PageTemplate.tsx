import { Link } from 'inferno-router'

import './PageTemplate.scss'

export default function PageTemplate({ id = undefined, children }) {
  return (
    <div id={id} className="page">
      <header>
        <nav>
          <ul>
            <li><Link to="/">Start</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/page/one">Page One</Link></li>
            <li><Link to="/page/two">Page Two</Link></li>
          </ul>
        </nav>
      </header>
      <main>{children}</main>
      <footer>
        <p>Page Footer</p>
      </footer>
    </div>
  )

}
