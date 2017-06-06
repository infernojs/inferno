#!/usr/bin/env bash

# Perform Tests and snap exit code
npm test -- --coverage
EXIT_CODE=$?

echo ""
echo "Uploading Coverage..."
(npm run coveralls 2> /dev/null ) || true

exit $EXIT_CODE
