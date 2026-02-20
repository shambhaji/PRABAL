#!/usr/bin/env bash
# exit on error
set -o errexit

echo "--- INSTALLING NODE & FRONTEND DEPENDENCIES ---"
# Render environments for Python might not have npm right away, 
# so we ensure it's available or rely on the build environment
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

nvm install 20
nvm use 20

cd frontend
npm install
npm run build
cd ..

echo "--- INSTALLING PYTHON BACKEND DEPENDENCIES ---"
pip install -r requirements.txt
