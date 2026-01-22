const { SheetsClient } = require('./src/lib/sheets-client');

// Test if SheetsClient can be imported
console.log('Testing SheetsClient...');
console.log('Environment variables:');
console.log('  GOOGLE_SERVICE_ACCOUNT_EMAIL:', process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ? '✓ Set' : '✗ Missing');
console.log('  GOOGLE_PRIVATE_KEY:', process.env.GOOGLE_PRIVATE_KEY ? '✓ Set' : '✗ Missing');

// Check if we can instantiate with the org's sheet ID
const spreadsheetId = '1fPzS7Nhdu14Qij_5siC9Nj5fBJUjlGO70LZl_BW8rwM';
console.log('\nTesting SheetsClient initialization...');
console.log('  Spreadsheet ID:', spreadsheetId);

try {
  const client = new SheetsClient(spreadsheetId);
  console.log('  ✓ SheetsClient created successfully');
} catch (error) {
  console.log('  ✗ Error:', error.message);
}
