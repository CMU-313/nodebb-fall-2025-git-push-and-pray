#!/bin/bash

# ESLint Fix Script
# This script fixes ESLint errors while avoiding permission issues with Docker directories

echo "🔧 Fixing ESLint errors..."

# Fix JavaScript files in key directories
npx eslint --fix \
  "src/**/*.js" \
  "public/src/**/*.js" \
  "nodebb-plugin-anonymous-checkbox/**/*.js" \
  "test/**/*.js" \
  --ignore-pattern ".docker/**" \
  --ignore-pattern "node_modules/**" \
  --ignore-pattern "build/**" \
  --ignore-pattern "vendor/**"

echo "✅ ESLint fixes completed!"
echo ""
echo "To check for remaining errors:"
echo "npm run lint"