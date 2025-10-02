#!/bin/bash

# Digital Ocean Deployment Script for English Learning Platform Backend
# Make sure to run this script with appropriate permissions

set -e  # Exit on any error

echo "🚀 Starting deployment to Digital Ocean..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    print_error ".env.production file not found. Please create it with your production environment variables."
    exit 1
fi

print_status "Building Docker image..."
docker-compose build

print_status "Stopping existing containers..."
docker-compose down

print_status "Starting services..."
docker-compose up -d

print_status "Waiting for services to start..."
sleep 30

# Health check
print_status "Performing health check..."
if curl -f http://localhost/api/health > /dev/null 2>&1; then
    print_success "Deployment successful! Backend is running."
    print_success "API is available at: http://your-server-ip/api/health"
else
    print_error "Health check failed. Please check the logs:"
    docker-compose logs backend
    exit 1
fi

print_status "Deployment completed successfully!"
print_status "To view logs: docker-compose logs -f"
print_status "To stop services: docker-compose down"
print_status "To restart services: docker-compose restart"
