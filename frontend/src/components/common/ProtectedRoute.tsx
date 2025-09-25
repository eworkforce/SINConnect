/**
 * Protected Route Component
 * StrokeTraining Platform v2.0
 * 
 * Protects routes that require authentication
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import type { UserRole } from '../../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles = [],
  redirectTo = '/login',
}) => {
  const { currentUser, userProfile, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        gap={2}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Chargement...
        </Typography>
      </Box>
    );
  }

  // Redirect to login if not authenticated
  if (!currentUser) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check email verification
  if (!currentUser.emailVerified) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        gap={2}
        p={4}
      >
        <Typography variant="h5" color="warning.main" textAlign="center">
          Vérification d'email requise
        </Typography>
        <Typography variant="body1" color="text.secondary" textAlign="center" maxWidth={400}>
          Veuillez vérifier votre adresse email en cliquant sur le lien envoyé dans votre boîte de réception.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Email: {currentUser.email}
        </Typography>
      </Box>
    );
  }

  // Check user profile exists
  if (!userProfile) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        gap={2}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Chargement du profil utilisateur...
        </Typography>
      </Box>
    );
  }

  // Check role-based access
  if (requiredRoles.length > 0 && !requiredRoles.includes(userProfile.role)) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        gap={2}
        p={4}
      >
        <Typography variant="h5" color="error.main" textAlign="center">
          Accès refusé
        </Typography>
        <Typography variant="body1" color="text.secondary" textAlign="center" maxWidth={400}>
          Vous n'avez pas les permissions nécessaires pour accéder à cette page.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Rôle actuel: {userProfile.role}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Rôles requis: {requiredRoles.join(', ')}
        </Typography>
      </Box>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;