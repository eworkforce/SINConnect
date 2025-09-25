# 🔥 Firebase Storage Configuration - Document Management System

**StrokeTraining Platform v2.0**

## 📋 Overview

This document outlines the Firebase Storage configuration and security rules for the healthcare document management system. The storage is organized with a hierarchical folder structure that supports document versioning, thumbnails, previews, and role-based access control.

## 🏗️ Storage Structure

### 📁 Document Storage Hierarchy

```
firebase-storage/
├── 📁 documents/                           # Main documents storage
│   ├── 📁 {category}/                      # Document category folder
│   │   ├── 📁 {documentId}/                # Individual document folder
│   │   │   ├── 📁 {version}/               # Version-specific files
│   │   │   │   └── 📄 {fileName}           # Actual document file
│   │   │   ├── 📁 thumbnails/              # Document thumbnails
│   │   │   │   └── 🖼️ thumbnail.jpg        # Auto-generated thumbnails
│   │   │   └── 📁 previews/                # Document previews
│   │   │       └── 👁️ preview.pdf          # PDF previews, images
│   │   └── ...
│   └── ...
├── 📁 users/                               # User-specific storage
│   └── 📁 {userId}/
│       └── 📁 profile/
│           └── 🖼️ avatar.jpg                # Profile images
├── 📁 temp/                                # Temporary uploads
│   └── 📁 {userId}/
│       └── 📁 {uploadId}/
│           └── 📄 {fileName}                # Temporary files (24h TTL)
└── 📁 backups/                             # System backups (admin only)
    └── 📁 {date}/
        └── 📄 backup.zip
```

### 🗂️ Document Categories

| Category | Folder Name | Description | French Label |
|----------|-------------|-------------|--------------|
| Clinical Guidelines | `clinical-guidelines` | Medical protocols and clinical practice guidelines | Recommandations cliniques |
| Training Materials | `training-materials` | Educational resources and course materials | Matériel de formation |
| Case Studies | `case-studies` | Clinical cases and detailed analyses | Études de cas |
| Best Practices | `best-practices` | Recommendations and practical advice | Bonnes pratiques |
| Research Papers | `research-papers` | Scientific publications and studies | Articles de recherche |
| Policy Documents | `policy-documents` | Institutional and regulatory policies | Documents de politique |
| Presentations | `presentations` | Slides and presentation materials | Présentations |
| Videos | `videos` | Educational video content | Vidéos |
| Infographics | `infographics` | Visual aids and diagrams | Infographies |
| Assessments | `assessments` | Tests and evaluation questionnaires | Évaluations |

## 🔒 Security Rules

### 🛡️ Access Control Matrix

| User Role | Read Documents | Upload Documents | Edit Documents | Delete Documents | Max File Size |
|-----------|----------------|------------------|----------------|------------------|---------------|
| **Attendee** | ✅ Approved only | ❌ No | ❌ No | ❌ No | N/A |
| **Specialist** | ✅ All + Drafts | ✅ Yes | ✅ Own docs | ❌ No | 100MB (200MB videos) |
| **Admin** | ✅ All | ✅ Yes | ✅ All | ✅ Yes | 500MB |
| **Stakeholder** | ✅ Approved only | ❌ No | ❌ No | ❌ No | N/A |

### 🔐 Authentication Requirements

- **All operations require authentication** (Firebase Auth)
- **Role-based permissions** via custom claims in JWT tokens
- **Email verification required** for document access
- **Session-based access** with automatic token refresh

### 📏 File Size Limits

#### Documents & Presentations
- **Admin**: Up to 500MB
- **Specialist**: Up to 100MB
- **Others**: Up to 10MB

#### Videos
- **Admin**: Up to 500MB
- **Specialist**: Up to 200MB
- **Others**: Up to 50MB

#### Profile Images
- **All users**: Up to 5MB

#### Thumbnails & Previews
- **Thumbnails**: Up to 5MB
- **Previews**: Up to 20MB

### 🎯 Supported File Types

#### Documents
- **PDF**: `application/pdf`
- **Word**: `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- **PowerPoint**: `application/vnd.ms-powerpoint`, `application/vnd.openxmlformats-officedocument.presentationml.presentation`

#### Media
- **Images**: `image/jpeg`, `image/png`
- **Videos**: `video/mp4`, `video/webm`

#### Validation Rules
- **Minimum file size**: 1KB (prevents empty files)
- **File type validation**: Strict MIME type checking
- **Malicious file prevention**: Extension-based validation
- **Duplicate detection**: MD5 checksum validation

## 🛠️ Configuration Details

### 📝 Rules Configuration

The storage rules are defined in `storage/rules/storage.rules` and include:

1. **Helper Functions**
   - User authentication checks
   - Role-based permission validation
   - File size and type validation
   - Custom security predicates

2. **Path-based Rules**
   - Document access patterns
   - User-specific folder permissions
   - Temporary upload handling
   - System asset management

3. **Validation Logic**
   - Dynamic file size limits based on user role
   - MIME type enforcement
   - Custom metadata requirements
   - Upload progress tracking

### 🚀 Deployment

#### Automatic Deployment
Use the provided deployment script:

```bash
# Navigate to backend directory
cd backend

# Run deployment script
./storage/rules/deploy-storage-rules.sh
```

#### Manual Deployment
```bash
# Navigate to backend directory
cd backend

# Deploy only storage rules
firebase deploy --only storage:rules

# Deploy all services
firebase deploy
```

#### Validation
```bash
# Dry run (validate without deploying)
firebase deploy --only storage:rules --dry-run
```

### 🧪 Testing

#### Firebase Emulator
```bash
# Start storage emulator
firebase emulators:start --only storage

# Storage emulator runs on port 9199
# Web UI available at http://localhost:4000
```

#### Rule Testing
```bash
# Test rules with Firebase CLI
firebase emulators:exec "npm test" --only storage
```

## 🔧 Integration

### 📱 Frontend Integration

The frontend uses the `documentStorage.ts` service which provides:

#### Upload Operations
```typescript
import { uploadDocument, uploadTempFile } from '../services/documentStorage';

// Upload document with progress tracking
const result = await uploadDocument(
  file,
  'clinical-guidelines',
  documentId,
  '1.0',
  (progress) => console.log(`Progress: ${progress.progress}%`)
);
```

#### Download Operations
```typescript
import { getDocumentDownloadURL } from '../services/documentStorage';

// Get secure download URL
const downloadURL = await getDocumentDownloadURL(
  'clinical-guidelines',
  documentId,
  '1.0',
  fileName
);
```

#### Validation
```typescript
import { validateFileType, validateFileSize } from '../services/documentStorage';

// Validate file before upload
const isValidType = validateFileType(file);
const sizeValidation = validateFileSize(file, userRole);
```

### 🔄 Firestore Integration

Storage paths are synchronized with Firestore documents:

```typescript
// Document metadata stored in Firestore
const documentDoc = {
  id: 'doc123',
  fileUrl: 'gs://bucket/documents/clinical-guidelines/doc123/1.0/file.pdf',
  thumbnailUrl: 'gs://bucket/documents/clinical-guidelines/doc123/thumbnails/thumb.jpg',
  previewUrl: 'gs://bucket/documents/clinical-guidelines/doc123/previews/preview.pdf',
  // ... other metadata
};
```

## 🔍 Monitoring & Analytics

### 📊 Storage Metrics

Monitor the following metrics in Firebase Console:

- **Storage usage by category**
- **Upload/download bandwidth**
- **Failed upload attempts**
- **Security rule denials**
- **File type distribution**

### 🚨 Error Handling

Common storage errors and solutions:

| Error Code | Cause | Solution |
|------------|--------|----------|
| `storage/unauthorized` | User lacks permission | Check user role and authentication |
| `storage/invalid-checksum` | File corruption | Retry upload or check file integrity |
| `storage/retry-limit-exceeded` | Network issues | Implement exponential backoff |
| `storage/canceled` | User canceled upload | Handle gracefully in UI |
| `storage/unknown` | Server error | Log and retry with delay |

### 🔧 Maintenance

#### Regular Tasks
1. **Cleanup temporary files** (24h+ old)
2. **Monitor storage quotas** and usage patterns
3. **Review security rule logs** for unauthorized access attempts
4. **Archive old document versions** based on retention policy
5. **Generate usage reports** for administrators

#### Backup Strategy
1. **Document metadata**: Stored in Firestore (automated backups)
2. **File content**: Firebase Storage (regional replication)
3. **Configuration**: Version controlled in Git
4. **Security rules**: Backed up before deployment

## 📚 Additional Resources

- [Firebase Storage Documentation](https://firebase.google.com/docs/storage)
- [Security Rules Reference](https://firebase.google.com/docs/storage/security)
- [Storage Quotas and Limits](https://firebase.google.com/docs/storage/quotas)
- [Best Practices for Security](https://firebase.google.com/docs/storage/security/start)

---

**Last Updated**: September 25, 2025  
**Version**: 2.0  
**Author**: StrokeTraining Platform Team