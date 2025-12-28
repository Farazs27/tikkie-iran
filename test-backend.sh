#!/bin/bash

# Tikkie Iran - Test Backend Script
# This script tests all backend endpoints

API_URL="https://tikkie-iran-demo.vercel.app"

echo "🎭 ================================"
echo "🎭 TIKKIE IRAN - BACKEND TESTS"
echo "🎭 ================================"
echo ""
echo "🌐 Testing: $API_URL"
echo ""

# Test 1: Health Check
echo "1️⃣ Testing Health Check..."
curl -s -k "$API_URL/api/health" | python3 -m json.tool
echo ""
echo ""

# Test 2: Demo Users
echo "2️⃣ Testing Demo Users..."
curl -s -k "$API_URL/api/mock/demo-users" | python3 -m json.tool
echo ""
echo ""

# Test 3: Login
echo "3️⃣ Testing Login (علی احمدی)..."
LOGIN_RESPONSE=$(curl -s -k -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"phone":"09123456789","password":"demo1234"}')

echo "$LOGIN_RESPONSE" | python3 -m json.tool
echo ""

# Extract token
TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('data', {}).get('token', ''))" 2>/dev/null)

if [ ! -z "$TOKEN" ]; then
    echo "✅ Login successful! Token: ${TOKEN:0:20}..."
    echo ""
    
    # Test 4: Get Profile
    echo "4️⃣ Testing Get Profile (with auth)..."
    curl -s -k "$API_URL/api/user/profile" \
      -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
    echo ""
    echo ""
    
    # Test 5: Get Cards
    echo "5️⃣ Testing Get Cards..."
    curl -s -k "$API_URL/api/user/cards" \
      -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
    echo ""
    echo ""
    
    # Test 6: Get Transactions
    echo "6️⃣ Testing Get Transactions..."
    curl -s -k "$API_URL/api/payments/transactions" \
      -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
    echo ""
    echo ""
    
    # Test 7: Get Payment Requests
    echo "7️⃣ Testing Get Payment Requests..."
    curl -s -k "$API_URL/api/payments/requests" \
      -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
    echo ""
else
    echo "❌ Login failed!"
fi

echo ""
echo "🎬 All tests completed!"
echo ""
echo "🌐 API URL: $API_URL"
echo "📚 Full documentation: See DEPLOYED.md"
echo ""

