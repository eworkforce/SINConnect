/**
 * Dashboard Page Component
 * StrokeTraining Platform v2.0
 */

import React from "react";
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  Alert,
} from "@mui/material";
import {
  Description,
  Forum,
  Person,
  Analytics,
  Notifications,
  School,
} from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";
import AppLayout from "../../components/layout/AppLayout";
import FirebaseTest from "../../components/common/FirebaseTest";
import type { UserRole } from "../../types";

const Dashboard: React.FC = () => {
  const { currentUser, userProfile } = useAuth();

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

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'attendee':
        return 'primary';
      case 'specialist':
        return 'success';
      case 'admin':
        return 'error';
      case 'stakeholder':
        return 'warning';
      default:
        return 'default';
    }
  };

  // Role-based dashboard features
  const getDashboardFeatures = (role: UserRole) => {
    const baseFeatures = [
      {
        title: 'Documents',
        description: 'Accédez aux ressources de formation',
        icon: Description,
        path: '/documents',
        color: '#1976d2',
        available: true,
      },
      {
        title: 'Mon Profil',
        description: 'Gérez vos informations personnelles',
        icon: Person,
        path: '/profile',
        color: '#2e7d32',
        available: true,
      },
    ];

    const roleSpecificFeatures = {
      attendee: [
        {
          title: 'Forum',
          description: 'Participez aux discussions',
          icon: Forum,
          path: '/forum',
          color: '#ed6c02',
          available: false,
        },
        {
          title: 'Formation',
          description: 'Suivez vos formations',
          icon: School,
          path: '/training',
          color: '#9c27b0',
          available: false,
        },
      ],
      specialist: [
        {
          title: 'Forum',
          description: 'Modérez et participez aux discussions',
          icon: Forum,
          path: '/forum',
          color: '#ed6c02',
          available: false,
        },
        {
          title: 'Contenu',
          description: 'Créez et gérez le contenu',
          icon: School,
          path: '/content',
          color: '#9c27b0',
          available: false,
        },
      ],
      admin: [
        {
          title: 'Rapports',
          description: 'Analysez les données et métriques',
          icon: Analytics,
          path: '/reports',
          color: '#d32f2f',
          available: false,
        },
        {
          title: 'Gestion',
          description: 'Administrez la plateforme',
          icon: Notifications,
          path: '/admin',
          color: '#1976d2',
          available: false,
        },
      ],
      stakeholder: [
        {
          title: 'Rapports',
          description: 'Consultez les rapports d\'impact',
          icon: Analytics,
          path: '/reports',
          color: '#d32f2f',
          available: false,
        },
      ],
    };

    return [...baseFeatures, ...(roleSpecificFeatures[role] || [])];
  };

  const features = userProfile ? getDashboardFeatures(userProfile.role) : [];

  return (
    <AppLayout>
      <Box>
        {/* Welcome Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Tableau de bord
          </Typography>
          {userProfile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Typography variant="h6" color="text.secondary">
                Bienvenue, {userProfile.profile.name}
              </Typography>
              <Chip 
                label={getRoleDisplayName(userProfile.role)} 
                color={getRoleColor(userProfile.role) as any}
                size="small"
              />
            </Box>
          )}
          {userProfile && (
            <Typography variant="body2" color="text.secondary">
              {userProfile.profile.hospital}
              {userProfile.profile.specialization && ` • ${userProfile.profile.specialization}`}
            </Typography>
          )}
        </Box>

        {/* Email Verification Alert */}
        {currentUser && !currentUser.emailVerified && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Vérification d'email requise:</strong> Veuillez vérifier votre adresse email 
              en cliquant sur le lien envoyé à {currentUser.email}
            </Typography>
          </Alert>
        )}

        {/* Dashboard Features */}
        <Grid container spacing={3}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 4,
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <feature.icon sx={{ color: feature.color, mr: 1 }} />
                    <Typography variant="h6" gutterBottom>
                      {feature.title}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {feature.description}
                  </Typography>
                  <Button 
                    variant={feature.available ? "contained" : "outlined"}
                    component={feature.available ? Link : "button"}
                    to={feature.available ? feature.path : undefined}
                    disabled={!feature.available}
                    fullWidth
                    sx={{ mt: 'auto' }}
                  >
                    {feature.available ? 'Accéder' : 'Bientôt disponible'}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Development Status - Remove in production */}
        <Paper elevation={1} sx={{ padding: 2, mt: 4, bgcolor: "#f5f5f5" }}>
          <Typography variant="h6" gutterBottom color="text.secondary">
            État du développement
          </Typography>
          <FirebaseTest />
          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Utilisateur actuel:</strong> {currentUser ? currentUser.email : "Non connecté"}<br/>
            <strong>Email vérifié:</strong> {currentUser ? (currentUser.emailVerified ? "Oui" : "Non") : "N/A"}<br/>
            <strong>Profil utilisateur:</strong> {userProfile ? "Chargé" : "Non disponible"}<br/>
            {userProfile && (
              <>
                <strong>Rôle:</strong> {getRoleDisplayName(userProfile.role)}<br/>
                <strong>Hôpital:</strong> {userProfile.profile.hospital}
              </>
            )}
          </Typography>
        </Paper>
      </Box>
    </AppLayout>
  );
};

export default Dashboard;