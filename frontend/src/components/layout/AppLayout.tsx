/**
 * Application Layout Component
 * StrokeTraining Platform v2.0
 */

import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Avatar,
  Divider,
  ListItemIcon,
  ListItemText,
  Container,
} from '@mui/material';
import {
  AccountCircle,
  ExitToApp,
  Dashboard as DashboardIcon,
  Description,
  Forum,
  Analytics,
} from '@mui/icons-material';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { UserRole } from '../../types';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
    handleMenuClose();
  };

  const handleProfileClick = () => {
    navigate('/profile');
    handleMenuClose();
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

  const navigationItems = [
    {
      label: 'Tableau de bord',
      path: '/dashboard',
      icon: DashboardIcon,
      roles: ['attendee', 'specialist', 'admin', 'stakeholder'] as UserRole[],
    },
    {
      label: 'Documents',
      path: '/documents',
      icon: Description,
      roles: ['attendee', 'specialist', 'admin', 'stakeholder'] as UserRole[],
    },
    {
      label: 'Forum',
      path: '/forum',
      icon: Forum,
      roles: ['attendee', 'specialist', 'admin'] as UserRole[],
    },
    {
      label: 'Rapports',
      path: '/reports',
      icon: Analytics,
      roles: ['admin', 'stakeholder'] as UserRole[],
    },
  ];

  const visibleNavItems = navigationItems.filter(item =>
    !userProfile || item.roles.includes(userProfile.role)
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Plateforme AVC-Espoir
          </Typography>

          {/* Navigation Items */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, mr: 2 }}>
            {visibleNavItems.map((item) => (
              <Button
                key={item.path}
                color="inherit"
                component={Link}
                to={item.path}
                startIcon={<item.icon />}
                sx={{
                  mx: 1,
                  backgroundColor: location.pathname === item.path ? 'rgba(255,255,255,0.1)' : 'transparent',
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>

          {/* User Menu */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {userProfile && (
              <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
                {userProfile.profile.name}
              </Typography>
            )}
            <IconButton
              size="large"
              aria-label="account menu"
              aria-controls="user-menu"
              aria-haspopup="true"
              onClick={handleMenuOpen}
              color="inherit"
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                {userProfile?.profile.name?.[0]?.toUpperCase() || currentUser?.email?.[0]?.toUpperCase()}
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* User Menu */}
      <Menu
        id="user-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {userProfile && [
          <MenuItem key="profile-info" disabled>
            <Box>
              <Typography variant="body2" fontWeight="bold">
                {userProfile.profile.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {getRoleDisplayName(userProfile.role)} • {userProfile.profile.hospital}
              </Typography>
            </Box>
          </MenuItem>,
          <Divider key="divider-1" />
        ]}
        <MenuItem onClick={handleProfileClick}>
          <ListItemIcon>
            <AccountCircle fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Mon profil" />
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <ExitToApp fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Déconnexion" />
        </MenuItem>
      </Menu>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, py: 3 }}>
        <Container maxWidth="lg">
          {children}
        </Container>
      </Box>
    </Box>
  );
};

export default AppLayout;