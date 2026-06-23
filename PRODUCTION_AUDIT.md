# Production Audit

Audit date: 2026-06-11

## Executive Summary

This project is a strong MVP for a single-organization, single-election live voting flow, but it is not yet commercially production-ready for regulated or high-trust elections. The largest risks are vote integrity, client-authorized admin behavior, single-election Firestore modeling, lack of immutable audit trails, and incomplete operational controls.

Current readiness after this hardening pass:

- Security: 5.5/10
- UI/UX: 7/10
- Scalability: 5/10
- Production readiness: 5.5/10

The app can support around 100 users with current design. It can likely support 1,000 users for light usage with careful Firestore rules and quotas. It is not ready for 10,000 users, multi-election sales, or multi-organization tenancy without a schema redesign and server-side vote casting.

## Changes Applied

- Moved Firebase config to `VITE_FIREBASE_*` environment variables.
- Added `.env.example`.
- Added `firestore.rules` baseline.
- Added shared election category config in `src/lib/electionConfig.js`.
- Converted route pages to lazy imports, reducing initial bundle size from about 919 kB to about 227 kB.
- Reworked vote submission in `src/pages/VotingPage.jsx` to use Firestore transactions.
- Votes are now stored by candidate ID with `voteDetails` preserving names for audit display.
- Added ballot review confirmation modal and keyboard-accessible candidate selection.
- Updated results tallying to resolve candidate IDs and support older name-based votes.
- Soft-archived candidates instead of deleting historical records.
- Removed unused React imports and debug user creation code.

## Top Issues

| Severity | Area | Issue | Root Cause | Recommended Fix |
|---|---|---|---|---|
| Critical | Vote integrity | Voters can still write vote fields from client if rules allow it | No trusted server vote endpoint | Move `castVote` to Cloud Functions with Admin SDK transaction |
| Critical | Admin access | Admin role is read from Firestore profile | Client-visible mutable role model | Use custom claims plus locked rules |
| Critical | Secrets | `.env.local` contains a Vercel OIDC token | Local deployment token stored in project folder | Rotate token, clear local file, audit Vercel access logs |
| High | Data model | Single global `settings/election` and `candidates` collections | No election or organization scope | Use `/organizations/{orgId}/elections/{electionId}` hierarchy |
| High | Audit | No immutable audit logs | Writes only update voter profile | Add append-only server-created audit logs |
| High | Privacy | Results reads entire voter collection | Admin result screen mixes voter identity and ballots | Separate voter status from anonymous ballots |
| High | Tampering | Browser console can call Firebase SDK | Trust placed in React UI | Enforce all constraints in rules/functions |
| High | Race conditions | Final `hasVoted` completion is separate from category vote writes | Multi-step client workflow | Derive completion server-side after final category |
| Medium | Performance | Realtime listener reads all candidates | No category query or election scope | Query candidates by active election/category |
| Medium | Performance | Results loads all voters at once | No pagination or aggregation | Maintain server tallies and paginate voters |
| Medium | UX | No explicit election schedule/countdown | Admin manually opens categories | Add scheduled phase control |
| Medium | Accessibility | Dialog lacks focus trap | Custom modal | Add focus management or headless dialog library |
| Medium | Maintainability | Pages contain Firestore logic directly | No service layer | Add `services/elections`, `services/votes`, `hooks` |
| Medium | Compliance | Candidate deletion previously removed records | Destructive admin action | Keep soft archive and election snapshots |
| Medium | Registration | Anyone can self-register | Open voter roll | Add invite codes, allowlists, or admin imports |
| Medium | Session | localStorage stores role/name | Convenience state mistaken for auth | Remove role reliance from localStorage |
| Low | UI | Some rounded/card styling feels consumer-heavy | Mixed design language | Create design tokens and consistent shell |
| Low | Code | Empty/unused components exist | Template leftovers | Remove or implement `CandidateCard`, `VoteProgress` |
| Low | Docs | README is Vite template | No operator docs | Replace with deployment/admin guide |
| Low | Testing | No automated tests | MVP stage | Add unit, integration, and emulator security tests |

## Recommended Firestore Structure

```text
organizations/{orgId}
  members/{uid}
  elections/{electionId}
    config/main
    categories/{categoryId}
    candidates/{candidateId}
    eligibleVoters/{uid}
    ballots/{uid_categoryId}
    tallies/{categoryId}
    auditLogs/{logId}
```

Store candidate IDs in ballots, not only names. Snapshot candidate name/category inside `voteDetails` for historical reporting. Never derive official results by scanning mutable voter profile documents.

## Required Production Security Model

1. Use Firebase Auth custom claims: `{ orgIds: [], adminOrgIds: [] }`.
2. Use callable Cloud Function `castVote({ orgId, electionId, categoryId, candidateIds })`.
3. Function validates election schedule, voter eligibility, category max, candidate active status, and no prior ballot.
4. Function writes immutable ballot and audit log in one transaction.
5. Firestore rules deny direct client writes to ballots, tallies, audit logs, and admin-only settings.
6. Admin changes also go through functions for auditability.

## File-Level Findings

- `src/App.jsx`: route structure is clear; now lazy-loaded. Next: add layout shells and error boundaries.
- `src/firebase/config.js`: now env-driven. Next: ensure all deployment env vars are set.
- `src/routes/ProtectedRoute.jsx`: acceptable for UX gating. Security must be enforced in rules, not routes.
- `src/routes/AdminRoute.jsx`: useful UX guard, but role should move to custom claims.
- `src/pages/UserLogin.jsx`: removed debug account creation. Next: avoid storing role in localStorage.
- `src/pages/UserRegister.jsx`: open self-registration is not commercial-ready. Add invite-only enrollment.
- `src/pages/UserDashboard.jsx`: simple and responsive. Next: show category progress and election schedule.
- `src/pages/VotingPage.jsx`: now transactional with review modal. Next: move final vote write to Cloud Function.
- `src/admin/AdminDashboard.jsx`: simple tab shell. Next: URL-backed tabs and operator audit events.
- `src/admin/VotingControl.jsx`: uses shared categories. Next: scheduled phases and admin confirmation records.
- `src/admin/Candidates.jsx`: soft archives candidates. Next: candidate profiles, ordering, imports.
- `src/admin/Results.jsx`: supports ID-based tallies. Next: server tallies, pagination, PDF export.
- `src/components/Header.jsx`: usable but brand-specific. Next: shared app shell.
- `src/components/CandidateCard.jsx`: empty; remove or implement.
- `src/components/VoteProgress.jsx`: empty; remove or implement.
- `src/App.css`: unused Vite/template CSS; remove after confirming no references.
- `src/index.css`: minimal Tailwind import; add global focus and typography tokens.
- `README.md`: template content; replace with product setup and security deployment guide.
- `firestore.rules`: baseline only; use emulator tests before deployment.

## Roadmap

1. Launch blocker: Cloud Function vote casting, custom claims, emulator-tested rules. Estimated 3-5 days.
2. Launch blocker: multi-election/multi-organization schema migration. Estimated 4-7 days.
3. Launch blocker: voter roll import/invite flow. Estimated 2-4 days.
4. High value: immutable audit logs and admin activity history. Estimated 2-3 days.
5. High value: results exports with signed PDF report. Estimated 2-4 days.
6. High value: premium responsive app shell and design tokens. Estimated 3-5 days.
7. Scale: server tallies and paginated admin tables. Estimated 2-4 days.
8. QA: emulator tests, Playwright flows, accessibility checks. Estimated 3-5 days.

## Commercial Features

Highest business value:

- Multi-organization tenancy
- Multiple elections per organization
- Scheduled voting windows
- Voter import from Excel/CSV
- Audit log and tamper-evident report
- PDF/Excel exports
- Candidate profiles
- Email/SMS/QR voter verification
- Admin activity timeline
- Multi-language support

