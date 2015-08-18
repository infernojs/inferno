"use strict";

t7.module(function(t7) {

  class InfernoExample extends Inferno.Component {
      constructor(props) {
        super(props);
        this.state = {
          visible: true,
          counter: 0,
          formShow: true,
          foo: "single!",
          isOn: false,
          className: "foo",
          name: "test",
          textFieldValue: "Text!"
        };
        this.handleCounter();
      }
      render() {
        if(this.state.visible) {
          return t7`
            <div class="main">
              <button onClick=${ this.hide }>Hide</button>
              <div>Count is at ${ this.state.counter }</div>
              <div class=${ this.state.className }>
                <span id="bar">${ this.state.name }</span>
                <div id="time">The time is ${ this.props.time.toString() }</div>
                ${ this.renderForm() }
                ${ this.state.name }
                ${this.state.isOn === false
                  ? t7`<div>Switch is off!</div>`
                  : t7`<div>Switch is on! <span>${ this.props.time.toString() }</span></div>`
                }
                <button onClick=${ this.clickSwitch }>Switch!</button>
                <div>
                  ${ t7`<div>${ this.state.foo }</div>` }
                </div>
                <ul>
                  ${ this.props.people != null ? this.props.people.map(this.renderPerson.bind(this)) : null }
                </ul>
              </div>
            </div>
          `;
        } else {
          return t7`
            <div>
              <button onClick=${ this.show }>Show</button>
              <div>Hidden!</div>
            </div>
          `;
        }
      }
      renderPerson(person) {
        if(this.state.counter % 3 === 1) {
          return t7`<li>${ person }, the number is ${ this.state.counter }<div>foo</div></li>`;
        } else {
          return t7`<li>${ person }, the magical number is ${ this.state.counter }<div>foo</div></li>`;
        }
      }
      renderForm() {
        if(this.state.formShow) {
          return t7`
            <form>
              <input type="text" value=${ this.state.textFieldValue } />
              <button onClick=${ this.turnOffForm }>Turn off form</button>
            </form>
          `;
        } else {
          return t7`
            <div>
              <h2>No form!</h2>
              <button onClick=${ this.turnOnForm }>Turn on form</button>
            </div>
          `;
        }
      }
      turnOffForm(e) {
        this.setState({
          formShow: false
        });
        e.preventDefault();
      }
      turnOnForm(e) {
        this.setState({
          formShow: true
        });
        e.preventDefault();
      }
      hide(e) {
        this.setState({
          visible: false
        });
      }
      show(e) {
        this.setState({
          visible: true
        });
      }
      clickSwitch(e) {
        this.setState({
          isOn: !this.state.isOn
        });
      }
      handleCounter() {
        this.setState({
          counter: this.state.counter + 1
        });
        setTimeout(this.handleCounter.bind(this), 2000);
      }
  }

  t7.assign("App", InfernoExample);

  var odd = true;

  function update() {
    var date = new Date();
    var people = [];
    odd = !odd;
    if(!odd) {
      people = [
        "Bob",
        "Dominic",
        "John",
        "Edward"
      ]
    } else {
      people = [
        "Jemma",
        "Charlie",
        "Harry",
        "Kieria",
        "Paul",
        "Ken"
      ]
    }

    Inferno.render(
      t7`<App time=${ date } people=${ people }></App>`,
      document.getElementById("app")
    );
    setTimeout(update, 1000);
  }

  update();

});
