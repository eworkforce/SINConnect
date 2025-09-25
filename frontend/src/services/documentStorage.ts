/**
 * Document Storage Service
 * StrokeTraining Platform v2.0
 * 
 * Handles all Firebase Storage operations for document management
 */

import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  getMetadata,
  listAll,
} from 'firebase/storage';
import type { UploadTask } from 'firebase/storage';
import { storage } from './firebase';
import type { 
  DocumentUploadProgress,
  DocumentCategory,
  SupportedFileType,
} from '../types';

// =============================================================================
// STORAGE PATH UTILITIES
// =============================================================================

/**
 * Generate storage path for document files
 */
export const getDocumentPath = (
  category: DocumentCategory,
  documentId: string,
  version: string,
  fileName: string
): string => {
  return `documents/${category}/${documentId}/${version}/${fileName}`;
};

/**
 * Generate storage path for document thumbnails
 */
export const getThumbnailPath = (
  category: DocumentCategory,
  documentId: string,
  fileName: string
): string => {
  return `documents/${category}/${documentId}/thumbnails/${fileName}`;
};

/**
 * Generate storage path for document previews
 */
export const getPreviewPath = (
  category: DocumentCategory,
  documentId: string,
  fileName: string
): string => {
  return `documents/${category}/${documentId}/previews/${fileName}`;
};

/**
 * Generate storage path for temporary uploads
 */
export const getTempUploadPath = (
  userId: string,
  uploadId: string,
  fileName: string
): string => {
  return `temp/${userId}/${uploadId}/${fileName}`;
};

/**
 * Generate storage path for user profile images
 */
export const getProfileImagePath = (
  userId: string,
  fileName: string
): string => {
  return `users/${userId}/profile/${fileName}`;
};

// =============================================================================
// FILE VALIDATION
// =============================================================================

/**
 * Validate file type against supported types
 */
export const validateFileType = (file: File): boolean => {
  const supportedTypes: SupportedFileType[] = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'image/jpeg',
    'image/png',
    'video/mp4',
    'video/webm'
  ];
  
  return supportedTypes.includes(file.type as SupportedFileType);
};

/**
 * Validate file size based on role and file type
 */
export const validateFileSize = (file: File, userRole: string): { valid: boolean; error?: string } => {
  const fileSizeMB = file.size / (1024 * 1024);
  
  // Define size limits based on user role
  let maxSizeMB: number;
  switch (userRole) {
    case 'admin':
      maxSizeMB = 500;
      break;
    case 'specialist':
      maxSizeMB = 100;
      break;
    default:
      maxSizeMB = 10;
  }
  
  // Special handling for videos (larger limits)
  if (file.type.startsWith('video/')) {
    if (userRole === 'admin') {
      maxSizeMB = 500;
    } else if (userRole === 'specialist') {
      maxSizeMB = 200;
    } else {
      maxSizeMB = 50;
    }
  }
  
  // Check minimum size (1KB)
  if (file.size < 1024) {
    return { valid: false, error: 'Le fichier doit faire au moins 1KB' };
  }
  
  // Check maximum size
  if (fileSizeMB > maxSizeMB) {
    return { valid: false, error: `Le fichier ne peut pas dépasser ${maxSizeMB}MB` };
  }
  
  return { valid: true };
};

/**
 * Generate safe file name for storage
 */
export const generateSafeFileName = (originalName: string): string => {
  // Remove or replace unsafe characters
  const safeName = originalName
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
  
  // Add timestamp to prevent conflicts
  const timestamp = Date.now();
  const nameWithoutExt = safeName.substring(0, safeName.lastIndexOf('.'));
  const extension = safeName.substring(safeName.lastIndexOf('.'));
  
  return `${nameWithoutExt}_${timestamp}${extension}`;
};

/**
 * Generate MD5 checksum for file (for duplicate detection)
 */
export const generateFileChecksum = async (file: File): Promise<string> => {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('MD5', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

// =============================================================================
// UPLOAD OPERATIONS
// =============================================================================

/**
 * Upload document file with progress tracking
 */
export const uploadDocument = (
  file: File,
  category: DocumentCategory,
  documentId: string,
  version: string,
  onProgress?: (progress: DocumentUploadProgress) => void
): Promise<{ downloadURL: string; metadata: any }> => {
  return new Promise((resolve, reject) => {
    const safeFileName = generateSafeFileName(file.name);
    const storagePath = getDocumentPath(category, documentId, version, safeFileName);
    const storageRef = ref(storage, storagePath);
    
    // Custom metadata
    const metadata = {
      customMetadata: {
        originalName: file.name,
        category,
        documentId,
        version,
        uploadedAt: new Date().toISOString(),
      }
    };
    
    const uploadTask: UploadTask = uploadBytesResumable(storageRef, file, metadata);
    
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        const status = snapshot.state === 'running' ? 'uploading' : 
                      snapshot.state === 'paused' ? 'uploading' : 'processing';
        
        if (onProgress) {
          onProgress({
            fileName: file.name,
            progress,
            status,
            uploadedBytes: snapshot.bytesTransferred,
            totalBytes: snapshot.totalBytes,
            estimatedTimeRemaining: calculateETA(
              snapshot.bytesTransferred, 
              snapshot.totalBytes, 
              Date.now() - (uploadTask.snapshot.metadata?.timeCreated ? new Date(uploadTask.snapshot.metadata.timeCreated).getTime() : Date.now())
            ),
          });
        }
      },
      (error) => {
        let errorMessage = 'Erreur lors du téléchargement';
        
        switch (error.code) {
          case 'storage/unauthorized':
            errorMessage = 'Non autorisé à télécharger ce fichier';
            break;
          case 'storage/canceled':
            errorMessage = 'Téléchargement annulé';
            break;
          case 'storage/unknown':
            errorMessage = 'Erreur inconnue lors du téléchargement';
            break;
          case 'storage/retry-limit-exceeded':
            errorMessage = 'Limite de tentatives dépassée';
            break;
          case 'storage/invalid-checksum':
            errorMessage = 'Fichier corrompu';
            break;
        }
        
        if (onProgress) {
          onProgress({
            fileName: file.name,
            progress: 0,
            status: 'error',
            error: errorMessage,
            uploadedBytes: 0,
            totalBytes: file.size,
          });
        }
        
        reject(new Error(errorMessage));
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          const fileMetadata = await getMetadata(uploadTask.snapshot.ref);
          
          if (onProgress) {
            onProgress({
              fileName: file.name,
              progress: 100,
              status: 'completed',
              uploadedBytes: file.size,
              totalBytes: file.size,
            });
          }
          
          resolve({ downloadURL, metadata: fileMetadata });
        } catch (error) {
          reject(error);
        }
      }
    );
  });
};

/**
 * Upload temporary file (for preview before final upload)
 */
export const uploadTempFile = (
  file: File,
  userId: string,
  uploadId: string,
  onProgress?: (progress: DocumentUploadProgress) => void
): Promise<{ downloadURL: string; path: string }> => {
  return new Promise((resolve, reject) => {
    const safeFileName = generateSafeFileName(file.name);
    const storagePath = getTempUploadPath(userId, uploadId, safeFileName);
    const storageRef = ref(storage, storagePath);
    
    const metadata = {
      customMetadata: {
        originalName: file.name,
        userId,
        uploadId,
        isTemporary: 'true',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      }
    };
    
    const uploadTask: UploadTask = uploadBytesResumable(storageRef, file, metadata);
    
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        
        if (onProgress) {
          onProgress({
            fileName: file.name,
            progress,
            status: 'uploading',
            uploadedBytes: snapshot.bytesTransferred,
            totalBytes: snapshot.totalBytes,
          });
        }
      },
      (error) => {
        if (onProgress) {
          onProgress({
            fileName: file.name,
            progress: 0,
            status: 'error',
            error: error.message,
            uploadedBytes: 0,
            totalBytes: file.size,
          });
        }
        reject(error);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          
          if (onProgress) {
            onProgress({
              fileName: file.name,
              progress: 100,
              status: 'completed',
              uploadedBytes: file.size,
              totalBytes: file.size,
            });
          }
          
          resolve({ downloadURL, path: storagePath });
        } catch (error) {
          reject(error);
        }
      }
    );
  });
};

/**
 * Upload profile image
 */
export const uploadProfileImage = (
  file: File,
  userId: string,
  onProgress?: (progress: number) => void
): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Validate image file
    if (!file.type.startsWith('image/')) {
      reject(new Error('Le fichier doit être une image'));
      return;
    }
    
    // Check file size (5MB max for profile images)
    if (file.size > 5 * 1024 * 1024) {
      reject(new Error('L\'image ne peut pas dépasser 5MB'));
      return;
    }
    
    const fileName = `avatar_${Date.now()}.${file.name.split('.').pop()}`;
    const storagePath = getProfileImagePath(userId, fileName);
    const storageRef = ref(storage, storagePath);
    
    const uploadTask = uploadBytesResumable(storageRef, file);
    
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) {
          onProgress(progress);
        }
      },
      reject,
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        } catch (error) {
          reject(error);
        }
      }
    );
  });
};

// =============================================================================
// DOWNLOAD OPERATIONS
// =============================================================================

/**
 * Get document download URL
 */
export const getDocumentDownloadURL = async (
  category: DocumentCategory,
  documentId: string,
  version: string,
  fileName: string
): Promise<string> => {
  const storagePath = getDocumentPath(category, documentId, version, fileName);
  const storageRef = ref(storage, storagePath);
  return await getDownloadURL(storageRef);
};

/**
 * Get document metadata
 */
export const getDocumentMetadata = async (
  category: DocumentCategory,
  documentId: string,
  version: string,
  fileName: string
): Promise<any> => {
  const storagePath = getDocumentPath(category, documentId, version, fileName);
  const storageRef = ref(storage, storagePath);
  return await getMetadata(storageRef);
};

// =============================================================================
// DELETE OPERATIONS
// =============================================================================

/**
 * Delete document file
 */
export const deleteDocument = async (
  category: DocumentCategory,
  documentId: string,
  version: string,
  fileName: string
): Promise<void> => {
  const storagePath = getDocumentPath(category, documentId, version, fileName);
  const storageRef = ref(storage, storagePath);
  await deleteObject(storageRef);
};

/**
 * Delete temporary file
 */
export const deleteTempFile = async (
  userId: string,
  uploadId: string,
  fileName: string
): Promise<void> => {
  const storagePath = getTempUploadPath(userId, uploadId, fileName);
  const storageRef = ref(storage, storagePath);
  await deleteObject(storageRef);
};

/**
 * Delete all versions of a document
 */
export const deleteAllDocumentVersions = async (
  category: DocumentCategory,
  documentId: string
): Promise<void> => {
  const basePath = `documents/${category}/${documentId}`;
  const baseRef = ref(storage, basePath);
  
  // List all files in the document folder
  const result = await listAll(baseRef);
  
  // Delete all files
  const deletePromises = result.items.map(itemRef => deleteObject(itemRef));
  await Promise.all(deletePromises);
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Calculate estimated time remaining for upload
 */
const calculateETA = (
  bytesTransferred: number,
  totalBytes: number,
  timeElapsed: number
): number => {
  if (bytesTransferred === 0) return 0;
  
  const bytesRemaining = totalBytes - bytesTransferred;
  const bytesPerMs = bytesTransferred / timeElapsed;
  const msRemaining = bytesRemaining / bytesPerMs;
  
  return Math.round(msRemaining / 1000); // Return in seconds
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

/**
 * Get file extension from file name
 */
export const getFileExtension = (fileName: string): string => {
  return fileName.slice((fileName.lastIndexOf('.') - 1 >>> 0) + 2);
};

/**
 * Check if file type supports preview
 */
export const supportsPreview = (fileType: string): boolean => {
  const previewableTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'video/mp4',
    'video/webm'
  ];
  
  return previewableTypes.includes(fileType);
};

export default {
  // Upload operations
  uploadDocument,
  uploadTempFile,
  uploadProfileImage,
  
  // Download operations
  getDocumentDownloadURL,
  getDocumentMetadata,
  
  // Delete operations
  deleteDocument,
  deleteTempFile,
  deleteAllDocumentVersions,
  
  // Validation utilities
  validateFileType,
  validateFileSize,
  generateSafeFileName,
  generateFileChecksum,
  
  // Path utilities
  getDocumentPath,
  getThumbnailPath,
  getPreviewPath,
  getTempUploadPath,
  getProfileImagePath,
  
  // Utility functions
  formatFileSize,
  getFileExtension,
  supportsPreview,
};