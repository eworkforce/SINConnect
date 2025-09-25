# **StrokeTraining Platform v2.0 - Authentication System Plan**

**Date:** September 24, 2025  
**Version:** 1.0  
**Focus:** Firebase Authentication with Role-Based Access Control  
**Philosophy:** KISS (Keep It Simple, Stupid)

## **📋 Table of Contents**

1. [Authentication Overview](#1-authentication-overview)
2. [User Roles & Permissions](#2-user-roles--permissions)
3. [Auth Flows & UX](#3-auth-flows--ux)
4. [Technical Implementation](#4-technical-implementation)
5. [Security & Compliance](#5-security--compliance)
6. [Testing & Monitoring](#6-testing--monitoring)
7. [Sprint Plan - Auth Focus](#7-sprint-plan---auth-focus)

## **1. Authentication Overview**

### **1.1. Approach**
> "Use Firebase Auth for identity management, with custom claims for roles and Firestore security rules to enforce access control."

### **1.2. Requirements from PRD**
- Secure login for all user types
- Role-based access control (4 roles)
- Password reset and email verification
- French language support for auth flows
- Basic audit and activity logging

### **1.3. Technology Choices**
- **Firebase Auth**: Email/password provider
- **Custom Claims**: Role assignment and RBAC
- **Firestore Rules**: Data access enforcement
- **Firebase Functions**: Admin role assignment and audits

## **2. User Roles & Permissions**

### **2.1. Roles**
- **attendee**: Access learning tools, submit impact data, post in forum
- **specialist**: All attendee permissions + upload/curate content, moderate forum
- **admin**: Full control, manage users, view full analytics
- **stakeholder**: Read-only access to anonymized high-level dashboards

### **2.2. Permissions Matrix**
```
Resource          attendee  specialist  admin  stakeholder
---------------------------------------------------------
Auth/Login        R         R           R      R
Profile           RW        RW          RW     R
Documents         R         RW          RW     R
Forum             RW        RW          RW     R
Messaging         RW        RW          RW     -
Impact Metrics    RW        RW          R*     R
Reports           -         -           RW     R
Admin Panel       -         -           RW     -
```
Notes:
- R: Read, W: Write
- Admin can read aggregated Impact Metrics; Stakeholder sees anonymized only

## **3. Auth Flows & UX**

### **3.1. Registration Flow**
1. User fills sign-up form (email, password, name, hospital, role request)
2. Email verification sent
3. On first login, profile is created in Firestore
4. Admin review for specialist role (optional)
5. Role assigned via custom claims

### **3.2. Login Flow**
1. User submits email/password
2. On success, check email verification
3. Fetch custom claims (role)
4. Redirect to role-based dashboard

### **3.3. Password Reset Flow**
1. User requests password reset
2. Email with reset link sent
3. User resets password via Firebase page

### **3.4. Email Verification Flow**
1. After sign-up, verification email is sent
2. User clicks link to verify
3. App detects verification status and allows access

### **3.5. Session Management**
- Persist sessions with Firebase Auth persistence (local)
- Auto-refresh tokens handled by SDK
- Logout clears session and cached data

## **4. Technical Implementation**

### **4.1. Data Models**
```typescript
// Firestore user document
interface UserDoc {
  email: string;
  role: 'attendee' | 'specialist' | 'admin' | 'stakeholder';
  profile: {
    name: string;
    hospital: string;
    specialization?: string;
    phone?: string;
  };
  preferences: {
    language: 'fr';
    notifications: boolean;
  };
  metadata: {
    createdAt: Timestamp;
    lastLogin?: Timestamp;
    emailVerified: boolean;
  };
}
```

### **4.2. Role Assignment with Custom Claims**
```typescript
// Cloud Function to set role claims
import { onCall } from 'firebase-functions/v2/https';
import { getAuth } from 'firebase-admin/auth';

export const setUserRole = onCall(async (req) => {
  const { uid, role } = req.data;
  const caller = req.auth;

  // Only admins can set roles
  if (!caller || caller.token.role !== 'admin') {
    throw new HttpsError('permission-denied', 'Admin only');
  }

  await getAuth().setCustomUserClaims(uid, { role });
  return { success: true };
});
```

### **4.3. Firestore Security Rules (Auth-Aware)**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAdmin() { return request.auth.token.role == 'admin'; }
    function isSpecialist() { return request.auth.token.role == 'specialist'; }
    function isStakeholder() { return request.auth.token.role == 'stakeholder'; }
    function isAttendee() { return request.auth.token.role == 'attendee'; }

    // Users can read their own profile; admins can read all
    match /users/{userId} {
      allow read, update: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null && isAdmin();
      allow create: if request.auth != null;
    }

    // Documents
    match /documents/{docId} {
      allow read: if request.auth != null;
      allow create, update: if request.auth != null && (isAdmin() || isSpecialist());
      allow delete: if request.auth != null && isAdmin();
    }

    // Impact metrics
    match /impactMetrics/{metricId} {
      allow create, read, update: if request.auth != null &&
        request.resource.data.userId == request.auth.uid;
      allow read: if request.auth != null && (isAdmin() || isStakeholder());
    }

    // Reports
    match /reports/{reportId} {
      allow read: if request.auth != null && (isAdmin() || isStakeholder());
      allow create: if request.auth != null && isAdmin();
    }
  }
}
```

### **4.4. Frontend Integration**
```typescript
// Auth hook
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const token = await firebaseUser.getIdTokenResult(true);
        setRole((token.claims.role as UserRole) || 'attendee');
      } else {
        setRole(null);
      }
      setLoading(false);
    });
  }, []);

  return { user, role, loading };
};
```

### **4.5. Admin Role Management UI**
- Admin page to search users and assign roles
- Call `setUserRole` function via callable function
- Show current role and assignment history

## **5. Security & Compliance**

### **5.1. Authentication Security**
- Enforce strong passwords (8+ chars, upper/lower, number)
- Email verification required before full access
- Lockout after 5 failed attempts (via rules + UX)
- Session persistence with secure tokens
- App Check enabled

### **5.2. Privacy & Compliance**
- Minimum PII stored (email + role + optional profile)
- Anonymize data for stakeholder reports
- Consent checkbox during registration
- Right to be forgotten: delete user + Firestore doc
- Audit logs for admin actions via Functions

## **6. Testing & Monitoring**

### **6.1. Tests**
- Unit: auth utils, role handling
- Integration: login/register/reset flows
- Rules tests: Firestore Security Rules emulator
- E2E: Cypress/Playwright for full auth flows

### **6.2. Monitoring**
- Auth error rates via Firebase console
- Suspicious login attempts reports
- Function logs for role assignments

## **7. Sprint Plan - Auth Focus**

### **Sprint A (Week 1-2)**
- Auth UI: Register/Login/Reset/Verify (frontend)
- Firebase Auth setup (backend)
- Firestore user doc creation on first login
- Email templates in French

### **Sprint B (Week 3-4)**
- Role management: custom claims + admin UI
- Firestore Rules v1 (users, documents, metrics)
- Session management & route guards

### **Sprint C (Week 5-6)**
- Audit logging for admin actions
- Account deactivation/reactivation
- Security hardening and rules test suite

## **📞 Auth Next Steps**
1. Enable Email/Password in Firebase Auth
2. Create French email templates (welcome, verify, reset)
3. Build Register/Login/Reset forms in frontend
4. Implement role assignment cloud function

This plan keeps authentication simple, secure, and fully aligned with Firebase and the PRD. 🚀