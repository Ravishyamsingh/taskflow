#!/bin/sh
set -eu

echo "Running Prisma migrations..."
until npx prisma migrate deploy; do
  echo "Migration failed, retrying in 5 seconds..."
  sleep 5
done

echo "Starting API server..."
exec node server.js
