#!/bin/bash

echo "Building types for ui from auth and backend"
cd auth
bun x tsc -p tsconfig.json

cd ../backend
bun x tsc -p tsconfig.json

cd ..
echo "Done building types"