#!/bin/bash
# Script to test API endpoints using curl

# Configuration
BASE_URL="http://localhost:8000/api/v1"
AUTH_TOKEN=""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to make API requests
function make_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    local auth_required=$4
    local description=$5

    echo -e "\n${GREEN}Testing: $description${NC}"
    echo "Endpoint: $endpoint"
    echo "Method: $method"
    
    local auth_header=""
    if [ "$auth_required" = true ] && [ ! -z "$AUTH_TOKEN" ]; then
        auth_header="-H \"Authorization: Bearer $AUTH_TOKEN\""
    fi
    
    local curl_cmd=""
    if [ "$method" = "GET" ]; then
        curl_cmd="curl -s -X GET \"$BASE_URL/$endpoint\" $auth_header"
    elif [ "$method" = "POST" ]; then
        curl_cmd="curl -s -X POST \"$BASE_URL/$endpoint\" $auth_header -H \"Content-Type: application/json\" -d '$data'"
    fi
    
    echo "Command: $curl_cmd"
    
    # Execute the curl command
    local response=$(eval $curl_cmd)
    local status=$?
    
    if [ $status -eq 0 ]; then
        echo -e "${GREEN}Request successful${NC}"
        echo "Response:"
        echo "$response" | python -m json.tool 2>/dev/null || echo "$response"
        
        # If this is a login request, extract the JWT access token
        if [[ "$endpoint" == "auth/login/" ]]; then
            AUTH_TOKEN=$(echo "$response" | python -c "import sys, json; print(json.load(sys.stdin).get('access', ''))" 2>/dev/null)
            if [ ! -z "$AUTH_TOKEN" ]; then
                echo -e "${GREEN}JWT access token obtained${NC}"
            fi
        fi
    else
        echo -e "${RED}Request failed with status $status${NC}"
    fi
}

# Check if Django server is running
echo "Checking if Django server is running..."
if ! curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/ > /dev/null; then
    echo -e "${RED}Django server is not running. Please start it with:${NC}"
    echo "python manage.py runserver"
    exit 1
fi
echo -e "${GREEN}Django server is running${NC}"

# Test login endpoint
make_request "POST" "auth/login/" '{"username_or_email":"lead_instructor","password":"testpass123"}' false "Login with lead_instructor credentials"

# Test courses endpoint (requires authentication)
make_request "GET" "courses/" "" true "Get all courses"

# Add more endpoint tests as needed
# make_request "GET" "another-endpoint/" "" true "Description of the endpoint"

echo -e "\n${GREEN}API testing completed${NC}"
