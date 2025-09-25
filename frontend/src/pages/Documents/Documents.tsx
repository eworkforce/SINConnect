/**
 * Documents Hub Page
 * StrokeTraining Platform v2.0
 * 
 * Main documents page with navigation to all document features
 */

import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Paper,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  CloudUpload,
  LibraryBooks,
  Search,
  Star,
  TrendingUp,
  Assignment,
  VideoLibrary,
  Image,
  PictureAsPdf,
  Assessment,
  Group,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import { useAuth } from '../../contexts/AuthContext';
import type { UserRole } from '../../types';

const Documents: React.FC = () => {
  const { userProfile } = useAuth();

  // Mock stats - these would come from Firebase/Firestore in production
  const documentStats = {
    total: 156,
    categories: {
      'Clinical Guidelines': 45,
      'Research Papers': 32,
      'Training Materials': 28,
      'Case Studies': 24,
      'Educational Videos': 18,
      'Infographics': 9,
    },
    recentUploads: 12,
    pendingReview: 5,
  };

  const quickActions = [
    {
      title: 'Télécharger un document',
      description: 'Partagez vos ressources avec la communauté',
      icon: <CloudUpload />,
      color: 'primary',
      link: '/documents/upload',
      roles: ['specialist', 'admin'] as UserRole[],
    },
    {
      title: 'Parcourir les documents',
      description: 'Explorez la bibliothèque médicale',
      icon: <LibraryBooks />,
      color: 'secondary',
      link: '/documents/browse',
      roles: ['attendee', 'specialist', 'admin', 'stakeholder'] as UserRole[],
    },
    {
      title: 'Recherche avancée',
      description: 'Trouvez des documents spécifiques',
      icon: <Search />,
      color: 'success',
      link: '/documents/search',
      roles: ['attendee', 'specialist', 'admin', 'stakeholder'] as UserRole[],
    },
    {
      title: 'Documents favoris',
      description: 'Accédez à vos ressources sauvegardées',
      icon: <Star />,
      color: 'warning',
      link: '/documents/favorites',
      roles: ['attendee', 'specialist', 'admin', 'stakeholder'] as UserRole[],
    },
    {
      title: 'Gérer les documents',
      description: 'Administration et modération',
      icon: <Assessment />,
      color: 'error',
      link: '/documents/manage',
      roles: ['admin'] as UserRole[],
    },
  ];

  const canAccessAction = (action: typeof quickActions[0]) => {
    return !userProfile || action.roles.includes(userProfile.role);
  };

  const getFileTypeIcon = (type: string) => {
    switch (type) {
      case 'PDF': return <PictureAsPdf sx={{ color: 'error.main' }} />;
      case 'Video': return <VideoLibrary sx={{ color: 'primary.main' }} />;
      case 'Image': return <Image sx={{ color: 'success.main' }} />;
      default: return <Assignment sx={{ color: 'grey.600' }} />;
    }
  };

  return (
    <AppLayout>
      <Box>
        {/* Page Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <LibraryBooks sx={{ mr: 2, color: 'primary.main' }} />
            Centre de Documentation
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Accédez aux ressources médicales, guides cliniques et matériels de formation sur l'AVC
          </Typography>
        </Box>

        {/* Stats Overview */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{xs: 12, sm: 6, md: 3}}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.light', color: 'primary.contrastText' }}>
              <Typography variant="h4" fontWeight="bold">
                {documentStats.total}
              </Typography>
              <Typography variant="body2">
                Documents totaux
              </Typography>
            </Paper>
          </Grid>
          
          <Grid size={{xs: 12, sm: 6, md: 3}}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'secondary.light', color: 'secondary.contrastText' }}>
              <Typography variant="h4" fontWeight="bold">
                {Object.keys(documentStats.categories).length}
              </Typography>
              <Typography variant="body2">
                Catégories
              </Typography>
            </Paper>
          </Grid>
          
          <Grid size={{xs: 12, sm: 6, md: 3}}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light', color: 'success.contrastText' }}>
              <Typography variant="h4" fontWeight="bold">
                {documentStats.recentUploads}
              </Typography>
              <Typography variant="body2">
                Nouveaux ce mois
              </Typography>
            </Paper>
          </Grid>
          
          <Grid size={{xs: 12, sm: 6, md: 3}}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.light', color: 'warning.contrastText' }}>
              <Typography variant="h4" fontWeight="bold">
                {documentStats.pendingReview}
              </Typography>
              <Typography variant="body2">
                En attente de validation
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
          Actions rapides
        </Typography>
        
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {quickActions.filter(canAccessAction).map((action, index) => (
            <Grid size={{xs: 12, sm: 6, md: 4}} key={index}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  '&:hover': { 
                    boxShadow: 3, 
                    transform: 'translateY(-2px)',
                    transition: 'all 0.2s ease-in-out'
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar 
                      sx={{ 
                        bgcolor: `${action.color}.main`, 
                        mr: 2,
                        width: 48,
                        height: 48
                      }}
                    >
                      {action.icon}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        {action.title}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {action.description}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button 
                    component={RouterLink}
                    to={action.link}
                    variant="outlined"
                    color={action.color as any}
                    fullWidth
                    startIcon={action.icon}
                  >
                    Accéder
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3}>
          {/* Categories Overview */}
          <Grid size={{xs: 12, md: 8}}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                📚 Catégories de documents
              </Typography>
              
              <List>
                {Object.entries(documentStats.categories).map(([category, count], index) => (
                  <React.Fragment key={category}>
                    <ListItem>
                      <ListItemIcon>
                        {getFileTypeIcon(category)}
                      </ListItemIcon>
                      <ListItemText 
                        primary={category}
                        secondary={`${count} documents`}
                      />
                      <Chip 
                        label={count}
                        color="primary"
                        size="small"
                      />
                    </ListItem>
                    {index < Object.entries(documentStats.categories).length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* Recent Activity */}
          <Grid size={{xs: 12, md: 4}}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUp sx={{ mr: 1 }} />
                Activité récente
              </Typography>
              
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <CloudUpload fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Nouveau guide clinique"
                    secondary="Il y a 2 heures"
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <Star fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Document ajouté aux favoris"
                    secondary="Il y a 4 heures"
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <Group fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="5 nouveaux téléchargements"
                    secondary="Aujourd'hui"
                  />
                </ListItem>
              </List>
              
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Button 
                  variant="outlined" 
                  size="small"
                  component={RouterLink}
                  to="/documents/activity"
                >
                  Voir tout
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Help Section */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            💡 Astuce: Utilisez les tags et catégories pour une recherche plus efficace
          </Typography>
        </Box>
      </Box>
    </AppLayout>
  );
};

export default Documents;