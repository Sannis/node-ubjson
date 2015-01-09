#!/bin/sh

CURR_HEAD_SHA := $(firstword $(shell git show-ref --hash HEAD | cut -b -6) master)
GITHUB_PROJECT_NAME := Sannis/node-ubjson
GITHUB_PROJECT_URL := https://github.com/${GITHUB_PROJECT_NAME}
API_SRC_URL_FMT := ${GITHUB_PROJECT_URL}/blob/${CURR_HEAD_SHA}/{file}\#L{line}
API_DEST_DIR := ./doc/api

all: npm-install

npm-install: npm-install-stamp

npm-install-stamp: ./package.json
		npm install
		touch npm-install-stamp

test: npm-install
		@./node_modules/.bin/nodeunit ./test/test-*.js

lint: npm-install
		@./node_modules/.bin/jshint . --show-non-errors

doc-api: npm-install ./lib/*
		rm -rf ${API_DEST_DIR}
		./node_modules/.bin/ndoc \
		  --gh-ribbon ${GITHUB_PROJECT_URL} \
		  --link-format ${API_SRC_URL_FMT} \
		  --output ${API_DEST_DIR} \
		  ./lib/*.js

doc: doc-api

pages: doc
		@echo "Update gh-pages branch:"
		./gh_pages.sh

.PHONY: all npm-install test lint doc pages
