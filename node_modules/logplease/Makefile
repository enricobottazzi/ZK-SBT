all: build

deps:
	npm install

test: deps
	npm run test
	
build: test
	npm run build
	@echo "Build success!"
	@echo "Output: 'dist/', 'es5/', 'examples/browser/'"

clean:
	rm -rf node_modules/

.PHONY: test build
