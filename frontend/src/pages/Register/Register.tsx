/**
 * Register Page Component
 * StrokeTraining Platform v2.0
 */

import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Link,
  Container,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../../contexts/AuthContext";
import { registerSchema, type RegisterFormData } from "../../utils/validation";
import type { UserRole } from "../../types";

const Register: React.FC = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // React Hook Form with Zod validation
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
      hospital: '',
      specialization: '',
      region: '',
      phoneNumber: '',
      role: 'attendee',
      consent: false,
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      await registerUser({
        email: data.email,
        password: data.password,
        name: data.name,
        hospital: data.hospital,
        specialization: data.specialization,
        region: data.region,
        phoneNumber: data.phoneNumber,
        role: data.role as UserRole,
      });
      
      setSuccessMessage('Compte créé avec succès! Un email de vérification vous a été envoyé.');
      reset();
      // Redirect to login after a delay
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error: any) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, width: "100%" }}>
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            Inscription
          </Typography>
          <Typography variant="h6" align="center" color="text.secondary" gutterBottom>
            Rejoignez la communauté de formation AVC
          </Typography>
          
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          )}
          
          {successMessage && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {successMessage}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 3 }}>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  margin="normal"
                  required
                  fullWidth
                  id="name"
                  label="Nom complet"
                  autoComplete="name"
                  autoFocus
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />
              )}
            />
            
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Adresse email"
                  autoComplete="email"
                  error={!!errors.email}
                  helperText={errors.email?.message}
                />
              )}
            />
            
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Mot de passe"
                  type="password"
                  id="password"
                  autoComplete="new-password"
                  error={!!errors.password}
                  helperText={errors.password?.message}
                />
              )}
            />
            
            <Controller
              name="confirmPassword"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  margin="normal"
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirmer le mot de passe"
                  type="password"
                  id="confirmPassword"
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword?.message}
                />
              )}
            />
            
            <Controller
              name="hospital"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  margin="normal"
                  required
                  fullWidth
                  id="hospital"
                  label="Hôpital d'exercice"
                  error={!!errors.hospital}
                  helperText={errors.hospital?.message}
                />
              )}
            />
            
            <Controller
              name="specialization"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  margin="normal"
                  fullWidth
                  id="specialization"
                  label="Spécialisation"
                  error={!!errors.specialization}
                  helperText={errors.specialization?.message}
                />
              )}
            />
            
            <Controller
              name="region"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  margin="normal"
                  fullWidth
                  id="region"
                  label="Région"
                  error={!!errors.region}
                  helperText={errors.region?.message}
                />
              )}
            />
            
            <Controller
              name="phoneNumber"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  margin="normal"
                  fullWidth
                  id="phoneNumber"
                  label="Numéro de téléphone"
                  error={!!errors.phoneNumber}
                  helperText={errors.phoneNumber?.message}
                />
              )}
            />
            
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth margin="normal" error={!!errors.role}>
                  <InputLabel id="role-label">Rôle demandé</InputLabel>
                  <Select
                    {...field}
                    labelId="role-label"
                    id="role"
                    label="Rôle demandé"
                  >
                    <MenuItem value="attendee">Participant (Médecin généraliste)</MenuItem>
                    <MenuItem value="specialist">Spécialiste AVC</MenuItem>
                    <MenuItem value="stakeholder">Partie prenante</MenuItem>
                  </Select>
                  {errors.role && (
                    <Typography variant="caption" color="error">
                      {errors.role.message}
                    </Typography>
                  )}
                </FormControl>
              )}
            />
            
            <Controller
              name="consent"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Checkbox 
                      {...field}
                      checked={field.value}
                      color={errors.consent ? "error" : "primary"}
                    />
                  }
                  label="J'accepte les conditions d'utilisation et la politique de confidentialité"
                />
              )}
            />
            {errors.consent && (
              <Typography variant="caption" color="error" display="block">
                {errors.consent.message}
              </Typography>
            )}
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "S'inscrire"}
            </Button>
            
            <Box textAlign="center">
              <Link component={RouterLink} to="/login" variant="body2">
                Déjà un compte ? Se connecter
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;