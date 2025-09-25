/**
 * StrokeTraining Platform - Database Types
 *
 * TypeScript interfaces for all Firestore collections
 * Based on the PRD requirements and architecture document
 */

import {Timestamp} from "firebase-admin/firestore";

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

export interface UserMetadata {
  createdAt: Timestamp;
  lastLogin?: Timestamp;
  emailVerified: boolean;
  isActive: boolean;
  lastImpactSubmission?: Timestamp;
}

export interface User {
  id: string; // This will be the Firebase Auth UID
  email: string;
  role: UserRole;
  profile: UserProfile;
  preferences: UserPreferences;
  metadata: UserMetadata;
}

// =============================================================================
// DOCUMENT TYPES
// =============================================================================

export interface DocumentMetadata {
  createdAt: Timestamp;
  updatedAt: Timestamp;
  viewCount: number;
  downloadCount: number;
  fileSize: number;
  checksum?: string; // For duplicate detection
}

export interface DocumentAccess {
  isPublic: boolean;
  allowedRoles: UserRole[];
  restrictedRegions?: string[];
}

export interface Document {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  fileUrl: string;
  fileName: string;
  fileType: string; // MIME type
  version: number;
  createdBy: string; // User ID
  metadata: DocumentMetadata;
  access: DocumentAccess;
}

export interface DocumentCategory {
  id: string;
  name: string;
  description: string;
  icon?: string;
  parentCategory?: string; // For hierarchical categories
  sortOrder: number;
  createdAt: Timestamp;
}

// =============================================================================
// IMPACT METRICS TYPES
// =============================================================================

export interface QuantitativeData {
  patientsHelped: number;
  improvementRate: number; // Percentage
  treatmentTimeReduction: number; // In minutes
  diagnosticAccuracyImprovement: number; // Percentage
  protocolsImplemented: number;
  casesHandledCorrectly: number;
}

export interface QualitativeData {
  confidenceLevel: number; // 1-10 scale
  testimonial: string;
  successStories: string[];
  challengesFaced: string[];
  suggestionsForImprovement: string[];
}

export interface ImpactMetadata {
  submittedAt: Timestamp;
  isAnonymized: boolean;
  region: string;
  hospitalType: string; // 'public' | 'private' | 'clinic' | 'other'
  submissionPeriod: string; // YYYY-MM format
  isComplete: boolean;
}

export interface ImpactMetric {
  id: string;
  userId: string;
  quantitativeData: QuantitativeData;
  qualitativeData: QualitativeData;
  metadata: ImpactMetadata;
}

// =============================================================================
// COMMUNICATION TYPES
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
    createdAt: Timestamp;
    updatedAt?: Timestamp;
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
    createdAt: Timestamp;
    updatedAt?: Timestamp;
    upvoteCount: number;
    isAccepted: boolean; // For marking as helpful
  };
}

export interface DirectMessage {
  id: string;
  from: string; // User ID
  to: string; // User ID
  subject?: string;
  content: string;
  attachments?: string[]; // File URLs
  metadata: {
    sentAt: Timestamp;
    readAt?: Timestamp;
    isRead: boolean;
    threadId?: string; // For message threading
  };
}

export interface Notification {
  id: string;
  userId: string;
  type: "document" | "forum" | "message" | "impact" | "system";
  title: string;
  message: string;
  actionUrl?: string;
  data?: Record<string, unknown>; // Additional context data
  metadata: {
    createdAt: Timestamp;
    readAt?: Timestamp;
    isRead: boolean;
    priority: "low" | "normal" | "high";
  };
}

// =============================================================================
// REPORTING TYPES
// =============================================================================

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: "monthly" | "quarterly" | "annual" | "custom";
  sections: string[]; // Report section names
  parameters: Record<string, unknown>;
  createdBy: string;
  createdAt: Timestamp;
}

export interface GeneratedReport {
  id: string;
  templateId: string;
  title: string;
  period: {
    start: Timestamp;
    end: Timestamp;
  };
  data: Record<string, unknown>; // Aggregated data
  fileUrl?: string; // PDF URL if generated
  metadata: {
    generatedAt: Timestamp;
    generatedBy: string;
    isAnonymized: boolean;
    recipientRoles: UserRole[];
    status: "generating" | "completed" | "failed";
  };
}

// =============================================================================
// ADMIN TYPES
// =============================================================================

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string; // e.g., "user", "document", "role"
  resourceId: string;
  changes?: Record<string, unknown>; // What changed
  metadata: {
    timestamp: Timestamp;
    userAgent?: string;
    ipAddress?: string;
    success: boolean;
    errorMessage?: string;
  };
}

export interface SystemSettings {
  id: string;
  category: string; // e.g., "email", "notifications", "content"
  settings: Record<string, unknown>;
  updatedBy: string;
  updatedAt: Timestamp;
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

export interface EmailTemplate {
  id: string;
  name: string;
  type: "welcome" | "verification" | "password_reset" |
    "notification" | "digest";
  language: "fr";
  subject: string;
  htmlBody: string;
  textBody: string;
  variables: string[]; // List of template variables
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FileUpload {
  id: string;
  originalName: string;
  fileName: string;
  mimeType: string;
  size: number;
  path: string;
  uploadedBy: string;
  uploadedAt: Timestamp;
  isProcessed: boolean;
  processingStatus?: "pending" | "processing" | "completed" | "failed";
}

// =============================================================================
// ANALYTICS TYPES
// =============================================================================

export interface UserActivity {
  userId: string;
  sessionId: string;
  action: string;
  resource?: string;
  timestamp: Timestamp;
  duration?: number; // In seconds
  metadata?: Record<string, unknown>;
}

export interface PlatformMetrics {
  date: string; // YYYY-MM-DD format
  metrics: {
    activeUsers: number;
    newUsers: number;
    documentsViewed: number;
    documentsUploaded: number;
    forumPosts: number;
    impactSubmissions: number;
    avgSessionDuration: number;
  };
  updatedAt: Timestamp;
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
  timestamp: Timestamp;
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
// FORM DATA TYPES
// =============================================================================

export interface RegistrationData {
  email: string;
  password: string;
  profile: Omit<UserProfile, "profilePhoto">;
  requestedRole: UserRole;
  consent: boolean;
}

export interface ImpactDataSubmission {
  quantitativeData: Partial<QuantitativeData>;
  qualitativeData: Partial<QualitativeData>;
  submissionPeriod: string;
  isComplete: boolean;
}

export interface DocumentUploadData {
  title: string;
  description: string;
  category: string;
  tags: string[];
  isPublic: boolean;
  allowedRoles: UserRole[];
}

// =============================================================================
// CONSTANTS
// =============================================================================

export const USER_ROLES = [
  "attendee", "specialist", "admin", "stakeholder",
] as const;

export const DOCUMENT_CATEGORIES = [
  "clinical-guidelines",
  "research-papers",
  "case-studies",
  "training-materials",
  "protocols",
  "presentations",
  "other",
] as const;

export const NOTIFICATION_TYPES = [
  "document",
  "forum",
  "message",
  "impact",
  "system",
] as const;

export const SUPPORTED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument." +
    "wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument." +
    "presentationml.presentation",
  "image/jpeg",
  "image/png",
  "image/gif",
] as const;

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB in bytes

export const IMPACT_METRICS_FIELDS = {
  quantitative: [
    "patientsHelped",
    "improvementRate",
    "treatmentTimeReduction",
    "diagnosticAccuracyImprovement",
    "protocolsImplemented",
    "casesHandledCorrectly",
  ],
  qualitative: [
    "confidenceLevel",
    "testimonial",
    "successStories",
    "challengesFaced",
    "suggestionsForImprovement",
  ],
} as const;
