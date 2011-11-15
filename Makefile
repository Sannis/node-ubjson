#!/bin/sh
SOURCES = $(shell find ./lib -name '*.js')
TESTS = $(shell find ./test -name '*.js')

all: deps

stamp-dependencies:
		@touch stamp-dependencies;
		@git submodule update --init

dependencies: stamp-dependencies

stamp-devdependencies:
		@touch stamp-devdependencies;
		@touch stamp-dependencies;
		@npm install --dev

devdependencies: stamp-devdependencies

test: devdependencies
		@./node_modules/.bin/nodeunit ./test/test-*.js

lint: devdependencies
		@./node_modules/.bin/nodelint --config ./nodelint.cfg $(SOURCES) $(TESTS)

./doc/index.html: ./README.markdown devdependencies
		./node_modules/.bin/dox \
		--title "Node-UBJSON" \
		--desc "[ChangeLog](./changelog.html), [Wiki](http://github.com/Sannis/node-ubjson/wiki)." \
		--ribbon "http://github.com/Sannis/node-ubjson" \
		--ignore-filenames \
		./README.markdown \
		> ./doc/index.html

./doc/changelog.html: ./CHANGELOG.markdown devdependencies
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
		./gh_pages.sh

.PHONY: all test lint docs pages

