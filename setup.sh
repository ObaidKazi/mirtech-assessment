#!/bin/bash

# Create all necessary directories
mkdir -p backend/app
mkdir -p frontend/src/{app,components/ui,lib,types}
mkdir -p frontend/src/app/item/[id]

# Install frontend dependencies
cd frontend
npm install

# Install shadcn/ui components
npx shadcn-ui@latest add button input select card tabs

# Go back to root
cd ..

echo "Setup complete! Run 'docker-compose up' to start the application."