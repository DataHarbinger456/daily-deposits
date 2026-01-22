const { google } = require('googleapis');
const fs = require('fs');

const SPREADSHEET_ID = '1fPzS7Nhdu14Qij_5siC9Nj5fBJUjlGO70LZl_BW8rwM';
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

async function setupSheets() {
  try {
    console.log('Setting up Google Sheets for client...\n');

    // Step 1: Create "Raw Data" tab
    console.log('Creating "Raw Data" tab...');
    const createRawDataResponse = await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: {
                title: 'Raw Data',
                gridProperties: {
                  rowCount: 1000,
                  columnCount: 15,
                  frozenRowCount: 1,
                },
              },
            },
          },
        ],
      },
    });

    const rawDataSheetId = createRawDataResponse.data.replies[0].addSheet.properties.sheetId;

    // Step 3: Add headers to "Raw Data" tab (15 columns)
    console.log('Adding headers to "Raw Data" tab...');
    const headers = [
      'Lead ID',
      'Contact Name',
      'Email',
      'Phone',
      'Service',
      'Source',
      'Estimate Amount',
      'Estimate Status',
      'Close Status',
      'Revenue',
      'Notes',
      'Tags',
      'Created Date',
      'Updated Date',
      'Company Tag',
    ];

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [
          {
            updateCells: {
              rows: [
                {
                  values: headers.map((header) => ({
                    userEnteredValue: { stringValue: header },
                    userEnteredFormat: {
                      textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 } },
                      backgroundColor: { red: 0.2, green: 0.2, blue: 0.2 },
                    },
                  })),
                },
              ],
              fields: 'userEnteredValue,userEnteredFormat',
              start: { sheetId: rawDataSheetId, rowIndex: 0, columnIndex: 0 },
            },
          },
        ],
      },
    });

    // Step 4: Create "Dashboard" tab
    console.log('Creating "Dashboard" tab...');
    const createDashboardResponse = await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: {
                title: 'Dashboard',
                gridProperties: {
                  rowCount: 500,
                  columnCount: 4,
                },
              },
            },
          },
        ],
      },
    });

    const dashboardSheetId = createDashboardResponse.data.replies[0].addSheet.properties.sheetId;

    // Step 5: Add dashboard content
    console.log('Adding dashboard formulas...');
    const dashboardContent = [
      [{ stringValue: 'LEAD METRICS' }, {}, {}, {}],
      [
        { stringValue: 'Total Leads' },
        { formulaValue: `=COUNTA('Raw Data'!A2:A)` },
        {},
        {},
      ],
      [
        { stringValue: 'Total Revenue' },
        { formulaValue: `=SUM('Raw Data'!J2:J)` },
        {},
        {},
      ],
      [
        { stringValue: 'Won Deals' },
        { formulaValue: `=COUNTIF('Raw Data'!I2:I,"WON")` },
        {},
        {},
      ],
      [
        { stringValue: 'Open Leads' },
        { formulaValue: `=COUNTIF('Raw Data'!I2:I,"OPEN")` },
        {},
        {},
      ],
      [
        { stringValue: 'Lost Deals' },
        { formulaValue: `=COUNTIF('Raw Data'!I2:I,"LOST")` },
        {},
        {},
      ],
      [
        { stringValue: 'Win Rate (%)' },
        {
          formulaValue: `=IF(B2=0,0,ROUND((B4/B2)*100,1))`,
        },
        {},
        {},
      ],
      [
        { stringValue: 'Avg Deal Size' },
        {
          formulaValue: `=IF(B4=0,0,ROUND(B3/B4,2))`,
        },
        {},
        {},
      ],
      [{}, {}, {}, {}],
      [{ stringValue: 'BY STATUS' }, {}, {}, {}],
      [
        { stringValue: 'Status' },
        { stringValue: 'Count' },
        { stringValue: 'Revenue' },
        {},
      ],
      [
        { stringValue: 'Pending Estimates' },
        { formulaValue: `=COUNTIF('Raw Data'!H2:H,"PENDING")` },
        { formulaValue: `=SUMIF('Raw Data'!H2:H,"PENDING",'Raw Data'!J2:J)` },
        {},
      ],
      [
        { stringValue: 'Scheduled Estimates' },
        { formulaValue: `=COUNTIF('Raw Data'!H2:H,"SCHEDULED")` },
        { formulaValue: `=SUMIF('Raw Data'!H2:H,"SCHEDULED",'Raw Data'!J2:J)` },
        {},
      ],
      [
        { stringValue: 'Completed Estimates' },
        { formulaValue: `=COUNTIF('Raw Data'!H2:H,"COMPLETED")` },
        { formulaValue: `=SUMIF('Raw Data'!H2:H,"COMPLETED",'Raw Data'!J2:J)` },
        {},
      ],
    ];

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [
          {
            updateCells: {
              rows: dashboardContent.map((row) => ({
                values: row.map((cell) =>
                  cell.stringValue
                    ? {
                        userEnteredValue: cell,
                        userEnteredFormat: {
                          textFormat: { bold: true },
                        },
                      }
                    : cell.formulaValue
                    ? { userEnteredValue: cell }
                    : {}
                ),
              })),
              fields: 'userEnteredValue,userEnteredFormat',
              start: { sheetId: dashboardSheetId, rowIndex: 0, columnIndex: 0 },
            },
          },
        ],
      },
    });

    // Step 6: Delete Sheet1 if it still exists
    console.log('Cleaning up default sheet...');
    const finalSheetResponse = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });

    const sheet1 = finalSheetResponse.data.sheets.find((s) => s.properties.title === 'Sheet1');
    if (sheet1) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          requests: [
            {
              deleteSheet: {
                sheetId: sheet1.properties.sheetId,
              },
            },
          ],
        },
      });
    }

    console.log('\n✅ Google Sheets setup complete!');
    console.log('\nYour spreadsheet now has:');
    console.log('  • "Raw Data" tab - 15 columns with headers (leads will sync here)');
    console.log('  • "Dashboard" tab - Auto-calculated metrics');
    console.log('\nSpreadsheet URL:');
    console.log(`https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit`);
  } catch (error) {
    console.error('❌ Error setting up sheets:', error.message);
    process.exit(1);
  }
}

setupSheets();
