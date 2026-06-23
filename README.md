# Voting Platform

This is a React + Vite voting platform backed by Firebase Authentication and Firestore.

## Project overview

- React 19, Vite, Tailwind CSS
- Firebase Authentication for user login and registration
- Firestore collections for voter profiles, candidates, and election settings
- Admin dashboard for managing voting stages, candidates, and results
- Client-side route protection for regular users and administrators

## Local development setup

1. Install dependencies:

```bash
npm install
```

2. Create a local Firebase config file:

```bash
cp .env.example .env.local
```

3. Fill in the Firebase values inside `.env.local`:

```text
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

4. Start development server:

```bash
npm run dev
```

## Production notes

- Do not commit `.env.local` or actual Firebase secrets to source control.
- The app expects Firebase variables prefixed with `VITE_`.
- If any required Firebase config is missing, startup will fail with a clear message.

## Recommended improvements for commercial readiness

- Add an `AuthContext` provider to centralize auth state and user profile data.
- Introduce explicit `organizationId` and `electionId` fields to support multiple organizations and elections.
- Replace browser `localStorage` storage of role/profile data with in-memory auth session data.
- Add payment / subscription metadata for SaaS licensing if needed.
- Harden Firestore rules and add a Cloud Function for vote submission and audit logging.
