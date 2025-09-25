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
// DOCUMENT TYPES
// =============================================================================

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
  metadata: {
    createdAt: any; // Timestamp
    updatedAt: any; // Timestamp
    viewCount: number;
    downloadCount: number;
    fileSize: number;
    checksum?: string; // For duplicate detection
  };
  access: {
    isPublic: boolean;
    allowedRoles: UserRole[];
    restrictedRegions?: string[];
  };
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