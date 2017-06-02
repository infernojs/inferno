
import Route from '../dist-es/Route';
import IndexRoute from '../dist-es/IndexRoute';
import createRoutes from '../dist-es/createRoutes';

const App = () => (<div/>);
const Home = () => (<div/>);
const Films = () => (<div/>);
const FilmDetail = () => (<div/>);
const NoMatch = () => (<div/>);

const routeConfig = [
	{
		path: '/',
		component: App,
		indexRoute: {
			component: Home
		},
		childRoutes: [
			{
				path: 'films/',
				component: Films,
				childRoutes: {
					path: 'detail/:id',
					component: FilmDetail
				}
			},
			{
				path: '/*',
				component: NoMatch
			}
		]
	}
];

const expectedResult = (
	<Route path="/" component={App}>
		<IndexRoute component={Home}/>
		<Route path="films/" component={Films}>
			<Route path="detail/:id" component={FilmDetail}/>
		</Route>
		<Route path="/*" component={NoMatch}/>
	</Route>
);

describe('Router #createRoutes', () => {
	it('it should parse route configuration', () => {
		expect(JSON.stringify(createRoutes(routeConfig)[ 0 ])).to.equal(JSON.stringify(expectedResult));
	});
});
