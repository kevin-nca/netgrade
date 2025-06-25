/**
 * Utility functions for export functionality
 */

/**
 * Generate a filename for export based on school name and user name
 * @param schoolName - Name of the school (optional)
 * @param userName - Name of the user (optional)
 * @returns Generated filename without extension
 */
export const generateExportFilename = (
  schoolName?: string,
  userName?: string,
): string => {
  const timestamp = new Date().toISOString().split('T')[0];
  const sanitizedSchoolName = schoolName
    ? sanitizeFilename(schoolName) + '-'
    : '';
  const sanitizedUserName = userName ? sanitizeFilename(userName) + '-' : '';

  return `netgrade-${sanitizedSchoolName}${sanitizedUserName}${timestamp}`;
};

/**
 * Ensure filename has .xlsx extension
 * @param filename - Filename to check
 * @returns Filename with .xlsx extension
 */
export const ensureXlsxExtension = (filename: string): string => {
  const cleaned = filename.trim();
  return cleaned.endsWith('.xlsx') ? cleaned : `${cleaned}.xlsx`;
};

/**
 * Sanitize filename by removing/replacing invalid characters
 * @param filename - Filename to sanitize
 * @returns Sanitized filename
 */
export const sanitizeFilename = (filename: string): string => {
  return filename
    .replace(/[^a-z0-9\s\-_]/gi, '')
    .replace(/\s+/g, '-')
    .toLowerCase()
    .substring(0, 50);
};

/**
 * Validate filename
 * @param filename - Filename to validate
 * @returns Error message if invalid, null if valid
 */
export const validateFilename = (filename: string): string | null => {
  const cleaned = filename.trim();

  if (!cleaned) {
    return 'Dateiname darf nicht leer sein.';
  }

  if (cleaned.length > 100) {
    return 'Dateiname ist zu lang (max. 50 Zeichen).';
  }
  if (/[<>:"/\\|?*]/.test(cleaned)) {
    return 'Dateiname enthält ungültige Zeichen.';
  }

  return null;
};
/**
 * Get toast color based on export result success
 * @param success - Whether the export was successful
 * @returns Toast color
 */
export const getExportToastColor = (
  success: boolean,
): 'success' | 'warning' | 'danger' => {
  return success ? 'success' : 'warning';
};
