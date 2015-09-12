"use strict";
var container = document.getElementById("container");
var Inferno = require("../src/Inferno");
var chai = require("chai");
var expect = chai.expect;

describe("Inferno acceptance tests", function() {
    afterEach(function() {
        Inferno.clearDomElement(container);
    });

    describe("Render browser (DOM) tests using functional API", function() {
        it("should render a basic example", function() {
            var template = Inferno.createTemplate(function(createElement) {
                return createElement("div", null, "Hello world");
            });

            Inferno.render(
                Inferno.createFragment(null, template),
                container
            );

            let test = container.innerHTML.toString();
            let expected = "<div>Hello world</div>";

            expect(test).to.equal(expected);
        });

        it("should render a basic example with dynamic values", function() {
            var template = Inferno.createTemplate(function(createElement, val1, val2) {
                return createElement("div", null, "Hello world - ", val1, " ", val2);
            });

            Inferno.render(
                Inferno.createFragment(["Inferno", "Owns"], template),
                container
            );

            let test = container.innerHTML.toString();
            let expected = "<div>Hello world - Inferno Owns</div>";

            expect(test).to.equal(expected);
        });

        it("should render a basic example with dynamic values and props", function() {
            var template = Inferno.createTemplate(function(createElement, val1, val2) {
                return createElement("div", {class: "foo"},
                    createElement("span", {class: "bar"}, val1),
                    createElement("span", {class: "yar"}, val2)
                );
            });

            Inferno.render(
                Inferno.createFragment(["Inferno", "Rocks"], template),
                container
            );

            let test = container.innerHTML.toString();
            let expected = '<div class="foo"><span class="bar">Inferno</span><span class="yar">Rocks</span></div>';

            expect(test).to.equal(expected);
        });
    });
});
