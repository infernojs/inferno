# InfernoJS

Inferno is a very fast, light-weight, isomorphic framework that allows for rapid
and scalable application development. It utilises a virtual-dom and a very simple
JavaScript DSL that allows for greater flexibility than writing applications in
cumbersome DOM templating engines like Knockout and Angular.

Inferno works very much like React, where you can build components of a UI easily
with a clean way of doing so. Inferno intentionally leverages ES6, thus requires
a transpiler (such as 6to5) till classes, arrow functions and other features become
natively available.

Here is an example component written with Inferno:


```javascript
var Inferno = require('./InfernoJS/Inferno.js');

class Demo extends Inferno.Component {

  //this is where we setup our variables
  constructor() {
    this.todos = [
      "Clean the dishes",
      "Cook the dinner",
      "Code some coding",
      "Comment on stuff"
    ];
    this.title = "Todo Demo";
    this.testClassName = "foo-bar";
    super();
  }

  //our component's template is setup in this function
  //$ = templateHelper shorthand
  initTemplate($) {
    return [
      ["div",
        ["header",
          ["h1", $.text(none => "Example " + this.title)]
        ]
      ],
      ['div#main',
        //example of a truthy statement
        ['div', $.if(isTrue => this.todos.length > 0,
          ['span.counter', $.text(none => "There are " + this.todos.length + " todos!")]
        )],
        //example of a falsey statement
        ['div', $.if(isFalse => this.todos.length > 0,
          ['span.no-todos', "There are no todos!"]
        )]
      ],
      ['ul.todos',
        $.for(each => this.todos, (todo, index) => [
          ['li.todo',
            ['h2', "A todo"],
            ['span', $.text(none => index + ": " + todo)]
          ],
          ['div.test', "Foo!"]
        ])
      ]
    ];
  }
};

window.Demo = Demo;
```

As you can see from the `initTemplate($)` method above, Inferno introduces its own
DSL for creating the DOM. This DSL is fully 100% JavaScript code, allowing developers
to utilise the full power of JavaScript to manipulate how templates are rendered.

Convenient helper functions are provided (`$` in the above example) to allow for
typical template logic flow handling like that offered in other templating libraries
(Handlebars, Knockout, Angular) without compromising on performance, testability or
readability.
