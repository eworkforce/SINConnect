/**
 * Document Upload Component
 * StrokeTraining Platform v2.0
 * 
 * Comprehensive document upload interface with drag-and-drop,
 * real-time validation, progress tracking, and metadata input
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  LinearProgress,
  Grid,
  IconButton,
  Autocomplete,
  FormControlLabel,
  Switch,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  CloudUpload,
  Description,
  Delete,
  CheckCircle,
  Error,
  Warning,
  PictureAsPdf,
  Image,
  VideoFile,
  Add,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../contexts/AuthContext';
import { useDropzone } from 'react-dropzone';
import {
  validateFileType,
  validateFileSize,
  formatFileSize,
} from '../../services/documentStorage';
import { uploadDocumentWithMetadata } from '../../services/documentService';
import {
  DOCUMENT_CATEGORIES,
  DOCUMENT_PRIORITY_CONFIG,
  MEDICAL_SPECIALTIES,
  DIFFICULTY_LEVELS,
  DOCUMENT_PERMISSIONS,
} from '../../utils/documentConstants';
import { documentUploadSchema } from '../../utils/validation';
import type {
  DocumentUploadProgress,
  DocumentCategory,
  UserRole,
} from '../../types';

interface UploadFile {
  file: File;
  id: string;
  progress: DocumentUploadProgress;
  error?: string;
  documentId?: string;
  completed?: boolean;
}

interface DocumentUploadProps {
  onUploadComplete?: (documentIds: string[]) => void;
  onUploadError?: (error: string) => void;
  maxFiles?: number;
  allowedCategories?: DocumentCategory[];
  defaultCategory?: DocumentCategory;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  onUploadComplete,
  onUploadError,
  maxFiles = 10,
  allowedCategories,
  defaultCategory,
}) => {
  const { userProfile } = useAuth();
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showMetadataForm, setShowMetadataForm] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get user permissions
  const userPermissions = userProfile 
    ? DOCUMENT_PERMISSIONS[userProfile.role as UserRole]
    : null;

  // Filter allowed categories based on user role
  const availableCategories = allowedCategories || 
    (userPermissions?.allowedCategories || []);

  // Form setup
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<any>({
    resolver: zodResolver(documentUploadSchema as any),
    defaultValues: {
      title: '',
      description: '',
      summary: '',
      category: defaultCategory || availableCategories[0] || 'training-materials',
      tags: [],
      keywords: [], // Add keywords field
      priority: 'normal',
      language: 'fr',
      medicalSpecialty: [],
      targetAudience: ['attendee'],
      difficultyLevel: 'intermediate',
      cmeCredits: 0,
      medicalDisclaimer: '',
      clinicalEvidence: '',
      authorCredentials: '',
      isPublic: false,
      allowedRoles: ['attendee', 'specialist', 'admin'],
      requiresApproval: true,
    },
  });

  // Drag and drop setup
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (!userPermissions?.canUpload) {
      onUploadError?.('Vous n\'avez pas l\'autorisation de télécharger des documents');
      return;
    }

    // Check total file limit
    if (uploadFiles.length + acceptedFiles.length > maxFiles) {
      onUploadError?.(`Maximum ${maxFiles} fichiers autorisés`);
      return;
    }

    const newFiles: UploadFile[] = acceptedFiles.map((file) => {
      // Validate file type
      const isValidType = validateFileType(file);
      if (!isValidType) {
        return {
          file,
          id: `${Date.now()}-${Math.random()}`,
          progress: {
            fileName: file.name,
            progress: 0,
            status: 'error',
            error: 'Type de fichier non supporté',
            uploadedBytes: 0,
            totalBytes: file.size,
          },
        };
      }

      // Validate file size
      const sizeValidation = validateFileSize(file, userProfile?.role || 'attendee');
      if (!sizeValidation.valid) {
        return {
          file,
          id: `${Date.now()}-${Math.random()}`,
          progress: {
            fileName: file.name,
            progress: 0,
            status: 'error',
            error: sizeValidation.error,
            uploadedBytes: 0,
            totalBytes: file.size,
          },
        };
      }

      return {
        file,
        id: `${Date.now()}-${Math.random()}`,
        progress: {
          fileName: file.name,
          progress: 0,
          status: 'uploading',
          uploadedBytes: 0,
          totalBytes: file.size,
        },
      };
    });

    setUploadFiles(prev => [...prev, ...newFiles]);

    // Auto-fill title if only one file and no title set
    if (acceptedFiles.length === 1 && !watch('title')) {
      const fileName = acceptedFiles[0].name;
      const titleWithoutExt = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;
      setValue('title', titleWithoutExt);
    }

    // Show metadata form if files are valid
    if (newFiles.some(f => !f.progress.error)) {
      setShowMetadataForm(true);
    }
  }, [uploadFiles, maxFiles, userPermissions, userProfile, onUploadError, watch, setValue]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'video/mp4': ['.mp4'],
      'video/webm': ['.webm'],
    },
    maxSize: userPermissions?.maxFileSize ? userPermissions.maxFileSize * 1024 * 1024 : 50 * 1024 * 1024,
    disabled: isUploading || !userPermissions?.canUpload,
  });

  // Remove file from upload queue
  const removeFile = (fileId: string) => {
    setUploadFiles(prev => prev.filter(f => f.id !== fileId));
  };

  // Add tag
  const addTag = () => {
    if (tagInput.trim() && tags.length < 10 && !tags.includes(tagInput.trim())) {
      const newTags = [...tags, tagInput.trim()];
      setTags(newTags);
      setValue('tags', newTags);
      setTagInput('');
    }
  };

  // Remove tag
  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter(tag => tag !== tagToRemove);
    setTags(newTags);
    setValue('tags', newTags);
  };

  // Add keyword
  const addKeyword = () => {
    if (keywordInput.trim() && keywords.length < 20 && !keywords.includes(keywordInput.trim())) {
      const newKeywords = [...keywords, keywordInput.trim()];
      setKeywords(newKeywords);
      setValue('keywords', newKeywords);
      setKeywordInput('');
    }
  };

  // Remove keyword
  const removeKeyword = (keywordToRemove: string) => {
    const newKeywords = keywords.filter(keyword => keyword !== keywordToRemove);
    setKeywords(newKeywords);
    setValue('keywords', newKeywords);
  };


  // Get file icon based on type
  const getFileIcon = (file: File) => {
    if (file.type === 'application/pdf') return <PictureAsPdf color="error" />;
    if (file.type.startsWith('image/')) return <Image color="success" />;
    if (file.type.startsWith('video/')) return <VideoFile color="secondary" />;
    return <Description color="primary" />;
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'error': return 'error';
      case 'uploading': return 'primary';
      default: return 'primary';
    }
  };

  // Upload files
  const handleUpload = async (formData: any) => {
    console.log('\n=== UPLOAD HANDLER CALLED ===');
    console.log('🚀 Upload started with form data:', formData);
    console.log('📁 Files to upload:', uploadFiles);
    console.log('🔐 User permissions:', userPermissions);
    
    if (!userPermissions?.canUpload) {
      const errorMsg = 'Vous n\'avez pas l\'autorisation de télécharger des documents';
      console.error('❌ Permission error:', errorMsg);
      onUploadError?.(errorMsg);
      return;
    }

    const validFiles = uploadFiles.filter(f => !f.progress.error);
    if (validFiles.length === 0) {
      const errorMsg = 'Aucun fichier valide à télécharger';
      console.error('❌ No valid files:', errorMsg);
      onUploadError?.(errorMsg);
      return;
    }

    console.log('✅ Starting upload for', validFiles.length, 'files');
    setIsUploading(true);
    const completedDocumentIds: string[] = [];

    try {
      // Upload files one by one (could be parallel for better performance)
      for (const uploadFile of validFiles) {
        console.log('📤 Uploading file:', uploadFile.file.name);
        
        try {
          // Prepare document metadata
          const documentMetadata = {
            title: formData.title,
            description: formData.description,
            summary: formData.summary || '',
            category: formData.category,
            tags: formData.tags || [],
            keywords: formData.keywords || [],
            priority: formData.priority,
            language: formData.language,
            medicalSpecialty: formData.medicalSpecialty || [],
            targetAudience: formData.targetAudience || ['attendee'],
            difficultyLevel: formData.difficultyLevel,
            cmeCredits: formData.cmeCredits || 0,
            medicalDisclaimer: formData.medicalDisclaimer || '',
            clinicalEvidence: formData.clinicalEvidence || '',
            authorCredentials: formData.authorCredentials || '',
            access: {
              isPublic: formData.isPublic || false,
              allowedRoles: formData.allowedRoles || ['attendee', 'specialist', 'admin'],
              requiresApproval: formData.requiresApproval !== false,
            },
            version: 1,
            status: 'draft' as const,
            createdBy: userProfile!.id,
          };
          
          console.log('📋 Document metadata prepared:', documentMetadata);
          
          const result = await uploadDocumentWithMetadata(
            uploadFile.file,
            documentMetadata,
            userProfile!.id,
            (progress) => {
              console.log('📊 Upload progress for', uploadFile.file.name, ':', progress);
              setUploadFiles(prev => prev.map(f => 
                f.id === uploadFile.id 
                  ? { ...f, progress }
                  : f
              ));
            }
          );
          
          console.log('✅ Upload successful for', uploadFile.file.name, ':', result);

          // Mark as completed
          setUploadFiles(prev => prev.map(f => 
            f.id === uploadFile.id 
              ? { 
                  ...f, 
                  completed: true, 
                  documentId: result.documentId,
                  progress: { ...f.progress, status: 'completed', progress: 100 }
                }
              : f
          ));

          completedDocumentIds.push(result.documentId);

        } catch (error: any) {
          console.error('❌ Upload failed for', uploadFile.file.name, ':', error);
          // Mark individual file as error
          setUploadFiles(prev => prev.map(f => 
            f.id === uploadFile.id 
              ? { 
                  ...f, 
                  error: error.message,
                  progress: { ...f.progress, status: 'error', error: error.message }
                }
              : f
          ));
        }
      }

      if (completedDocumentIds.length > 0) {
        onUploadComplete?.(completedDocumentIds);
        
        // Reset form and files after successful upload
        setTimeout(() => {
          setUploadFiles([]);
          setShowMetadataForm(false);
          setTags([]);
          setKeywords([]);
          reset();
        }, 2000);
      }

    } catch (error: any) {
      console.error('❌ General upload error:', error);
      onUploadError?.(error.message || 'Erreur lors du téléchargement');
    } finally {
      setIsUploading(false);
    }
  };

  if (!userPermissions?.canUpload) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Warning color="warning" sx={{ fontSize: 48, mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          Accès non autorisé
        </Typography>
        <Typography color="text.secondary">
          Vous n'avez pas l'autorisation de télécharger des documents. 
          Contactez un administrateur pour obtenir les permissions nécessaires.
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      {/* File Drop Zone */}
      {!showMetadataForm && (
        <Paper
          {...getRootProps()}
          sx={{
            p: 4,
            textAlign: 'center',
            cursor: 'pointer',
            border: '2px dashed',
            borderColor: isDragReject 
              ? 'error.main' 
              : isDragActive 
                ? 'primary.main' 
                : 'grey.300',
            bgcolor: isDragReject 
              ? 'error.light' 
              : isDragActive 
                ? 'primary.light' 
                : 'background.default',
            transition: 'all 0.3s ease',
            '&:hover': {
              borderColor: 'primary.main',
              bgcolor: 'primary.light',
            },
          }}
        >
          <input {...getInputProps()} />
          <CloudUpload 
            sx={{ 
              fontSize: 64, 
              color: isDragReject ? 'error.main' : 'primary.main',
              mb: 2 
            }} 
          />
          
          {isDragReject ? (
            <Typography color="error" variant="h6">
              Fichier non supporté
            </Typography>
          ) : (
            <>
              <Typography variant="h6" gutterBottom>
                {isDragActive 
                  ? 'Déposez les fichiers ici...' 
                  : 'Glissez-déposez vos documents ou cliquez pour sélectionner'
                }
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                Formats supportés: PDF, Word, PowerPoint, Images (JPEG, PNG), Vidéos (MP4, WebM)
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Taille maximum: {formatFileSize(userPermissions.maxFileSize * 1024 * 1024)} par fichier
              </Typography>
            </>
          )}

          <Button
            variant="contained"
            startIcon={<CloudUpload />}
            sx={{ mt: 2 }}
            onClick={() => fileInputRef.current?.click()}
          >
            Sélectionner des fichiers
          </Button>
        </Paper>
      )}

      {/* File List */}
      {uploadFiles.length > 0 && (
        <Paper sx={{ mt: 2, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Fichiers sélectionnés ({uploadFiles.length})
          </Typography>
          
          <List dense>
            {uploadFiles.map((uploadFile) => (
              <ListItem key={uploadFile.id}>
                <ListItemIcon>
                  {getFileIcon(uploadFile.file)}
                </ListItemIcon>
                
                <ListItemText
                  primary={uploadFile.file.name}
                  secondary={
                    <React.Fragment>
                      <Typography variant="caption" component="span" display="block">
                        {formatFileSize(uploadFile.file.size)}
                      </Typography>
                      
                      {uploadFile.progress.status === 'uploading' && (
                        <Box sx={{ mt: 1 }} component="span">
                          <LinearProgress 
                            variant="determinate" 
                            value={uploadFile.progress.progress}
                            color={getStatusColor(uploadFile.progress.status) as any}
                          />
                          <Typography variant="caption" component="span">
                            {Math.round(uploadFile.progress.progress)}%
                          </Typography>
                        </Box>
                      )}
                      
                      {uploadFile.progress.status === 'completed' && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }} component="span">
                          <CheckCircle color="success" sx={{ fontSize: 16, mr: 0.5 }} />
                          <Typography variant="caption" color="success.main" component="span">
                            Téléchargé avec succès
                          </Typography>
                        </Box>
                      )}
                      
                      {uploadFile.progress.error && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }} component="span">
                          <Error color="error" sx={{ fontSize: 16, mr: 0.5 }} />
                          <Typography variant="caption" color="error" component="span">
                            {uploadFile.progress.error}
                          </Typography>
                        </Box>
                      )}
                    </React.Fragment>
                  }
                />
                
                <ListItemSecondaryAction>
                  <IconButton 
                    edge="end" 
                    onClick={() => removeFile(uploadFile.id)}
                    disabled={isUploading}
                  >
                    <Delete />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>

          {uploadFiles.some(f => !f.progress.error) && (
            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                onClick={() => setShowMetadataForm(true)}
                disabled={isUploading}
              >
                Continuer vers les informations
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || uploadFiles.length >= maxFiles}
              >
                Ajouter d'autres fichiers
              </Button>
            </Box>
          )}
        </Paper>
      )}

      {/* Metadata Form */}
      {showMetadataForm && (
        <Paper sx={{ mt: 2, p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Informations du document
          </Typography>

          <Box component="form" onSubmit={(e) => {
            console.log('📝 Form submitted!');
            console.log('📋 Form event:', e);
            console.log('🔍 Form validation errors:', errors);
            console.log('📊 Form valid?', Object.keys(errors).length === 0);
            
            const result = handleSubmit(
              (data) => {
                console.log('🎯 handleSubmit callback called with data:', data);
                return handleUpload(data);
              },
              (errors) => {
                console.error('❌ Form validation failed:', errors);
              }
            )(e);
            
            console.log('📤 handleSubmit result:', result);
            return result;
          }}>
            <Grid container spacing={3}>
              {/* Title */}
              <Grid size={12}>
                <Controller
                  name="title"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Titre du document *"
                      error={!!errors.title}
                      helperText={errors.title?.message as string}
                      disabled={isUploading}
                    />
                  )}
                />
              </Grid>

              {/* Description */}
              <Grid size={12}>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      multiline
                      rows={4}
                      label="Description *"
                      error={!!errors.description}
                      helperText={errors.description?.message as string}
                      disabled={isUploading}
                    />
                  )}
                />
              </Grid>

              {/* Summary */}
              <Grid size={12}>
                <Controller
                  name="summary"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      multiline
                      rows={2}
                      label="Résumé (optionnel)"
                      error={!!errors.summary}
                      helperText={(errors.summary?.message as string) || "Bref résumé pour les listes"}
                      disabled={isUploading}
                    />
                  )}
                />
              </Grid>

              {/* Category and Priority */}
              <Grid size={{xs: 12, md: 6}}>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.category}>
                      <InputLabel>Catégorie *</InputLabel>
                      <Select
                        {...field}
                        label="Catégorie *"
                        disabled={isUploading}
                      >
                        {availableCategories.map((category) => (
                          <MenuItem key={category} value={category}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Box
                                sx={{
                                  width: 12,
                                  height: 12,
                                  borderRadius: 1,
                                  bgcolor: DOCUMENT_CATEGORIES[category].color,
                                  mr: 1,
                                }}
                              />
                              {DOCUMENT_CATEGORIES[category].label}
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid size={{xs: 12, md: 6}}>
                <Controller
                  name="priority"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.priority}>
                      <InputLabel>Priorité *</InputLabel>
                      <Select
                        {...field}
                        label="Priorité *"
                        disabled={isUploading}
                      >
                        {Object.entries(DOCUMENT_PRIORITY_CONFIG).map(([key, config]) => (
                          <MenuItem key={key} value={key}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Box
                                sx={{
                                  width: 12,
                                  height: 12,
                                  borderRadius: 1,
                                  bgcolor: config.color,
                                  mr: 1,
                                }}
                              />
                              {config.label}
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>

              {/* Tags */}
              <Grid size={12}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Tags ({tags.length}/10)
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                    {tags.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        onDelete={() => removeTag(tag)}
                        size="small"
                        disabled={isUploading}
                      />
                    ))}
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      size="small"
                      label="Ajouter un tag"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      disabled={isUploading || tags.length >= 10}
                    />
                    <Button
                      onClick={addTag}
                      disabled={!tagInput.trim() || isUploading || tags.length >= 10}
                      variant="outlined"
                      size="small"
                    >
                      Ajouter
                    </Button>
                  </Box>
                </Box>
              </Grid>

              {/* Keywords */}
              <Grid size={12}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Mots-clés ({keywords.length}/20)
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                    {keywords.map((keyword) => (
                      <Chip
                        key={keyword}
                        label={keyword}
                        onDelete={() => removeKeyword(keyword)}
                        size="small"
                        disabled={isUploading}
                        color="secondary"
                      />
                    ))}
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      size="small"
                      label="Ajouter un mot-clé"
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                      disabled={isUploading || keywords.length >= 20}
                      helperText="Mots-clés techniques ou concepts spécifiques"
                    />
                    <Button
                      onClick={addKeyword}
                      disabled={!keywordInput.trim() || isUploading || keywords.length >= 20}
                      variant="outlined"
                      size="small"
                    >
                      Ajouter
                    </Button>
                  </Box>
                </Box>
              </Grid>

              {/* Medical Specialties */}
              <Grid size={{xs: 12, md: 6}}>
                <Controller
                  name="medicalSpecialty"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      {...field}
                      multiple
                      options={MEDICAL_SPECIALTIES}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Spécialités médicales"
                          error={!!errors.medicalSpecialty}
                          helperText={errors.medicalSpecialty?.message as string}
                        />
                      )}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <Chip
                            {...getTagProps({ index })}
                            key={option}
                            label={option}
                            size="small"
                          />
                        ))
                      }
                      disabled={isUploading}
                      onChange={(_, newValue) => {
                        setValue('medicalSpecialty', newValue);
                      }}
                    />
                  )}
                />
              </Grid>

              {/* Difficulty Level */}
              <Grid size={{xs: 12, md: 6}}>
                <Controller
                  name="difficultyLevel"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Niveau de difficulté</InputLabel>
                      <Select
                        {...field}
                        label="Niveau de difficulté"
                        disabled={isUploading}
                      >
                        {Object.entries(DIFFICULTY_LEVELS).map(([key, config]) => (
                          <MenuItem key={key} value={key}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Box
                                sx={{
                                  width: 12,
                                  height: 12,
                                  borderRadius: 1,
                                  bgcolor: config.color,
                                  mr: 1,
                                }}
                              />
                              {config.label}
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>

              {/* CME Credits */}
              <Grid size={{xs: 12, md: 6}}>
                <Controller
                  name="cmeCredits"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="number"
                      label="Crédits CME"
                      inputProps={{ min: 0, max: 50 }}
                      error={!!errors.cmeCredits}
                      helperText={errors.cmeCredits?.message as string}
                      disabled={isUploading}
                      onChange={(e) => setValue('cmeCredits', parseInt(e.target.value) || 0)}
                    />
                  )}
                />
              </Grid>

              {/* Public/Private Toggle */}
              <Grid size={{xs: 12, md: 6}}>
                <Controller
                  name="isPublic"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Switch
                          {...field}
                          checked={field.value}
                          disabled={isUploading}
                        />
                      }
                      label="Document public"
                    />
                  )}
                />
              </Grid>

              <Divider sx={{ width: '100%', my: 2 }} />

              {/* Action Buttons */}
              <Grid size={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={() => setShowMetadataForm(false)}
                    disabled={isUploading}
                  >
                    Retour aux fichiers
                  </Button>
                  
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isUploading || uploadFiles.every(f => f.progress.error)}
                    startIcon={isUploading ? <LinearProgress /> : <CloudUpload />}
                    onClick={(e) => {
                      console.log('🖱️ Upload button clicked!');
                      console.log('🔴 Is uploading:', isUploading);
                      console.log('🔄 Upload files:', uploadFiles);
                      console.log('🚫 Button disabled?', (isUploading || uploadFiles.every(f => f.progress.error)));
                      console.log('🔍 Current form values:', control._formValues);
                      console.log('⚠️ Form errors:', errors);
                      
                      // Check if button is actually disabled
                      if (isUploading || uploadFiles.every(f => f.progress.error)) {
                        console.log('🙅 Button is disabled - not proceeding');
                        e.preventDefault();
                        return;
                      }
                      
                      console.log('✅ Button click proceeding to form submission...');
                      // Let form submission handle the rest
                    }}
                  >
                    {isUploading ? 'Téléchargement...' : 'Télécharger les documents'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      )}

      {/* Hidden file input for manual selection */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.mp4,.webm"
        style={{ display: 'none' }}
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          onDrop(files);
          e.target.value = ''; // Reset input
        }}
      />
    </Box>
  );
};

export default DocumentUpload;