[Re-design underway]

# InfernoJS

Below is the proposal syntax and details for how I envisage the new Inferno will
shape out (will leverage t7 + ES2015 + Web Components + Cito):

```html

<html>
<head>
  <title>Inferno Example</title>
<head>
<body>

  <div id="main">

    <demo-person hasPets>
      <string:name value="Bob" />
      <number:age value="32" />
      <list:pets>
        <item>Dog</item>
        <item>Cat</item>
        <item>Fish</item>
      </list:pets>
    </demo-person>

    <demo-person>
      <string:name value="John" />
      <number:age value="47" />
    </demo-person>

  </div>

  <script src="inferno.js"></script>
  <script>

    //will echo out changes
    Inferno.devMode = true;

    var Person = Inferno.createTag("demo-person", {

      attached: function(props, config) {
        this.set("name", props.name);
        this.set("age", Math.round(10 + Math.random() * 70));

        if(config.hasPets === true) {
          this.set("pets", props.pets);
        }
      },

      detached: function() {
        alert("Person was detached from the DOM!");
      },

      template: function(data) {
        return t7`
          <div class="person">
            <h1>${ this.get("name") }</h1>
            <div>I am ${ this.get("age") } years old</div>
            ${
              t7.if(this.get("pets").length > 0, t7`
                <div>
                  I have ${ this.get("pets").length } pets! Their names
                  are called:
                </div>
                <ul>
                  ${
                    this.get("pets").map( petName => t7`
                      <span>${ petName }</span>
                    `)
                  }
                </ul>
              `).else(t7`
                <div>I have no pets :(</div>
              `)
            }
          </div>
        `;
      }
    });

  </script>
</body>
</html>


```
