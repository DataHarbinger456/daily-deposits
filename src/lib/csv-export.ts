interface LeadData {
  id: string;
  contactName?: string | null;
  email?: string | null;
  phone?: string | null;
  service: string;
  source: string;
  estimateAmount?: number | null;
  estimateStatus: string;
  closeStatus: string;
  revenue?: number | null;
  notes?: string | null;
  tags?: string | null;
  createdAt: Date | number;
  updatedAt?: Date | number;
  companyTag?: string;
}

export function convertLeadsToCSV(leads: LeadData[], includeCompanyTag = true): string {
  if (leads.length === 0) {
    return getCSVHeaders(includeCompanyTag);
  }

  const headers = getCSVHeaders(includeCompanyTag);
  const rows = leads.map(lead => formatLeadAsCSVRow(lead, includeCompanyTag));

  return [headers, ...rows].join('\n');
}

function getCSVHeaders(includeCompanyTag = true): string {
  const baseHeaders = [
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
  ];

  if (includeCompanyTag) {
    baseHeaders.push('Company Tag');
  }

  return baseHeaders.map(escapeCSVField).join(',');
}

function formatLeadAsCSVRow(lead: LeadData, includeCompanyTag = true): string {
  let tags = '';
  if (lead.tags) {
    try {
      tags = Array.isArray(JSON.parse(lead.tags))
        ? JSON.parse(lead.tags).join('; ')
        : '';
    } catch {
      tags = '';
    }
  }

  const createdAt = new Date(lead.createdAt).toISOString().split('T')[0]; // YYYY-MM-DD format
  const updatedAt = lead.updatedAt
    ? new Date(lead.updatedAt).toISOString().split('T')[0]
    : createdAt; // Default to created date if not provided

  const fields = [
    lead.id || '',
    lead.contactName || '',
    lead.email || '',
    lead.phone || '',
    lead.service || '',
    lead.source || '',
    lead.estimateAmount?.toString() || '',
    lead.estimateStatus || '',
    lead.closeStatus || '',
    lead.revenue?.toString() || '',
    lead.notes || '',
    tags,
    createdAt,
    updatedAt,
  ];

  if (includeCompanyTag) {
    fields.push(lead.companyTag || '');
  }

  return fields.map(escapeCSVField).join(',');
}

function escapeCSVField(field: string): string {
  if (!field) return '';

  // If field contains comma, quote, or newline, wrap in quotes and escape quotes
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`;
  }

  return field;
}
