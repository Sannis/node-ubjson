SOURCES = $(shell find ./lib -name '*.js')
TESTS = $(shell find ./test -name '*.js')

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
		@./node_modules/.bin/nodelint $(SOURCES) $(TESTS)

.PHONY: test lint
