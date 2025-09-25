# Firestore & Storage Security Rules

This directory contains the security rules for the StrokeTraining Platform, implementing role-based access control (RBAC) for four distinct user roles:

- **Attendee**: Platform users accessing educational content and community features
- **Specialist**: Healthcare professionals who can create/moderate content
- **Admin**: Platform administrators with full system access
- **Stakeholder**: External stakeholders with access to reports and metrics

## File Structure

```
rules/
├── firestore.rules          # Firestore database security rules
├── storage.rules            # Firebase Storage security rules
├── README.md               # This documentation file
└── deploy-rules.sh         # Deployment script
```

## Security Architecture

### Authentication & Authorization

The security rules use Firebase Authentication with custom claims to implement role-based access control:

```javascript
// Example of role checking in rules
function getUserRole() {
  return request.auth.token.role;
}

function isAdmin() {
  return isAuthenticated() && getUserRole() == 'admin';
}
```

### Data Access Patterns

#### 1. User Data (`/users/{userId}`)
- Users can read/update their own profile
- Admins can read all user profiles
- Role changes must be done via Cloud Functions (not direct updates)
- Soft deletion only (isActive: false)

#### 2. Documents (`/documents/{documentId}`)
- Public documents: readable by all authenticated users
- Private documents: role-based access via `allowedRoles` field
- Creation: specialists and admins only
- Updates: document creator or admin only
- Deletion: admin only

#### 3. Impact Metrics (`/impactMetrics/{metricId}`)
- Users can only access their own metrics
- Admins and stakeholders can read all (for reporting)
- No deletion allowed (healthcare data integrity)
- Admin can update for data correction

#### 4. Forum System
- **Posts**: All users can read, create their own, update their own
- **Replies**: Similar to posts but specialists can moderate
- **Attachments**: Handled via Storage rules

#### 5. Communications
- **Direct Messages**: Users can only access messages they sent/received
- **Notifications**: Users can only access their own notifications

### File Storage Rules

#### File Type Validation
```javascript
function isValidImageType() {
  return resource.contentType.matches('image/(png|jpg|jpeg|gif|webp)');
}

function isValidDocumentType() {
  return resource.contentType.matches('application/(pdf|msword|...)') ||
         resource.contentType.matches('text/(plain|csv)');
}
```

#### Size Limits
- Regular files: 10MB limit
- Large files (videos/documents): 100MB limit

#### Storage Paths
- `/users/{userId}/profile/` - Profile images (user-owned)
- `/documents/{category}/` - Educational documents (specialist/admin upload)
- `/forum/posts/{postId}/attachments/` - Forum attachments
- `/impact-metrics/{userId}/` - User metric attachments
- `/temp/{userId}/` - Temporary uploads
- `/system/` - System assets (admin only)

## Deployment

### Prerequisites

1. Firebase CLI installed and logged in:
```bash
npm install -g firebase-tools
firebase login
```

2. Initialize Firebase project (if not already done):
```bash
firebase init firestore
firebase init storage
```

### Deploy Rules

Use the deployment script:
```bash
chmod +x deploy-rules.sh
./deploy-rules.sh
```

Or deploy manually:
```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Storage rules
firebase deploy --only storage

# Deploy both
firebase deploy --only firestore:rules,storage
```

### Testing Rules

Use the Firebase Rules Playground or unit tests:

```bash
# Install testing dependencies
npm install --save-dev @firebase/rules-unit-testing

# Run rule tests
npm test
```

## Rule Validation Examples

### Valid Operations
```javascript
// User reading their own profile
/users/user123 - read by user123 ✓

// Specialist creating document
/documents/doc123 - create by specialist ✓

// Admin reading all metrics
/impactMetrics/metric123 - read by admin ✓
```

### Invalid Operations
```javascript
// User trying to read another user's profile
/users/user456 - read by user123 ✗

// Attendee trying to create document
/documents/doc123 - create by attendee ✗

// User trying to delete impact metrics
/impactMetrics/metric123 - delete by user ✗
```

## Security Best Practices

### 1. Principle of Least Privilege
- Users only get minimum required permissions
- Default deny for undefined paths
- Explicit allow rules for each operation

### 2. Data Integrity
- Immutable audit logs
- No deletion of healthcare metrics
- Required field validation

### 3. Role-Based Access
- Custom claims for role management
- Role validation in all rules
- Hierarchical permissions (admin > specialist > user)

### 4. Input Validation
- File type restrictions
- Size limits enforced
- Required fields checked
- Timestamp validation

## Troubleshooting

### Common Issues

1. **Permission Denied Errors**
   - Check user authentication status
   - Verify custom claims are set correctly
   - Ensure rule syntax is correct

2. **File Upload Failures**
   - Check file size limits
   - Verify content type restrictions
   - Ensure proper storage path structure

3. **Rule Deployment Errors**
   - Validate rule syntax with Firebase CLI
   - Check for circular function dependencies
   - Ensure all referenced collections exist

### Debugging Rules

Enable Firestore debug logging:
```javascript
firebase.firestore.setLogLevel('debug');
```

Use the Firebase Console to view security rule evaluation logs.

## Migration Notes

### Updating Rules
1. Test rules in a development environment first
2. Use gradual rollout for production changes
3. Monitor error logs after deployment
4. Have rollback plan ready

### Schema Changes
When updating data schema, ensure:
1. Rules accommodate both old and new data formats
2. Migration functions respect security rules
3. Backward compatibility during transition period

## Support

For security rule issues:
1. Check Firebase Console logs
2. Review rule evaluation in Debug mode
3. Test with Firebase Rules Playground
4. Consult Firebase documentation for rule syntax

---

**Important**: Never deploy rules without testing in a development environment first. Security rules directly impact data access and cannot be easily reverted once deployed.