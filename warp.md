# Warp.md - IvoireStrockTraining Project

## Project Overview
IvoireStrockTraining is a Firebase-based stock training application designed for healthcare inventory management in Côte d'Ivoire. This project follows a simple web app architecture without complex frameworks, deployed on Firebase.

## Project Structure
```
IvoireStrockTraining/
├── backend/                 # Firebase backend services
│   ├── firestore/          # Firestore database configuration
│   ├── functions/          # Firebase Cloud Functions
│   ├── storage/            # Firebase Storage configuration
│   └── docs/               # Backend documentation
├── frontend/               # Web frontend application
├── auth/                   # Authentication configuration
├── AGILE_DEVELOPMENT_PLAN.md
├── ARCHITECTURE_DOCUMENT.md
├── AVC-Espoir_StockTraining_PRD.md
└── README.md
```

## Development Environment
- **Platform**: Linux Mint
- **Shell**: zsh 5.9
- **Deployment**: Firebase (full stack)
- **Architecture**: Simple web app (no complex frameworks)

## Quick Commands

### Development
```bash
# Navigate to project root
cd /home/serge/Documents/DEVSpace/IvoireStrockTraining

# Start backend services (Firebase emulator)
cd backend && firebase serve

# Start frontend development server
cd frontend && npm start
```

### Firebase Commands
```bash
# Deploy to Firebase
firebase deploy

# Start Firebase emulators
firebase emulators:start

# Initialize Firebase project (if needed)
firebase init
```

### Git Commands
```bash
# Check status
git status

# Add all changes
git add .

# Commit changes
git commit -m "Your commit message"

# Push changes
git push origin main
```

## Project Preferences
- Simple web app architecture
- No mobile app or offline mode for now
- No CI/CD pipeline
- Full stack deployment on Firebase
- Focus on healthcare inventory management
- Targeted for Côte d'Ivoire market

## Documentation
- [Product Requirements Document](./AVC-Espoir_StockTraining_PRD.md)
- [Architecture Document](./ARCHITECTURE_DOCUMENT.md)
- [Agile Development Plan](./AGILE_DEVELOPMENT_PLAN.md)
- [Main README](./README.md)

## Notes
This project is specifically designed for stock training in healthcare environments, with a focus on simplicity and Firebase integration.