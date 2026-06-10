import { useEffect } from 'inferno-next';
import { useRoute, matchRoute, parsePage, navigate } from './router.js';
import { Nav } from './components/Nav.tsrx';
import { StoryList } from './components/StoryList.tsrx';
import { StoryDetail } from './components/StoryDetail.tsrx';
import { UserView } from './components/UserView.tsrx';

export component App() {
  const loc = useRoute();
  const route = matchRoute(loc.pathname);
  const page = parsePage(loc.search);

  // Click delegation: intercept all in-app <a> clicks and turn them into
  // pushState navigations (no full-page reload). External links, links with
  // target="_blank", and modifier-clicks pass through untouched.
  useEffect(() => {
    const onClick = (e) => {
      if (e.defaultPrevented) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (e.button !== 0) return;
      let el = e.target;
      while (el && el.tagName !== 'A') el = el.parentNode;
      if (!el) return;
      const href = el.getAttribute('href');
      const target = el.getAttribute('target');
      if (!href || href.startsWith('http') || href.startsWith('mailto:') || target === '_blank') return;
      e.preventDefault();
      if (href !== loc.pathname + loc.search) navigate(href);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  <div>
    <Nav kind={route.kind} pending={false} />
    if (route.kind === 'news' || route.kind === 'newest' || route.kind === 'show' || route.kind === 'ask' || route.kind === 'jobs') {
      <StoryList kind={route.kind} page={page} />
    } else if (route.kind === 'story') {
      <main class='view'>
        <StoryDetail id={route.params.id} />
      </main>
    } else if (route.kind === 'user') {
      <UserView id={route.params.id} />
    } else {
      <main class='view'>
        <div class='error-view'>
          <h2>{text 'Page not found'}</h2>
          <p>{text 'No route matches ' + loc.pathname}</p>
        </div>
      </main>
    }
  </div>
}
