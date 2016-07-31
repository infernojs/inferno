import { render } from './../../DOM/rendering';
import Router from '../Router';
import Route from '../Route';
import Link from '../Link';
import browserHistory from '../browserHistory';
import { createBlueprint } from './../../core/shapes';

const hashbang = false;
const rootURL = location.pathname;
const Inferno = {
	createBlueprint
};

function createLink(component, container) {
	render(
		<Router url={ rootURL } history={ browserHistory } hashbang={ hashbang }>
			<Route path={ '*' } component={ component }/>
		</Router>,
		container
	);
}

describe('Link tests (jsx)', () => {
	let container;

	beforeEach(() => {
		container = document.createElement('div');
	});

	afterEach(() => {
		render(null, container);
		container.innerHTML = '';
	});

	describe('className', () => {
		it('it should render <a> with a className', () => {
			createLink(
				() => <Link to={ rootURL } className={ 'my-css-class' }>Test</Link>,
				container
			);
			const element = container.querySelector('a')
			expect(element.className).to.equal('my-css-class');
		});
	});

	describe('activeStyle', () => {
		it('it should render <a> with an activeStyle', () => {
			createLink(
				() => <Link to={ rootURL } activeStyle={{ color: 'red' }}>Red text</Link>,
				container
			);
			const element = container.querySelector('a')
			expect(element.style.color).to.equal('red');
		});

		it('it should NOT render <a> with an activeStyle', () => {
			createLink(
				() => <Link to={ '/invalid' } activeStyle={{ color: 'red' }}>Red text</Link>,
				container
			);
			const element = container.querySelector('a')
			expect(element.style.color).to.not.equal('red');
		});
	});

	describe('activeClassName', () => {
		it('it should render <a> with an activeClassName', () => {
			createLink(
				() => <Link to={ rootURL } activeClassName={ 'my-active-class' }>Test</Link>,
				container
			);
			const element = container.querySelector('a')
			expect(element.className).to.equal('my-active-class');
		});

		it('it should NOT render <a> with an activeClassName', () => {
			createLink(
				() => <Link to={ '/invalid' } activeClassName={ 'my-active-class' }>Test</Link>,
				container
			);
			const element = container.querySelector('a')
			expect(element.className).to.not.equal('my-active-class');
		});
	});
});