# SubscriptionOS — Development Plan
### Phase 6: Module Breakdown & Build Order

**Status:** Ready for Phase 7 kickoff
**Depends on:** Vision, PRD, Data Dictionary, Database Schema, ERD, Business Rules, UI/UX Spec, Screen Wireframes, API Spec, System Architecture (all complete)

---

## How to Read This Plan

Modules are grouped into **six build stages**. Within a stage, order is flexible; across stages, order isn't — each stage depends on the previous one existing and working. This isn't a sprint calendar (I don't know your available hours), it's a dependency ordering: build top to bottom, and don't start a stage until the one above it is genuinely done, not just "mostly working."

For each module: **what it needs to exist first**, **what it unlocks**, and a **Definition of Done** so "finished" isn't a feeling — it's a checklist.

---

## Stage 1 — Foundation

*Nothing is usable until this stage is done. No UI work should start before this.*

### 1.1 Project Scaffolding
- Monorepo structure per Section 10 (`frontend/`, `backend/`, `database/`, `docker/`)
- Environment config (`.env` per Section 10's variable table) with a `.env.example` committed, secrets never committed
- Docker Compose for local Postgres + Redis
- CI pipeline: lint + typecheck on push (tests come later, once there's something to test)

**Done when:** a fresh clone + `docker compose up` + one setup command gets a teammate (or future-you) running locally in under 10 minutes.

### 1.2 Database Schema
- All 15 tables from Section 4, as Prisma models, with every FK, index, and unique constraint from the schema doc
- Migrations committed, not just a synced dev DB
- Seed script with realistic fake data (a handful of customers, master accounts, subscriptions) — every later module needs something to build against

**Done when:** `prisma migrate dev` + seed script produces a database matching Section 4 exactly, with no manual schema edits needed later. This is worth getting right now — schema changes get expensive once Stage 3+ code depends on them.

### 1.3 Authentication & Users
- Login, JWT access + refresh tokens (Section 9)
- bcrypt password hashing
- Role middleware (Owner / Admin) enforcing the PRD's permission table
- `/auth/me`, `/auth/logout`

**Done when:** you can log in as a seeded Owner and a seeded Admin, and hitting an Admin-restricted endpoint (e.g. archiving a Master Account) as Admin returns 403.

### 1.4 Activity Log (as a shared service, not a screen)
- A single internal `logActivity()` function every other module will call — build this now so nobody "adds it later" (that's how audit trails end up with gaps)
- Append-only enforcement at the service layer

**Done when:** calling `logActivity()` from a throwaway test endpoint produces a row, and there is no code path to update or delete one.

---

## Stage 2 — Core Data (the nouns)

*Depends on Stage 1. These are mostly CRUD — the highest ratio of "screens built" to "risk," good for building momentum.*

| Module | Needs | Unlocks |
|---|---|---|
| Settings | Auth | Assignment Strategy config, Credential Templates (used in Stage 3–4) |
| Products + Service Types | Auth, DB | Pending Customers, Subscriptions |
| Master Accounts | Auth, DB | Services |
| Services | Master Accounts, Service Types | Streaming Profiles |
| Streaming Profiles | Services | Assignment Engine |
| Customers | Auth, DB | Pending Customers, Subscriptions |

**Done when:** every table in this stage has full CRUD through the API, matching Section 9 exactly, and a corresponding list + detail screen from Section 7/8. Archive (never hard-delete) is enforced server-side, not just hidden in the UI (BR-004, BR-008, BR-017).

---

## Stage 3 — Business Logic Core

*This is the hard part. Everything else in the product is arguably a UI wrapped around Stage 3 working correctly. Do not rush this stage — bugs here mean overbooked profiles and wrong revenue, which are the two things this whole system exists to prevent.*

### 3.1 Assignment Engine — build and test this before anything else in this stage
- Find eligible Streaming Profiles (Active, not full, parent Service/Master Account Active) — BR-023, BR-041, BR-042
- Assignment Strategy selection (Lowest Occupancy / Fill First) — BR-024, BR-043
- **The transaction + row-lock behavior from Section 10 is the single riskiest piece of code in this entire project.** Write the concurrency test from Section 10's Testing Strategy *first*: two simultaneous requests against a profile with one remaining seat, exactly one must succeed. If you can't make that test pass reliably, do not move on — this is the bug that turns into overbooked accounts and angry customers in production.

**Done when:** the concurrency test passes 100/100 runs, not just once.

### 3.2 Pending Customers
- Duplicate-phone detection (BR-007)
- Approve → creates Customer record

**Done when:** submitting the same phone number twice updates the existing Pending record instead of duplicating it, server-side (not just blocked in the UI).

### 3.3 Subscriptions
- Create → triggers Assignment Engine
- Cancel, Archive

**Done when:** creating a subscription with no eligible profile available returns `409 NO_PROFILE_AVAILABLE` (BR-044) instead of silently creating an unassigned subscription.

### 3.4 Revenue + Renewals
- Auto-create Revenue on Subscription creation and renewal (BR-028, BR-029, BR-051, BR-052)
- Renewal creates a RenewalHistory record

**Done when:** renewing a subscription in the UI produces exactly one new Revenue row and one new RenewalHistory row — check this in the DB, not just the response.

---

## Stage 4 — Operational Layer

*Depends on Stage 3 fully working — these modules read and act on subscriptions/assignments that Stage 3 produces.*

- **Move Customer** — closes current Assignment, opens new one (BR-045, BR-046)
- **PIN Change** — encrypt, write PinHistory, return currently-affected customers
- **Credential Center** — assembles the ready-to-send message; requires Settings templates (Stage 2) and a working Subscription+Assignment (Stage 3)
- **Master Account password / PIN reveal** — step-up re-auth + Activity Log entry

**Done when:** changing a PIN correctly identifies every customer currently on that profile (Vision §9's success criterion), and every reveal/credential-generation action appears in the Activity Log.

---

## Stage 5 — Intelligence Layer

*Depends on Stage 3–4 having real data flowing through them. Building these earlier means testing them against empty/fake data, which hides bugs.*

- **Notifications** — background job checking expiring subscriptions, dead accounts, full profiles
- **Task Center** — aggregates Pending Customers, due renewals, notifications into one screen
- **Dashboard** — aggregate stats, Redis-cached (Section 10)
- **Global Search** — Postgres FTS + GIN indexes across the entities in Section 9
- **Reports + Export** — PDF/Excel/CSV

**Done when:** the Task Center accurately reflects what's actually pending in the DB (cross-check manually against a few seeded scenarios), and Dashboard numbers survive a Redis restart without going stale or wrong (Open Item in the SDD Appendix — decide fallback behavior here).

---

## Stage 6 — Hardening & Ship

- Run the full Testing Strategy from Section 10 (unit, integration, E2E, manual QA checklist against Vision §9's timing targets)
- Rate limiting, HTTPS, backup automation live
- Deploy per Section 10 (Vercel / Railway / Supabase / Upstash)
- Point real business data at it in parallel with the spreadsheet for one real billing cycle before fully cutting over — don't retire the spreadsheet on day one

**Done when:** you've run one full renewal cycle on real customers through the software and the numbers match what the spreadsheet would have said.

---

## Critical Path Summary

If you only remember one thing from this doc: **Auth → Schema → Master Accounts/Services/Profiles → Assignment Engine → everything else.** The Assignment Engine is the one module where a bug doesn't just look wrong on screen — it lets a Streaming Profile go over capacity, which is the exact failure this whole project was built to prevent. Everything before it in this plan exists to give it real data to work against; everything after it exists to make it easier to operate.

---

*This document supersedes Phase 6 in `00_PROJECT_ROADMAP.md`. Phases 1–5 are complete; Phase 7 (Backend Development) begins after Stage 1 of this plan.*
