/**
 * Browse Documents Page
 * StrokeTraining Platform v2.0
 * 
 * Page for browsing and searching through uploaded documents
 */

import React from 'react';
import {
  Box,
  Typography,
  Breadcrumbs,
  Link,
  Container,
  Alert,
  Button,
} from '@mui/material';
import {
  NavigateNext,
  LibraryBooks,
  Refresh,
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import DocumentList from '../../components/documents/DocumentList';
import { useDocuments } from '../../hooks/useDocuments';
import { useAuth } from '../../contexts/AuthContext';
import { createSampleDocuments } from '../../utils/testDataHelper';

const BrowseDocuments: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile, loading: authLoading } = useAuth();
  
  // Fetch documents using our custom hook - TEMPORARILY showing ALL documents for debugging
  const { documents, loading, error, refetch } = useDocuments({
    // status: 'approved', // TEMPORARILY COMMENTED OUT - show all documents
    limit: 50,
  });

  // Handle document click - navigate to view page
  const handleDocumentClick = (documentId: string) => {
    navigate(`/documents/view/${documentId}`);
  };

  // Temporary function to create sample documents
  const handleCreateSampleData = async () => {
    if (!currentUser) {
      alert('Vous devez être connecté pour créer des données de test');
      return;
    }

    try {
      await createSampleDocuments(currentUser.uid);
      alert('Données de test créées avec succès!');
      // Refresh the document list
      refetch();
    } catch (error: any) {
      alert(`Erreur lors de la création des données de test: ${error.message}`);
      console.error('Error creating sample data:', error);
    }
  };

  return (
    <AppLayout>
      <Container maxWidth="lg">
        <Box>
          {/* Breadcrumbs */}
          <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mb: 3 }}>
            <Link component={RouterLink} to="/dashboard" color="inherit">
              Tableau de bord
            </Link>
            <Link component={RouterLink} to="/documents" color="inherit">
              Documents
            </Link>
            <Typography color="text.primary">Parcourir</Typography>
          </Breadcrumbs>

          {/* Page Header */}
          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <LibraryBooks sx={{ mr: 2, color: 'primary.main' }} />
                Parcourir les Documents
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Explorez la bibliothèque de ressources médicales et de formation sur l'AVC
              </Typography>
            </Box>
            
            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              {/* Temporary Test Data Button */}
              <Button
                variant="contained"
                color="secondary"
                onClick={handleCreateSampleData}
                disabled={!currentUser || loading}
                size="small"
              >
                Créer données de test
              </Button>
              
              {/* Refresh Button */}
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={refetch}
                disabled={loading}
              >
                Actualiser
              </Button>
            </Box>
          </Box>

          {/* Error State */}
          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 3 }}
              action={
                <Button color="inherit" size="small" onClick={refetch}>
                  Réessayer
                </Button>
              }
            >
              {error}
            </Alert>
          )}

          {/* Auth Status Debug (remove later) */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Auth: {authLoading ? 'loading...' : currentUser ? `logged in as ${currentUser.email}` : 'not logged in'}
              {userProfile ? ` • role: ${userProfile.role}` : ''}
            </Typography>
          </Box>

          {/* Document List */}
          <DocumentList
            loading={loading}
            documents={documents}
            onDocumentClick={handleDocumentClick}
          />
        </Box>
      </Container>
    </AppLayout>
  );
};

export default BrowseDocuments;