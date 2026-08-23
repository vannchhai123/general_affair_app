/**
 * Utility to extract clean, descriptive business logic error messages from backend responses.
 */

interface BackendErrorPayload {
  status?: number;
  message?: string;
  error?: string;
  messageCode?: string;
  errors?: Record<string, string>;
  code?: string;
  [key: string]: any;
}

const BUSINESS_ERROR_TRANSLATIONS: Record<string, string> = {
  // Document duplicates & validation
  'Document number already exists for this document type':
    'លេខឯកសារនេះមានរួចហើយសម្រាប់ប្រភេទលិខិតនេះ! សូមប្រើប្រាស់លេខផ្សេង។',
  'Direction is required': 'សូមជ្រើសរើសទិសដៅឯកសារ',
  'Document type ID is required': 'សូមជ្រើសរើសប្រភេទលិខិត',
  'Document number is required': 'សូមបំពេញលេខឯកសារ',
  'Document date is required': 'សូមជ្រើសរើសកាលបរិច្ឆេទឯកសារ',
  'Subject is required': 'សូមបំពេញកម្មវត្ថុឯកសារ',
  'Authenticated user is not associated with an officer profile':
    'គណនីរបស់អ្នកមិនទាន់បានភ្ជាប់ជាមួយប្រវត្តិរូបមន្ត្រីនៅឡើយទេ សូមទាក់ទងអ្នកគ្រប់គ្រង។',

  // File errors
  'Only jpeg, jpg, png, webp, and pdf files are allowed':
    'អនុញ្ញាតតែឯកសារប្រភេទ PDF, JPEG, PNG និង WebP ប៉ុណ្ណោះ',
  'Uploaded file is too large. Maximum allowed size is 10MB.':
    'ទំហំឯកសារធំពេក (ទំហំអនុញ្ញាតអតិបរមាគឺ 10MB)',
  'File must not be empty': 'ឯកសារដែលបានជ្រើសរើសមិនអាចទទេបានឡើយ',

  // Common errors
  'An unexpected error occurred':
    'មានបញ្ហាបច្ចេកទេសលើម៉ាស៊ីនបម្រើ (Server Error)។ សូមទាក់ទងអ្នកគ្រប់គ្រង ឬសាកល្បងម្តងទៀត។',
  'Unauthorized access': 'អ្នកគ្មានសិទ្ធិអនុវត្តសកម្មភាពនេះឡើយ',
  'Access denied': 'ការចូលប្រើប្រាស់ត្រូវបានបដិសេធ',
};

export async function parseApiError(
  response: Response,
  defaultMessage: string = 'ប្រតិបត្តិការបរាជ័យ',
): Promise<string> {
  try {
    const data: BackendErrorPayload = await response.json().catch(() => ({}));

    // 1. Check if there are field-specific validation errors (MethodArgumentNotValidException)
    if (data.errors && typeof data.errors === 'object' && Object.keys(data.errors).length > 0) {
      const fieldMessages = Object.entries(data.errors)
        .map(([field, msg]) => {
          const translatedMsg = translateErrorMessage(msg);
          return `${translateFieldName(field)}: ${translatedMsg}`;
        })
        .join('\n');
      return fieldMessages;
    }

    // 2. Check main error message
    const rawMessage = data.message || data.error || data.messageCode;
    if (rawMessage && typeof rawMessage === 'string') {
      return translateErrorMessage(rawMessage);
    }

    // 3. Fallback based on HTTP status code
    if (response.status === 400) return 'សំណើមិនត្រឹមត្រូវ (Bad Request) សូមពិនិត្យទិន្នន័យម្តងទៀត';
    if (response.status === 401) return 'សូមចូលគណនីឡើងវិញ (Unauthorized)';
    if (response.status === 403) return 'អ្នកគ្មានសិទ្ធិអនុវត្តសកម្មភាពនេះទេ (Forbidden)';
    if (response.status === 404) return 'មិនរកឃើញទិន្នន័យឡើយ (Not Found)';
    if (response.status === 409) return 'ទិន្នន័យនេះមានរួចហើយ (Data Conflict)';
    if (response.status === 413) return 'ទំហំឯកសារធំពេក (Payload Too Large)';
    if (response.status >= 500) return 'មានបញ្ហាបច្ចេកទេសលើម៉ាស៊ីនបម្រើ (Internal Server Error)';

    return defaultMessage;
  } catch (err) {
    return defaultMessage;
  }
}

export function translateErrorMessage(message: string): string {
  if (!message) return message;

  for (const [key, translation] of Object.entries(BUSINESS_ERROR_TRANSLATIONS)) {
    if (message.includes(key)) {
      return translation;
    }
  }

  return message;
}

function translateFieldName(field: string): string {
  const fieldsMap: Record<string, string> = {
    documentNumber: 'លេខឯកសារ',
    documentDate: 'កាលបរិច្ឆេទ',
    documentTypeId: 'ប្រភេទលិខិត',
    direction: 'ទិសដៅ',
    subject: 'កម្មវត្ថុ',
    summary: 'សេចក្តីសង្ខេប',
    status: 'ស្ថានភាព',
    receiverOrganizationName: 'ស្ថាប័នទទួល',
    senderOrganizationId: 'ស្ថាប័នផ្ញើ',
    receiverOrganizationId: 'ស្ថាប័នទទួល',
    fileIds: 'ឯកសារភ្ជាប់',
  };

  return fieldsMap[field] || field;
}
