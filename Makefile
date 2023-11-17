develop:
	npx webpack serve

publish:
	npm publish --dry-run
	
install:
	npm ci

build:
	NODE_ENV=production npx webpack

test:
	npm test

lint:
	npx eslint

.PHONY: test

