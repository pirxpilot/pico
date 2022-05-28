check: lint test

lint:
	./node_modules/.bin/jshint *.js lib test

test:
	./node_modules/.bin/tape --require ./test/init.js test/*.js

.PHONY: check lint test
