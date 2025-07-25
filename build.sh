#!/bin/bash

# build frontend
echo "Building frontend 🏢"
cd frontend
rm package-lock.json
npm install
npm run generate
mv dist ../

## output nuxt build information
npx nuxt info
cd ..

# build functions
echo "Building functions ƛ😉"
cd code
npm install
./build.sh
cd ..


