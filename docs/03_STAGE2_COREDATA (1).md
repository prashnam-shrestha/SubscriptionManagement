# SubscriptionOS — Build Manual
## 03 — Stage 2: Core Data

```
CURRENT STATUS
✓ Phase 0: Setup
✓ Stage 1: Foundation
→ Stage 2: Core Data
○ Stage 3: Business Logic Core
○ Stage 4: Operational Layer
○ Stage 5: Intelligence Layer
○ Stage 6: Hardening & Ship
```

Seven sprints, in this order: **2.0 Frontend Foundation → 2.1 Settings → 2.2 Service Types & Products → 2.3 Master Accounts → 2.4 Services → 2.5 Streaming Profiles → 2.6 Customers.**

**Why this order:** Settings comes first because Assignment Strategy config and Credential Templates are needed by Stage 3–4. Service Types must exist before Products (FK) and before Services. Master Accounts must exist before Services (FK). Services must exist before Streaming Profiles (FK). Customers is independent and can safely go last.

**A pattern note before you start:** every module below is "mostly CRUD" — the highest ratio of features-built to risk in this whole project, per your Dev Plan. Once you've done Settings and Products, Master Accounts/Services/Profiles will feel very familiar. Don't skip reading each one though — the FK dependencies and archive rules differ slightly per module.

---
---

# Sprint 2.0 — Frontend Foundation & Login

### Goal
Set up shadcn/ui, the global layout (sidebar + top bar per Section 7), an API client that attaches your JWT automatically, an auth context so the frontend knows who's logged in, and a working Login screen. Every module after this one builds *inside* this shell.

### Why now
Sprint 1.1 only scaffolded a bare Next.js app. Without this sprint, every future module would have to invent its own layout and auth wiring — six times. Build it once here.

### What I need before starting
- Stage 1 complete (Sprint 1.5 gap-fix included), backend running with working `/auth/login`, `/auth/refresh`, `/auth/me`.

### What I need to understand
- **shadcn/ui** — not a traditional component library you install as one package; it's a CLI that copies individual component source files (Button, Table, Dialog, etc.) directly into your project, so you own and can edit them.
- **Auth context** — a React mechanism that makes "who is logged in" and "what's their role" available to any component in the app without passing it down manually through every layer.
- **Protected route** — a wrapper that redirects to `/login` if there's no valid session, so you don't have to repeat that check on every single page.

---

### Step 1 — Give Gemini this prompt

```text
You are the primary implementation engineer for SubscriptionOS. We are on Sprint 2.0
of Stage 2: Frontend Foundation & Login. Stage 1 (backend: auth, schema, activity log)
is complete and working at http://localhost:3001/api/v1.

Before writing code, inspect the current frontend/ structure (Next.js App Router,
TypeScript, Tailwind already scaffolded) and confirm nothing else has been added yet.

OBJECTIVE (Section 7 Global Layout & Screen 1; Section 10 tech stack; Section 9
Authentication Flow):

1. Initialize shadcn/ui in frontend/ (npx shadcn@latest init), using the default New
   York style, and add these components now since every future sprint will need them:
   button, input, table, dialog, dropdown-menu, toast (or sonner if that's the current
   shadcn recommendation), card, badge, form, select, tabs, sheet (for mobile sidebar).

2. Install: lucide-react, @tanstack/react-table, recharts (per Section 10 tech stack -
   don't add any other UI library).

3. Create frontend/lib/api-client.ts: a thin wrapper around fetch that:
   - Reads the API base URL from an environment variable (NEXT_PUBLIC_API_URL,
     default http://localhost:3001/api/v1)
   - Automatically attaches `Authorization: Bearer <token>` from stored auth state on
     every request
   - On a 401 response, attempts ONE silent call to /auth/refresh, retries the
     original request once with the new token, and if that also fails, clears auth
     state and redirects to /login
   - Unwraps the standard `{ success, data }` / `{ success, error }` response envelope
     from Section 9 Conventions, throwing a typed error on failure so calling code can
     just try/catch

4. Create an AuthContext (frontend/lib/auth-context.tsx) that:
   - Stores the current user (id, name, role) and the access token in memory (React
     state), NOT localStorage/sessionStorage for the access token - keep it in memory
     only, refresh token handling stays server-side/httpOnly-cookie-style if you
     recommend that approach, or explain your chosen approach and any tradeoff before
     implementing if you'd rather use a different secure pattern - ask me first if
     you're unsure, don't just default to localStorage for tokens.
   - Exposes login(email, password), logout(), and the current user/role
   - On app load, tries GET /auth/me to restore a session if a valid token exists

5. Create a ProtectedRoute / layout wrapper that redirects to /login if there's no
   authenticated user, applied to a route group like frontend/app/(dashboard)/.

6. Build the Login screen at frontend/app/login/page.tsx matching Section 7 Screen 1
   and Section 8's wireframe exactly: SubscriptionOS heading, Email field, Password
   field, Login button. On success, redirect to /dashboard (we'll build the real
   Task Center/Dashboard screens in later sprints - for now just create a simple
   placeholder page at frontend/app/(dashboard)/dashboard/page.tsx that says
   "Logged in as {user.name} ({user.role})" so we have somewhere to land and verify
   auth works end to end).

7. Build the Global Layout (Section 7 Global Layout section) as a wrapper around the
   (dashboard) route group:
   - Persistent left sidebar (collapsible to a Sheet on mobile) with this exact nav
     list from Section 7's Navigation diagram: Task Center, Dashboard, Customers
     (with a Pending Customers sub-item), Subscriptions, Products, Master Accounts
     (with a Streaming Profiles sub-item), Revenue, Reports, Notifications, Activity
     Log, Settings. Link every item to its future route now even though most pages
     don't exist yet (e.g. /customers, /products) - they'll 404 until we build them
     in upcoming sprints, that's expected and fine for now.
   - Sticky top bar with: a Global Search input (non-functional placeholder for now -
     built in Stage 5), a notification bell icon (placeholder), and a user menu
     showing the logged-in user's name/role with a Logout option.
   - Every action needs a toast notification pattern ready to use in later sprints -
     confirm the toast/sonner setup from Step 1 is wired into the root layout.

8. Set up dark mode support via Tailwind (class-based dark mode + a simple toggle in
   the user menu), per Section 7's "Dark mode supported via a single design-token
   theme" requirement. Don't build separate dark-mode component variants - use CSS
   variables/tokens so existing components just work in both modes.

Do not build any actual data screens yet (Customers, Products, etc.) - those are the
next six sprints. This sprint is shell + auth only.

After implementation tell me:
1. Every file created/changed.
2. Your chosen approach for storing the access/refresh token and why - I want to
   understand the security tradeoff you picked.
3. Exact steps to test: log in as Owner, see the dashboard placeholder with my name/
   role, click every sidebar link and confirm real navigation happens (even to future
   404s), log out, confirm I land back on /login and can't access /dashboard directly
   by typing the URL while logged out.
```

### Step 2 — What Gemini should create

```text
frontend/
├── app/
│   ├── login/
│   │   └── page.tsx
│   └── (dashboard)/
│       ├── layout.tsx          (sidebar + top bar + ProtectedRoute)
│       └── dashboard/
│           └── page.tsx        (placeholder)
├── lib/
│   ├── api-client.ts
│   └── auth-context.tsx
├── components/
│   ├── ui/                     (shadcn components)
│   ├── sidebar.tsx
│   └── top-bar.tsx
└── .env.local                  (NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1)
```

### Step 3 — Run this

Terminal 1 (backend, if not already running):
```bash
cd backend && npm run start:dev
```

Terminal 2 (frontend):
```bash
cd frontend && npm run dev
```

### Step 4 — Test it manually

1. Open `http://localhost:3000` — you should be redirected to `/login` (not logged in yet).
2. Log in with your seeded Owner credentials.
3. **Expected result:** redirected to `/dashboard`, showing "Logged in as [Owner name] (Owner)".
4. Click every sidebar link. Pages that don't exist yet should 404 (expected) — but the sidebar itself, the URL changing, and returning via the browser back button should all work smoothly.
5. Click the user menu → Logout. **Expected result:** redirected to `/login`.
6. Try typing `http://localhost:3000/dashboard` directly into the address bar while logged out. **Expected result:** redirected back to `/login`, not the dashboard.
7. Toggle dark mode from the user menu — confirm the whole layout switches, not just part of it.

### Step 5 — PASS / FAIL

**PASS** if all 7 checks above behave as described.

**FAIL** if you can reach `/dashboard` while logged out, or login/logout doesn't work, or the sidebar/top bar don't render.

### Step 6A — If it works

```bash
git add .
git status
git diff --cached
git commit -m "Sprint 2.0: frontend shell - shadcn/ui, global layout, auth context, login"
git push
```

### Step 6B — If it fails

Collect: browser console errors (open DevTools → Console), the Network tab showing the failed request/response, and which of the 7 test steps failed. Send to Gemini with the specifics. If it's an auth/security-shaped bug (e.g. protected routes not actually protecting), don't accept a quick patch without understanding why — ask Gemini to explain the root cause, not just the fix.

### Step 7 — Completion Checklist

```
[ ] shadcn/ui initialized with all required components
[ ] Login screen matches Section 7/8 exactly
[ ] AuthContext restores session on page reload via /auth/me
[ ] Protected routes redirect to /login when logged out
[ ] Sidebar matches the exact navigation list from Section 7
[ ] Top bar has search placeholder, notification bell placeholder, user menu, logout
[ ] Dark mode toggle works across the whole layout
[ ] Token storage approach explained by Gemini and understood by you
[ ] Committed and pushed
```

---
---

# Sprint 2.1 — Settings (+ two schema additions)

### Goal
Build the Settings screen (Business Info, Assignment Strategy, Credential Templates, User Management, System Preferences) — and first, add the two missing tables this screen actually needs.

### Why now
Assignment Strategy (Stage 3) and Credential Templates (Stage 4) both read from Settings. Building this now means Stage 3 has something real to configure against instead of a hardcoded default.

### What I need before starting
- Sprint 2.0 complete.

### What I need to understand
- **Singleton table** — a table intentionally designed to hold exactly one row (Settings has one business, not many). We'll enforce this with a fixed, known ID rather than letting the app create multiple rows by accident.
- Nothing else new here — this sprint is standard CRUD plus one config screen.

---

### Step 1 — Give Gemini this prompt

```text
You are the primary implementation engineer for SubscriptionOS. We are on Sprint 2.1
of Stage 2: Settings. Sprint 2.0 (frontend shell) is complete.

Before writing code, inspect backend/prisma/schema.prisma and frontend/app/(dashboard)/
to confirm current state.

OBJECTIVE:

PART A - Two new Prisma models (this is a deliberate schema addition - the original
15-table list in Section 4 omitted these even though Section 9's API spec and Section
7's UI spec both require them; Section 10's Backend Modules list also names "Settings"
explicitly):

1. Settings - a SINGLETON table (enforce exactly one row: use a fixed id like
   "SETTINGS-001" and never allow a second row to be created, add a check in the
   service layer, not just convention):
   id String @id @default("SETTINGS-001")
   businessName String
   businessContactEmail String?
   businessContactPhone String?
   currency String @default("NPR")
   assignmentStrategy String @default("LowestOccupancy")
     (enum: "LowestOccupancy" | "FillFirst" - used by the Assignment Engine in Stage 3)
   pinRotationPolicy String @default("Manual")
     (enum: "Manual" | "TimeBased" - V1 only implements "Manual" behavior; store the
     field now for forward-compatibility per the SDD's Open Item #2, but do not build
     any time-based automation logic - that's explicitly out of scope for V1)
   preferences Json? (small free-form bag for anything that doesn't need its own
     column yet - keep this minimal, don't pre-build fields nobody asked for)
   updatedAt DateTime @updatedAt

2. CredentialTemplate:
   id (PK, prefix CRT- - use the same ID generation mechanism as every other table
     from Sprint 1.2's id-generator.ts)
   name String
   templateText String @db.Text (contains placeholders like {CustomerName},
     {ProductName}, {MasterAccountEmail}, {MasterAccountPassword}, {ProfileName},
     {PIN}, {UsageRules} - matching Section 7 Screen 14's Credential Center preview
     fields exactly. Do NOT implement the placeholder-substitution logic yet - that's
     built in Stage 4 when the Credential Center feature is actually assembled. This
     sprint just stores and manages templates as text.)
   isDefault Boolean @default(false)
   createdAt, updatedAt

Generate a migration for these two additions: `npx prisma migrate dev --name
add_settings_and_credential_templates`. In the seed script, add exactly one Settings
row (businessName "SubscriptionOS Demo Business" or similar, assignmentStrategy
"LowestOccupancy") and one default CredentialTemplate with a reasonable placeholder
message using the fields listed above.

PART B - Backend module backend/src/modules/settings/:
- GET /api/v1/settings - returns the single Settings row (create it on first read if
  somehow missing, don't error)
- PUT /api/v1/settings - Owner only (BR-072: Admin cannot modify system settings) -
  update businessName/contact fields/assignmentStrategy/pinRotationPolicy/preferences.
  Write an ActivityLog entry (action "Settings Changed", per BR-075's example list) on
  every successful update, using the shared ActivityLogService from Sprint 1.4.
- Standard CRUD for CredentialTemplate at /api/v1/credential-templates (GET list, GET
  by id, POST, PUT, DELETE - Owner and Admin can both manage templates, this isn't
  restricted like core Settings).
- GET/POST /api/v1/users and PUT/DELETE /api/v1/users/{id} - Owner only (Section 9).
  Basic user management: list users, create a new Admin user (Owner can also create
  another Owner if they choose), edit fullName/email/status, and DELETE actually
  means disabling (set status to "Disabled"), never a hard delete of a User record -
  this is a slight extension of the archive-not-delete pattern to Users, consistent
  with BR-078.

PART C - Frontend Settings screen at frontend/app/(dashboard)/settings/page.tsx,
matching Section 7 Screen 19 and Section 8's wireframe: tabs for Business, Products
(this tab is just a link/shortcut to the Products screen we build in Sprint 2.2 - a
placeholder note is fine for now), Assignment Strategy (a simple select: Lowest
Occupancy / Fill First), Templates (list + create/edit CredentialTemplates), Users
(Owner only - hide this tab entirely for a logged-in Admin, don't just disable it).
Each section has its own Save button (Section 7: "Save per-section, not global").

If the logged-in user is an Admin, the whole Settings screen besides Templates should
be read-only or hidden per BR-072 - confirm your exact approach (hide vs disable) and
tell me why.

After implementation tell me:
1. Every file created/changed, including the exact migration file name.
2. How you enforced "exactly one Settings row" at the service layer.
3. Test steps: view Settings as Owner, change Assignment Strategy, save, refresh the
   page and confirm it persisted. Create a Credential Template. Try to access Settings
   as Admin and confirm the restricted parts are hidden/blocked, but confirm Admin CAN
   still manage Credential Templates.
```

### Step 2 — What Gemini should create

```text
backend/
├── prisma/
│   ├── schema.prisma            (+ Settings, CredentialTemplate models)
│   └── migrations/.../
├── src/modules/settings/
│   ├── settings.module.ts
│   ├── settings.controller.ts
│   ├── settings.service.ts
│   ├── credential-templates.controller.ts
│   ├── credential-templates.service.ts
│   ├── users.controller.ts
│   └── users.service.ts
frontend/
└── app/(dashboard)/settings/
    └── page.tsx
```

### Step 3 — Run this

```bash
cd backend && npx prisma migrate dev --name add_settings_and_credential_templates
npx prisma db seed
npm run start:dev
```
(In another terminal) `cd frontend && npm run dev`

### Step 4 — Test it manually

1. Log in as Owner, navigate to Settings.
2. Change Assignment Strategy to "Fill First," save, refresh the browser tab fully. **Expected:** the change persisted (still shows "Fill First" after reload).
3. Go to Templates, create a new template with a couple of the placeholder tokens in the text, save. **Expected:** it appears in the template list.
4. Log out, log in as Admin.
5. Go to Settings. **Expected:** Business Info / Assignment Strategy / Users are hidden or clearly read-only; Templates tab is still usable.
6. As Admin, try calling `PUT /api/v1/settings` directly via curl with a valid Admin token. **Expected:** `403 Forbidden`.

### Step 5 — PASS / FAIL

**PASS** if all 6 checks behave as described and Prisma Studio shows exactly one row in `Settings` no matter how many times you save.

**FAIL** if a second Settings row ever gets created, or Admin can modify business info/assignment strategy.

### Step 6A — If it works
```bash
git add . && git status && git diff --cached
git commit -m "Sprint 2.1: Settings, Credential Templates, User Management"
git push
```

### Step 6B — If it fails
Collect the exact failing test step, curl/browser output, and server logs. Send to Gemini, specifying which of the 6 test steps failed and the exact response you got.

### Step 7 — Completion Checklist
```
[ ] Settings and CredentialTemplate tables exist via a real migration
[ ] Exactly one Settings row can ever exist (verified by trying to trigger a second)
[ ] GET/PUT /settings works, PUT is Owner-only
[ ] CredentialTemplate CRUD works for both Owner and Admin
[ ] User management (list/create/edit/disable) works, Owner-only
[ ] Settings Changed events appear in Activity Log
[ ] Admin sees a correctly restricted Settings screen
[ ] Committed and pushed
```

---
---

# Sprint 2.2 — Service Types & Products

### Goal
Build Service Types (the category, e.g. "Netflix Shared") and Products (what you actually sell), both with full CRUD, matching Section 7 Screen 8 and Section 4's schema.

### Why now
Products need Service Types to exist first (FK). Both are needed before Master Accounts/Services in a practical sense (you'll want to pick a Service Type when creating a Service), and before Stage 3's Pending Customers / Subscriptions, which reference Products.

### What I need before starting
- Sprint 2.1 complete.

### What I need to understand
Nothing new — straightforward CRUD, same shape as Settings' CredentialTemplate piece.

---

### Step 1 — Give Gemini this prompt

```text
You are the primary implementation engineer for SubscriptionOS. We are on Sprint 2.2
of Stage 2: Service Types & Products. Sprint 2.1 is complete.

Before writing code, inspect current backend/src/modules/ and confirm ServiceType and
Product models already exist in schema.prisma from Sprint 1.2 (they do - no new
migration needed this sprint unless you find a genuine gap, in which case stop and
tell me before changing the schema).

OBJECTIVE:

PART A - backend/src/modules/service-types/:
  GET /api/v1/service-types - list all (Owner + Admin)
  POST /api/v1/service-types - create (Owner + Admin) - name, defaultProfileCapacity
  PUT /api/v1/service-types/{id} - update
  No DELETE/archive endpoint is specified for Service Types in Section 9 - don't
  invent one. If you think this is a real gap, flag it to me rather than silently
  adding a DELETE endpoint.

PART B - backend/src/modules/products/:
  Standard CRUD at /api/v1/products, /api/v1/products/{id} (Section 9: "Standard CRUD
  ... DELETE archives - BR-008"). Fields: productCode, productName, serviceTypeId,
  price, durationDays, status.
  - productCode must be unique - return 409 CONFLICT with a clear message if it
    collides.
  - DELETE must archive (set status to "Disabled"), never hard-delete, matching
    BR-008 and BR-085. Verify: an archived Product must NOT be selectable when
    creating a new Subscription later (we'll enforce this again in Stage 3 when
    Subscriptions are built, but the Product's own GET-list endpoint should support
    filtering by status now so the frontend can already exclude archived ones from
    "new subscription" pickers later).
  - Write ActivityLog entries for Product Created/Updated (per BR-075's example
    list), using the shared ActivityLogService.

PART C - Frontend at frontend/app/(dashboard)/products/page.tsx, matching Section 7
Screen 8 and Section 8's wireframe exactly: table with Code, Name, Price, Duration,
Service Type name (not just the ID), Status columns; Add Product button (top right);
row actions Edit and Archive with a confirmation dialog before archiving (Section 7
Global Layout rule: "Destructive or state-changing actions... always show a
confirmation dialog naming what will be affected"). The Add/Edit form needs a Service
Type dropdown, populated from GET /service-types.

Add a small "Service Types" management UI too - it doesn't need its own full screen
per the SDD, a simple list+add modal reachable from the Products page (e.g. a
"Manage Service Types" button) is enough - use your judgement on the simplest UI that
satisfies Section 9's endpoints, and tell me what you chose.

After implementation tell me:
1. Every file created/changed.
2. Test steps: create a Service Type, create a Product referencing it, edit the
   Product, archive it, confirm archived products are excluded when you filter the
   list by status=Active, confirm the archived product still appears when you don't
   filter (historical visibility, per BR-008 "existing subscriptions remain
   unaffected").
```

### Step 2 — What Gemini should create
```text
backend/src/modules/
├── service-types/{module,controller,service}.ts
└── products/{module,controller,service}.ts
frontend/app/(dashboard)/products/page.tsx
```

### Step 3 — Run & Step 4 — Test manually
```bash
cd backend && npm run start:dev
cd frontend && npm run dev
```
1. Create a Service Type ("Spotify Family," capacity 6).
2. Create a Product using it (code, name, price, 30 days).
3. Edit the Product's price, confirm it saves.
4. Archive the Product — confirmation dialog should name the product.
5. Filter the products list by Active — archived one should disappear.
6. Remove the filter — archived one should reappear, clearly marked Disabled/Archived.

### Step 5 — PASS / FAIL
**PASS** if all 6 steps work and duplicate `productCode` is rejected with 409. **FAIL** otherwise.

### Step 6A/6B — Git / Troubleshooting
Same pattern as previous sprints — commit with `git commit -m "Sprint 2.2: Service Types & Products CRUD"` if it passes; otherwise collect the exact failing step and error for Gemini.

### Step 7 — Completion Checklist
```
[ ] Service Types: list, create, update all work
[ ] Products: full CRUD, DELETE archives not deletes
[ ] Duplicate productCode rejected with 409
[ ] Archived products excluded from Active-filtered lists, visible unfiltered
[ ] Product list/form matches Section 7/8 exactly
[ ] Activity Log entries created for Product changes
[ ] Committed and pushed
```

---
---

# Sprint 2.3 — Master Accounts

### Goal
Full CRUD for Master Accounts (the actual purchased third-party accounts), including the encrypted-password field, Mark Dead action, and the BR-017a archive-blocking rule.

### Why now
Services (next sprint) belong to a Master Account (FK) — this has to exist first.

### What I need before starting
- Sprint 2.2 complete.

### What I need to understand
- **Dead vs Archived** — these mean different things here. **Dead** (BR-015/016) means the account stopped working (e.g. banned) — it can't take *new* assignments, but customers already on it stay put until manually moved. **Archived** (BR-017/017a) is stricter — it means "we're done with this account entirely," and the system physically won't let you archive it while any Active Assignment still exists underneath it.

---

### Step 1 — Give Gemini this prompt

```text
You are the primary implementation engineer for SubscriptionOS. We are on Sprint 2.3
of Stage 2: Master Accounts. Sprint 2.2 is complete.

Before writing code, inspect schema.prisma to confirm the MasterAccount model from
Sprint 1.2 (id, email, encryptedPassword, nickname, status, notes) and confirm
CryptoService (AES-256-GCM) exists from Sprint 1.2.

OBJECTIVE (Section 9 Master Accounts; BR-013 through BR-017a; Section 7 Screens 9-10):

1. backend/src/modules/master-accounts/:
   GET /api/v1/master-accounts - list, with each row's overall occupancy computed
     (sum of occupied seats across all its Services' Streaming Profiles / sum of
     total capacity) - Services and Streaming Profiles don't exist as usable data
     until Sprints 2.4/2.5, so for THIS sprint return occupancy as 0/0 or null
     safely - don't error if there are no Services yet, and structure the query so
     it naturally starts working once Sprints 2.4/2.5 add real data, without needing
     to revisit this endpoint.
   GET /api/v1/master-accounts/{id}
   POST /api/v1/master-accounts - email, plaintext password from the admin (encrypt
     it with CryptoService before storing - NEVER store or log the plaintext),
     nickname, notes
   PUT /api/v1/master-accounts/{id} - if password is being changed, re-encrypt; if
     omitted, leave the existing encrypted password untouched
   DELETE /api/v1/master-accounts/{id} - archives (sets status "Archived"). BEFORE
     archiving, check for ANY Active Assignment anywhere underneath this account
     (through its Services -> Streaming Profiles -> Assignments chain). If any exist,
     REJECT with 409 CONFLICT and list which Streaming Profiles/customers are
     blocking it (BR-017a) - since Services/Assignments are mostly empty until later
     sprints, this check will usually just pass for now, but implement the real query
     now, not a stub, so it's correct once real data exists.
   POST /api/v1/master-accounts/{id}/mark-dead - sets status "Dead". Per BR-016,
     existing customers stay assigned - this endpoint does NOT touch any Assignment
     records, it only flags the account so it stops accepting NEW assignments (the
     "stops accepting new assignments" enforcement itself happens in Stage 3's
     Assignment Engine, which will check parent Master Account status - just make
     sure this endpoint correctly sets the flag now).
   GET /api/v1/master-accounts/{id}/reveal-password - requires step-up re-
     authentication (Section 9: "Requires re-authentication (short-lived step-up
     token)"). Implement this as: a new endpoint POST /api/v1/auth/step-up that
     accepts the user's current password again and returns a short-lived (~5 min)
     step-up token; reveal-password requires this step-up token in a header (e.g.
     X-Step-Up-Token) in addition to the normal JWT, rejecting with 401 if missing/
     expired. EVERY call to reveal-password writes an ActivityLog entry (action
     "Master Account Password Revealed") regardless of success, per Section 7 Screen
     10's requirement that reveals are logged.

2. Frontend:
   - frontend/app/(dashboard)/master-accounts/page.tsx matching Section 7 Screen 9 /
     Section 8 wireframe: table with Nickname, Email, Status, Services (count),
     Overall Occupancy; Add button; row actions View, Edit, Mark Dead, Archive
     (Archive button disabled with a tooltip explaining why if BR-017a would block
     it - call the backend check before rendering the button state, don't just try
     and catch the error after the click).
   - frontend/app/(dashboard)/master-accounts/[id]/page.tsx matching Section 7
     Screen 10 / Section 8 wireframe: account info with email and a masked password
     (••••••••) with a "Reveal" button that triggers the step-up re-auth flow (a
     dialog asking the admin to re-enter their password) before showing the real
     value; Services list (empty for now until Sprint 2.4); Edit/Mark Dead/Archive
     buttons.

After implementation tell me:
1. Every file created/changed.
2. How the step-up re-authentication flow works end to end - walk me through it.
3. Test steps: create a Master Account, confirm the password is encrypted in the DB
   (show me via Prisma Studio - it should NOT be readable plaintext), edit it, mark
   it Dead, reveal the password via the step-up flow and confirm an ActivityLog entry
   was created, archive an account with no Services underneath (should succeed).
```

### Step 2 — What Gemini should create
```text
backend/src/modules/
├── master-accounts/{module,controller,service}.ts
└── auth/ (+ step-up endpoint added to existing auth module)
frontend/app/(dashboard)/master-accounts/
├── page.tsx
└── [id]/page.tsx
```

### Step 3 — Run & Step 4 — Test manually
1. Create a Master Account. Open Prisma Studio — confirm `encryptedPassword` is unreadable ciphertext, not the plaintext you typed.
2. Edit its nickname. Confirm it saves.
3. Mark it Dead. Confirm status changes and the record is otherwise untouched.
4. Open its detail page, click Reveal — confirm you're prompted to re-enter your password, and only after that does the real password appear.
5. Check Activity Log — confirm a "Master Account Password Revealed" entry exists.
6. Archive it (should succeed since no Services exist yet). Confirm status is "Archived."

### Step 5 — PASS / FAIL
**PASS** if all 6 steps behave as described and the password is never visible in plaintext anywhere except the intentional Reveal flow. **FAIL** if the password appears in plaintext in Prisma Studio, logs, or the list view.

### Step 6A/6B
```bash
git commit -m "Sprint 2.3: Master Accounts CRUD, encrypted passwords, step-up reveal"
```
On failure, collect the exact step and error, and if it's the encryption or step-up auth that's broken, treat it as high-risk (per your Safety Rules) — get it right before moving on, don't paper over it.

### Step 7 — Completion Checklist
```
[ ] Master Account CRUD works, password always encrypted at rest
[ ] Mark Dead sets status without touching Assignments
[ ] Archive is blocked with 409 + details when Active Assignments exist underneath
[ ] Step-up re-auth required before password reveal
[ ] Every reveal (successful or not) logged to Activity Log
[ ] List/detail screens match Section 7/8
[ ] Committed and pushed
```

---
---

# Sprint 2.4 — Services

### Goal
Full CRUD for Services — the join between a Master Account and a Service Type (e.g. "this specific Netflix account's Netflix Shared tier").

### Why now
Streaming Profiles (next sprint) belong to a Service (FK).

### What I need before starting
- Sprint 2.3 complete (Master Accounts exist) and Sprint 2.2 complete (Service Types exist).

### What I need to understand
Nothing new conceptually — but note the **unique constraint**: one Master Account can't have the same Service Type twice (BR-013's examples always show *different* service types per account).

---

### Step 1 — Give Gemini this prompt

```text
You are the primary implementation engineer for SubscriptionOS. We are on Sprint 2.4
of Stage 2: Services. Sprint 2.3 (Master Accounts) is complete.

Before writing code, confirm the Service model from Sprint 1.2 (masterAccountId,
serviceTypeId, status, with a unique constraint on the pair).

OBJECTIVE (Section 9 Services; BR-018 through BR-020):

1. backend/src/modules/services/ nested under Master Accounts, exactly as Section 9
   specifies:
   GET /api/v1/master-accounts/{masterAccountId}/services
   POST /api/v1/master-accounts/{masterAccountId}/services - body: serviceTypeId,
     status. Enforce the unique (masterAccountId, serviceTypeId) constraint - return
     409 CONFLICT with a clear message ("This Master Account already provides
     [Service Type Name]") if violated, not a raw database error.
   PUT /api/v1/services/{id}
   DELETE /api/v1/services/{id} - archives (BR-085), never hard-deletes.
   Also block archiving a Service if it has Streaming Profiles with Active
   Assignments underneath it (same pattern as BR-017a for Master Accounts, applied
   one level down - the SDD doesn't explicitly restate this rule for Services, but
   it follows the same logic your own document uses for Master Accounts one level up.
   Flag this back to me if you disagree with extending the pattern here.) Return 409
   with details, same shape as the Master Account case.

2. Update the Master Account detail screen from Sprint 2.3
   (frontend/app/(dashboard)/master-accounts/[id]/page.tsx) to actually show its
   Services list now (Section 7 Screen 10: "Services list, each showing Streaming
   Profile count and occupancy" - Streaming Profile count/occupancy will still be
   0 until Sprint 2.5, that's expected), with an "Add Service" action that opens a
   form to pick a Service Type and create it under this Master Account.

After implementation tell me:
1. Every file created/changed.
2. Test: add a Service to a Master Account, try adding the SAME Service Type again
   to the same account (should 409), add a DIFFERENT Service Type (should succeed),
   archive a Service with no Streaming Profiles yet (should succeed).
```

### Step 2 — Run & Test
Same pattern: create, duplicate-attempt (expect 409), create a second distinct one (expect success), archive (expect success since empty).

### Step 3 — PASS / FAIL, Git, Checklist
```bash
git commit -m "Sprint 2.4: Services CRUD, nested under Master Accounts"
```
```
[ ] Services CRUD works, nested correctly under Master Accounts
[ ] Duplicate (MasterAccount, ServiceType) pair rejected with 409
[ ] Archive blocked if Active Assignments exist underneath (once testable in later stages)
[ ] Master Account detail page shows its Services list
[ ] Committed and pushed
```

---
---

# Sprint 2.5 — Streaming Profiles

### Goal
Full CRUD for Streaming Profiles — the actual seats customers get assigned to — plus the PIN change flow and the `pinChangeRequired` flag for the Task Center (built in Stage 5).

### Why now
This is the last piece the Assignment Engine (Stage 3) needs to exist before it has real profiles to assign customers to.

### What I need before starting
- Sprint 2.4 complete.

### What I need to understand
- **Occupancy vs Capacity** — Capacity is the configured max (BR-022). Occupancy is a *live count* of Active Assignments (BR-024) — it's never stored as its own column, always computed, so it can never drift out of sync with reality.

---

### Step 1 — Give Gemini this prompt

```text
You are the primary implementation engineer for SubscriptionOS. We are on Sprint 2.5
of Stage 2: Streaming Profiles. Sprint 2.4 (Services) is complete.

Before writing code, confirm the StreamingProfile model from Sprint 1.2 (serviceId,
profileName, encryptedPin, capacity, status, capacity > 0 check constraint).

OBJECTIVE (Section 9 Streaming Profiles; BR-021 through BR-028; Section 7 Screens
11-12):

1. SCHEMA ADDITION: add `pinChangeRequired Boolean @default(false)` to
   StreamingProfile via a new migration (`npx prisma migrate dev --name
   add_pin_change_required_flag`). This supports the Task Center's "PIN Changes
   Required" row (Section 7 Screen 2, built in Stage 5) and the SDD's Open Item #2
   decision: V1 uses a manual flag only, no automatic time-based rotation.

2. backend/src/modules/streaming-profiles/ nested under Services:
   GET /api/v1/services/{serviceId}/streaming-profiles - each result includes a
     computed `occupied` count (COUNT of Assignments where streamingProfileId = this
     profile AND status = 'Active' - there won't be any real Assignments until Stage
     3, so this will correctly return 0 for now, which is fine)
   GET /api/v1/streaming-profiles/{id}
   POST /api/v1/services/{serviceId}/streaming-profiles - profileName, pin
     (plaintext from admin, encrypt with CryptoService before storing), capacity
     (must be > 0, validate before hitting the DB constraint so the error message is
     friendly, not a raw Postgres error)
   PUT /api/v1/streaming-profiles/{id}
   DELETE /api/v1/streaming-profiles/{id} - archives, blocked with 409 if Active
     Assignments exist (same pattern as Sprints 2.3/2.4)
   POST /api/v1/streaming-profiles/{id}/change-pin - body: { newPin }. Encrypt the
     new PIN, save it, create a PinHistory record (oldEncryptedPin, newEncryptedPin,
     changedBy, changedAt) - PinHistory is immutable, never update an existing row.
     Find every customer currently on this profile (Active Assignments) and return
     them in the response (Section 9: "returns the list of currently-affected
     customers" - there won't be any until Stage 3, return an empty array correctly
     rather than erroring). Also clear pinChangeRequired back to false if it was set
     (the change was just made, so it's no longer "required"). Write an ActivityLog
     entry ("PIN Changed").
   GET /api/v1/streaming-profiles/{id}/customers
   GET /api/v1/streaming-profiles/{id}/pin-history
   ALSO add a simple way to SET pinChangeRequired = true manually (e.g. a small PATCH
   or a field on the PUT endpoint) - this is what an admin uses to flag "this profile
   needs its PIN rotated soon," surfaced later in the Task Center.

3. Frontend:
   - frontend/app/(dashboard)/services/[serviceId]/streaming-profiles/page.tsx (or
     nest this reasonably under the Master Account/Service detail view - use your
     judgement matching Section 7 Screen 11, tell me the route you chose): table with
     Profile Name, Capacity, Occupied, Status; Add Profile button; row actions Change
     PIN, View Customers - PIN itself is NEVER shown in this list view per Section 7
     Screen 11's explicit note ("PIN not shown in the list view").
   - Streaming Profile detail screen matching Section 7 Screen 12: PIN shown masked
     with Reveal (same step-up re-auth pattern as Master Account passwords from
     Sprint 2.3 - reuse that mechanism, don't build a second one), Capacity,
     Occupied, Current Customers list (empty for now), PIN History, Assignment
     History (empty for now), Change PIN and Move Customer buttons (Move Customer
     button can be a disabled placeholder for now - it's built in Stage 4).

After implementation tell me:
1. Every file created/changed, including the new migration name.
2. Test: create a Streaming Profile with capacity 3, confirm the PIN is encrypted at
   rest, reveal it via step-up auth, change the PIN and confirm a PinHistory record
   was created and it's returned as immutable (no update method exists), manually
   flag pinChangeRequired and confirm changing the PIN clears it back to false.
```

### Step 2 — Run & Test
Standard pattern: create with capacity 3 → reveal via step-up → change PIN → verify PinHistory row appears in Prisma Studio → verify `pinChangeRequired` toggles correctly.

### Step 3 — PASS / FAIL, Git, Checklist
```bash
git commit -m "Sprint 2.5: Streaming Profiles CRUD, PIN change flow, pinChangeRequired flag"
```
```
[ ] Streaming Profile CRUD works, capacity > 0 enforced
[ ] PIN always encrypted at rest, revealed only via step-up auth
[ ] Change PIN creates an immutable PinHistory record and returns affected customers
    (empty array is correct for now)
[ ] pinChangeRequired flag can be set manually and clears automatically on PIN change
[ ] List view never shows the PIN; detail view shows it masked with Reveal
[ ] Committed and pushed
```

---
---

# Sprint 2.6 — Customers

### Goal
Full CRUD for Customers — the last Stage 2 module, and the one Pending Customers/Subscriptions (Stage 3) will build directly on top of.

### Why now
Everything else in Stage 2 is done; Customers has no dependency on the other five modules, which is why it's last, not first — no urgency, and by now the CRUD pattern is very familiar.

### What I need before starting
- Sprints 2.1–2.5 complete (not a hard technical dependency for Customers itself, but Stage 2 should finish as a whole before Stage 3 starts).

### What I need to understand
Nothing new.

---

### Step 1 — Give Gemini this prompt

```text
You are the primary implementation engineer for SubscriptionOS. We are on Sprint 2.6
of Stage 2: Customers - the last module in this stage. Sprints 2.1-2.5 are complete.

Before writing code, confirm the Customer model from Sprint 1.2 (fullName, phone
unique, username, platform, notes, status).

OBJECTIVE (Section 9 Customers; BR-001 through BR-005; Section 7 Screens 5-6):

1. backend/src/modules/customers/:
   GET /api/v1/customers - query: page, search (matches name/phone/username per
     BR-065), status, platform
   GET /api/v1/customers/{id}
   POST /api/v1/customers - phone is required and must be unique (BR-001) - return
     409 CONFLICT with a clear message on duplicate phone, not a raw DB error. Per
     BR-002, if fullName or username closely matches an existing customer, this is
     only a WARNING the frontend should surface (e.g. "A customer named 'John' already
     exists - continue anyway?") - it must NOT block creation server-side. Implement
     this as the create endpoint returning a `warnings` array alongside success,
     rather than rejecting the request - the frontend decides whether to show a
     confirm-anyway step.
   PUT /api/v1/customers/{id}
   DELETE /api/v1/customers/{id} - archives (BR-004), never hard-deletes. Historical
     visibility (BR-005) means archived customers must still appear in
     subscription/revenue history queries - don't filter them out of anything except
     the default Active customer list view.
   GET /api/v1/customers/{id}/subscriptions - empty array for now until Stage 3, but
     implement the real query now.
   GET /api/v1/customers/{id}/revenue - same, empty for now, real query now.

2. Frontend:
   - frontend/app/(dashboard)/customers/page.tsx matching Section 7 Screen 5 /
     Section 8 wireframe: table with ID, Name, Phone, Platform, Active Subscriptions
     (count, 0 for now), Status; Search box; Filter (Status, Platform); Add Customer
     button; row actions View, Edit, Archive (with confirmation dialog).
   - frontend/app/(dashboard)/customers/[id]/page.tsx matching Section 7 Screen 6:
     Customer Info (phone, platform, notes), Subscriptions section (empty state for
     now - "No subscriptions yet," this becomes real in Stage 3), Assignment History
     and Revenue History tabs (empty state), and Renew / Move Customer / Generate
     Credentials / Archive buttons - all four should exist as disabled placeholders
     for now since their real functionality is built in Stage 3/4, EXCEPT Archive
     which is fully functional now (it's a Stage 2 feature).
   - Implement BR-002's soft-duplicate-warning UX: if the create-customer API returns
     a `warnings` array, show a confirmation step ("A similar customer already
     exists - create anyway?") before actually submitting, rather than blocking.

After implementation tell me:
1. Every file created/changed.
2. Test: create a customer, try creating another with the SAME phone (should 409),
   create one with a very similar name to trigger the BR-002 warning (should warn,
   not block), archive a customer, confirm it disappears from the default Active
   list but is still viewable directly and via an unfiltered/Archived-status search.
```

### Step 2 — Run & Test
Standard pattern per the prompt's own test steps above.

### Step 3 — PASS / FAIL, Git, Checklist
```bash
git commit -m "Sprint 2.6: Customers CRUD, duplicate-phone and soft-duplicate handling"
git push
```
```
[ ] Customer CRUD works
[ ] Duplicate phone rejected with 409 (BR-001)
[ ] Similar name/username warns but does not block (BR-002)
[ ] Archive hides from default Active list but preserves full historical visibility
[ ] Customer detail screen shows correct empty states for not-yet-built features
[ ] Committed and pushed
```

---

# Stage 2 Complete — What You Should Have Right Now

```
CURRENT STATUS
✓ Phase 0: Setup
✓ Stage 1: Foundation
✓ Stage 2: Core Data
→ Stage 3: Business Logic Core       ← not yet written
○ Stage 4: Operational Layer
○ Stage 5: Intelligence Layer
○ Stage 6: Hardening & Ship
```

At this point you have a real, navigable, authenticated app: Settings, Products, Master Accounts, Services, Streaming Profiles, and Customers all with working screens, encrypted secrets, archive-not-delete enforced server-side everywhere it matters, and a Settings/CredentialTemplate foundation Stage 3–4 will build on.

**Still nothing connects them yet** — no customer has a subscription, no subscription has an assignment, no revenue exists. That's exactly what Stage 3 builds, starting with the Assignment Engine: the single riskiest piece of code in this project, per your own Dev Plan. Don't rush into it — when you're ready, ask me for **Stage 3**, and I'll write it with the same care, including the concurrency test your Dev Plan calls out as the thing to get right before moving on.
