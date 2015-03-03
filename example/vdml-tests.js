
//example 1

t`
  <div id="${ foo }">
    <div class="${ bar }">
      This is a ${ woo } test!
    </div>
  </div>
`;

=>

function t(html, p1, p2, p3) {
  return {
    tag: "div",
    attrs: {
      id: p1
    },
    children: [
      {
        tag: "div",
        attrs: {
          "class": p2
        },
        children: [
          "This is a " + p3 + " test!"
        ]
      }
    ]
  }
}

//example 2

t`
  <div>
    ${ $.forEach(items, item => t`
        <div>
          Item is: ${ item }
        </div>
      `)
    }
  </div>
`;

=>

function t(html, p1) {
  return {
    tag: "div",
    children: [
      "Item is: " + p1
    ]
  }
}

function t(html, p1) {
  return {
    tag: "div",
    children: [
      p1
    ]
  }
}
