PATH        := ./node_modules/.bin:${PATH}

NPM_PACKAGE := $(shell node -e 'process.stdout.write(require("./package.json").name)')
NPM_VERSION := $(shell node -e 'process.stdout.write(require("./package.json").version)')

TMP_PATH    := /tmp/${NPM_PACKAGE}-$(shell date +%s)

REMOTE_NAME ?= origin
REMOTE_REPO ?= $(shell git config --get remote.${REMOTE_NAME}.url)

CURR_HEAD   := $(firstword $(shell git show-ref --hash HEAD | cut -b -6) master)
GITHUB_PROJ := nodeca/${NPM_PACKAGE}


help:
	echo "make help       - Print this help"
	echo "make lint       - Lint sources with JSHint"
	echo "make test       - Run tests"
	echo "make cover      - Create coverage report"
	echo "make doc        - Generate documentation"
	echo "make browserify - Build browserified packages"
	echo "make publish    - Set new version tag and publish npm package"


lint:
	jshint . --show-non-errors


test: lint
	mocha

test-browser: lint
	rm -f ./test/browser/pako.js
	browserify -r ./ -s pako > test/browser/pako.js
	@SAUCE_PROJ=${GITHUB_PROJ} grunt test

cover:
	rm -rf cover
	istanbul cover node_modules/.bin/_mocha

doc:
	rm -rf ./doc
	ndoc --link-format "{package.homepage}/blob/${CURR_HEAD}/{file}#L{line}"


browserify:
	rm -rf ./dist
	mkdir dist
	# Browserify
	( echo -n "/* ${NPM_PACKAGE} ${NPM_VERSION} ${GITHUB_PROJ} */" ; \
		browserify -r ./ -s pako \
		) > dist/pako.js
	( echo -n "/* ${NPM_PACKAGE} ${NPM_VERSION} ${GITHUB_PROJ} */" ; \
		browserify -r ./lib/deflate.js -s pako \
		) > dist/pako_deflate.js
	( echo -n "/* ${NPM_PACKAGE} ${NPM_VERSION} ${GITHUB_PROJ} */" ; \
		browserify -r ./lib/inflate.js -s pako \
		) > dist/pako_inflate.js
	# Minify
	uglifyjs dist/pako.js -c -m \
		--preamble "/* ${NPM_PACKAGE} ${NPM_VERSION} ${GITHUB_PROJ} */" \
		> dist/pako.min.js
	uglifyjs dist/pako_deflate.js -c -m \
		--preamble "/* ${NPM_PACKAGE} ${NPM_VERSION} ${GITHUB_PROJ} */" \
		> dist/pako_deflate.min.js
	uglifyjs dist/pako_inflate.js -c -m \
		--preamble "/* ${NPM_PACKAGE} ${NPM_VERSION} ${GITHUB_PROJ} */" \
		> dist/pako_inflate.min.js
	# Update bower package
	#sed -i -r -e \
	#	"s/(\"version\":\s*)\"[0-9]+[.][0-9]+[.][0-9]+\"/\1\"${NPM_VERSION}\"/" \
	#	bower.json


gh-pages:
	@if test -z ${REMOTE_REPO} ; then \
		echo 'Remote repo URL not found' >&2 ; \
		exit 128 ; \
		fi
	$(MAKE) doc && \
		cp -r ./doc ${TMP_PATH} && \
		touch ${TMP_PATH}/.nojekyll
	cd ${TMP_PATH} && \
		git init && \
		git add . && \
		git commit -q -m 'Recreated docs'
	cd ${TMP_PATH} && \
		git remote add remote ${REMOTE_REPO} && \
		git push --force remote +master:gh-pages
	rm -rf ${TMP_PATH}


publish:
	@if test 0 -ne `git status --porcelain | wc -l` ; then \
		echo "Unclean working tree. Commit or stash changes first." >&2 ; \
		exit 128 ; \
		fi
	@if test 0 -ne `git fetch ; git status | grep '^# Your branch' | wc -l` ; then \
		echo "Local/Remote history differs. Please push/pull changes." >&2 ; \
		exit 128 ; \
		fi
	@if test 0 -ne `git tag -l ${NPM_VERSION} | wc -l` ; then \
		echo "Tag ${NPM_VERSION} exists. Update package.json" >&2 ; \
		exit 128 ; \
		fi
	git tag ${NPM_VERSION} && git push origin ${NPM_VERSION}
	npm publish https://github.com/${GITHUB_PROJ}/tarball/${NPM_VERSION}


.PHONY: publish lint doc
.SILENT: help lint
