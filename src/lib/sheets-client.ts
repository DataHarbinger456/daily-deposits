import { google } from 'googleapis';

interface SheetLead {
  contactName: string;
  email: string;
  phone: string;
  service: string;
  source: string;
  estimateAmount: number | null;
  estimateStatus: string;
  closeStatus: string;
  revenue: number | null;
  notes: string;
  tags: string[];
  createdAt: Date;
  companyTag: string;
}

interface TabInfo {
  sheetId: number | null;
  title: string;
}

const SHEET_HEADERS = [
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
  'Company Tag',
];

export class SheetsClient {
  private sheets: ReturnType<typeof google.sheets>;
  private spreadsheetId: string;

  constructor() {
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

    if (!privateKey || !serviceAccountEmail || !spreadsheetId) {
      throw new Error('Missing Google Sheets environment variables');
    }

    const auth = new google.auth.JWT({
      email: serviceAccountEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    this.sheets = google.sheets({ version: 'v4', auth });
    this.spreadsheetId = spreadsheetId;
  }

  async appendLead(companyTag: string, lead: SheetLead): Promise<void> {
    try {
      // Ensure tab exists
      const tabInfo = await this.ensureTabExists(companyTag);

      // Format and append lead data
      const leadData = this.formatLeadData(lead);
      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: `'${tabInfo.title}'!A:M`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [leadData],
        },
      });
    } catch (error) {
      throw new Error(
        `Failed to append lead to Google Sheets: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private async ensureTabExists(companyTag: string): Promise<TabInfo> {
    try {
      // Try to get existing tab
      const existingTab = await this.getTabByName(companyTag);
      if (existingTab) {
        return existingTab;
      }

      // Create new tab
      return await this.createTabWithHeaders(companyTag);
    } catch (error) {
      throw new Error(
        `Failed to ensure tab exists: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private async getTabByName(title: string): Promise<TabInfo | null> {
    try {
      const spreadsheet = await this.sheets.spreadsheets.get({
        spreadsheetId: this.spreadsheetId,
      });

      const sheet = spreadsheet.data.sheets?.find(
        (s) => s.properties?.title === title
      );

      if (sheet?.properties?.sheetId !== undefined) {
        return {
          sheetId: sheet.properties.sheetId,
          title: sheet.properties.title || title,
        };
      }

      return null;
    } catch (error) {
      throw new Error(
        `Failed to get tab: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private async createTabWithHeaders(companyTag: string): Promise<TabInfo> {
    try {
      // Create new sheet
      const addSheetResponse = await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId: this.spreadsheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: companyTag,
                  gridProperties: {
                    rowCount: 1000,
                    columnCount: 13,
                    frozenRowCount: 1,
                  },
                },
              },
            },
          ],
        },
      });

      const newSheetId =
        addSheetResponse.data.replies?.[0]?.addSheet?.properties?.sheetId;
      if (newSheetId === undefined) {
        throw new Error('Failed to create sheet');
      }

      // Add headers with formatting
      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId: this.spreadsheetId,
        requestBody: {
          requests: [
            {
              updateCells: {
                rows: [
                  {
                    values: SHEET_HEADERS.map((header) => ({
                      userEnteredValue: { stringValue: header },
                      userEnteredFormat: {
                        backgroundColor: {
                          red: 0.2,
                          green: 0.2,
                          blue: 0.2,
                        },
                        textFormat: {
                          bold: true,
                          foregroundColor: { red: 1, green: 1, blue: 1 },
                        },
                      },
                    })),
                  },
                ],
                fields: 'userEnteredValue,userEnteredFormat',
                start: {
                  sheetId: newSheetId,
                  rowIndex: 0,
                  columnIndex: 0,
                },
              },
            },
          ],
        },
      });

      return {
        sheetId: newSheetId,
        title: companyTag,
      };
    } catch (error) {
      throw new Error(
        `Failed to create tab with headers: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private formatLeadData(lead: SheetLead): (string | number)[] {
    const formattedDate = lead.createdAt.toISOString().split('T')[0]; // YYYY-MM-DD format
    const tagsStr = lead.tags.join(', ');

    return [
      lead.contactName,
      lead.email,
      lead.phone,
      lead.service,
      lead.source,
      lead.estimateAmount ?? '',
      lead.estimateStatus,
      lead.closeStatus,
      lead.revenue ?? '',
      lead.notes,
      tagsStr,
      formattedDate,
      lead.companyTag,
    ];
  }
}
