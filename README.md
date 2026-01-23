# QadamSafe

Cybersecurity education platform with interactive training scenarios.

## Production

Live application: https://qadamsafe.web.app

## Architecture

The project is built entirely on Firebase:

- Frontend: React, TypeScript, Vite, deployed to Firebase Hosting
- Database: Cloud Firestore
- Authentication: Firebase Authentication
- Server: Backend на Render (Groq: ИИ-сценарии, чат-ассистент); Firebase Cloud Functions (auth, progress, classroom)

## Quick Start

### Prerequisites

- Node.js 18+
- npm
- Firebase CLI (`npm install -g firebase-tools`)

### Installation

```bash
npm run install:all
```

### Environment Configuration

Create `frontend/.env` with your Firebase credentials:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=qadamsafe.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=qadamsafe
VITE_FIREBASE_STORAGE_BUCKET=qadamsafe.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### Development

```bash
npm run dev
```

Opens at http://localhost:5173

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run deploy` | Deploy to Firebase Hosting |
| `npm run deploy:functions` | Deploy Cloud Functions |
| `npm run install:all` | Install all dependencies |

## Project Structure

```
QadamSafe/
├── frontend/               # React application
│   ├── src/
│   │   ├── pages/          # Page components
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts
│   │   ├── services/       # Firebase API layer
│   │   ├── i18n/           # Localization (RU, EN, KK)
│   │   └── types/          # TypeScript definitions
│   └── dist/               # Production build
├── functions/              # Firebase Cloud Functions
├── firebase.json           # Firebase configuration
├── firestore.rules         # Firestore security rules
└── firestore.indexes.json  # Firestore indexes
```

## Localization

Supported languages:

- Russian (ru)
- English (en)
- Kazakh (kk)

## Firestore Collections

| Collection | Description |
|------------|-------------|
| `users` | User profiles and settings |
| `scenarios` | Training scenarios |
| `userProgress` | User progress records |
| `achievements` | Achievement definitions |
| `userAchievements` | User achievement records |
| `aiScenarios` | AI-generated scenarios |

## Cloud Functions

| Function | Description |
|----------|-------------|
| `api` | Auth, scenarios, progress, achievements, classroom join (ИИ-сценарии и чат — через Backend на Render) |

## Security

- Firestore rules enforce user-level data isolation
- Each user can only access their own records
- Scenarios are read-only for authenticated users

## Additional Documentation

- [IMPROVEMENTS.md](./IMPROVEMENTS.md) — рекомендации по улучшению
- [docs/AI_TRAINING_GUIDE.md](./docs/AI_TRAINING_GUIDE.md) — как кастомизировать и «обучить» ИИ под QadamSafe (промпты, knowledge, RAG)
