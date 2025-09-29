/**
 * useDocuments Hook
 * StrokeTraining Platform v2.0
 * 
 * Custom hook for fetching and managing document data from Firestore
 */

import { useState, useEffect, useCallback } from 'react';
import { getDocuments } from '../services/documentService';
import { useAuth } from '../contexts/AuthContext';
import type { DocumentCategory, DocumentStatus } from '../types';

// Document interface matching the DocumentMetadata from service
interface Document {
  id: string;
  title: string;
  description: string;
  summary?: string;
  category: DocumentCategory;
  tags: string[];
  keywords?: string[]; // Optional since existing docs might not have this
  priority: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  downloadURL: string;
  createdBy: string;
  createdAt: any;
  status: DocumentStatus;
  metadata?: {
    viewCount?: number;
    downloadCount?: number;
    rating?: number;
    ratingCount?: number;
  };
  // Additional fields from DocumentMetadata that we might need
  storagePath?: string;
  language?: string;
  version?: number;
  access?: {
    isPublic: boolean;
    allowedRoles: string[];
    requiresApproval: boolean;
  };
}

interface UseDocumentsOptions {
  category?: DocumentCategory;
  status?: DocumentStatus;
  createdBy?: string;
  limit?: number;
  autoFetch?: boolean;
}

interface UseDocumentsReturn {
  documents: Document[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  fetchMore: () => Promise<void>;
  hasMore: boolean;
}

export const useDocuments = (options: UseDocumentsOptions = {}): UseDocumentsReturn => {
  const { currentUser, userProfile, loading: authLoading } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const {
    category,
    status, // TEMPORARILY removed default 'approved' to show all documents
    createdBy,
    limit = 20,
    autoFetch = true
  } = options;

  const fetchDocuments = useCallback(async (reset = false) => {
    try {
      // Check if auth is still loading
      if (authLoading) {
        console.log('⏳ Auth still loading, skipping document fetch');
        return;
      }

      // Check if user is authenticated
      if (!currentUser) {
        console.log('⚠️ User not authenticated, cannot fetch documents');
        setError('Vous devez être connecté pour voir les documents');
        setLoading(false);
        return;
      }

      if (reset) {
        setLoading(true);
        setError(null);
      }

      console.log('🔍 Fetching documents with filters:', { category, status, createdBy, limit });
      console.log('🔐 Auth status:', {
        isAuthenticated: !!currentUser,
        userId: currentUser?.uid,
        userRole: userProfile?.role,
        emailVerified: currentUser?.emailVerified
      });

      const fetchedDocuments = await getDocuments({
        category,
        status,
        createdBy,
        limit
      });

      console.log('📊 Fetched documents:', fetchedDocuments);
      
      // Debug: Show status of all documents
      console.log('🔍 Document statuses:', fetchedDocuments.map(doc => ({ 
        id: doc.id, 
        title: doc.title, 
        status: doc.status,
        createdBy: doc.createdBy 
      })));

      if (reset) {
        setDocuments(fetchedDocuments);
      } else {
        setDocuments(prev => [...prev, ...fetchedDocuments]);
      }

      // Simple pagination logic - if we got less than requested, no more available
      setHasMore(fetchedDocuments.length === limit);
      
    } catch (err: any) {
      console.error('❌ Error fetching documents:', err);
      setError(err.message || 'Erreur lors du chargement des documents');
    } finally {
      setLoading(false);
    }
  }, [category, status, createdBy, limit, authLoading, currentUser, userProfile]);

  const refetch = useCallback(async () => {
    await fetchDocuments(true);
  }, [fetchDocuments]);

  const fetchMore = useCallback(async () => {
    if (!loading && hasMore) {
      await fetchDocuments(false);
    }
  }, [fetchDocuments, loading, hasMore]);

  // Auto-fetch on mount and when options change
  useEffect(() => {
    if (autoFetch) {
      fetchDocuments(true);
    }
  }, [fetchDocuments, autoFetch]);

  return {
    documents,
    loading,
    error,
    refetch,
    fetchMore,
    hasMore
  };
};