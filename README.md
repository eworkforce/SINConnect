# **StrokeTraining Platform v2.0 - Healthcare Knowledge Platform**

**Plateforme de Formation AVC-Espoir pour les Professionnels de Santé en Côte d'Ivoire**

## **📋 Project Overview**

The StrokeTraining Platform is a web-based knowledge platform designed to support healthcare professionals in Côte d'Ivoire through continuous education and collaboration. It serves as the primary learning and impact measurement tool for the stroke care training program led by NGO AVC Espoir.

### **🎯 Vision**
> Build a sustainable ecosystem for knowledge sharing and performance measurement in stroke care, creating a community of learners dedicated to improving patient outcomes.

### **👥 Target Users**
- **Attendees**: Generalist doctors who completed AVC Espoir training
- **Specialists**: Stroke experts providing guidance and content
- **Administrators**: AVC Espoir staff managing the platform
- **Stakeholders**: Donors and health officials viewing impact data

## **📁 Project Structure**

This project is organized into **three mutually exclusive and collectively exhaustive** components:

```
IvoireStrockTraining/
├── 🔧 backend/                 # Firebase Backend Services
│   ├── functions/              # Cloud Functions (Node.js/TypeScript)
│   ├── firestore/              # Database rules and indexes
│   ├── storage/                # File storage rules
│   └── docs/                   # Backend documentation
│
├── 🎨 frontend/                # React Frontend Application  
│   ├── src/                    # React source code
│   │   ├── components/         # UI components
│   │   ├── pages/              # Application pages
│   │   ├── hooks/              # Custom React hooks
│   │   ├── contexts/           # State management
│   │   └── locales/            # French translations
│   ├── public/                 # Static assets
│   └── docs/                   # Frontend documentation
│
├── 🔒 auth/                    # Authentication System
│   ├── config/                 # Environment configurations
│   ├── rules/                  # Security rules
│   └── docs/                   # Auth documentation
│
├── 📚 Planning Documents/       # Project documentation
│   ├── AVC-Espoir_StockTraining.md    # Original PRD
│   ├── ARCHITECTURE_DOCUMENT.md       # System architecture
│   └── AGILE_DEVELOPMENT_PLAN.md      # Development plan
│
└── README.md                   # This file
```

## **🏗️ Architecture Overview**

### **Technology Stack (KISS Principle)**
- **Frontend**: React 18 + TypeScript + Material-UI + Vite
- **Backend**: Firebase (Firestore + Functions + Storage)
- **Authentication**: Firebase Auth with Custom Claims
- **Hosting**: Firebase Hosting (everything in one platform)
- **Language**: French (fully localized)

### **System Diagram**
```
┌─────────────────────────────────────────────────────────┐
│                 🎨 FRONTEND (React)                     │
│           Material-UI + French Localization            │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│              🔒 AUTHENTICATION (Firebase Auth)          │
│            Custom Claims + Security Rules              │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│                🔧 BACKEND (Firebase)                   │
│  Firestore + Cloud Functions + Storage + Analytics    │
└─────────────────────────────────────────────────────────┘
```

## **🚀 Getting Started**

### **Prerequisites**
- **Node.js 18+** installed
- **Firebase CLI** installed (`npm install -g firebase-tools`)
- **Git** for version control

### **Quick Setup**

1. **Clone and Setup**
   ```bash
   git clone <repository-url>
   cd IvoireStrockTraining
   ```

2. **Firebase Project Setup**
   ```bash
   firebase login
   firebase projects:create your-project-id
   firebase use your-project-id
   ```

3. **Backend Setup**
   ```bash
   cd backend
   # Follow backend/README.md instructions
   ```

4. **Frontend Setup**
   ```bash
   cd frontend  
   # Follow frontend/README.md instructions
   ```

5. **Authentication Setup**
   ```bash
   cd auth
   # Follow auth/README.md instructions
   ```

## **📊 Development Approach**

### **Agile Methodology**
- **7 Sprints** over 12-14 weeks
- **2-week sprints** with clear deliverables
- **Parallel development** across three components
- **KISS principle** - Keep It Simple, Stupid

### **Sprint Overview**
```
Sprint 1-2: Foundation & Authentication (Weeks 1-4)
Sprint 3-4: Content Management (Weeks 5-8)
Sprint 5:   Impact Measurement (Weeks 9-10)
Sprint 6:   Communication Features (Weeks 11-12)
Sprint 7:   Polish & Launch (Weeks 13-14)
```

## **📋 Core Features**

### **🔐 Authentication & User Management**
- Email/password authentication
- 4 user roles with permissions
- French language interface
- Profile management

### **📚 Content Management**
- Document upload and viewing
- PDF viewer integration
- Search and categorization
- Version control

### **💬 Communication**
- Discussion forums
- Direct messaging
- Real-time notifications
- Content moderation

### **📊 Impact Measurement**
- Metrics collection forms
- Personal dashboards
- Data visualization
- Automated reporting

### **👑 Administration**
- User role management
- Content moderation
- Analytics dashboard
- Report generation

## **🌍 Localization**

### **French-First Design**
- All UI text in French
- French date/time formatting
- Currency formatting (CFA Franc)
- French language documentation
- Error messages in French

### **Translation Structure**
```javascript
locales/fr/
├── common.json      // Navigation, actions
├── auth.json        // Authentication
├── dashboard.json   // Dashboard content
├── forms.json       // Form labels
└── errors.json      // Error messages
```

## **🔒 Security & Compliance**

### **Healthcare Data Protection**
- GDPR-inspired data handling
- Data anonymization for reports
- User consent management
- Audit logging
- Right to be forgotten

### **Technical Security**
- Firebase Auth with custom claims
- Firestore security rules
- Role-based access control
- Input validation and sanitization
- Secure file upload/storage

## **📈 Performance & Scalability**

### **Performance Targets**
- **Page load**: <3 seconds on 3G networks
- **Bundle size**: <500KB initial load
- **Uptime**: 99.9% (Firebase SLA)
- **Mobile optimized**: Touch-friendly interface

### **Scalability**
- Firebase auto-scaling
- CDN for global delivery
- Efficient query optimization
- Lazy loading and code splitting

## **🧪 Testing Strategy**

### **Testing Pyramid**
```
     E2E Tests (10%)
   ─────────────────
  Integration Tests (20%)
 ─────────────────────────
Unit Tests (70%)
```

### **Testing Tools**
- **Unit**: Vitest + React Testing Library
- **Integration**: Firebase Test SDK
- **E2E**: Playwright
- **Security**: Firebase Security Rules Testing

## **📦 Deployment**

### **Environment Strategy**
- **Development**: Local with Firebase emulators
- **Staging**: Firebase staging project
- **Production**: Firebase production project

### **Deployment Commands**
```bash
# Frontend
cd frontend && npm run build && firebase deploy --only hosting

# Backend  
cd backend && firebase deploy --only functions,firestore:rules

# Authentication
cd auth && firebase deploy --only functions,firestore:rules,storage
```

## **📊 Success Metrics**

### **Technical KPIs**
- 60%+ monthly active users
- <3s page load times
- 99.9% uptime
- Zero data breaches

### **Business KPIs** 
- 70%+ users submit impact data
- 4.0/5+ platform satisfaction
- 50+ documents uploaded
- Monthly automated reports

## **🔗 Documentation Links**

### **Development Plans**
- [📋 Overall Agile Plan](AGILE_DEVELOPMENT_PLAN.md)
- [🔧 Backend Plan](backend/docs/BACKEND_DEVELOPMENT_PLAN.md) 
- [🎨 Frontend Plan](frontend/docs/FRONTEND_DEVELOPMENT_PLAN.md)
- [🔒 Authentication Plan](auth/docs/AUTHENTICATION_SYSTEM_PLAN.md)

### **Technical Documentation**
- [🏗️ Architecture Document](ARCHITECTURE_DOCUMENT.md)
- [📝 Original PRD](AVC-Espoir_StockTraining.md)

## **👥 Team & Roles**

### **Suggested Team Structure**
- **1-2 Full-Stack Developers**: Can work across all components
- **OR Specialized Teams**:
  - 1 Backend Developer (Firebase Functions, Firestore)
  - 1 Frontend Developer (React, UI/UX)
  - 1 DevOps/Auth Specialist (Security, Deployment)

### **Development Workflow**
1. **Sprint Planning**: Review stories and assign to components
2. **Parallel Development**: Teams work on backend/frontend/auth simultaneously  
3. **Integration**: Regular integration testing
4. **Sprint Review**: Demo completed features
5. **Retrospective**: Improve process

## **📞 Support & Resources**

### **Technical Support**
- Firebase Documentation: https://firebase.google.com/docs
- React Documentation: https://react.dev
- Material-UI: https://mui.com

### **Project Communication**
- Development updates in sprint reviews
- Technical discussions in component READMEs
- Issue tracking via GitHub Issues

## **🌟 Contributing**

### **Development Guidelines**
1. Follow component-specific README instructions
2. Maintain KISS principle - keep solutions simple
3. Write tests for new features
4. Update French translations
5. Document architecture decisions

### **Code Standards**
- TypeScript for type safety
- ESLint + Prettier for formatting
- Conventional commits
- Component-based architecture

## **🚀 Next Steps**

1. **Choose your focus area**: Backend, Frontend, or Authentication
2. **Follow component README**: Each folder has detailed setup instructions
3. **Start with Sprint 1**: Foundation and authentication setup
4. **Build iteratively**: Follow agile sprints for progressive delivery

---

**Ready to build an amazing healthcare platform for Côte d'Ivoire! 🇨🇮**

*Cette plateforme va révolutionner la formation en soins AVC pour les professionnels de santé!* 🚀