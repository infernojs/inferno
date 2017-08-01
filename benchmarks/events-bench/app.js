(function() {
  "use strict";
  /* This benchmark tests only how quickly Inferno delegates through Synthetic events

  - create long nested tree
  - trigger event from the bottom (button)
  - measure the time it takes to finish the delegation loop

	*/
  var createElement = Inferno.createElement;
  var counter = 0;

  function App() {
    var divs = [];
    var first = createElement("div", null, divs);
    var content = [first];

    for (var i = 0; i < 500; i++) {
      if (i % 3 === 0) {
        divs.push(createElement("div", null, []));
        first = divs[divs.length - 1];
        divs = first.children;
      }

      divs.push(
        createElement("div", {
          className: "foobar",
          onDblClick: function() {
            counter++;
          },
          onClick: function() {
            counter--;
          }
        })
      );

      if (i === 499) {
        divs[divs.length - 1].children = createElement(
          "button",
          {
            onClick: startBench
          },
          "START!"
        );
      }
    }

    return createElement(
      "div",
      {
        onClick: function() {
          counter++;
        }
      },
      content
    );
  }

  var count = 100;
  var totalTime = 0;

  function renderResults() {
    Inferno.render(
      createElement(
        "div",
        null,
        `
			Rounds: ${count},
			Average: ${totalTime / count},
			Total: ${totalTime}
		`
      ),
      document.querySelector("#results")
    );
    totalTime = 0;
  }

  function startBench() {
    var times = [];

    var button = document.querySelector("button");

    for (var i = 0; i < count; i++) {
      var start = window.performance.now();

      button.click();

      var end = window.performance.now();

      var roundTime = end - start;
      totalTime += roundTime;

      times.push(roundTime);
    }

    renderResults();
  }

  document.addEventListener("DOMContentLoaded", function() {
    var container = document.querySelector("#App");
    Inferno.render(createElement(App), container);
  });
})();
