/**
 * User Profile Page Component
 * StrokeTraining Platform v2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Avatar,
  Chip,
  Card,
  CardContent,
  IconButton,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Edit,
  Save,
  Cancel,
  PhotoCamera,
  Verified,
  Email,
  Phone,
  LocationOn,
  Work,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../contexts/AuthContext';
import AppLayout from '../../components/layout/AppLayout';
import type { UserRole } from '../../types';

// Profile update validation schema
const profileUpdateSchema = z.object({
  name: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères'),
  hospital: z
    .string()
    .min(2, "Le nom de l'hôpital est requis")
    .max(200, "Le nom de l'hôpital ne peut pas dépasser 200 caractères"),
  specialization: z
    .string()
    .max(100, 'La spécialisation ne peut pas dépasser 100 caractères')
    .optional(),
  region: z
    .string()
    .max(100, 'La région ne peut pas dépasser 100 caractères')
    .optional(),
  phoneNumber: z
    .string()
    .regex(/^[+]?[0-9\s\-()]{8,20}$/, 'Numéro de téléphone invalide')
    .optional()
    .or(z.literal('')),
});

type ProfileUpdateData = z.infer<typeof profileUpdateSchema>;

const Profile: React.FC = () => {
  const { currentUser, userProfile, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileUpdateData>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      name: '',
      hospital: '',
      specialization: '',
      region: '',
      phoneNumber: '',
    },
  });

  // Update form values when userProfile changes
  useEffect(() => {
    if (userProfile) {
      reset({
        name: userProfile.profile.name || '',
        hospital: userProfile.profile.hospital || '',
        specialization: userProfile.profile.specialization || '',
        region: userProfile.profile.region || '',
        phoneNumber: userProfile.profile.phoneNumber || '',
      });
    }
  }, [userProfile, reset]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setSuccessMessage(null);
    setErrorMessage(null);
    if (isEditing) {
      // Cancel editing - reset form
      if (userProfile) {
        reset({
          name: userProfile.profile.name || '',
          hospital: userProfile.profile.hospital || '',
          specialization: userProfile.profile.specialization || '',
          region: userProfile.profile.region || '',
          phoneNumber: userProfile.profile.phoneNumber || '',
        });
      }
    }
  };

  const onSubmit = async (data: ProfileUpdateData) => {
    if (!userProfile) return;

    setLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      await updateProfile({
        profile: {
          ...userProfile.profile,
          name: data.name,
          hospital: data.hospital,
          specialization: data.specialization || undefined,
          region: data.region || undefined,
          phoneNumber: data.phoneNumber || undefined,
        },
      });

      setSuccessMessage('Profil mis à jour avec succès!');
      setIsEditing(false);
    } catch (error: any) {
      setErrorMessage(error.message || 'Erreur lors de la mise à jour du profil');
    } finally {
      setLoading(false);
    }
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

  const handleNotificationToggle = async (type: string) => {
    if (!userProfile) return;
    
    try {
      const updatedNotifications = {
        ...userProfile.preferences.notifications,
        [type]: !userProfile.preferences.notifications[type as keyof typeof userProfile.preferences.notifications],
      };

      await updateProfile({
        preferences: {
          ...userProfile.preferences,
          notifications: updatedNotifications,
        },
      });
    } catch (error: any) {
      setErrorMessage('Erreur lors de la mise à jour des préférences');
    }
  };

  if (!userProfile || !currentUser) {
    return (
      <AppLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Box>
        <Typography variant="h4" gutterBottom>
          Mon Profil
        </Typography>

        {/* Success/Error Messages */}
        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage(null)}>
            {successMessage}
          </Alert>
        )}

        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErrorMessage(null)}>
            {errorMessage}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Profile Overview Card */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                  <Avatar
                    sx={{
                      width: 120,
                      height: 120,
                      fontSize: '2rem',
                      bgcolor: 'primary.main',
                    }}
                  >
                    {userProfile.profile.name[0]?.toUpperCase()}
                  </Avatar>
                  
                  <IconButton color="primary" component="label" disabled={isEditing}>
                    <PhotoCamera />
                    <input type="file" hidden accept="image/*" />
                  </IconButton>
                  
                  <Typography variant="h5" textAlign="center">
                    {userProfile.profile.name}
                  </Typography>
                  
                  <Chip
                    label={getRoleDisplayName(userProfile.role)}
                    color={getRoleColor(userProfile.role) as any}
                    size="medium"
                  />
                  
                  <Box display="flex" alignItems="center" gap={1}>
                    <Email fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {currentUser.email}
                    </Typography>
                    {currentUser.emailVerified && (
                      <Verified fontSize="small" color="success" />
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Account Status Card */}
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  État du compte
                </Typography>
                
                <Box display="flex" alignItems="center" gap={2} mb={1}>
                  <Typography variant="body2" color="text.secondary">
                    Email vérifié:
                  </Typography>
                  <Chip
                    label={currentUser.emailVerified ? 'Oui' : 'Non'}
                    color={currentUser.emailVerified ? 'success' : 'warning'}
                    size="small"
                  />
                </Box>
                
                <Box display="flex" alignItems="center" gap={2} mb={1}>
                  <Typography variant="body2" color="text.secondary">
                    Compte actif:
                  </Typography>
                  <Chip
                    label={userProfile.metadata.isActive ? 'Actif' : 'Inactif'}
                    color={userProfile.metadata.isActive ? 'success' : 'error'}
                    size="small"
                  />
                </Box>
                
                <Typography variant="caption" color="text.secondary">
                  Membre depuis: {new Date(userProfile.metadata.createdAt?.toDate?.() || userProfile.metadata.createdAt).toLocaleDateString('fr-FR')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Profile Details */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                  <Typography variant="h6">
                    Informations personnelles
                  </Typography>
                  <Button
                    variant={isEditing ? 'outlined' : 'contained'}
                    startIcon={isEditing ? <Cancel /> : <Edit />}
                    onClick={handleEditToggle}
                    disabled={loading}
                  >
                    {isEditing ? 'Annuler' : 'Modifier'}
                  </Button>
                </Box>

                <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Controller
                        name="name"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Nom complet"
                            error={!!errors.name}
                            helperText={errors.name?.message}
                            disabled={!isEditing}
                            InputProps={{
                              startAdornment: <Work sx={{ mr: 1, color: 'action.active' }} />,
                            }}
                          />
                        )}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Controller
                        name="hospital"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Hôpital d'exercice"
                            error={!!errors.hospital}
                            helperText={errors.hospital?.message}
                            disabled={!isEditing}
                            InputProps={{
                              startAdornment: <LocationOn sx={{ mr: 1, color: 'action.active' }} />,
                            }}
                          />
                        )}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Controller
                        name="specialization"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Spécialisation"
                            error={!!errors.specialization}
                            helperText={errors.specialization?.message}
                            disabled={!isEditing}
                          />
                        )}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Controller
                        name="region"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Région"
                            error={!!errors.region}
                            helperText={errors.region?.message}
                            disabled={!isEditing}
                          />
                        )}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Controller
                        name="phoneNumber"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Numéro de téléphone"
                            error={!!errors.phoneNumber}
                            helperText={errors.phoneNumber?.message}
                            disabled={!isEditing}
                            InputProps={{
                              startAdornment: <Phone sx={{ mr: 1, color: 'action.active' }} />,
                            }}
                          />
                        )}
                      />
                    </Grid>

                    {isEditing && (
                      <Grid item xs={12}>
                        <Button
                          type="submit"
                          variant="contained"
                          startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                          disabled={loading || !isDirty}
                          size="large"
                        >
                          {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
                        </Button>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              </CardContent>
            </Card>

            {/* Notification Preferences */}
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Préférences de notification
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={userProfile.preferences.notifications.email}
                          onChange={() => handleNotificationToggle('email')}
                        />
                      }
                      label="Notifications par email"
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={userProfile.preferences.notifications.forum}
                          onChange={() => handleNotificationToggle('forum')}
                        />
                      }
                      label="Notifications du forum"
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={userProfile.preferences.notifications.documents}
                          onChange={() => handleNotificationToggle('documents')}
                        />
                      }
                      label="Nouveaux documents"
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={userProfile.preferences.notifications.impact}
                          onChange={() => handleNotificationToggle('impact')}
                        />
                      }
                      label="Rappels d'impact"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </AppLayout>
  );
};

export default Profile;