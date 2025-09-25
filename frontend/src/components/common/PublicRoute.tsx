/**
 * Public Route Component
 * StrokeTraining Platform v2.0
 * 
 * Redirects authenticated users away from public routes like login/register
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

interface PublicRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

const PublicRoute: React.FC<PublicRouteProps> = ({
  children,
  redirectTo = '/dashboard',
}) => {
  const { currentUser, loading } = useAuth();
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

  // Redirect authenticated users to dashboard or intended destination
  if (currentUser) {
    const from = location.state?.from?.pathname;
    const destination = from && from !== '/login' && from !== '/register' ? from : redirectTo;
    return <Navigate to={destination} replace />;
  }

  return <>{children}</>;
};

export default PublicRoute;