# Document Upload System Testing Guide

## Overview
This guide will help you test the document upload functionality as different user roles. The system is implemented with a comprehensive React frontend and Firebase backend.

## Prerequisites Setup

### 1. Terminal Setup
You'll need **3 terminal windows** for testing:

**Terminal 1: Firebase Emulators**
```bash
cd /home/serge/Documents/DEVSpace/IvoireStrockTraining/backend
firebase emulators:start --only firestore,storage,auth
```

**Terminal 2: Frontend Development Server**
```bash
cd /home/serge/Documents/DEVSpace/IvoireStrockTraining/frontend
npm run dev
```

**Terminal 3: Monitoring & Commands**
Keep this available for additional commands during testing.

### 2. Access Points
- **Frontend App**: http://localhost:5173
- **Firebase Emulator UI**: http://localhost:4001
- **Firestore Emulator**: http://localhost:8082
- **Storage Emulator**: http://localhost:9198
- **Auth Emulator**: http://localhost:9098

## Testing Scenarios by User Role

### Test User Creation
Before testing uploads, create test users with different roles:

1. **Attendee User**
   - Email: `attendee@test.com`
   - Password: `test123456`
   - Role: `attendee`

2. **Specialist User**
   - Email: `specialist@test.com`
   - Password: `test123456`
   - Role: `specialist`

3. **Admin User**
   - Email: `admin@test.com`
   - Password: `test123456`
   - Role: `admin`

### Role-Based Upload Testing

#### 1. Attendee User Testing (Limited Permissions)
**Expected Behavior**: Should be blocked from uploading documents

**Test Steps**:
1. Navigate to http://localhost:5173
2. Login with attendee credentials
3. Try to access document upload page
4. **Expected Result**: Should see "Accès non autorisé" message
5. Verify role-based UI restrictions are working

#### 2. Specialist User Testing (Standard Upload Permissions)
**Expected Behavior**: Can upload documents with standard limits

**Test Steps**:
1. Login with specialist credentials
2. Navigate to document upload page
3. **File Size Test**: Try uploading files up to 100MB (should work)
4. **File Type Test**: Test supported formats:
   - ✅ PDF files
   - ✅ Word documents (.doc, .docx)
   - ✅ PowerPoint (.ppt, .pptx)
   - ✅ Images (.jpg, .png)
   - ✅ Videos (.mp4, .webm)
   - ❌ Unsupported formats (should be rejected)

**Form Testing**:
1. **Drag-and-Drop Test**: Drag files into the upload zone
2. **Manual Selection**: Click "Sélectionner des fichiers"
3. **Form Validation**: Test required fields:
   - Title (required)
   - Description (required)
   - Category (required)
   - Priority (required)
4. **Optional Fields**: Test tags, keywords, medical specialties
5. **Multi-file Upload**: Try uploading multiple files at once

#### 3. Admin User Testing (Full Permissions)
**Expected Behavior**: Can upload large files with all permissions

**Test Steps**:
1. Login with admin credentials
2. Test all specialist features plus:
3. **Large File Test**: Try uploading files up to 500MB
4. **All Categories**: Verify access to all document categories
5. **Admin-Only Features**: Check for any admin-specific upload options

## Detailed Testing Checklist

### ✅ File Upload Interface
- [ ] Drag-and-drop zone appears and responds to file drag
- [ ] Click-to-browse functionality works
- [ ] File selection shows immediate feedback
- [ ] Progress bars display during upload
- [ ] Error messages appear for invalid files

### ✅ File Validation
- [ ] File type validation (accept/reject correct types)
- [ ] File size validation (role-based limits)
- [ ] Multiple file selection (up to 10 files)
- [ ] File preview/information display

### ✅ Metadata Form
- [ ] All required fields are enforced
- [ ] Form validation provides helpful error messages
- [ ] Tags can be added and removed dynamically
- [ ] Keywords can be added and removed dynamically
- [ ] Category selection shows available options
- [ ] Priority selection works correctly
- [ ] Medical specialties autocomplete works

### ✅ Upload Process
- [ ] Form submission triggers upload
- [ ] Progress tracking shows real-time progress
- [ ] Success messages appear after completion
- [ ] Error handling for failed uploads
- [ ] Multiple file upload works correctly

### ✅ Firebase Integration
- [ ] Files are stored in Firebase Storage
- [ ] Metadata is saved to Firestore
- [ ] Security rules prevent unauthorized access
- [ ] User authentication is required
- [ ] Role-based permissions are enforced

## Test Files to Prepare

Create a folder with test files:

**Small Files** (for all users):
- `test-document.pdf` (1-5MB)
- `test-presentation.pptx` (1-5MB)
- `test-image.jpg` (1-5MB)

**Medium Files** (for specialist/admin):
- `medium-document.pdf` (20-50MB)
- `medium-video.mp4` (50-80MB)

**Large Files** (for admin only):
- `large-document.pdf` (200MB+)
- `large-video.mp4` (300MB+)

**Invalid Files** (should be rejected):
- `test.txt` (unsupported format)
- `malicious.exe` (executable file)
- `empty-file.pdf` (0 bytes)

## Common Issues to Watch For

### 🐛 Potential Issues
1. **File Size Validation**: Ensure role-based limits are enforced
2. **Form Submission**: Check that all required fields prevent submission
3. **Progress Tracking**: Verify real-time progress updates
4. **Error Messages**: Ensure French error messages are clear
5. **Storage Rules**: Confirm unauthorized access is blocked
6. **Memory Issues**: Large file uploads should not crash browser
7. **Network Errors**: Test behavior with poor connectivity

### 🔍 Debugging Steps
1. **Browser Console**: Check for JavaScript errors
2. **Network Tab**: Monitor upload requests and responses
3. **Firebase Emulator UI**: Verify data is being stored correctly
4. **Storage Rules**: Test unauthorized access attempts

## User Experience Testing

### 🎯 UX Checklist
- [ ] Upload interface is intuitive and clear
- [ ] French language is used throughout
- [ ] Error messages are helpful and actionable
- [ ] Progress feedback is clear and responsive
- [ ] Success confirmations are satisfying
- [ ] Navigation between steps is smooth
- [ ] Mobile responsive design works well

### 🚨 Error Testing
- [ ] Network disconnection during upload
- [ ] File corruption scenarios
- [ ] Server errors (simulate with emulator)
- [ ] Authentication timeout during upload
- [ ] Storage quota exceeded (if applicable)

## Performance Testing

### ⚡ Performance Metrics to Monitor
- [ ] Upload speed for different file sizes
- [ ] Form responsiveness during upload
- [ ] Memory usage with large files
- [ ] Multiple simultaneous uploads
- [ ] Browser performance during long uploads

## Security Testing

### 🔒 Security Verification
- [ ] Unauthenticated access is blocked
- [ ] Role permissions are properly enforced
- [ ] File type restrictions cannot be bypassed
- [ ] XSS prevention in form inputs
- [ ] CSRF protection is active

## Final Verification

After testing all scenarios:

1. **Check Firebase Storage**: Verify files are stored correctly
2. **Check Firestore**: Verify metadata is saved properly
3. **Check Security Rules**: Confirm unauthorized access is blocked
4. **User Experience**: Ensure the flow is intuitive for French users
5. **Error Handling**: Verify all error cases are handled gracefully

## Quick Start Commands

### Start Development Environment
```bash
# Terminal 1: Start Firebase Emulators
cd /home/serge/Documents/DEVSpace/IvoireStrockTraining/backend
firebase emulators:start --only firestore,storage,auth

# Terminal 2: Start Frontend
cd /home/serge/Documents/DEVSpace/IvoireStrockTraining/frontend
npm run dev

# Access the application at http://localhost:5173
```

### Create Test Users
Use the Firebase Emulator Auth UI at http://localhost:4001 to create test users or implement a registration flow.

### Monitor Uploads
Watch the Firebase Emulator UI at http://localhost:4001 to see real-time data as uploads complete.

---

**Note**: The system has been marked as complete in `DocumentUpload_Progress.md`. This testing guide will help you verify that all functionality works as expected before considering the system production-ready.