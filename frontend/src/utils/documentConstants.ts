/**
 * Document Management Constants
 * StrokeTraining Platform v2.0
 */

import type { 
  DocumentCategory, 
  SupportedFileType, 
  DocumentStatus, 
  DocumentPriority,
  UserRole 
} from '../types';

// =============================================================================
// DOCUMENT CATEGORIES
// =============================================================================

export const DOCUMENT_CATEGORIES: Record<DocumentCategory, { 
  label: string; 
  description: string; 
  icon: string;
  color: string;
}> = {
  'clinical-guidelines': {
    label: 'Recommandations cliniques',
    description: 'Protocoles et guides de pratique clinique',
    icon: 'LocalHospital',
    color: '#1976d2',
  },
  'training-materials': {
    label: 'Matériel de formation',
    description: 'Ressources pédagogiques et supports de cours',
    icon: 'School',
    color: '#2e7d32',
  },
  'case-studies': {
    label: 'Études de cas',
    description: 'Cas cliniques et analyses détaillées',
    icon: 'Assignment',
    color: '#ed6c02',
  },
  'best-practices': {
    label: 'Bonnes pratiques',
    description: 'Recommandations et conseils pratiques',
    icon: 'Stars',
    color: '#9c27b0',
  },
  'research-papers': {
    label: 'Articles de recherche',
    description: 'Publications scientifiques et études',
    icon: 'Science',
    color: '#d32f2f',
  },
  'policy-documents': {
    label: 'Documents de politique',
    description: 'Politiques institutionnelles et réglementaires',
    icon: 'Policy',
    color: '#689f38',
  },
  'presentations': {
    label: 'Présentations',
    description: 'Diapositives et supports de présentation',
    icon: 'Slideshow',
    color: '#0288d1',
  },
  'videos': {
    label: 'Vidéos',
    description: 'Contenu vidéo éducatif',
    icon: 'PlayArrow',
    color: '#f57c00',
  },
  'infographics': {
    label: 'Infographies',
    description: 'Supports visuels et schémas',
    icon: 'ImageSearch',
    color: '#7b1fa2',
  },
  'assessments': {
    label: 'Évaluations',
    description: 'Tests et questionnaires d\'évaluation',
    icon: 'Quiz',
    color: '#5d4037',
  },
};

// =============================================================================
// FILE TYPES CONFIGURATION
// =============================================================================

export const FILE_TYPE_CONFIG: Record<SupportedFileType, {
  label: string;
  extensions: string[];
  maxSize: number; // in MB
  icon: string;
  color: string;
  previewSupported: boolean;
}> = {
  'application/pdf': {
    label: 'PDF',
    extensions: ['.pdf'],
    maxSize: 50,
    icon: 'PictureAsPdf',
    color: '#d32f2f',
    previewSupported: true,
  },
  'application/msword': {
    label: 'Word (Legacy)',
    extensions: ['.doc'],
    maxSize: 25,
    icon: 'Description',
    color: '#1976d2',
    previewSupported: false,
  },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
    label: 'Word Document',
    extensions: ['.docx'],
    maxSize: 25,
    icon: 'Description',
    color: '#1976d2',
    previewSupported: false,
  },
  'application/vnd.ms-powerpoint': {
    label: 'PowerPoint (Legacy)',
    extensions: ['.ppt'],
    maxSize: 100,
    icon: 'Slideshow',
    color: '#d84315',
    previewSupported: false,
  },
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': {
    label: 'PowerPoint',
    extensions: ['.pptx'],
    maxSize: 100,
    icon: 'Slideshow',
    color: '#d84315',
    previewSupported: false,
  },
  'image/jpeg': {
    label: 'Image JPEG',
    extensions: ['.jpg', '.jpeg'],
    maxSize: 10,
    icon: 'Image',
    color: '#388e3c',
    previewSupported: true,
  },
  'image/png': {
    label: 'Image PNG',
    extensions: ['.png'],
    maxSize: 10,
    icon: 'Image',
    color: '#388e3c',
    previewSupported: true,
  },
  'video/mp4': {
    label: 'Vidéo MP4',
    extensions: ['.mp4'],
    maxSize: 500,
    icon: 'VideoFile',
    color: '#7b1fa2',
    previewSupported: true,
  },
  'video/webm': {
    label: 'Vidéo WebM',
    extensions: ['.webm'],
    maxSize: 500,
    icon: 'VideoFile',
    color: '#7b1fa2',
    previewSupported: true,
  },
};

// =============================================================================
// DOCUMENT STATUS CONFIGURATION
// =============================================================================

export const DOCUMENT_STATUS_CONFIG: Record<DocumentStatus, {
  label: string;
  description: string;
  color: string;
  icon: string;
  allowedTransitions: DocumentStatus[];
}> = {
  'draft': {
    label: 'Brouillon',
    description: 'Document en cours de rédaction',
    color: '#757575',
    icon: 'Edit',
    allowedTransitions: ['pending-review', 'archived'],
  },
  'pending-review': {
    label: 'En attente de révision',
    description: 'Document soumis pour révision',
    color: '#ff9800',
    icon: 'Schedule',
    allowedTransitions: ['approved', 'rejected', 'under-revision', 'draft'],
  },
  'approved': {
    label: 'Approuvé',
    description: 'Document validé et publié',
    color: '#4caf50',
    icon: 'CheckCircle',
    allowedTransitions: ['under-revision', 'archived'],
  },
  'rejected': {
    label: 'Rejeté',
    description: 'Document refusé',
    color: '#f44336',
    icon: 'Cancel',
    allowedTransitions: ['draft', 'under-revision'],
  },
  'under-revision': {
    label: 'En révision',
    description: 'Document en cours de modification',
    color: '#2196f3',
    icon: 'EditNote',
    allowedTransitions: ['pending-review', 'draft'],
  },
  'archived': {
    label: 'Archivé',
    description: 'Document archivé',
    color: '#9e9e9e',
    icon: 'Archive',
    allowedTransitions: ['draft'],
  },
};

// =============================================================================
// DOCUMENT PRIORITIES
// =============================================================================

export const DOCUMENT_PRIORITY_CONFIG: Record<DocumentPriority, {
  label: string;
  description: string;
  color: string;
  icon: string;
  weight: number; // For sorting
}> = {
  'critical': {
    label: 'Critique',
    description: 'Information critique pour la sécurité des patients',
    color: '#d32f2f',
    icon: 'Warning',
    weight: 4,
  },
  'high': {
    label: 'Élevée',
    description: 'Information importante pour la pratique clinique',
    color: '#f57c00',
    icon: 'PriorityHigh',
    weight: 3,
  },
  'normal': {
    label: 'Normale',
    description: 'Information standard',
    color: '#1976d2',
    icon: 'Info',
    weight: 2,
  },
  'low': {
    label: 'Faible',
    description: 'Information complémentaire',
    color: '#388e3c',
    icon: 'InfoOutlined',
    weight: 1,
  },
};

// =============================================================================
// ROLE-BASED PERMISSIONS
// =============================================================================

export const DOCUMENT_PERMISSIONS: Record<UserRole, {
  canUpload: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canApprove: boolean;
  canViewDrafts: boolean;
  canViewAnalytics: boolean;
  canManageCollections: boolean;
  maxFileSize: number; // in MB
  allowedCategories: DocumentCategory[];
}> = {
  'attendee': {
    canUpload: false,
    canEdit: false,
    canDelete: false,
    canApprove: false,
    canViewDrafts: false,
    canViewAnalytics: false,
    canManageCollections: false,
    maxFileSize: 0,
    allowedCategories: [],
  },
  'specialist': {
    canUpload: true,
    canEdit: true,
    canDelete: false,
    canApprove: false,
    canViewDrafts: true,
    canViewAnalytics: true,
    canManageCollections: true,
    maxFileSize: 100,
    allowedCategories: [
      'clinical-guidelines',
      'training-materials',
      'case-studies',
      'best-practices',
      'research-papers',
      'presentations',
      'videos',
      'infographics',
    ],
  },
  'admin': {
    canUpload: true,
    canEdit: true,
    canDelete: true,
    canApprove: true,
    canViewDrafts: true,
    canViewAnalytics: true,
    canManageCollections: true,
    maxFileSize: 500,
    allowedCategories: [
      'clinical-guidelines',
      'training-materials',
      'case-studies',
      'best-practices',
      'research-papers',
      'policy-documents',
      'presentations',
      'videos',
      'infographics',
      'assessments',
    ],
  },
  'stakeholder': {
    canUpload: false,
    canEdit: false,
    canDelete: false,
    canApprove: false,
    canViewDrafts: false,
    canViewAnalytics: true,
    canManageCollections: false,
    maxFileSize: 0,
    allowedCategories: [],
  },
};

// =============================================================================
// UTILITY CONSTANTS
// =============================================================================

export const MEDICAL_SPECIALTIES = [
  'Cardiologie',
  'Neurologie',
  'Médecine interne',
  'Médecine d\'urgence',
  'Radiologie',
  'Pharmacologie',
  'Kinésithérapie',
  'Soins infirmiers',
  'Médecine générale',
  'Gériatrie',
  'Pédiatrie',
  'Psychiatrie',
];

export const DIFFICULTY_LEVELS = {
  'beginner': {
    label: 'Débutant',
    description: 'Niveau d\'introduction',
    color: '#4caf50',
    icon: 'School',
  },
  'intermediate': {
    label: 'Intermédiaire',
    description: 'Connaissances de base requises',
    color: '#ff9800',
    icon: 'MenuBook',
  },
  'advanced': {
    label: 'Avancé',
    description: 'Expertise spécialisée requise',
    color: '#f44336',
    icon: 'Psychology',
  },
  'expert': {
    label: 'Expert',
    description: 'Niveau de spécialiste',
    color: '#9c27b0',
    icon: 'EmojiObjects',
  },
} as const;

export const DEFAULT_SEARCH_FILTERS = {
  query: '',
  categories: [],
  tags: [],
  status: ['approved'] as DocumentStatus[],
  language: 'fr' as const,
  priority: [],
  dateFrom: undefined,
  dateTo: undefined,
  fileTypes: [],
  difficultyLevels: [],
  medicalSpecialties: [],
  hasVideo: false,
  hasCMECredits: false,
  sortBy: 'relevance' as const,
  sortOrder: 'desc' as const,
};

// =============================================================================
// VALIDATION CONSTANTS
// =============================================================================

export const VALIDATION_RULES = {
  TITLE_MIN_LENGTH: 5,
  TITLE_MAX_LENGTH: 200,
  DESCRIPTION_MIN_LENGTH: 20,
  DESCRIPTION_MAX_LENGTH: 1000,
  SUMMARY_MAX_LENGTH: 300,
  MAX_TAGS: 10,
  MAX_KEYWORDS: 20,
  TAG_MAX_LENGTH: 50,
  KEYWORD_MAX_LENGTH: 50,
  MAX_FILE_SIZE_MB: 500,
  MIN_FILE_SIZE_MB: 0.001, // 1KB
  SUPPORTED_LANGUAGES: ['fr', 'en'],
  MAX_CME_CREDITS: 50,
} as const;