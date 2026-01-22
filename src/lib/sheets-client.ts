import { google } from 'googleapis';

interface SheetLead {
  id: string;
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
  updatedAt: Date;
  companyTag: string;
}

interface TabInfo {
  sheetId: number | null;
  title: string;
}

const SHEET_HEADERS = [
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

export class SheetsClient {
  private sheets: ReturnType<typeof google.sheets>;
  private spreadsheetId: string;
  private isClientSheet: boolean;

  constructor(spreadsheetId?: string) {
    let privateKey = process.env.GOOGLE_PRIVATE_KEY || '';

    if (!privateKey) {
      throw new Error('GOOGLE_PRIVATE_KEY environment variable is not set');
    }

    // Remove surrounding quotes if present
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
      privateKey = privateKey.slice(1, -1);
    }

    // Handle both formats:
    // 1. Escaped newlines: -----BEGIN...\n...\n-----END...
    // 2. Actual newlines from Vercel multiline input (already correct)

    // If it has escaped \n sequences, convert to actual newlines
    if (privateKey.includes('\\n')) {
      privateKey = privateKey.replace(/\\n/g, '\n');
    }

    // Ensure key has proper BEGIN and END markers
    if (!privateKey.includes('BEGIN PRIVATE KEY') || !privateKey.includes('END PRIVATE KEY')) {
      throw new Error('GOOGLE_PRIVATE_KEY does not contain valid BEGIN/END markers');
    }

    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const defaultSpreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

    if (!serviceAccountEmail) {
      throw new Error('GOOGLE_SERVICE_ACCOUNT_EMAIL environment variable is not set');
    }

    // Use provided spreadsheet ID or fall back to default from environment
    const finalSpreadsheetId = spreadsheetId || defaultSpreadsheetId;
    if (!finalSpreadsheetId) {
      throw new Error('No spreadsheet ID provided and GOOGLE_SHEETS_SPREADSHEET_ID not set');
    }

    // Determine if this is a client sheet (org-specific) or master sheet (env default)
    this.isClientSheet = !!spreadsheetId;

    const auth = new google.auth.JWT({
      email: serviceAccountEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    this.sheets = google.sheets({ version: 'v4', auth });
    this.spreadsheetId = finalSpreadsheetId;
  }

  async appendLead(companyTag: string, lead: SheetLead): Promise<void> {
    try {
      // For client sheets (using org-specific spreadsheet ID), append to "Raw Data" tab
      // For master sheet (using environment variable), create tabs by company tag
      const tabTitle = this.isClientSheet ? 'Raw Data' : companyTag;

      // Ensure tab exists only if using company tag (master sheet)
      if (!this.isClientSheet) {
        await this.ensureTabExists(companyTag);
      }

      // Format and append lead data
      const leadData = this.formatLeadData(lead);
      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: `'${tabTitle}'!A:O`,
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

  async updateLead(companyTag: string, lead: SheetLead): Promise<void> {
    try {
      // For client sheets, update in "Raw Data" tab; for master sheet, use company tag
      const tabTitle = this.isClientSheet ? 'Raw Data' : companyTag;

      // Ensure tab exists only if using company tag (master sheet)
      if (!this.isClientSheet) {
        await this.ensureTabExists(companyTag);
      }

      // Find the row with this lead ID
      const rowIndex = await this.findLeadRowIndex(tabTitle, lead.id);
      if (rowIndex === -1) {
        // Lead not found, append as new
        await this.appendLead(companyTag, lead);
        return;
      }

      // Update the row
      const leadData = this.formatLeadData(lead);
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: `'${tabTitle}'!A${rowIndex + 1}:O${rowIndex + 1}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [leadData],
        },
      });
    } catch (error) {
      throw new Error(
        `Failed to update lead in Google Sheets: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private async findLeadRowIndex(tabTitle: string, leadId: string): Promise<number> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: `'${tabTitle}'!A:A`,
      });

      const values = response.data.values || [];
      // Row 0 is headers, so start from row 1
      for (let i = 1; i < values.length; i++) {
        if (values[i]?.[0] === leadId) {
          return i;
        }
      }

      return -1; // Not found
    } catch (error) {
      throw new Error(
        `Failed to find lead row: ${error instanceof Error ? error.message : 'Unknown error'}`
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
                    columnCount: 15,
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
    const createdDate = lead.createdAt.toISOString().split('T')[0]; // YYYY-MM-DD format
    const updatedDate = lead.updatedAt.toISOString().split('T')[0]; // YYYY-MM-DD format
    const tagsStr = lead.tags.join(', ');

    return [
      lead.id,
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
      createdDate,
      updatedDate,
      lead.companyTag,
    ];
  }
}
