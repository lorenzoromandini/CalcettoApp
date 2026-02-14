#!/bin/bash
# Supabase Local Setup Script

echo "Setting up Supabase locally..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Error: Docker is not running. Please start Docker first."
    exit 1
fi

# Generate keys if not set
if [ -z "$POSTGRES_PASSWORD" ] || [ "$POSTGRES_PASSWORD" == "your-super-secret-and-long-postgres-password" ]; then
    echo "Generating secure keys..."
    export POSTGRES_PASSWORD=$(openssl rand -base64 32)
    export JWT_SECRET=$(openssl rand -base64 32)
    export ANON_KEY=$(openssl rand -base64 32)
    export SERVICE_ROLE_KEY=$(openssl rand -base64 32)
    
    # Update .env file
    cat > .env << EOF
POSTGRES_PASSWORD=$POSTGRES_PASSWORD
JWT_SECRET=$JWT_SECRET
ANON_KEY=$ANON_KEY
SERVICE_ROLE_KEY=$SERVICE_ROLE_KEY
EOF
    echo "Generated keys saved to .env"
fi

# Start Supabase
echo "Starting Supabase containers..."
docker compose up -d

# Wait for services to be ready
echo "Waiting for services..."
sleep 10

echo ""
echo "=========================================="
echo "Supabase is now running!"
echo "=========================================="
echo ""
echo "Dashboard:  http://localhost:54323"
echo "API URL:    http://localhost:54321"
echo "DB:         localhost:5432"
echo ""
echo "To stop: docker compose down"
echo "To view logs: docker compose logs -f"
echo ""
echo "Add these to your .env.local:"
echo "NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321"
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=$ANON_KEY"
