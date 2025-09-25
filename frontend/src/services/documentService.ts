/**
 * Document Service
 * Handles both Firebase Storage uploads and Firestore metadata creation
 */

import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { firestore } from './firebase';
import { 
  uploadDocument as uploadToStorage, 
  deleteDocument as deleteFromStorage,
  getDocumentDownloadURL 
} from './documentStorage';
import type { 
  DocumentUploadProgress,
  DocumentCategory,
  DocumentStatus,
  DocumentPriority,
  UserRole 
} from '../types';

// Document metadata interface for Firestore
interface DocumentMetadata {
  id: string;
  title: string;
  description: string;
  summary?: string;
  category: DocumentCategory;
  tags: string[];
  priority: DocumentPriority;
  
  // File information
  fileName: string;
  fileSize: number;
  fileType: string;
  downloadURL: string;
  storagePath: string;
  
  // Content metadata
  language: string;
  medicalSpecialty?: string[];
  targetAudience: UserRole[];
  difficultyLevel: string;
  cmeCredits: number;
  
  // Medical/Legal
  medicalDisclaimer?: string;
  clinicalEvidence?: string;
  authorCredentials?: string;
  
  // Access control
  access: {
    isPublic: boolean;
    allowedRoles: UserRole[];
    requiresApproval: boolean;
  };
  
  // Versioning
  version: number;
  previousVersionId?: string;
  
  // Status tracking
  status: DocumentStatus;
  
  // Audit fields
  createdBy: string;
  createdAt: any; // serverTimestamp
  updatedBy?: string;
  updatedAt?: any; // serverTimestamp
  approvedBy?: string;
  approvedAt?: any; // serverTimestamp
  
  // Metadata
  metadata: {
    createdAt: any; // serverTimestamp  
    updatedAt?: any; // serverTimestamp
    viewCount: number;
    downloadCount: number;
    rating: number;
    ratingCount: number;
  };
}

/**
 * Upload document with both file and metadata
 */
export const uploadDocumentWithMetadata = async (
  file: File,
  metadata: Omit<DocumentMetadata, 'id' | 'fileName' | 'fileSize' | 'fileType' | 'downloadURL' | 'storagePath' | 'createdAt' | 'updatedAt' | 'metadata'>,
  userId: string,
  onProgress?: (progress: DocumentUploadProgress) => void
): Promise<{ documentId: string; downloadURL: string }> => {
  console.log('📝 Starting document upload with metadata...', { fileName: file.name, userId });
  
  try {
    const documentId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Step 1: Upload file to Storage
    console.log('📤 Uploading file to Storage...');
    const storageResult = await uploadToStorage(
      file,
      metadata.category,
      documentId,
      metadata.version.toString(),
      onProgress
    );
    
    console.log('✅ File uploaded to Storage:', storageResult);
    
    // Step 2: Create document metadata in Firestore
    console.log('📋 Creating document metadata in Firestore...');
    
    const now = serverTimestamp();
    
    const documentMetadata: DocumentMetadata = {
      ...metadata,
      id: documentId,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      downloadURL: storageResult.downloadURL,
      storagePath: `documents/${metadata.category}/${documentId}/${metadata.version}/${file.name}`,
      createdBy: userId,
      createdAt: now,
      metadata: {
        createdAt: now,
        viewCount: 0,
        downloadCount: 0,
        rating: 0,
        ratingCount: 0,
      }
    };
    
    // Create the document in Firestore
    const docRef = doc(firestore, 'documents', documentId);
    await setDoc(docRef, documentMetadata);
    
    console.log('✅ Document metadata saved to Firestore:', documentId);
    
    return {
      documentId,
      downloadURL: storageResult.downloadURL
    };
    
  } catch (error: any) {
    console.error('❌ Document upload failed:', error);
    throw new Error(`Upload failed: ${error.message}`);
  }
};

/**
 * Get document metadata from Firestore
 */
export const getDocumentMetadata = async (documentId: string): Promise<DocumentMetadata | null> => {
  try {
    const docRef = doc(firestore, 'documents', documentId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as DocumentMetadata;
    }
    return null;
  } catch (error) {
    console.error('Error fetching document metadata:', error);
    return null;
  }
};

/**
 * Get all documents (with filtering)
 */
export const getDocuments = async (filters?: {
  category?: DocumentCategory;
  status?: DocumentStatus;
  createdBy?: string;
  limit?: number;
}): Promise<DocumentMetadata[]> => {
  try {
    let q = collection(firestore, 'documents');
    
    // Apply filters if provided
    if (filters?.category) {
      q = query(q as any, where('category', '==', filters.category)) as any;
    }
    if (filters?.status) {
      q = query(q as any, where('status', '==', filters.status)) as any;
    }
    if (filters?.createdBy) {
      q = query(q as any, where('createdBy', '==', filters.createdBy)) as any;
    }
    
    // Add ordering
    q = query(q as any, orderBy('createdAt', 'desc')) as any;
    
    const querySnapshot = await getDocs(q as any);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as DocumentMetadata[];
  } catch (error) {
    console.error('Error fetching documents:', error);
    return [];
  }
};

/**
 * Update document status
 */
export const updateDocumentStatus = async (
  documentId: string,
  status: DocumentStatus,
  userId: string
): Promise<void> => {
  try {
    const docRef = doc(firestore, 'documents', documentId);
    await updateDoc(docRef, {
      status,
      updatedBy: userId,
      updatedAt: serverTimestamp(),
      ...(status === 'approved' && { 
        approvedBy: userId, 
        approvedAt: serverTimestamp() 
      })
    });
    
    console.log(`✅ Document ${documentId} status updated to: ${status}`);
  } catch (error) {
    console.error('Error updating document status:', error);
    throw error;
  }
};

/**
 * Delete document (both Storage and Firestore)
 */
export const deleteDocument = async (
  documentId: string,
  userId: string
): Promise<void> => {
  try {
    // Get document metadata first
    const docMetadata = await getDocumentMetadata(documentId);
    if (!docMetadata) {
      throw new Error('Document not found');
    }
    
    // Delete from Storage
    await deleteFromStorage(
      docMetadata.category,
      documentId,
      docMetadata.version.toString(),
      docMetadata.fileName
    );
    
    // Delete from Firestore
    const docRef = doc(firestore, 'documents', documentId);
    await deleteDoc(docRef);
    
    console.log(`✅ Document ${documentId} deleted successfully`);
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
};

/**
 * Increment document view count
 */
export const incrementViewCount = async (documentId: string): Promise<void> => {
  try {
    const docRef = doc(firestore, 'documents', documentId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const currentCount = docSnap.data().metadata?.viewCount || 0;
      await updateDoc(docRef, {
        'metadata.viewCount': currentCount + 1
      });
    }
  } catch (error) {
    console.error('Error incrementing view count:', error);
    // Don't throw - this is non-critical
  }
};

/**
 * Increment document download count
 */
export const incrementDownloadCount = async (documentId: string): Promise<void> => {
  try {
    const docRef = doc(firestore, 'documents', documentId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const currentCount = docSnap.data().metadata?.downloadCount || 0;
      await updateDoc(docRef, {
        'metadata.downloadCount': currentCount + 1
      });
    }
  } catch (error) {
    console.error('Error incrementing download count:', error);
    // Don't throw - this is non-critical
  }
};

export default {
  uploadDocumentWithMetadata,
  getDocumentMetadata,
  getDocuments,
  updateDocumentStatus,
  deleteDocument,
  incrementViewCount,
  incrementDownloadCount,
};