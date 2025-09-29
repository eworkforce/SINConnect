/**
 * View Document Page
 * StrokeTraining Platform v2.0
 * 
 * Page for viewing individual documents with PDF viewer and metadata
 */

import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Breadcrumbs,
  Link,
  Container,
  CircularProgress,
  Button,
} from '@mui/material';
import {
  NavigateNext,
  Description,
  ArrowBack,
} from '@mui/icons-material';
import { Link as RouterLink, useParams, useNavigate } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';

const ViewDocument: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate('/documents/browse');
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
            <Link component={RouterLink} to="/documents/browse" color="inherit">
              Parcourir
            </Link>
            <Typography color="text.primary">Visualiser</Typography>
          </Breadcrumbs>

          {/* Page Header */}
          <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <Description sx={{ mr: 2, color: 'primary.main' }} />
                Visualiser le Document
              </Typography>
              <Typography variant="body1" color="text.secondary">
                ID du document: {id}
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={handleGoBack}
            >
              Retour
            </Button>
          </Box>

          {/* Placeholder Content */}
          <Paper sx={{ p: 4, textAlign: 'center', minHeight: 400 }}>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Chargement du document...
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Implementation en cours - Le visualiseur de documents sera affiché ici.
            </Typography>
            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" color="text.secondary">
                • Visualisation PDF intégrée<br/>
                • Métadonnées du document<br/>
                • Contrôles de zoom et navigation<br/>
                • Téléchargement si autorisé
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Container>
    </AppLayout>
  );
};

export default ViewDocument;