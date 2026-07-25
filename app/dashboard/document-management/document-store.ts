// Shared Store for Document Management using LocalStorage

export interface DocumentType {
  id: number;
  name: string;
  code: string;
}

export interface Organization {
  id: number;
  name: string;
  shortName: string;
}

export interface DocumentTag {
  id: number;
  name: string;
}

export interface DocumentFile {
  id: number;
  fileName: string;
  filePath: string;
  mimeType: string;
  fileSize: string;
  isPrimary: boolean;
  uploadedBy: string;
}

export interface DocumentLog {
  id: number;
  officerName: string;
  action: string;
  description: string;
  createdAt: string;
}

export interface DocumentItem {
  id: number;
  uuid: string;
  direction: 'INCOMING' | 'OUTGOING' | 'INTERNAL';
  documentType: DocumentType;
  senderOrganization?: Organization;
  receiverOrganization?: Organization;
  documentNumber: string;
  documentDate: string;
  receivedDate?: string;
  subject: string;
  summary: string;
  confidentiality: 'NORMAL' | 'CONFIDENTIAL';
  priority: 'NORMAL' | 'HIGH' | 'CRITICAL';
  status: 'PENDING' | 'LOGGED';
  remarks?: string;
  createdBy: string;
  updatedBy?: string;
  createdAt: string;
  tags: DocumentTag[];
  files: DocumentFile[];
  logs: DocumentLog[];
}

export const INITIAL_TYPES: DocumentType[] = [
  { id: 1, name: 'លិខិតផ្លូវការ (Official Letter)', code: 'OFF_LTR' },
  { id: 2, name: 'សារាចរ (Circular)', code: 'CIR' },
  { id: 3, name: 'កំណត់ហេតុ (Memo)', code: 'MEMO' },
  { id: 4, name: 'សេចក្តីណែនាំ (Directive)', code: 'DIR' },
  { id: 5, name: 'របាយការណ៍ (Report)', code: 'RPT' },
];

export const INITIAL_ORGS: Organization[] = [
  { id: 1, name: 'ក្រសួងមហាផ្ទៃ', shortName: 'MoI' },
  { id: 2, name: 'ក្រសួងការបរទេស និងសហប្រតិបត្តិការអន្តរជាតិ', shortName: 'MFAIC' },
  { id: 3, name: 'សាកលវិទ្យាល័យ ណរតុន', shortName: 'NU' },
  { id: 4, name: 'ក្រសួងអប់រំ យុវជន និងកីឡា', shortName: 'MoEYS' },
];

export const INITIAL_TAGS: DocumentTag[] = [
  { id: 1, name: 'បន្ទាន់ (Urgent)' },
  { id: 2, name: 'សម្ងាត់ (Confidential)' },
  { id: 3, name: 'ហិរញ្ញវត្ថុ (Finance)' },
  { id: 4, name: 'អប់រំ (Education)' },
  { id: 5, name: 'ផ្ទៃក្នុង (Internal)' },
];

const INITIAL_DOCUMENTS: DocumentItem[] = [
  {
    id: 1,
    uuid: 'd7a9ef38-51f6-42cf-961f-132d73352611',
    direction: 'INCOMING',
    documentType: INITIAL_TYPES[0],
    senderOrganization: INITIAL_ORGS[0],
    receiverOrganization: INITIAL_ORGS[2],
    documentNumber: 'MoI-2026-1049',
    documentDate: '2026-07-01',
    receivedDate: '2026-07-02',
    subject: 'ការអញ្ជើញចូលរួមសិក្ខាសាលាស្តីពីសន្តិសុខបច្ចេកវិទ្យាជាតិ',
    summary:
      'លិខិតអញ្ជើញតំណាងសាកលវិទ្យាល័យណរតុន ចូលរួមសិក្ខាសាលាស្តីពីការយល់ដឹងអំពីសន្តិសុខបច្ចេកវិទ្យាជាតិនៅខែក្រោយ។',
    confidentiality: 'NORMAL',
    priority: 'HIGH',
    status: 'LOGGED',
    remarks: 'ចាត់ចែងជូនប្រធានការិយាល័យព័ត៌មានវិទ្យាដើម្បីសហការសម្របសម្រួល',
    createdBy: 'ឆៃ វណ្ណ',
    createdAt: '2026-07-02T09:15:00',
    tags: [INITIAL_TAGS[0], INITIAL_TAGS[3]],
    files: [
      {
        id: 101,
        fileName: 'MoI-2026-1049_Security_Workshop.pdf',
        filePath: '/documents/2026/07/MoI-2026-1049.pdf',
        mimeType: 'application/pdf',
        fileSize: '1.02 MB',
        isPrimary: true,
        uploadedBy: 'ឆៃ វណ្ណ',
      },
    ],
    logs: [
      {
        id: 201,
        officerName: 'ឆៃ វណ្ណ',
        action: 'CREATE',
        description: 'បានបញ្ចូល និងចុះបញ្ជីឯកសារក្នុងប្រព័ន្ធ',
        createdAt: '2026-07-02 09:15',
      },
    ],
  },
  {
    id: 2,
    uuid: '92ff698c-851f-4ccf-a2e6-df06ebfcd088',
    direction: 'OUTGOING',
    documentType: INITIAL_TYPES[1],
    senderOrganization: INITIAL_ORGS[2],
    receiverOrganization: INITIAL_ORGS[3],
    documentNumber: 'NU-CIR-2026-088',
    documentDate: '2026-07-04',
    subject: 'ការអនុវត្តស្តង់ដារនៃការរៀន និងបង្រៀនតាមប្រព័ន្ធអេឡិចត្រូនិក',
    summary:
      'សារាចរណែនាំទៅកាន់ក្រសួងអប់រំ យុវជន និងកីឡា អំពីរបាយការណ៍វឌ្ឍនភាព និងការអនុលោមតាមគោលការណ៍រៀនអនឡាញ។',
    confidentiality: 'NORMAL',
    priority: 'NORMAL',
    status: 'LOGGED',
    remarks: 'បានផ្ញើតាមរយៈសារអេឡិចត្រូនិច និងចម្លងរឹងរួចរាល់',
    createdBy: 'ឆៃ វណ្ណ',
    updatedBy: 'លឹម ហេង',
    createdAt: '2026-07-04T11:00:00',
    tags: [INITIAL_TAGS[3], INITIAL_TAGS[4]],
    files: [
      {
        id: 102,
        fileName: 'NU-CIR-2026-088_Elearning_Implementation.pdf',
        filePath: '/documents/2026/07/NU-CIR-2026-088.pdf',
        mimeType: 'application/pdf',
        fileSize: '2.05 MB',
        isPrimary: true,
        uploadedBy: 'លឹម ហេង',
      },
    ],
    logs: [
      {
        id: 202,
        officerName: 'ឆៃ វណ្ណ',
        action: 'CREATE',
        description: 'បានបង្កើតសេចក្តីព្រាងសារាចរ',
        createdAt: '2026-07-04 11:00',
      },
      {
        id: 203,
        officerName: 'លឹម ហេង',
        action: 'UPDATE',
        description: 'បានអនុម័តមាតិកា និងផ្លាស់ប្តូរស្ថានភាពទៅជាបានផ្ញើ (SENT)',
        createdAt: '2026-07-04 15:30',
      },
    ],
  },
  {
    id: 3,
    uuid: 'ec0e3860-23fe-4318-87ee-843e498c8dfa',
    direction: 'INTERNAL',
    documentType: INITIAL_TYPES[2],
    senderOrganization: INITIAL_ORGS[2],
    receiverOrganization: INITIAL_ORGS[2],
    documentNumber: 'NU-MEMO-IT-004',
    documentDate: '2026-07-06',
    subject: 'គម្រោងថវិកាសម្ងាត់សម្រាប់ការធ្វើបច្ចុប្បន្នភាពហេដ្ឋារចនាសម្ព័ន្ធ IT',
    summary:
      'សំណើថវិកាលម្អិតសម្រាប់ការផ្លាស់ប្តូរ Server ថ្មី និងការទិញឧបករណ៍ការពារសុវត្ថិភាព Firewall។',
    confidentiality: 'CONFIDENTIAL',
    priority: 'CRITICAL',
    status: 'PENDING',
    remarks: 'កំពុងរង់ចាំការពិនិត្យពីគណៈកម្មការនាយក',
    createdBy: 'លឹម ហេង',
    createdAt: '2026-07-06T17:25:00',
    tags: [INITIAL_TAGS[1], INITIAL_TAGS[2]],
    files: [],
    logs: [
      {
        id: 204,
        officerName: 'លឹម ហេង',
        action: 'CREATE',
        description: 'បានបង្កើតសេចក្តីព្រាងអនុស្សរណៈផ្ទៃក្នុងសម្ងាត់',
        createdAt: '2026-07-06 17:25',
      },
    ],
  },
];

const LOCAL_STORAGE_KEY = 'g_affairs_documents';

export function getStoredDocuments(): DocumentItem[] {
  if (typeof window === 'undefined') return INITIAL_DOCUMENTS;
  const val = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!val) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_DOCUMENTS));
    return INITIAL_DOCUMENTS;
  }
  try {
    return JSON.parse(val);
  } catch (e) {
    return INITIAL_DOCUMENTS;
  }
}

export function saveStoredDocuments(docs: DocumentItem[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(docs));
  // Dispatch custom event to sync states
  window.dispatchEvent(new Event('document-store-update'));
}
