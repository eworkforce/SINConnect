/**
 * Document List Component
 * StrokeTraining Platform v2.0
 * 
 * Component for displaying a list/grid of documents with search and filter capabilities
 */

import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
} from '@mui/material';
import {
  Description,
  FileDownload,
  Visibility,
  GetApp,
  Assignment,
  VideoLibrary,
  Image,
  PictureAsPdf,
  Article,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { DocumentCategory } from '../../types';

// Document interface matching our hook and DocumentMetadata from service
interface Document {
  id: string;
  title: string;
  description: string;
  summary?: string;
  category: DocumentCategory;
  tags: string[];
  keywords?: string[]; // Optional since existing docs might not have this
  priority: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  downloadURL: string;
  createdBy: string;
  createdAt: any;
  metadata?: {
    viewCount?: number;
    downloadCount?: number;
    rating?: number;
    ratingCount?: number;
  };
  // Additional fields that might be present
  storagePath?: string;
  language?: string;
  version?: number;
  access?: {
    isPublic: boolean;
    allowedRoles: string[];
    requiresApproval: boolean;
  };
}

interface DocumentListProps {
  loading?: boolean;
  documents?: Document[];
  onDocumentClick?: (documentId: string) => void;
}

// Helper function to get category icon
const getCategoryIcon = (category: DocumentCategory) => {
  switch (category) {
    case 'clinical-guidelines':
      return <Assignment />;
    case 'training-materials':
      return <Article />;
    case 'case-studies':
      return <Description />;
    case 'presentations':
      return <Assignment />;
    case 'videos':
      return <VideoLibrary />;
    case 'infographics':
      return <Image />;
    default:
      return <PictureAsPdf />;
  }
};

// Helper function to get category color
const getCategoryColor = (category: DocumentCategory) => {
  switch (category) {
    case 'clinical-guidelines':
      return 'primary';
    case 'training-materials':
      return 'secondary';
    case 'case-studies':
      return 'success';
    case 'best-practices':
      return 'info';
    case 'research-papers':
      return 'warning';
    case 'videos':
      return 'error';
    default:
      return 'default';
  }
};

// Helper function to format category name
const formatCategory = (category: DocumentCategory) => {
  const categoryMap = {
    'clinical-guidelines': 'Directives Cliniques',
    'training-materials': 'Matériel de Formation',
    'case-studies': 'Études de Cas',
    'best-practices': 'Bonnes Pratiques',
    'research-papers': 'Articles de Recherche',
    'policy-documents': 'Documents de Politique',
    'presentations': 'Présentations',
    'videos': 'Vidéos',
    'infographics': 'Infographies',
    'assessments': 'Évaluations',
  };
  return categoryMap[category] || category;
};

// Helper function to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const DocumentList: React.FC<DocumentListProps> = ({
  loading = true,
  documents = [],
  onDocumentClick,
}) => {
  if (loading) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <CircularProgress sx={{ mb: 2 }} />
        <Typography variant="body1">
          Chargement des documents...
        </Typography>
      </Paper>
    );
  }

  if (documents.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          Aucun document trouvé
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Aucun document ne correspond aux critères de recherche.
        </Typography>
      </Paper>
    );
  }

  // Helper function to format date
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Date inconnue';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return formatDistanceToNow(date, { addSuffix: true, locale: fr });
    } catch {
      return 'Date inconnue';
    }
  };

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {documents.length} document{documents.length > 1 ? 's' : ''} trouvé{documents.length > 1 ? 's' : ''}
      </Typography>

      <Grid container spacing={3}>
        {documents.map((document) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={document.id}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: onDocumentClick ? 'pointer' : 'default',
                transition: 'all 0.2s ease-in-out',
                '&:hover': onDocumentClick ? {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                } : {},
              }}
              onClick={() => onDocumentClick?.(document.id)}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                {/* Category and Priority */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Chip
                    icon={getCategoryIcon(document.category)}
                    label={formatCategory(document.category)}
                    color={getCategoryColor(document.category) as any}
                    size="small"
                  />
                  {document.priority === 'critical' && (
                    <Chip label="Critique" color="error" size="small" />
                  )}
                  {document.priority === 'high' && (
                    <Chip label="Priorité" color="warning" size="small" />
                  )}
                </Box>

                {/* Title */}
                <Typography variant="h6" gutterBottom sx={{ 
                  fontWeight: 600,
                  lineHeight: 1.3,
                  display: '-webkit-box',
                  WebkitBoxOrient: 'vertical',
                  WebkitLineClamp: 2,
                  overflow: 'hidden',
                }}>
                  {document.title}
                </Typography>

                {/* Description */}
                <Typography variant="body2" color="text.secondary" sx={{ 
                  mb: 2,
                  display: '-webkit-box',
                  WebkitBoxOrient: 'vertical',
                  WebkitLineClamp: 3,
                  overflow: 'hidden',
                }}>
                  {document.summary || document.description}
                </Typography>

                {/* Tags */}
                {document.tags && document.tags.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    {document.tags.slice(0, 3).map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        size="small"
                        variant="outlined"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    ))}
                    {document.tags.length > 3 && (
                      <Chip
                        label={`+${document.tags.length - 3}`}
                        size="small"
                        variant="outlined"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    )}
                  </Box>
                )}

                {/* File Info */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Description sx={{ fontSize: '1rem', mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {document.fileName} • {formatFileSize(document.fileSize)}
                  </Typography>
                </Box>

                {/* Metadata */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  {document.metadata?.viewCount !== undefined && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Visibility sx={{ fontSize: '0.9rem', mr: 0.5, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {document.metadata.viewCount}
                      </Typography>
                    </Box>
                  )}
                  {document.metadata?.downloadCount !== undefined && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <GetApp sx={{ fontSize: '0.9rem', mr: 0.5, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {document.metadata.downloadCount}
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Created Date */}
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  {formatDate(document.createdAt)}
                </Typography>
              </CardContent>

              <CardActions sx={{ pt: 0 }}>
                <Button
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDocumentClick?.(document.id);
                  }}
                  startIcon={<Visibility />}
                >
                  Voir
                </Button>
                <Button
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(document.downloadURL, '_blank');
                  }}
                  startIcon={<FileDownload />}
                >
                  Télécharger
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default DocumentList;