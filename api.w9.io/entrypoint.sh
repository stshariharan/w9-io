#!/bin/sh
# Perform the copy operation after container starts
cp /app/configs/ca.crt /app/ca.crt
cp /app/configs/config /app/.env
# rm -rf /app/configs
# Start your application
exec node dist/server.js
