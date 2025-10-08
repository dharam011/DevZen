#!/bin/bash

# AI Code Review App Build Script
set -e

echo "🚀 Building AI Code Review App for Production..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

print_status "Node.js version: $(node -v) ✓"

# Check if required environment file exists
if [ ! -f "Backend/.env.production" ]; then
    print_warning "Production environment file not found. Creating from template..."
    cp Backend/.env Backend/.env.production
    print_warning "Please update Backend/.env.production with your production values!"
fi

# Install Backend Dependencies
print_status "Installing Backend dependencies..."
cd Backend
npm ci --only=production
cd ..

# Install Frontend Dependencies and Build
print_status "Installing Frontend dependencies..."
cd Frontend
npm ci
print_status "Building Frontend for production..."
npm run build
cd ..

# Create production directory structure
print_status "Creating production build..."
mkdir -p dist/backend
mkdir -p dist/frontend

# Copy backend files
cp -r Backend/* dist/backend/
# Copy frontend build
cp -r Frontend/dist/* dist/frontend/

# Create production package.json
cat > dist/package.json << EOF
{
  "name": "ai-code-review-app",
  "version": "1.0.0",
  "description": "AI Code Review Application",
  "main": "backend/server.js",
  "scripts": {
    "start": "node backend/server.js"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
EOF

# Create startup script
cat > dist/start.sh << 'EOF'
#!/bin/bash
echo "Starting AI Code Review App..."
export NODE_ENV=production
node backend/server.js
EOF

chmod +x dist/start.sh

print_status "✅ Build completed successfully!"
print_status "📁 Production files are in the 'dist' directory"
print_status "🚀 To run in production:"
echo "   cd dist && npm start"
echo "   or"
echo "   cd dist && ./start.sh"
echo ""
print_warning "📝 Don't forget to:"
echo "   1. Update Backend/.env.production with your production API keys"
echo "   2. Configure your reverse proxy (nginx) if needed"
echo "   3. Set up SSL certificates for HTTPS"
echo "   4. Configure firewall rules"
