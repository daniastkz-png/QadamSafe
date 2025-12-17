# Firebase Integration Guide

## Overview
This document explains how to integrate Firebase into the QadamSafe backend for user authentication, progress tracking, and achievements storage.

## Architecture

```
Frontend (React)
    ↓ HTTP/REST API
Backend (Express + Prisma + Firebase Admin SDK)
    ↓ PostgreSQL (current - will run in parallel)
    ↓ Firebase (future - Auth + Firestore)
```

## Prerequisites

1. **Firebase Project**: Create a project in [Firebase Console](https://console.firebase.google.com/)
2. **Service Account**: Download service account credentials
3. **Firebase Admin SDK**: Already installed (`firebase-admin@^12.0.0`)

## Setup Instructions

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Follow the setup wizard
4. Enable **Authentication** and **Firestore Database**

### Step 2: Get Service Account Credentials

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Navigate to **Service Accounts** tab
3. Click **Generate New Private Key**
4. Download the JSON file (e.g., `serviceAccountKey.json`)
5. **IMPORTANT**: Store this file securely, never commit to Git

### Step 3: Configure Environment Variables

You have two options for configuring Firebase credentials:

#### Option A: Individual Environment Variables (Recommended for Production)

Add to `.env` file:

```env
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com"
```

**Note**: The private key must include `\n` for newlines.

#### Option B: Service Account File Path (Easier for Development)

Add to `.env` file:

```env
FIREBASE_SERVICE_ACCOUNT_PATH="./serviceAccountKey.json"
```

Then place your `serviceAccountKey.json` in the backend root directory.

### Step 4: Start Backend

The backend will automatically initialize Firebase if credentials are configured:

```bash
npm run dev
```

You should see:
```
✅ Firebase Admin SDK initialized
```

If credentials are not configured, you'll see:
```
⚠️  Firebase credentials not configured - skipping Firebase initialization
```

This is normal and the backend will continue to work with PostgreSQL only.

## Firestore Collections Structure

### Users Collection (`users`)

```typescript
{
  uid: string,              // Firebase Auth UID
  email: string,
  name: string,
  rank: number,
  securityScore: number,
  subscriptionTier: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Progress Collection (`progress`)

```typescript
{
  userId: string,
  scenarioId: string,
  completed: boolean,
  score: number,
  mistakes: number,
  decisions: object,
  completedAt: timestamp,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Achievements Collection (`achievements`)

```typescript
{
  userId: string,
  achievementId: string,
  progress: number,
  completed: boolean,
  completedAt: timestamp,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## Migration Strategy

### Phase 1: Parallel Operation (Current)
- PostgreSQL remains primary database
- Firebase services are placeholders
- No data migration yet

### Phase 2: Dual Write (Future)
- Write to both PostgreSQL and Firebase
- Read from PostgreSQL
- Verify data consistency

### Phase 3: Gradual Migration (Future)
- Migrate existing data from PostgreSQL to Firebase
- Start reading from Firebase
- Keep PostgreSQL as backup

### Phase 4: Firebase Primary (Future)
- Firebase becomes primary database
- PostgreSQL can be deprecated (optional)

## Available Services

### Firebase Auth Service
Location: `src/services/firebase/auth.service.ts`

Methods:
- `verifyIdToken(idToken)` - Verify Firebase ID token
- `createUser(email, password)` - Create Firebase user
- `getUserByUid(uid)` - Get user by UID
- `deleteUser(uid)` - Delete user
- `updateUserEmail(uid, newEmail)` - Update user email

### Firebase User Service
Location: `src/services/firebase/user.service.ts`

Methods:
- `createUserProfile(uid, data)` - Create user profile in Firestore
- `getUserProfile(uid)` - Get user profile
- `updateUserProfile(uid, data)` - Update user profile
- `deleteUserProfile(uid)` - Delete user profile

### Firebase Progress Service
Location: `src/services/firebase/progress.service.ts`

Methods:
- `saveProgress(userId, scenarioId, data)` - Save scenario progress
- `getProgress(userId, scenarioId)` - Get specific progress
- `getAllUserProgress(userId)` - Get all user progress

### Firebase Achievement Service
Location: `src/services/firebase/achievement.service.ts`

Methods:
- `updateAchievement(userId, achievementId, data)` - Update achievement
- `getAchievement(userId, achievementId)` - Get specific achievement
- `getAllUserAchievements(userId)` - Get all user achievements

## Security Best Practices

### ⚠️ Critical Security Rules

1. **NEVER commit Firebase credentials to Git**
   - `.gitignore` already excludes credential files
   - Always use environment variables

2. **Rotate keys regularly**
   - Generate new service account keys periodically
   - Revoke old keys in Firebase Console

3. **Use environment-specific credentials**
   - Different credentials for development/staging/production
   - Never use production credentials in development

4. **Firestore Security Rules**
   - Set up proper security rules in Firebase Console
   - Restrict read/write access based on authentication

### Example Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /progress/{progressId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    match /achievements/{achievementId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
  }
}
```

## Testing Firebase Integration

### 1. Check Initialization

```bash
npm run dev
```

Look for: `✅ Firebase Admin SDK initialized`

### 2. Test Health Endpoint

```bash
curl http://localhost:3000/health
```

Should return: `{"status":"ok"}`

### 3. Test Firebase Service (Example)

```typescript
import { firebaseUserService } from './services/firebase/user.service';

// This will throw an error if Firebase is not initialized
await firebaseUserService.createUserProfile('test-uid', {
  email: 'test@example.com',
  name: 'Test User',
  rank: 1
});
```

## Troubleshooting

### Firebase not initializing

**Problem**: `⚠️ Firebase credentials not configured`

**Solution**: 
- Check `.env` file has Firebase variables
- Verify credentials are correct
- Ensure no extra spaces in environment variables

### Invalid private key

**Problem**: `❌ Failed to initialize Firebase Admin SDK`

**Solution**:
- Ensure private key includes `\n` for newlines
- Use service account file path instead
- Re-download service account key from Firebase Console

### Permission denied in Firestore

**Problem**: Firestore operations fail with permission errors

**Solution**:
- Check Firestore Security Rules in Firebase Console
- Ensure service account has proper permissions
- Verify user authentication is working

## Next Steps

1. ✅ Firebase Admin SDK installed
2. ✅ Configuration files created
3. ✅ Service layer structure ready
4. ⏳ Configure Firebase credentials in `.env`
5. ⏳ Test Firebase initialization
6. ⏳ Implement API endpoints using Firebase services
7. ⏳ Set up Firestore security rules
8. ⏳ Begin data migration from PostgreSQL

## Support

For Firebase-specific issues:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Admin SDK Reference](https://firebase.google.com/docs/reference/admin/node)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
