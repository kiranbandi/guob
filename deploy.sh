#!/bin/sh
# Script to update server
# create new build folder
npm run build
# clear old assets
sudo systemctl stop nginx
rm -rf /var/www/guob/*
cp -r build/. /var/www/guob
systemctl reload nginx
echo "deploy complete"