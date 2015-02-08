function template() {
  return [
    ["div",
      ["header",
        ["h1", this.title)]
      ]
    ],
    ['div#test', {className: this.testClassName},
      "Test text"
    ],
    ['div#main',
      ['div', $.if(this.todos.length > 0,
        ['span.counter', "There are " + this.todos.length + " todos!")]
      )],
      ['div', $.if(this.todos.length === 0,
        ['span.no-todos', "There are no todos!"]
      )]
    ],
    ['ul.todos',
      $.forEach(this.todos, (todo, index) => [
        ['li.todo',
          ['h2', "A todo"],
          ['span', index + ": " + todo]
        ],
        ['div.test', "Foo!"]
      ])
    ],
    ['form', {id: this.formId, method: "post", action: "#"},
      ['div.form-control',
        ['input', {name: "first_name", type: "text"}]
      ],
      ['button', {type: "submit", onClick: this._clickSubmit},
        "Submit!"
      ]
    ]
  ];

  return `
    <div>
      <header>
        <h1>${ this.title }</h1>
      </header>
    </div>
    <div id="#main">
      <x-for each=${ this.todos } as=${ todo }>
        <span class="counter">There are ${ this.todos.length } todos!</span>
      </x-for>
    </div>
  `;
}
