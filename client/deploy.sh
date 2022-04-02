#!/bin/sh

echo "Building app"
npm run build

echo "Deploying files to server"
rsync -avP build/ root@198.58.97.88:/var/www/198.58.97.88/
echo "Deployment complete"

