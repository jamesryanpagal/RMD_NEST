#!/bin/bash#!/bin/bash
cd "$(dirname "$0")/.."

CONTAINER_NAME=rmdland-server-container
IMAGE_NAME=rmdland-server

# Stop & remove old container if it exists
docker rm -f $CONTAINER_NAME 2>/dev/null

# Build fresh image
docker build -t $IMAGE_NAME .

# Run container with .env
docker run -d \
  --name $CONTAINER_NAME \
  --env-file .env \
  -p 4000:4000 \
  $IMAGE_NAME