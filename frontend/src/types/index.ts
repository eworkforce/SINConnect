/**
 * TypeScript Type Definitions
 * StrokeTraining Platform v2.0 - Frontend
 * 
 * These types should match the backend types exactly
 */

// Re-export Firebase types that we need in the frontend
export type { Timestamp } from "firebase/firestore";

// =============================================================================
// USER TYPES
// =============================================================================

export type UserRole = "attendee" | "specialist" | "admin" | "stakeholder";

export interface UserProfile {
  name: string;
  hospital: string;
  specialization?: string;
  phoneNumber?: string;
  profilePhoto?: string;
  region?: string; // For geographical impact analysis
}

export interface UserPreferences {
  language: "fr"; // French only for this platform
  notifications: {
    email: boolean;
    forum: boolean;
    documents: boolean;
    impact: boolean;
  };
}

export interface User {
  id: string; // This will be the Firebase Auth UID
  email: string;
  role: UserRole;
  profile: UserProfile;
  preferences: UserPreferences;
  metadata: {
    createdAt: any; // Timestamp
    lastLogin?: any; // Timestamp
    emailVerified: boolean;
    isActive: boolean;
    lastImpactSubmission?: any; // Timestamp
  };
}

// =============================================================================
// DOCUMENT MANAGEMENT TYPES
// =============================================================================

// Document Categories for Healthcare Content
export type DocumentCategory = 
  | 'clinical-guidelines'
  | 'training-materials'
  | 'case-studies'
  | 'best-practices'
  | 'research-papers'
  | 'policy-documents'
  | 'presentations'
  | 'videos'
  | 'infographics'
  | 'assessments';

// Document Status for Approval Workflow
export type DocumentStatus = 
  | 'draft'
  | 'pending-review'
  | 'approved'
  | 'rejected'
  | 'archived'
  | 'under-revision';

// File Types Supported
export type SupportedFileType = 
  | 'application/pdf'
  | 'application/msword'
  | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  | 'application/vnd.ms-powerpoint'
  | 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  | 'image/jpeg'
  | 'image/png'
  | 'video/mp4'
  | 'video/webm';

// Document Priority for Healthcare Context
export type DocumentPriority = 'low' | 'normal' | 'high' | 'critical';

// Document Language Support
export type DocumentLanguage = 'fr' | 'en';

// Document Metadata for Healthcare Context
export interface DocumentMetadata {
  // Core metadata
  createdAt: any; // Timestamp
  updatedAt: any; // Timestamp
  publishedAt?: any; // Timestamp
  lastAccessedAt?: any; // Timestamp
  
  // File information
  fileSize: number; // in bytes
  fileName: string;
  originalFileName: string;
  mimeType: SupportedFileType;
  checksum: string; // MD5 hash for duplicate detection
  
  // Engagement metrics
  viewCount: number;
  downloadCount: number;
  shareCount: number;
  bookmarkCount: number;
  
  // Content analysis
  wordCount?: number;
  pageCount?: number;
  duration?: number; // for videos in seconds
  
  // Healthcare specific
  medicalSpecialty?: string[];
  targetAudience?: UserRole[];
  difficultyLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  cmeCredits?: number; // Continuing Medical Education credits
}

// Document Access Control
export interface DocumentAccess {
  isPublic: boolean;
  allowedRoles: UserRole[];
  restrictedRegions?: string[];
  requiresApproval: boolean;
  embargoUntil?: any; // Timestamp for delayed publication
  expiresAt?: any; // Timestamp for automatic archival
}

// Document Version Information
export interface DocumentVersion {
  versionNumber: string; // e.g., "1.0", "1.1", "2.0"
  versionNotes: string;
  createdAt: any; // Timestamp
  createdBy: string; // User ID
  previousVersionId?: string;
  isLatest: boolean;
  fileUrl: string;
  fileSize: number;
}

// Document Review Information
export interface DocumentReview {
  id: string;
  documentId: string;
  reviewerId: string;
  status: 'pending' | 'approved' | 'rejected' | 'needs-revision';
  reviewNotes?: string;
  reviewedAt: any; // Timestamp
  reviewCriteria: {
    contentAccuracy: number; // 1-5 rating
    clinicalRelevance: number; // 1-5 rating
    presentationQuality: number; // 1-5 rating
    languageClarity: number; // 1-5 rating
  };
}

// Main Document Interface
export interface Document {
  id: string;
  
  // Basic Information
  title: string;
  description: string;
  summary?: string; // Brief summary for listings
  
  // Categorization
  category: DocumentCategory;
  tags: string[];
  keywords: string[]; // For search optimization
  
  // File Information
  fileUrl: string;
  thumbnailUrl?: string;
  previewUrl?: string; // For PDF preview
  
  // Version Control
  version: string;
  versions: DocumentVersion[];
  
  // Authorship
  createdBy: string; // User ID
  authorName: string; // Display name
  authorCredentials?: string;
  contributors?: string[]; // User IDs
  
  // Status & Approval
  status: DocumentStatus;
  priority: DocumentPriority;
  language: DocumentLanguage;
  
  // Access Control
  access: DocumentAccess;
  
  // Metadata
  metadata: DocumentMetadata;
  
  // Review Process
  reviews?: DocumentReview[];
  
  // Healthcare Specific
  medicalDisclaimer?: string;
  clinicalEvidence?: string;
  lastReviewDate?: any; // Timestamp
  nextReviewDue?: any; // Timestamp
}

// Document Collection/Folder Structure
export interface DocumentCollection {
  id: string;
  name: string;
  description: string;
  category: DocumentCategory;
  parentId?: string; // For nested collections
  documentIds: string[];
  createdBy: string;
  createdAt: any; // Timestamp
  isPublic: boolean;
  allowedRoles: UserRole[];
}

// Document Search & Filtering
export interface DocumentSearchFilters {
  query?: string;
  categories?: DocumentCategory[];
  tags?: string[];
  status?: DocumentStatus[];
  language?: DocumentLanguage;
  priority?: DocumentPriority[];
  authorIds?: string[];
  dateRange?: {
    from?: any; // Timestamp
    to?: any; // Timestamp
  };
  fileTypes?: SupportedFileType[];
  difficultyLevel?: ('beginner' | 'intermediate' | 'advanced' | 'expert')[];
  medicalSpecialty?: string[];
  hasVideo?: boolean;
  hasCMECredits?: boolean;
}

export interface DocumentSearchResult {
  documents: Document[];
  totalCount: number;
  facets: {
    categories: { [key in DocumentCategory]?: number };
    tags: { [key: string]: number };
    authors: { [key: string]: number };
    fileTypes: { [key in SupportedFileType]?: number };
  };
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Document Analytics
export interface DocumentAnalytics {
  documentId: string;
  totalViews: number;
  totalDownloads: number;
  totalShares: number;
  totalBookmarks: number;
  uniqueViewers: number;
  averageViewDuration?: number; // for videos
  viewsByRole: { [key in UserRole]?: number };
  viewsByRegion: { [key: string]: number };
  viewsOverTime: {
    date: string; // YYYY-MM-DD
    views: number;
    downloads: number;
  }[];
  topReferrers: {
    source: string;
    count: number;
  }[];
}

// Document Activity Log
export interface DocumentActivity {
  id: string;
  documentId: string;
  userId: string;
  action: 'view' | 'download' | 'share' | 'bookmark' | 'comment' | 'rate';
  metadata?: {
    duration?: number; // for view duration
    page?: number; // for PDF page tracking
    rating?: number; // for ratings
    comment?: string; // for comments
  };
  timestamp: any; // Timestamp
  userAgent?: string;
  ipAddress?: string;
}

// Document Rating & Reviews
export interface DocumentRating {
  id: string;
  documentId: string;
  userId: string;
  rating: number; // 1-5 stars
  review?: string;
  isAnonymous: boolean;
  helpfulVotes: number;
  createdAt: any; // Timestamp
  updatedAt?: any; // Timestamp
}

// Document Upload Progress
export interface DocumentUploadProgress {
  fileName: string;
  progress: number; // 0-100
  status: 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
  uploadedBytes: number;
  totalBytes: number;
  estimatedTimeRemaining?: number;
}

// =============================================================================
// FORUM TYPES
// =============================================================================

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  authorId: string;
  category: string;
  tags: string[];
  isAnonymous: boolean;
  metadata: {
    createdAt: any; // Timestamp
    updatedAt?: any; // Timestamp
    viewCount: number;
    replyCount: number;
    upvoteCount: number;
    isSticky: boolean;
    isClosed: boolean;
  };
}

export interface ForumReply {
  id: string;
  postId: string;
  content: string;
  authorId: string;
  parentReplyId?: string; // For nested replies
  isAnonymous: boolean;
  metadata: {
    createdAt: any; // Timestamp
    updatedAt?: any; // Timestamp
    upvoteCount: number;
    isAccepted: boolean; // For marking as helpful
  };
}

// =============================================================================
// NOTIFICATION TYPES
// =============================================================================

export interface Notification {
  id: string;
  userId: string;
  type: "document" | "forum" | "message" | "impact" | "system";
  title: string;
  message: string;
  actionUrl?: string;
  data?: Record<string, unknown>; // Additional context data
  metadata: {
    createdAt: any; // Timestamp
    readAt?: any; // Timestamp
    isRead: boolean;
    priority: "low" | "normal" | "high";
  };
}

// =============================================================================
// FORM TYPES
// =============================================================================

export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  profile: Omit<UserProfile, "profilePhoto">;
  requestedRole: UserRole;
  consent: boolean;
}

// Document Upload Form
export interface DocumentUploadForm {
  title: string;
  description: string;
  summary?: string;
  category: DocumentCategory;
  tags: string[];
  keywords: string[];
  priority: DocumentPriority;
  language: DocumentLanguage;
  medicalSpecialty?: string[];
  targetAudience?: UserRole[];
  difficultyLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  cmeCredits?: number;
  medicalDisclaimer?: string;
  clinicalEvidence?: string;
  authorCredentials?: string;
  isPublic: boolean;
  allowedRoles: UserRole[];
  requiresApproval: boolean;
  embargoUntil?: Date;
  expiresAt?: Date;
}

// Document Edit Form
export interface DocumentEditForm extends Omit<DocumentUploadForm, 'isPublic' | 'allowedRoles'> {
  id: string;
  versionNotes?: string;
  access: {
    isPublic: boolean;
    allowedRoles: UserRole[];
    restrictedRegions?: string[];
    requiresApproval: boolean;
    embargoUntil?: Date;
    expiresAt?: Date;
  };
}

// Document Search Form
export interface DocumentSearchForm {
  query: string;
  categories: DocumentCategory[];
  tags: string[];
  status: DocumentStatus[];
  language: DocumentLanguage;
  priority: DocumentPriority[];
  dateFrom?: Date;
  dateTo?: Date;
  fileTypes: SupportedFileType[];
  difficultyLevels: ('beginner' | 'intermediate' | 'advanced' | 'expert')[];
  medicalSpecialties: string[];
  hasVideo: boolean;
  hasCMECredits: boolean;
  sortBy: 'relevance' | 'date' | 'title' | 'author' | 'views' | 'downloads';
  sortOrder: 'asc' | 'desc';
}

// Document Review Form
export interface DocumentReviewForm {
  documentId: string;
  status: 'approved' | 'rejected' | 'needs-revision';
  reviewNotes: string;
  contentAccuracy: number; // 1-5
  clinicalRelevance: number; // 1-5
  presentationQuality: number; // 1-5
  languageClarity: number; // 1-5
}

// Document Rating Form
export interface DocumentRatingForm {
  documentId: string;
  rating: number; // 1-5
  review?: string;
  isAnonymous: boolean;
}

// =============================================================================
// API RESPONSE TYPES
// =============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  timestamp: any; // Timestamp
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// =============================================================================
// UI TYPES
// =============================================================================

export interface NavItem {
  label: string;
  path: string;
  icon?: string;
  roles?: UserRole[];
  children?: NavItem[];
}

export interface Theme {
  mode: "light" | "dark";
  primaryColor: string;
  secondaryColor: string;
}

export interface AppState {
  user: User | null;
  isLoading: boolean;
  theme: Theme;
  notifications: Notification[];
}