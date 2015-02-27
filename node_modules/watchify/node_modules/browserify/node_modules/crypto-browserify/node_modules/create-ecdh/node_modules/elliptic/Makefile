BROWSERIFY ?= ./node_modules/.bin/browserify
UGLIFY ?= ./node_modules/.bin/uglifyjs

all: dist/elliptic.js dist/elliptic.min.js

dist/elliptic.js: lib/elliptic.js
	$(BROWSERIFY) --standalone ellipticjs $< -o $@

dist/elliptic.min.js: dist/elliptic.js
	$(UGLIFY) --compress --mangle < $< > $@

.PHONY: all
