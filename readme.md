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
benchmarks bests ever other framework out there (including React and Mithril).

Here is an example component written with Inferno:


```javascript
var Inferno = require('./InfernoJS/Inferno.js');

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
    //$ = RenderHelper, to reduce lines of code and to simplify workflow
    return [
      ['div'],
        ['header'],
          ['h1'],
            `Example ${ this.title }`,
          ['/h1'],
        ['/header'],
      ['/div'],
      ['div', {className: this.testClassName}],
        'Test text',
      ['/div'],
      ['div#main'],
        ['div'],
          //example of a truthy helper
          $.if(this.todos.length > 0, [
            ['span.counter'],
              `There are ${ this.todos.length } todos!`,
            ['/span']
          ], [ //else
            ['span.no-todos'],
              "There are no todos!",
            ['/span']
          ]),
        ['/div'],
      ['/div'],
      ['ul.todos'],
        //usage of forEach helper
        $.forEach(this.todos, (todo, index) => [
          ['li.todo'],
            ['h2'],"A todo",['/h2'],
            ['span'], `${ index }: ${ todo }`,['/span'],
          ['/li']
        ]),
      ['/ul']
    ];
  }
};

window.Demo = Demo;
```

As you can see from the `render($)` method above, Inferno introduces its own
DSL for creating the DOM, with strong similarities to HTML. This DSL is fully 100% JavaScript code, allowing developers
to utilise the full power of JavaScript to manipulate how templates are rendered.

Convenient helper functions are provided (`$` in the above example) to allow for
typical logic flow handling like that offered in other templating libraries
(Handlebars, Knockout, Angular, etc) without compromising on performance, testability or
readability of the code.
