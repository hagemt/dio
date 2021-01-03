.PHONY: all clean dev image test tunnel

CONTAINER_NAME ?= dio
IMAGE_TAG ?= hagemt/$(CONTAINER_NAME):latest

HTTP_PORT ?= 3000
HTTP_ARGS ?= -e "HTTP_PORT=$(HTTP_PORT)" -p "$(HTTP_PORT):$(HTTP_PORT)/tcp"

all: dev

clean:
	git clean -dix

dev: node_modules
	npm run dev

image:
	[[ -n "$(shell docker images "$(IMAGE_TAG)" -q)" ]] \
		|| docker build -t "$(IMAGE_TAG)" -- .

test: image
	@[[ -n "$(shell docker ps -f "name=$(CONTAINER_NAME)" -q)" ]] \
		|| docker run --init "--name=$(CONTAINER_NAME)" --rm $(HTTP_ARGS) \
		-- "$(IMAGE_TAG)"

tunnel:
	ngrok http "-subdomain=$(CONTAINER_NAME)" "$(HTTP_PORT)"

node_modules: yarn.lock
	yarn install
