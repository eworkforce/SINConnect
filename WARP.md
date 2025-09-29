# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.
``

Project overview
- Monorepo with Firebase backend and React frontend.
- Primary stack: React + TypeScript + Vite (frontend), Firebase Functions + Firestore + Storage (backend), Firebase Auth with custom claims (RBAC).
- Languages and tooling: TypeScript across repo, ESLint configured separately for frontend and backend.

Common commands
- Prereqs
  - Node.js >= 18 installed locally. Backend Functions target Node 22 for deploy/runtime.
  - Firebase CLI installed globally: npm install -g firebase-tools
  - From backend/, run firebase login and firebase use <project-id> as needed.

- Frontend (from frontend/)
  - Install deps: npm install
  - Dev server: npm run dev
  - Build: npm run build
  - Preview built app: npm run preview
  - Lint: npm run lint
  - Tests (Vitest present, no npm script wired): npx vitest
    - Run a single test file: npx vitest path/to/file.test.ts
    - Run a single test name: npx vitest -t "test name"

- Backend Functions (from backend/functions/)
  - Install deps: npm install
  - Lint: npm run lint
  - Build: npm run build
  - Functions emulator (builds, then starts functions only): npm run serve
  - Functions shell (after build): npm run shell
  - Deploy only functions: npm run deploy
  - View logs: npm run logs

- Firebase rules and indexes (from backend/)
  - Deploy Firestore rules: firebase deploy --only firestore:rules
  - Deploy Storage rules: firebase deploy --only storage:rules
  - Deploy both rules + functions: firebase deploy --only functions,firestore:rules,storage:rules
  - Emulators (all configured services from backend/firebase.json): firebase emulators:start

- Typical local workflow
  - Terminal 1: cd backend/functions && npm run serve
  - Terminal 2: cd frontend && npm run dev

High-level architecture
- Frontend (frontend/)
  - React 19 + Vite + TypeScript UI using MUI (@mui/material) and i18n (i18next/react-i18next).
  - Linting via eslint.config.js with @eslint/js, typescript-eslint, react-hooks, and react-refresh presets.
  - Testing stack present: Vitest + @testing-library/react + jsdom (no dedicated npm test script; invoke via npx vitest).
  - Auth integration (from docs): frontend reads Firebase Auth custom claims to derive role and gate UI/route access.

- Backend (backend/)
  - Firebase project config lives under backend/firebase.json.
  - Cloud Functions TypeScript project in backend/functions/ with NodeNext modules, outputs to lib/.
  - Predeploy hooks (backend/firebase.json) enforce lint and build before deploy.
  - Firestore rules at backend/firestore/rules/firestore.rules; Storage rules at backend/storage/rules/storage.rules; indexes file at backend/firestore.indexes.json.

- Authentication and RBAC
  - Firebase Auth with custom claims establishes roles: attendee, specialist, admin, stakeholder (as documented in auth/README.md).
  - Role management handled in Cloud Functions (e.g., callable function to set roles). Frontend reads ID token claims for role-aware routing.
  - Firestore/Storage rules implement RBAC consistently with those roles.

- Data domains (from READMEs; enforced by rules)
  - Users: self-readable/updatable profiles; admin-readable.
  - Documents: specialist/admin create/update; all authenticated can read approved; admin delete.
  - Impact metrics: user-owned read/write; admin and stakeholder read for reporting.
  - Forum/messaging: posts, replies, attachments with role-based moderation.
  - Storage layout mirrors documents/users, with versioned document folders, thumbnails, and previews.

Notes and caveats
- Frontend tests: Vitest is installed but no npm run test script is defined. Use npx vitest for now; add a script in frontend/package.json if desired.
- Backend tests: backend/README.md mentions Jest + Firebase Test SDK, but backend/functions/package.json does not define a test script and does not list Jest. If backend tests are needed, wire up Jest or Vitest and add scripts (e.g., "test", "test:watch").
- Node versioning: backend/functions specifies "engines": { "node": "22" } for deploy/runtime. Use a compatible local Node when developing functions or rely on the emulator.