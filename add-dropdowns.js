const { google } = require('googleapis');

const SPREADSHEET_ID = '1IbfhGn9rEG8ecYMq88OFrGnYKZebcDgEz_uMg0BYRGY';
const SERVICE_ACCOUNT_EMAIL = 'daily-deposits-sheets-sync@daily-deposits-484815.iam.gserviceaccount.com';
const PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCdrEjXvkwUc8fr
rjqT/g+FgaXuLIYDALnLHXZfY84hmWDA/zer8Su1K+ZY/H5XbKseVtRB9AB32uoU
l2OoNfgqZVHmJlnXz2oz9TSQbPTB3CGpT61z4oxCPtal6DYVPGi93Zhg0mvfTPwG
3WY2LjghgNwNkEwfs2HDqybj6L6ZBpZDx0hiwA0+OLqq9GnAVYtYWK/Flpessuwg
U/J/Hh0x+K299LtncM7EALKSaUFx6PPiwyo4FJXgZQzSjtx2lsByjKhyiwESSnjP
+8VVfFt3/SZN5ZTYQOOKIAG7kEyYfP9x9TQShWp7xR6UkZR5mclDDk5Udb6aVrx5
PIUyf06DAgMBAAECggEAICy/gpL5GHVV9xCLMJb4GODPeO5J/IPh5gJhnO6TakTP
uyJ5fFNO/X3zV/ZSW8m3k43Za4n8rHiWKtSHyBQXS6N4VnQ+Ai13uRmQ++XX/lVK
4y94sDyrLXuANsPPgX7dytzU0vEthRhDF62HRYgh+Sg//16SQifLS+/5lCly92vQ
MAOoJ/tZEgBe8qikyWccEQoe/AC7FFu4vVEs3tRkDMODibDJW9WxD4CNGi/q7NZU
77nY/y8cvOE4U+CcTWFgKBGCjqhOGgyYDCjvbdK+BWPDrLTavSk5aT530cIBGlnB
Jo2Js7SEpNa39J/GK3RRAztlmaXqnokz2F4g0+LYbQKBgQDJGIapwtb5Gthk1rM/
W2ow6BudnHGQ20Km4hSXvgf32LR+P04XxXUnyWa/WTxVxdu96r2B0rIsVQWaer/I
HB5yLxNQTDxOEghL2/Ujg663x0Mi1VTsVViQDRLYcdiovFvBK8UVHaKwMkC/DFhF
LTSlxCi+U5Hxvz3+3HkMgvQM/wKBgQDIuL73IGc+qm+o4KgzRAtcHr79T/YPMPGG
97Wo/SZwNh6rnBXsFYtYoClJL981y78Tfg0g7NVfgSHrUhiaDZ6gwi75VZ7OD72r
pscAVHJJHakBHfRLjk63kyTbuAm5njAgW7+KPDI6iyYyY1AkFIm61/e9yoQGqDNZ
zYnqkC0KfQKBgQCP1S4EYCrYk53xSit9BoqGno2aBtqnrFwY9x2Zhz81w9cdcXQO
xpnMMl5+QHpKMzG/vhV7tNLhqJJQcrmXjJ0uOIOM7Go5wOYUNCg7FaWzJx/a21FZ
lJW6us8e5xb7YXYTTZYySzcg5WCwBUlheTrt0cb+ktGRYqMaFmGyVDvwywKBgQCi
5BLNuLUwzN363f6CRCk35Be4uOiF4YFQt7vr3S0RiUoQmIXN5poEHU4D/96T6Loz
FmuPGcP7Um91alVex8jAy3WVkJ9kuK+DGsCKiv2ISpK5vlZf7qgBIF+cE9mIklCa
IfrqMvnMOtqPr7r83NH9GIELu8qzIFM0ALJ48fIrfQKBgDHQtEF5AcGQd9GVS8ib
gSMFWzwCLfFVGXtFmg/uXgQeJIdDwi3XGR+bcdp6cNiiVwQU6DMhFnagecVCWqEc
5PgruBnP9dc4vJw4OFvSNcDwCH6wpcLf+0DScmfvMfN9EIKiEgaC67Omb5yP9MEM
uv7aMXCQcjWPGOJgqVnz2f48
-----END PRIVATE KEY-----`;

const auth = new google.auth.JWT({
  email: SERVICE_ACCOUNT_EMAIL,
  key: PRIVATE_KEY,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

// Define drop-down options
const dropDownOptions = {
  estimateStatus: ['PENDING', 'SCHEDULED', 'COMPLETED', 'NO_SHOW'],
  closeStatus: ['OPEN', 'WON', 'LOST'],
  service: ['AC Installation', 'HVAC Installation', 'Leak Repair', 'Pipe Installation', 'Water Heater', 'Drain Cleaning'],
  source: ['Google', 'Google Ads', 'Facebook Ads', 'Referral'],
};

// Column mappings (1-indexed: A=1, B=2, etc.)
const columns = {
  service: 5, // Column E
  source: 6, // Column F
  estimateStatus: 7, // Column G
  closeStatus: 8, // Column H
};

async function addDropdowns() {
  try {
    console.log('Adding data validation drop-downs to Raw Data tab...\n');

    // Get the Raw Data sheet ID
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });

    const rawDataSheet = spreadsheet.data.sheets.find((s) => s.properties.title === 'Raw Data');
    if (!rawDataSheet) {
      throw new Error('Raw Data sheet not found');
    }

    const sheetId = rawDataSheet.properties.sheetId;

    // Build requests for each column with drop-down
    const requests = [];

    // Service column (E) - rows 2-1000
    console.log('Adding drop-down for Service column...');
    requests.push({
      setDataValidation: {
        range: {
          sheetId,
          startRowIndex: 1, // Row 2 (0-indexed)
          endRowIndex: 1000,
          startColumnIndex: columns.service - 1,
          endColumnIndex: columns.service,
        },
        rule: {
          condition: {
            type: 'ONE_OF_LIST',
            values: dropDownOptions.service.map((item) => ({ userEnteredValue: item })),
          },
          inputMessage: 'Please select from the list',
          strict: false,
        },
      },
    });

    // Source column (F) - rows 2-1000
    console.log('Adding drop-down for Source column...');
    requests.push({
      setDataValidation: {
        range: {
          sheetId,
          startRowIndex: 1,
          endRowIndex: 1000,
          startColumnIndex: columns.source - 1,
          endColumnIndex: columns.source,
        },
        rule: {
          condition: {
            type: 'ONE_OF_LIST',
            values: dropDownOptions.source.map((item) => ({ userEnteredValue: item })),
          },
          inputMessage: 'Please select from the list',
          strict: false,
        },
      },
    });

    // Estimate Status column (G) - rows 2-1000
    console.log('Adding drop-down for Estimate Status column...');
    requests.push({
      setDataValidation: {
        range: {
          sheetId,
          startRowIndex: 1,
          endRowIndex: 1000,
          startColumnIndex: columns.estimateStatus - 1,
          endColumnIndex: columns.estimateStatus,
        },
        rule: {
          condition: {
            type: 'ONE_OF_LIST',
            values: dropDownOptions.estimateStatus.map((item) => ({ userEnteredValue: item })),
          },
          inputMessage: 'Please select from the list',
          strict: false,
        },
      },
    });

    // Close Status column (H) - rows 2-1000
    console.log('Adding drop-down for Close Status column...');
    requests.push({
      setDataValidation: {
        range: {
          sheetId,
          startRowIndex: 1,
          endRowIndex: 1000,
          startColumnIndex: columns.closeStatus - 1,
          endColumnIndex: columns.closeStatus,
        },
        rule: {
          condition: {
            type: 'ONE_OF_LIST',
            values: dropDownOptions.closeStatus.map((item) => ({ userEnteredValue: item })),
          },
          inputMessage: 'Please select from the list',
          strict: false,
        },
      },
    });

    // Apply all requests
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: { requests },
    });

    console.log('\n✅ Drop-downs added successfully!');
    console.log('\nColumns with drop-downs:');
    console.log('  • Service (Column E): AC Installation, HVAC Installation, Leak Repair, Pipe Installation, Water Heater, Drain Cleaning');
    console.log('  • Source (Column F): Google, Google Ads, Facebook Ads, Referral');
    console.log('  • Estimate Status (Column G): PENDING, SCHEDULED, COMPLETED, NO_SHOW');
    console.log('  • Close Status (Column H): OPEN, WON, LOST');
  } catch (error) {
    console.error('❌ Error adding drop-downs:', error);
    process.exit(1);
  }
}

addDropdowns();
