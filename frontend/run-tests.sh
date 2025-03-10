#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print a section header
print_header() {
  echo -e "\n${BLUE}===========================================================${NC}"
  echo -e "${BLUE}   $1${NC}"
  echo -e "${BLUE}===========================================================${NC}\n"
}

# Function to run a specific test suite
run_tests() {
  local test_type=$1
  local test_files=$2
  
  print_header "Running $test_type Tests"
  
  if [ "$test_type" = "All" ]; then
    npx playwright test
  else
    npx playwright test $test_files
  fi
  
  if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}✓ $test_type Tests completed successfully!${NC}\n"
  else
    echo -e "\n${RED}✗ $test_type Tests failed!${NC}\n"
    if [ "$EXIT_ON_FAIL" = "true" ]; then
      exit 1
    fi
  fi
}

# Setup test environment
print_header "Setting Up Test Environment"
echo -e "${YELLOW}Starting backend server...${NC}"
echo -e "${YELLOW}Note: This script assumes the backend server is already running on localhost:8000${NC}"

# Parse command line arguments
RUN_ALL=false
RUN_AUTH=false
RUN_ROLES=false
RUN_API=false
RUN_SMOKE=false
DEBUG_MODE=false
EXIT_ON_FAIL=false
SHOW_REPORT=false

for arg in "$@"
do
  case $arg in
    --all)
      RUN_ALL=true
      ;;
    --auth)
      RUN_AUTH=true
      ;;
    --roles)
      RUN_ROLES=true
      ;;
    --api)
      RUN_API=true
      ;;
    --smoke)
      RUN_SMOKE=true
      ;;
    --debug)
      DEBUG_MODE=true
      ;;
    --exit-on-fail)
      EXIT_ON_FAIL=true
      ;;
    --report)
      SHOW_REPORT=true
      ;;
    --help)
      echo -e "Usage: $0 [options]"
      echo -e "Options:"
      echo -e "  --all           Run all tests"
      echo -e "  --auth          Run authentication tests"
      echo -e "  --roles         Run role-based access tests"
      echo -e "  --api           Run API tests"
      echo -e "  --smoke         Run smoke tests"
      echo -e "  --debug         Run tests in debug mode"
      echo -e "  --exit-on-fail  Exit on first test failure"
      echo -e "  --report        Show test report after execution"
      echo -e "  --help          Show this help message"
      exit 0
      ;;
    *)
      echo -e "${RED}Unknown argument: $arg${NC}"
      ;;
  esac
done

# If no test types specified, run smoke tests by default
if [[ "$RUN_ALL" = "false" && "$RUN_AUTH" = "false" && "$RUN_ROLES" = "false" && "$RUN_API" = "false" && "$RUN_SMOKE" = "false" ]]; then
  RUN_SMOKE=true
fi

# Set debug flag if requested
DEBUG_FLAG=""
if [ "$DEBUG_MODE" = "true" ]; then
  DEBUG_FLAG="--debug"
  echo -e "${YELLOW}Running in debug mode${NC}"
fi

# Run all tests if requested
if [ "$RUN_ALL" = "true" ]; then
  run_tests "All" "$DEBUG_FLAG"
else
  # Run smoke tests first if requested
  if [ "$RUN_SMOKE" = "true" ]; then
    run_tests "Smoke" "tests/smoke.spec.ts $DEBUG_FLAG"
  fi

  # Run specific test suites as requested
  if [ "$RUN_AUTH" = "true" ]; then
    run_tests "Authentication" "tests/auth.spec.ts $DEBUG_FLAG"
  fi
  
  if [ "$RUN_ROLES" = "true" ]; then
    run_tests "Role-Based Access" "tests/roles.spec.ts $DEBUG_FLAG"
  fi
  
  if [ "$RUN_API" = "true" ]; then
    run_tests "API" "tests/api.spec.ts $DEBUG_FLAG"
  fi
fi

# Show the test report if requested
if [ "$SHOW_REPORT" = "true" ]; then
  print_header "Opening Test Report"
  npx playwright show-report
fi

print_header "Test Run Completed"