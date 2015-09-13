"use strict";
var Inferno = require("../src/Inferno");
var chai = require("chai");
var t7 = require("../examples/t7");
var isBrowser = require("../src/util/isBrowser");
var expect = chai.expect;

//expose t7 and Inferno globally
global.t7 = t7;
global.Inferno = Inferno;

describe("Inferno acceptance tests", function() {
    describe("Inferno.render() (DOM elements) tests", function() {
        var container;

        beforeEach(function() {
            isBrowser.addBrowser();
            container = document.createElement("div");
        })

        afterEach(function() {
            Inferno.clearDomElement(container);
            container = null;
        });

        describe("using the Inferno functional API", function() {
            it("should render a basic example", function() {
                var template = Inferno.createTemplate(function(createElement) {
                    return createElement("div", null, "Hello world");
                });

                Inferno.render(
                    Inferno.createFragment(null, template),
                    container
                );

                var test = container.innerHTML;
                var expected = "<div>Hello world</div>";

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

                var test = container.innerHTML;
                var expected = "<div>Hello world - Inferno Owns</div>";

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

                var test = container.innerHTML;
                var expected = '<div class="foo"><span class="bar">Inferno</span><span class="yar">Rocks</span></div>';

                expect(test).to.equal(expected);
            });
        });

        describe("using the Inferno t7 raw API", function() {
            beforeEach(function() {
                t7.setOutput(t7.Outputs.Inferno);
            })

            it("should render a basic example", function() {
                Inferno.render(
                    t7`<div>Hello world</div>`,
                    container
                );

                var test = container.innerHTML;
                var expected = "<div>Hello world</div>";

                expect(test).to.equal(expected);
            });

            it("should render a basic example with dynamic values", function() {
                var val1 = "Inferno";
                var val2 = "Owns";

                Inferno.render(
                    t7`<div>Hello world - ${ val1 } ${ val2 }</div>`,
                    container
                );

                var test = container.innerHTML;
                var expected = "<div>Hello world - Inferno Owns</div>";

                expect(test).to.equal(expected);
            });

            it("should render a basic example with dynamic values and props", function() {
                var val1 = "Inferno";
                var val2 = "Rocks";

                Inferno.render(
                    t7`<div class="foo"><span class="bar">${ val1 }</span><span class="yar">${ val2 }</span></div>`,
                    container
                );

                var test = container.innerHTML;
                var expected = '<div class="foo"><span class="bar">Inferno</span><span class="yar">Rocks</span></div>';

                expect(test).to.equal(expected);
            });
        });
    });

    describe("Render (virtual elements) tests", function() {
        var container;

        beforeEach(function() {
            isBrowser.removeBrowser();
            container = Inferno.template.createElement("div", null, true);
        });

        afterEach(function() {
            container = null;
        });

        describe("using the Inferno functional API", function() {
            it("should render a basic example", function() {
                var template = Inferno.createTemplate(function(createElement) {
                    return createElement("div", null, "Hello world");
                });

                Inferno.render(
                    Inferno.createFragment(null, template),
                    container
                );

                var test = container.innerHTML;
                var expected = "<div>Hello world</div>";

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

                var test = container.innerHTML;
                var expected = "<div>Hello world - Inferno Owns</div>";

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

                var test = container.innerHTML;
                var expected = '<div class="foo"><span class="bar">Inferno</span><span class="yar">Rocks</span></div>';

                expect(test).to.equal(expected);
            });
        });
    });

    describe("Inferno.renderToString() (DOM elements) tests", function() {
        describe("using the Inferno functional API", function() {
            it("should render a basic example", function() {
                var template = Inferno.createTemplate(function(createElement) {
                    return createElement("div", null, "Hello world");
                });

                var test = Inferno.renderToString(
                    Inferno.createFragment(null, template)
                );

                var expected = "<div>Hello world</div>";

                expect(test).to.equal(expected);
            });

            it("should render a basic example with dynamic values", function() {
                var template = Inferno.createTemplate(function(createElement, val1, val2) {
                    return createElement("div", null, "Hello world - ", val1, " ", val2);
                });

                var test = Inferno.renderToString(
                    Inferno.createFragment(["Inferno", "Owns"], template)
                );

                var expected = "<div>Hello world - Inferno Owns</div>";

                expect(test).to.equal(expected);
            });

            it("should render a basic example with dynamic values and props", function() {
                var template = Inferno.createTemplate(function(createElement, val1, val2) {
                    return createElement("div", {class: "foo"},
                        createElement("span", {class: "bar"}, val1),
                        createElement("span", {class: "yar"}, val2)
                    );
                });

                var test = Inferno.renderToString(
                    Inferno.createFragment(["Inferno", "Rocks"], template)
                );

                var expected = '<div class="foo"><span class="bar">Inferno</span><span class="yar">Rocks</span></div>';

                expect(test).to.equal(expected);
            });
        });
    });
});
