/**
 * Login Page Component
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
  FormControlLabel,
  Checkbox,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../../contexts/AuthContext";
import { loginSchema, passwordResetSchema, type LoginFormData, type PasswordResetFormData } from "../../utils/validation";

const Login: React.FC = () => {
  const { login, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  // Login form with React Hook Form
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  // Password reset form
  const {
    control: resetControl,
    handleSubmit: handleResetSubmit,
    formState: { errors: resetErrors },
    reset: resetForm,
  } = useForm<PasswordResetFormData>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      await login(data.email, data.password, data.rememberMe);
      setSuccessMessage('Connexion réussie! Redirection...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (error: any) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const onResetPassword = async (data: PasswordResetFormData) => {
    setResetLoading(true);
    try {
      await resetPassword(data.email);
      setSuccessMessage('Email de réinitialisation envoyé!');
      setResetDialogOpen(false);
      resetForm();
    } catch (error: any) {
      setErrorMessage(error.message);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
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
            Plateforme AVC-Espoir
          </Typography>
          <Typography variant="h5" align="center" color="text.secondary" gutterBottom>
            Connexion
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
                  autoFocus
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
                  autoComplete="current-password"
                  error={!!errors.password}
                  helperText={errors.password?.message}
                />
              )}
            />
            
            <Controller
              name="rememberMe"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Checkbox 
                      {...field}
                      checked={field.value}
                    />
                  }
                  label="Se souvenir de moi"
                />
              )}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Se connecter"}
            </Button>
            
            <Box sx={{ textAlign: 'center' }}>
              <Link 
                component="button" 
                type="button"
                variant="body2" 
                onClick={() => setResetDialogOpen(true)}
                sx={{ display: 'block', mb: 1 }}
              >
                Mot de passe oublié ?
              </Link>
              <Link component={RouterLink} to="/register" variant="body2">
                Pas de compte ? S'inscrire
              </Link>
            </Box>
          </Box>
        </Paper>
        
        {/* Test Firebase Connection */}
        <Paper elevation={1} sx={{ padding: 2, width: "100%", mt: 2, bgcolor: "#f5f5f5" }}>
          <Typography variant="body2" align="center">
            <strong>État de la connexion Firebase:</strong><br/>
            Projet: strocktraining<br/>
            Statut: 🟢 Connecté
          </Typography>
        </Paper>
      </Box>
      
      {/* Password Reset Dialog */}
      <Dialog open={resetDialogOpen} onClose={() => setResetDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Réinitialiser le mot de passe</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Entrez votre adresse email pour recevoir un lien de réinitialisation.
          </Typography>
          <Box component="form" onSubmit={handleResetSubmit(onResetPassword)}>
            <Controller
              name="email"
              control={resetControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  margin="normal"
                  required
                  fullWidth
                  id="reset-email"
                  label="Adresse email"
                  autoComplete="email"
                  autoFocus
                  error={!!resetErrors.email}
                  helperText={resetErrors.email?.message}
                />
              )}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetDialogOpen(false)}>Annuler</Button>
          <Button 
            onClick={handleResetSubmit(onResetPassword)}
            variant="contained"
            disabled={resetLoading}
          >
            {resetLoading ? <CircularProgress size={20} /> : "Envoyer"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Login;
