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
    'Date Created',
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

  const createdAt = new Date(lead.createdAt).toLocaleDateString();

  const fields = [
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
