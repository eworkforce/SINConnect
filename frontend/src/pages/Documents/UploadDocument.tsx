/**
 * Document Upload Page
 * StrokeTraining Platform v2.0
 * 
 * Page for uploading new documents with comprehensive metadata
 */

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Alert,
  Button,
  Paper,
  Breadcrumbs,
  Link,
  Snackbar,
  Card,
  CardContent,
  Grid,
  Chip,
} from '@mui/material';
import {
  NavigateNext,
  Info,
  CloudUpload,
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import DocumentUpload from '../../components/documents/DocumentUpload';
import { useAuth } from '../../contexts/AuthContext';
import { DOCUMENT_PERMISSIONS } from '../../utils/documentConstants';
import type { UserRole } from '../../types';

const UploadDocument: React.FC = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [uploadedDocuments, setUploadedDocuments] = useState<string[]>([]);

  // Get user permissions
  const userPermissions = userProfile 
    ? DOCUMENT_PERMISSIONS[userProfile.role as UserRole]
    : null;

  const handleUploadComplete = (documentIds: string[]) => {
    setUploadedDocuments(prev => [...prev, ...documentIds]);
    setSnackbarMessage(
      `${documentIds.length} document${documentIds.length > 1 ? 's' : ''} téléchargé${documentIds.length > 1 ? 's' : ''} avec succès!`
    );
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  const handleUploadError = (error: string) => {
    setSnackbarMessage(error);
    setSnackbarSeverity('error');
    setSnackbarOpen(true);
  };

  const getRoleDisplayName = (role: UserRole): string => {
    switch (role) {
      case 'attendee':
        return 'Participant';
      case 'specialist':
        return 'Spécialiste';
      case 'admin':
        return 'Administrateur';
      case 'stakeholder':
        return 'Partie prenante';
      default:
        return role;
    }
  };

  return (
    <AppLayout>
      <Box>
        {/* Breadcrumbs */}
        <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mb: 3 }}>
          <Link component={RouterLink} to="/dashboard" color="inherit">
            Tableau de bord
          </Link>
          <Link component={RouterLink} to="/documents" color="inherit">
            Documents
          </Link>
          <Typography color="text.primary">Télécharger</Typography>
        </Breadcrumbs>

        {/* Page Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <CloudUpload sx={{ mr: 2, color: 'primary.main' }} />
            Télécharger des documents
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Partagez vos ressources médicales avec la communauté AVC-Espoir
          </Typography>
        </Box>

        {/* User Info Card */}
        {userProfile && (
          <Card sx={{ mb: 3, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={8}>
                  <Typography variant="h6" gutterBottom>
                    👋 Bonjour {userProfile.profile.name}
                  </Typography>
                  <Typography variant="body2">
                    Vous êtes connecté en tant que <strong>{getRoleDisplayName(userProfile.role)}</strong>
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Chip 
                      label={`Taille max: ${userPermissions?.maxFileSize}MB`}
                      size="small"
                      sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}
                    />
                    <Chip 
                      label={`${userPermissions?.allowedCategories.length} catégories disponibles`}
                      size="small"
                      sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* Upload Guidelines */}
        <Alert severity="info" sx={{ mb: 3 }} icon={<Info />}>
          <Typography variant="body2" component="div">
            <strong>Conseils pour le téléchargement:</strong>
            <Box component="ul" sx={{ mt: 1, pl: 2 }}>
              <li>Utilisez des noms de fichiers descriptifs</li>
              <li>Ajoutez des tags pertinents pour faciliter la recherche</li>
              <li>Remplissez soigneusement la description pour aider les utilisateurs</li>
              <li>Sélectionnez la bonne catégorie et le niveau de priorité</li>
              <li>Spécifiez les spécialités médicales concernées si applicable</li>
            </Box>
          </Typography>
        </Alert>

        {/* Success Messages */}
        {uploadedDocuments.length > 0 && (
          <Alert 
            severity="success" 
            sx={{ mb: 3 }}
            action={
              <Button color="inherit" size="small" onClick={() => navigate('/documents')}>
                Voir les documents
              </Button>
            }
          >
            <Typography>
              <strong>{uploadedDocuments.length} document{uploadedDocuments.length > 1 ? 's' : ''} téléchargé{uploadedDocuments.length > 1 ? 's' : ''}</strong>
            </Typography>
            <Typography variant="body2">
              Vos documents ont été téléchargés avec succès et sont en attente de validation.
            </Typography>
          </Alert>
        )}

        {/* Document Upload Component */}
        <DocumentUpload
          onUploadComplete={handleUploadComplete}
          onUploadError={handleUploadError}
          maxFiles={10}
          allowedCategories={userPermissions?.allowedCategories}
        />

        {/* Additional Information */}
        <Paper sx={{ mt: 4, p: 3, bgcolor: 'grey.50' }}>
          <Typography variant="h6" gutterBottom>
            📚 Types de documents acceptés
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" gutterBottom>
                📄 Documents
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • PDF (recommandé)<br/>
                • Word (.doc, .docx)<br/>
                • PowerPoint (.ppt, .pptx)
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" gutterBottom>
                🖼️ Images
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • JPEG (.jpg, .jpeg)<br/>
                • PNG (.png)<br/>
                • Idéal pour infographies
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" gutterBottom>
                🎥 Vidéos
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • MP4 (recommandé)<br/>
                • WebM<br/>
                • Pour formations vidéo
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Help Section */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Besoin d'aide ? Contactez l'équipe AVC-Espoir pour assistance.
          </Typography>
        </Box>
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity}
          variant="filled"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </AppLayout>
  );
};

export default UploadDocument;