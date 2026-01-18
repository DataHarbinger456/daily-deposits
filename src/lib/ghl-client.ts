export interface GHLContact {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  tags?: string[];
  customFields?: Array<{ id: string; value: string }>;
}

interface GHLClientConfig {
  locationId: string;
  privateIntegrationToken: string;
  baseUrl: string;
  apiVersion: string;
}

interface GHLResponse {
  id?: string;
  [key: string]: unknown;
}

export class GHLClient {
  private config: GHLClientConfig;

  constructor() {
    this.config = {
      locationId: process.env.GHL_LOCATION_ID!,
      privateIntegrationToken: process.env.GHL_PRIVATE_INTEGRATION_TOKEN!,
      baseUrl: process.env.GHL_BASE_URL || 'https://services.leadconnectorhq.com',
      apiVersion: process.env.GHL_API_VERSION || '2021-07-28',
    };

    if (!this.config.locationId || !this.config.privateIntegrationToken) {
      throw new Error('GHL_LOCATION_ID and GHL_PRIVATE_INTEGRATION_TOKEN environment variables are required');
    }
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.config.privateIntegrationToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Version': this.config.apiVersion,
    };
  }

  /**
   * Search for a contact by email
   */
  async findContactByEmail(email: string): Promise<GHLResponse | null> {
    try {
      const response = await fetch(
        `${this.config.baseUrl}/contacts/?locationId=${this.config.locationId}&query=${encodeURIComponent(email)}`,
        {
          method: 'GET',
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`GHL API error: ${response.status} ${response.statusText}`);
      }

      const data = (await response.json()) as { contacts?: GHLResponse[] };
      // Check if contact exists in response
      if (data.contacts && data.contacts.length > 0) {
        return data.contacts[0];
      }
      return null;
    } catch (error) {
      console.error('GHL findContactByEmail error:', error);
      return null;
    }
  }

  /**
   * Create a new contact
   */
  async createContact(contactData: GHLContact): Promise<GHLResponse> {
    const response = await fetch(`${this.config.baseUrl}/contacts/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        locationId: this.config.locationId,
        ...contactData,
      }),
    });

    if (!response.ok) {
      const errorData = (await response.json().catch(() => ({}))) as GHLResponse;
      throw new Error(
        `GHL create contact failed: ${response.status} ${JSON.stringify(errorData)}`
      );
    }

    return (await response.json()) as GHLResponse;
  }

  /**
   * Update an existing contact
   */
  async updateContact(contactId: string, updates: Partial<GHLContact>): Promise<GHLResponse> {
    const response = await fetch(`${this.config.baseUrl}/contacts/${contactId}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const errorData = (await response.json().catch(() => ({}))) as GHLResponse;
      throw new Error(
        `GHL update contact failed: ${response.status} ${JSON.stringify(errorData)}`
      );
    }

    return (await response.json()) as GHLResponse;
  }

  /**
   * Upsert contact (create if new, update if exists)
   * Uses email as the unique identifier
   */
  async upsertContact(
    contactData: GHLContact
  ): Promise<{ contact: GHLResponse; action: 'created' | 'updated' }> {
    if (!contactData.email) {
      throw new Error('Email is required for upsert operation');
    }

    // Check if contact exists
    const existingContact = await this.findContactByEmail(contactData.email);

    if (existingContact) {
      // Update existing contact
      const updated = await this.updateContact(existingContact.id as string, contactData);
      return { contact: updated, action: 'updated' };
    } else {
      // Create new contact
      const created = await this.createContact(contactData);
      return { contact: created, action: 'created' };
    }
  }

  /**
   * Add tags to a contact
   */
  async addTags(contactId: string, tags: string[]): Promise<void> {
    await fetch(`${this.config.baseUrl}/contacts/${contactId}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({
        tags,
      }),
    });
  }
}
