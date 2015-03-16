[Experimetnal - refactoring soon]

# InfernoJS

Inferno is a very fast, light-weight, isomorphic framework that allows for rapid
and scalable application development. It utilises a virtual-dom and a very simple
JavaScript DSL that allows for greater flexibility than writing applications in
cumbersome DOM templating engines like Knockout and Angular.

Inferno works very much like React, where you can build components of a UI easily
with a clean way of doing so. Inferno intentionally leverages ES6, thus requires
a transpiler (such as 6to5) till classes, arrow functions and other features become
natively available.

Inferno leverages a very fast virtual DOM (Bobril) to ensure maxmimum performance.
Although Inferno is in its very early stages of development, its performance in
benchmarks bests every other framework out there (including React and Mithril).

Here is an example component written with Inferno:


```javascript
var Inferno = require('./InfernoJS/Inferno.js');
var vdml = require('./InfernoJS/vdml.js');

class Demo extends Inferno.Component {

  constructor() {
    //we declare all our properties
    this.todos = [
      "Clean the dishes",
      "Cook the dinner",
      "Code some coding",
      "Comment on stuff"
    ];

    this.testClassName = "foo-bar";
    this.title = "Todo Demo";

    super();
  }

  render($) {
    var $ = vdml.helpers;
    //$ = VDML helpers, to reduce lines of code and to simplify workflow
    //you can use quickhand syntax to give elements classes and ids
    //<div.foo>, <span#bar>

    //you can also optionally close the elements with the quickhand to allow for easier
    //reading and syntax checking

    //Pass our markup through vdml so it generates a nice virtual dom
    return vdml(`
      <div>
        <header>
          <h1>
            Example ${ this.title }
          </h1>
        </header>
      </div>
      <div className="${ this.testClassName }">
        Test text
      </div>
      <div#main>
        <div>
          ${
            $.if(this.todos.length > 0, `
              <span.counter>
                There are ${ this.todos.length } todos!
              </span>
            `, /* else */ `
              <span.no-todos>
                There are no todos!
              </span>
            `)
          }
        </div>
        <ul.todos>
          ${
            $.forEach(this.todos, (todo, index) => `
              <li.todo>
                <h2>A todo</h2>
                <span>${ index }: ${ todo }</span>
              </li>
            `)
          }
        </ul.todos>
        <section>
          <form action="#" method="post">
            <div class="form-control">
              <input type="text" placeholder="Enter your name">
            </div>
          </form>
        </section>
      </div#main>
    `);
  }
};

window.Demo = Demo;
```

To mount an Inferno component, simply use:

```html

<div id="app"></div>

<script>

  var demo = new Demo();
  demo.mount( document.getElementById('app') );

</script>

```

As you can see from the `render($)` method above, Inferno introduces its own
DSL for creating the DOM, with strong similarities to HTML. This DSL is fully 100% JavaScript code, allowing developers
to utilise the full power of JavaScript to manipulate how templates are rendered.

Convenient helper functions are provided (`$` in the above example) to allow for
typical logic flow handling like that offered in other templating libraries
(Handlebars, Knockout, Angular, etc) without compromising on performance, testability or
readability of the code.
