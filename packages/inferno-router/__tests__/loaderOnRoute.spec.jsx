import { render } from 'inferno';
import { MemoryRouter, Route, Router } from 'inferno-router';
import { createMemoryHistory } from 'history';

describe('A <Route>', () => {
  // let container;

  // beforeEach(function () {
  //   container = document.createElement('div');
  //   document.body.appendChild(container);
  // });

  // afterEach(function () {
  //   render(null, container);
  //   container.innerHTML = '';
  //   document.body.removeChild(container);
  // });

  // it('renders at the root', () => {
  //   const TEXT = 'Mrs. Kato';
  //   const node = document.createElement('div');

  //   render(
  //     <MemoryRouter initialEntries={['/']}>
  //       <Route path="/" render={() => <h1>{TEXT}</h1>} />
  //     </MemoryRouter>,
  //     node
  //   );

  //   expect(node.innerHTML).toContain(TEXT);
  // });

  // it('does not render when it does not match', () => {
  //   const TEXT = 'bubblegum';
  //   const node = document.createElement('div');

  //   render(
  //     <MemoryRouter initialEntries={['/bunnies']}>
  //       <Route path="/flowers" render={() => <h1>{TEXT}</h1>} />
  //     </MemoryRouter>,
  //     node
  //   );

  //   expect(node.innerHTML).not.toContain(TEXT);
  // });


  // it('supports preact by nulling out children prop when empty array is passed', () => {
  //   const TEXT = 'Mrs. Kato';
  //   const node = document.createElement('div');

  //   render(
  //     <MemoryRouter initialEntries={['/']}>
  //       <Route path="/" render={() => <h1>{TEXT}</h1>}>
  //         {[]}
  //       </Route>
  //     </MemoryRouter>,
  //     node
  //   );

  //   expect(node.innerHTML).toContain(TEXT);
  // });

  // it('Should change activeClass on links without functional component Wrapper, Github #1345', () => {
  //   function CompList() {
  //     return <div id="first">FIRST</div>;
  //   }

  //   function CreateComp() {
  //     return <div id="second">SECOND</div>;
  //   }

  //   const tree = (
  //     <MemoryRouter>
  //       <div>
  //         <nav class="navbar navbar-expand-lg navbar-light bg-light">
  //           <div class="container py-2" style="border-bottom: 1px solid rgba(0, 0, 0, 0.13);">
  //             <div class="collapse navbar-collapse" id="navbarNav">
  //               <ul class="navbar-nav text-muted">
  //                 <li class="nav-item mr-2">
  //                   <NavLink exact to="/" activeClassName="active">
  //                     Play
  //                   </NavLink>
  //                 </li>
  //                 <li class="nav-item mr-2">
  //                   <NavLink to="/create" activeClassName="active">
  //                     Create
  //                   </NavLink>
  //                 </li>
  //                 <li class="nav-item mr-2">
  //                   <NavLink to="/publish" activeClassName="active">
  //                     Publish
  //                   </NavLink>
  //                 </li>
  //               </ul>
  //             </div>
  //           </div>
  //         </nav>
  //         <Route exact path="/" component={CompList} />
  //         <Route path="/create" component={CreateComp} />
  //         <Route path="/publish" component={() => <div>Publish</div>} />
  //       </div>
  //     </MemoryRouter>
  //   );

  //   render(tree, container);

  //   const links = container.querySelectorAll('li');
  //   links[1].firstChild.click();

  //   expect(container.querySelector('#second')).toBeNull();
  // });
});
