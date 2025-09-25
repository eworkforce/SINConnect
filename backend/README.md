# **Backend - StrokeTraining Platform v2.0**

**Firebase Backend Services & Cloud Functions**

## **📁 Folder Structure**

```
backend/
├── functions/              # Firebase Cloud Functions
│   ├── src/               # TypeScript source code
│   │   ├── api/           # API endpoint functions
│   │   ├── triggers/      # Database triggers
│   │   ├── services/      # Business logic services
│   │   ├── utils/         # Utility functions
│   │   ├── types/         # TypeScript interfaces
│   │   └── index.ts       # Main exports
│   ├── tests/             # Function tests
│   ├── package.json       # Dependencies
│   └── tsconfig.json      # TypeScript config
├── firestore/             # Firestore configuration
│   ├── rules/             # Security rules
│   │   └── firestore.rules
│   └── indexes/           # Database indexes
│       └── firestore.indexes.json
├── storage/               # Firebase Storage configuration
│   └── rules/             # Storage security rules
│       └── storage.rules
└── docs/                  # Documentation
    ├── BACKEND_DEVELOPMENT_PLAN.md
    ├── API_DOCUMENTATION.md
    └── DEPLOYMENT_GUIDE.md
```

## **🎯 Responsibilities**

- **Data Management**: Firestore database operations and schema
- **Business Logic**: Cloud Functions for complex operations
- **File Storage**: Document and media management
- **Security**: Authentication, authorization, and data protection
- **Integrations**: Email, notifications, and external services
- **Analytics**: Data processing and reporting

## **🛠️ Technology Stack**

- **Runtime**: Node.js 20 LTS
- **Language**: TypeScript
- **Database**: Firestore (NoSQL)
- **Functions**: Firebase Functions v2
- **Storage**: Firebase Storage
- **Email**: SendGrid/Nodemailer
- **Testing**: Jest + Firebase Test SDK

## **🚀 Getting Started**

### **Prerequisites**
- Node.js 20+ installed
- Firebase CLI installed (`npm install -g firebase-tools`)
- Firebase project created

### **Setup Instructions**

1. **Initialize Firebase Functions**
   ```bash
   cd backend/functions
   npm install
   ```

2. **Setup Environment**
   ```bash
   # Copy environment template
   cp .env.example .env.local
   
   # Edit with your Firebase config
   nano .env.local
   ```

3. **Start Development**
   ```bash
   # Start Firebase emulators
   firebase emulators:start
   
   # In another terminal, start function development
   npm run dev
   ```

4. **Run Tests**
   ```bash
   npm test
   npm run test:watch
   ```

## **📋 Development Workflow**

1. **Create new functions** in `src/` directory
2. **Export functions** in `src/index.ts`
3. **Write tests** in `tests/` directory
4. **Update security rules** in `firestore/rules/`
5. **Deploy to staging** with `npm run deploy:staging`
6. **Deploy to production** with `npm run deploy:prod`

## **📊 Key Features**

### **Database Management**
- User profile management
- Document metadata storage
- Impact metrics collection
- Forum and messaging data
- Real-time data synchronization

### **Cloud Functions**
- Email notifications
- PDF report generation
- Data aggregation and analytics
- Document processing
- User role management

### **Security**
- Firestore security rules
- Data validation
- Audit logging
- GDPR compliance features

## **🔗 Related Documentation**

- [Backend Development Plan](docs/BACKEND_DEVELOPMENT_PLAN.md)
- [API Documentation](docs/API_DOCUMENTATION.md)
- [Deployment Guide](docs/DEPLOYMENT_GUIDE.md)
- [Security Guidelines](docs/SECURITY_GUIDELINES.md)

## **📞 Quick Commands**

```bash
# Development
npm run dev                 # Start development server
npm run build              # Build TypeScript
npm run test               # Run tests
npm run lint               # Lint code

# Deployment  
npm run deploy:dev         # Deploy to development
npm run deploy:staging     # Deploy to staging
npm run deploy:prod        # Deploy to production

# Utilities
npm run logs               # View function logs
npm run shell              # Firebase shell
npm run emulators          # Start emulators
```

## **🎯 Sprint Focus Areas**

- **Sprint 1-2**: Database schema, security rules, email system
- **Sprint 3-4**: Document processing, analytics, API endpoints  
- **Sprint 5-6**: Report generation, search, external integrations
- **Sprint 7**: Optimization, backup, monitoring

Ready to build a robust Firebase backend! 🚀