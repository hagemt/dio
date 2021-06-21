.PHONY: app clean container dev docker image tunnel

CONTAINER_NAME ?= dio
IMAGE_TAG ?= hagemt/$(CONTAINER_NAME):latest

HTTP_PORT ?= 3002
HTTP_ARGS ?= -e "HTTP_PORT=$(HTTP_PORT)" -p "127.0.0.1:$(HTTP_PORT):$(HTTP_PORT)/tcp"

app: dev

clean:
	git clean -dix

container:
	docker run --init "--name=$(CONTAINER_NAME)" --rm $(HTTP_ARGS) -- "$(IMAGE_TAG)"

dev: node_modules
	yarn dev

docker:
	@[[ -n "$(shell docker images "$(IMAGE_TAG)" -q)" ]] || make image # slow build
	@[[ -n "$(shell docker ps -f "name=$(CONTAINER_NAME)" -q)" ]] || make container

image:
	docker build -t --build-arg "HTTP_PORT=$(HTTP_PORT)" "$(IMAGE_TAG)" -- .

tunnel:
	ngrok http "-subdomain=$(CONTAINER_NAME)" "$(HTTP_PORT)"

node_modules: yarn.lock
	yarn install --ignore-platform
