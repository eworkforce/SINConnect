/**
 * View Document Page
 * StrokeTraining Platform v2.0
 * 
 * Page for viewing individual documents with PDF viewer and metadata
 */

import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Breadcrumbs,
  Link,
  Container,
  CircularProgress,
  Button,
  Grid,
  Chip,
  Card,
  CardContent,
  Divider,
  IconButton,
  Alert,
} from '@mui/material';
import {
  NavigateNext,
  Description,
  ArrowBack,
  FileDownload,
  Visibility,
  Share,
  Bookmark,
  BookmarkBorder,
  ZoomIn,
  ZoomOut,
  Assignment,
  VideoLibrary,
  Image,
  PictureAsPdf,
  Article,
  Schedule,
  Category,
  LocalOffer,
  Info,
} from '@mui/icons-material';
import { Link as RouterLink, useParams, useNavigate } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import AppLayout from '../../components/layout/AppLayout';
import { useDocument } from '../../hooks/useDocument';
import { incrementDownloadCount } from '../../services/documentService';
import type { DocumentCategory } from '../../types';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

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

const ViewDocument: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { document, loading, error, refetch } = useDocument(id);
  
  // PDF viewer state
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.2);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const handleGoBack = () => {
    navigate('/documents/browse');
  };

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

  // PDF document load success
  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPdfError(null);
    console.log('📄 PDF loaded successfully:', numPages, 'pages');
  }, []);

  // PDF document load error
  const onDocumentLoadError = useCallback((error: any) => {
    console.error('❌ PDF load error:', error);
    setPdfError('Erreur lors du chargement du PDF. Le document pourrait ne pas être accessible.');
  }, []);

  // Handle download
  const handleDownload = useCallback(async () => {
    if (!document) return;
    
    try {
      console.log('⬇️ Downloading document:', document.id);
      
      // Increment download count
      await incrementDownloadCount(document.id);
      
      // Trigger download
      const link = window.document.createElement('a');
      link.href = document.downloadURL;
      link.download = document.fileName;
      link.target = '_blank';
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      
      console.log('✅ Download initiated');
    } catch (error) {
      console.error('❌ Download error:', error);
    }
  }, [document]);

  // Handle share
  const handleShare = useCallback(async () => {
    if (!document) return;
    
    const shareData = {
      title: document.title,
      text: document.description,
      url: window.location.href,
    };
    
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        // You might want to show a toast notification here
        console.log('📋 Link copied to clipboard');
      }
    } catch (error) {
      console.error('❌ Share error:', error);
    }
  }, [document]);

  // Handle bookmark toggle
  const handleBookmarkToggle = useCallback(() => {
    setIsBookmarked(!isBookmarked);
    // In a real app, you'd save this to user preferences or backend
    console.log('🔖 Bookmark toggled:', !isBookmarked);
  }, [isBookmarked]);

  // PDF navigation
  const goToPrevPage = () => setPageNumber(page => Math.max(1, page - 1));
  const goToNextPage = () => setPageNumber(page => Math.min(numPages || 1, page + 1));
  
  // Zoom controls
  const zoomIn = () => setScale(s => Math.min(3, s + 0.2));
  const zoomOut = () => setScale(s => Math.max(0.5, s - 0.2));

  if (loading) {
    return (
      <AppLayout>
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <Box sx={{ textAlign: 'center' }}>
              <CircularProgress size={60} sx={{ mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Chargement du document...
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Préparation de la visualisation
              </Typography>
            </Box>
          </Box>
        </Container>
      </AppLayout>
    );
  }

  if (error || !document) {
    return (
      <AppLayout>
        <Container maxWidth="lg">
          <Box sx={{ mt: 4 }}>
            <Alert severity="error" sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                {error || 'Document introuvable'}
              </Typography>
              <Typography variant="body2">
                Le document que vous recherchez n'existe pas ou n'est plus disponible.
              </Typography>
            </Alert>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<ArrowBack />}
                onClick={handleGoBack}
              >
                Retour aux documents
              </Button>
              <Button
                variant="outlined"
                onClick={refetch}
              >
                Réessayer
              </Button>
            </Box>
          </Box>
        </Container>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Container maxWidth="xl">
        {/* Breadcrumbs */}
        <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mb: 3 }}>
          <Link component={RouterLink} to="/dashboard" color="inherit">
            Tableau de bord
          </Link>
          <Link component={RouterLink} to="/documents" color="inherit">
            Documents
          </Link>
          <Link component={RouterLink} to="/documents/browse" color="inherit">
            Parcourir
          </Link>
          <Typography color="text.primary">{document.title}</Typography>
        </Breadcrumbs>

        <Grid container spacing={3}>
          {/* Document Viewer */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper sx={{ p: 2 }}>
              {/* PDF Controls */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                mb: 2,
                borderBottom: 1,
                borderColor: 'divider',
                pb: 2
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={<ArrowBack />}
                    onClick={handleGoBack}
                    size="small"
                  >
                    Retour
                  </Button>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {/* Page Navigation */}
                  {numPages && (
                    <>
                      <Button
                        size="small"
                        onClick={goToPrevPage}
                        disabled={pageNumber <= 1}
                      >
                        Précédent
                      </Button>
                      <Typography variant="body2" sx={{ mx: 2 }}>
                        {pageNumber} / {numPages}
                      </Typography>
                      <Button
                        size="small"
                        onClick={goToNextPage}
                        disabled={pageNumber >= numPages}
                      >
                        Suivant
                      </Button>
                      <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                    </>
                  )}
                  
                  {/* Zoom Controls */}
                  <IconButton size="small" onClick={zoomOut} disabled={scale <= 0.5}>
                    <ZoomOut />
                  </IconButton>
                  <Typography variant="body2" sx={{ mx: 1, minWidth: 40, textAlign: 'center' }}>
                    {Math.round(scale * 100)}%
                  </Typography>
                  <IconButton size="small" onClick={zoomIn} disabled={scale >= 3}>
                    <ZoomIn />
                  </IconButton>
                </Box>
              </Box>

              {/* PDF Viewer */}
              <Box sx={{ 
                textAlign: 'center', 
                minHeight: '70vh',
                border: 1,
                borderColor: 'grey.300',
                borderRadius: 1,
                overflow: 'auto',
                bgcolor: 'grey.50'
              }}>
                {pdfError ? (
                  <Box sx={{ p: 4 }}>
                    <Alert severity="warning">
                      <Typography variant="body2">
                        {pdfError}
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<FileDownload />}
                        onClick={handleDownload}
                        sx={{ mt: 2 }}
                      >
                        Télécharger le document
                      </Button>
                    </Alert>
                  </Box>
                ) : (
                  <Document
                    file={document.downloadURL}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={onDocumentLoadError}
                    loading={
                      <Box sx={{ p: 4 }}>
                        <CircularProgress />
                        <Typography variant="body2" sx={{ mt: 2 }}>
                          Chargement du PDF...
                        </Typography>
                      </Box>
                    }
                  >
                    <Page
                      pageNumber={pageNumber}
                      scale={scale}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                    />
                  </Document>
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Document Metadata Sidebar */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ position: 'sticky', top: 20 }}>
              <CardContent>
                {/* Document Title */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                    {document.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {document.description}
                  </Typography>
                  
                  {/* Category and Priority */}
                  <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
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
                </Box>

                <Divider sx={{ mb: 3 }} />

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
                  <Button
                    variant="contained"
                    startIcon={<FileDownload />}
                    onClick={handleDownload}
                    fullWidth
                  >
                    Télécharger
                  </Button>
                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      startIcon={<Share />}
                      onClick={handleShare}
                      sx={{ flex: 1 }}
                    >
                      Partager
                    </Button>
                    <IconButton
                      onClick={handleBookmarkToggle}
                      color={isBookmarked ? 'primary' : 'default'}
                    >
                      {isBookmarked ? <Bookmark /> : <BookmarkBorder />}
                    </IconButton>
                  </Box>
                </Box>

                <Divider sx={{ mb: 3 }} />

                {/* Document Info */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <Info sx={{ mr: 1, fontSize: '1.2rem' }} />
                    Informations
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {/* File Info */}
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Description sx={{ mr: 1, color: 'text.secondary', fontSize: '1rem' }} />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {document.fileName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatFileSize(document.fileSize)}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Created Date */}
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Schedule sx={{ mr: 1, color: 'text.secondary', fontSize: '1rem' }} />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          Créé {formatDate(document.createdAt)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          par {document.createdBy}
                        </Typography>
                      </Box>
                    </Box>

                    {/* View Stats */}
                    {document.metadata && (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Visibility sx={{ mr: 1, color: 'text.secondary', fontSize: '1rem' }} />
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {document.metadata.viewCount || 0} vues
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {document.metadata.downloadCount || 0} téléchargements
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  </Box>
                </Box>

                {/* Tags */}
                {document.tags && document.tags.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                      <LocalOffer sx={{ mr: 1, fontSize: '1.2rem' }} />
                      Tags
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {document.tags.map((tag) => (
                        <Chip
                          key={tag}
                          label={tag}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Box>
                )}

                {/* Additional Metadata */}
                {(document.medicalSpecialty || document.difficultyLevel || document.cmeCredits) && (
                  <Box>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                      <Category sx={{ mr: 1, fontSize: '1.2rem' }} />
                      Détails médicaux
                    </Typography>
                    
                    {document.medicalSpecialty && (
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Spécialité:</strong> {document.medicalSpecialty.join(', ')}
                      </Typography>
                    )}
                    
                    {document.difficultyLevel && (
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Niveau:</strong> {document.difficultyLevel}
                      </Typography>
                    )}
                    
                    {document.cmeCredits && (
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Crédits CME:</strong> {document.cmeCredits}
                      </Typography>
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </AppLayout>
  );
};

export default ViewDocument;