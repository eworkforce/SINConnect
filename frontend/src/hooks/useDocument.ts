/**
 * useDocument Hook
 * StrokeTraining Platform v2.0
 * 
 * Custom hook for fetching individual document data and tracking views
 */

import { useState, useEffect, useCallback } from 'react';
import { getDocumentMetadata, incrementViewCount } from '../services/documentService';
import { useAuth } from '../contexts/AuthContext';
import type { DocumentCategory, DocumentStatus } from '../types';

// Document interface matching the service
interface Document {
  id: string;
  title: string;
  description: string;
  summary?: string;
  category: DocumentCategory;
  tags: string[];
  keywords?: string[];
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
  // Additional metadata
  medicalSpecialty?: string[];
  targetAudience?: string[];
  difficultyLevel?: string;
  cmeCredits?: number;
  authorCredentials?: string;
  clinicalEvidence?: string;
  medicalDisclaimer?: string;
}

interface UseDocumentReturn {
  document: Document | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  trackView: () => Promise<void>;
}

export const useDocument = (documentId?: string): UseDocumentReturn => {
  const { currentUser } = useAuth();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewTracked, setViewTracked] = useState(false);

  const fetchDocument = useCallback(async () => {
    if (!documentId) {
      setError('ID de document manquant');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Fetching document:', documentId);

      const fetchedDocument = await getDocumentMetadata(documentId);

      if (!fetchedDocument) {
        setError('Document introuvable');
        setDocument(null);
        return;
      }

      console.log('📄 Document fetched:', fetchedDocument);
      setDocument(fetchedDocument as Document);

    } catch (err: any) {
      console.error('❌ Error fetching document:', err);
      setError(err.message || 'Erreur lors du chargement du document');
      setDocument(null);
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  const trackView = useCallback(async () => {
    if (!documentId || !currentUser || viewTracked) {
      return;
    }

    try {
      console.log('👁️ Tracking view for document:', documentId);
      await incrementViewCount(documentId);
      setViewTracked(true);

      // Update local state to reflect the view count increment
      setDocument(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          metadata: {
            ...prev.metadata,
            viewCount: (prev.metadata?.viewCount || 0) + 1
          }
        };
      });

      console.log('✅ View tracked successfully');
    } catch (err) {
      console.error('❌ Error tracking view:', err);
      // Don't throw - this is non-critical
    }
  }, [documentId, currentUser, viewTracked]);

  const refetch = useCallback(async () => {
    await fetchDocument();
  }, [fetchDocument]);

  // Fetch document on mount and when documentId changes
  useEffect(() => {
    if (documentId) {
      fetchDocument();
      setViewTracked(false); // Reset view tracking for new document
    }
  }, [fetchDocument, documentId]);

  // Track view after document is loaded (delay to ensure user is actually viewing)
  useEffect(() => {
    if (document && !viewTracked && !loading) {
      const timer = setTimeout(() => {
        trackView();
      }, 2000); // Track view after 2 seconds

      return () => clearTimeout(timer);
    }
  }, [document, viewTracked, loading, trackView]);

  return {
    document,
    loading,
    error,
    refetch,
    trackView,
  };
};