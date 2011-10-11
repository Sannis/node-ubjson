#!/bin/sh
SOURCES = $(shell find ./lib -name '*.js')
TESTS = $(shell find ./test -name '*.js')

all: deps

./node_modules/strtok/lib/strtok.js:
		@echo "Get dependencies:"
		@git submodule update --init

deps: ./node_modules/strtok/lib/strtok.js

./node_modules/.bin/nodeunit:
		@echo "Install nodeunit:"
		npm install nodeunit

test: ./node_modules/.bin/nodeunit $(SOURCES) $(TESTS)
		@echo "Run tests:"
		@./node_modules/.bin/nodeunit $(TESTS)

./node_modules/.bin/nodelint:
		@echo "Install nodelint:"
		npm install nodelint

lint: ./node_modules/.bin/nodelint $(SOURCES) $(TESTS)
		@echo "Lint code:"
		@./node_modules/.bin/nodelint --config ./nodelint.cfg $(SOURCES) $(TESTS)

./node_modules/.bin/dox:
		@echo "Install dox:"
		npm install https://github.com/Sannis/dox/tarball/0.0.4

./doc/index.html: ./README.markdown ./node_modules/.bin/dox
		./node_modules/.bin/dox \
		--title "Node-UBJSON" \
		--desc "[ChangeLog](./changelog.html), [Wiki](http://github.com/Sannis/node-ubjson/wiki)." \
		--ribbon "http://github.com/Sannis/node-ubjson" \
		--ignore-filenames \
		./README.markdown \
		> ./doc/index.html

./doc/changelog.html: ./CHANGELOG.markdown ./node_modules/.bin/dox
		./node_modules/.bin/dox \
		--title "Node-UBJSON" \
		--desc "[Home](./index.html), [Wiki](http://github.com/Sannis/node-mysql-ubjson/wiki)." \
		--ribbon "http://github.com/Sannis/node-ubjson" \
		--ignore-filenames \
		./CHANGELOG.markdown \
		> ./doc/changelog.html

docs: ./doc/index.html ./doc/changelog.html


pages: docs
		@echo "Update gh-pages branch:"
		./gh-pages.sh

.PHONY: all test lint docs pages

