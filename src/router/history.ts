import createBrowserHistory from 'history/createBrowserHistory';
import createMemoryHistory from 'history/createMemoryHistory';

export default typeof window !== 'undefined' ? createBrowserHistory() : createMemoryHistory();
