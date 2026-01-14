/**
 * Tag management utilities for leads
 * Handles parsing, serialization, and normalization of tags
 */

/**
 * Normalize company tag to lowercase with spaces
 */
export function normalizeCompanyTag(tag: string): string {
  return tag.toLowerCase().trim();
}

/**
 * Parse tags from JSON string stored in database
 */
export function parseLeadTags(tagsJson: string | null | undefined): string[] {
  if (!tagsJson) return [];
  try {
    const parsed = JSON.parse(tagsJson);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Serialize tags array to JSON string for database storage
 */
export function serializeLeadTags(tags: string[]): string | null {
  if (!tags || tags.length === 0) return null;
  return JSON.stringify(tags);
}

/**
 * Add company tag to lead's existing tags (if not already present)
 */
export function addTagToLead(existingTags: string[], newTag: string): string[] {
  const normalized = normalizeCompanyTag(newTag);
  if (existingTags.includes(normalized)) {
    return existingTags;
  }
  return [...existingTags, normalized];
}
