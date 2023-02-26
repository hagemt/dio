.PHONY: app clean container dev docker image tunnel

CONTAINER_NAME ?= dio
IMAGE_TAG ?= hagemt/$(CONTAINER_NAME):latest
HTTP_PORT ?= 3003

app: dev

clean:
	git clean -dix

container:
	docker run \
		--restart=unless-stopped \
		-p "127.0.0.1:$(HTTP_PORT):$(HTTP_PORT)/tcp" \
		--name "$(CONTAINER_NAME)" \
		--init \
		-e "HTTP_PORT=$(HTTP_PORT)" \
		--detach \
		-- "$(IMAGE_TAG)"

dev: node_modules
	yarn dev

docker:
	@[[ -n "$(shell docker images "$(IMAGE_TAG)" -q)" ]] || make image # slow build
	@[[ -n "$(shell docker ps -f "name=$(CONTAINER_NAME)" -q)" ]] || make container

image:
	rm -frv site.tar .next && env "PORT=$(HTTP_PORT)" yarn build && tar cf site.tar .next
	docker build --build-arg "HTTP_PORT=$(HTTP_PORT)" --tag "$(IMAGE_TAG)" -- .

tunnel:
	ngrok http "-subdomain=$(CONTAINER_NAME)" "$(HTTP_PORT)"

node_modules: yarn.lock
	yarn install --ignore-platform
