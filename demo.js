var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
var ARGUMENT_NAMES = /([^\s,]+)/g;
function getParamNames(func) {
  var fnStr = func.toString().replace(STRIP_COMMENTS, '');
  var result = fnStr.slice(fnStr.indexOf('(')+1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
  if(result === null)
     result = [];
  return result;
}


class Demo extends Engine.Component {

  constructor() {
    super({
      todos: [
        "Clean the dishes",
        "Cook the dinner",
        "Code some coding",
        "Comment on stuff"
      ],
      title: "Foo!",
      formId: "foo-form"
    });
  }

  click(e) {

  }

  template() {
    return [
      ["div",
        ["header"
          ["h1", "Example " + this.title]
        ]
      ],
      ['div#main',
        $.if(this.todos.length > 0, [
          ['div',
            ['span.counter', "There are " + this.todos.length + " todos!"]
          ]
        ])
      ],
      ['ul.todos',
        $.forEach(this.todos, (todo, index) => [
          ['li.todo',
            ['h2', "A todo"],
            ['span', index + ": " + todo]
          ]
        ])
      ],
      ['form', {id: them.formId, method: "post", action. "#"},
        ['div.form-control', [
          ['input', {name: "first_name", type: "text"}]
        ],
        ['button', {type: "submit", onClick: this.click},
          "Submit!"
        ]
      ]
    ]
  },
};

  //
  // template() {
  //   return [
  //     div => [
  //       header => [
  //         h1 => ["Example " + this.title]
  //       ]
  //     ],
  //     div => ["#main",
  //       $if => [this.todos.length > 0,
  //         div => [
  //           span => [".counter", "There are " + this.todos.length + " todos!"]
  //         ]
  //       ],
  //       ul => [".todos",
  //         $forEach => [this.todos, (todo, index) =>
  //           li => ['.todo',
  //             h2 => ["A todo!"],
  //             span => [index + ": " + todo]
  //           ]
  //         ]
  //       ],
  //       form => [{id: this.formId, method: "post", action: "#"},
  //         div => [".form-control",
  //           input => [{name: "first_name", type: "text"}]
  //         ],
  //         button => [{type: "submit", onClick: this.click},
  //           "Submit!"
  //         ]
  //       ]
  //     ]
  //   ]
  // }
