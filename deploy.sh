#!/bin/sh
# Script to update server
# create new build folder
npm run build
# clear old assets
sudo systemctl stop nginx
rm -rf /var/www/repeatsob/*
cp -r build/. /var/www/repeatsob
systemctl start nginx
echo "deploy complete"
