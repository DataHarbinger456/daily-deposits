#!/bin/bash

# Start dev server in background
npm run dev > /tmp/dev-server.log 2>&1 &
DEV_PID=$!
echo "Dev server started (PID: $DEV_PID)"

# Wait for server to start
sleep 3

# Get a user first to get a valid userId
USER_ID=$(sqlite3 dev.db "SELECT id FROM users LIMIT 1;")
ORG_ID=$(sqlite3 dev.db "SELECT id FROM orgs LIMIT 1;")

echo "Testing with:"
echo "  User ID: $USER_ID"
echo "  Org ID: $ORG_ID"

# Test the API
curl -X PATCH http://localhost:3000/api/org/update-google-sheets \
  -H "Content-Type: application/json" \
  -H "x-user-id: $USER_ID" \
  -d "{
    \"orgId\": \"$ORG_ID\",
    \"googleSheetsSpreadsheetId\": \"1fPzS7Nhdu14Qij_5siC9Nj5fBJUjlGO70LZl_BW8rwM\"
  }"

echo ""
echo "Checking database..."
sqlite3 dev.db "SELECT id, name, google_sheets_spreadsheet_id FROM orgs WHERE id = '$ORG_ID';"

# Kill dev server
kill $DEV_PID 2>/dev/null

