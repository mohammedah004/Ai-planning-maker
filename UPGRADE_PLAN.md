# AI MARKETING PLANNER — V2 UPGRADE PLAN

> **Version:** 2.0  
> **Date:** 2026-08-27  
> **Status:** Draft — Awaiting Approval  
> **Baseline:** PROJECT_PLAN.md (left untouched)

---

## 1. Executive Summary

The AI Marketing Planner MVP is functional: Google OAuth, product form, 3-step AI pipeline via n8n, Google Sheets export, progress tracking, plan history dashboard, and error handling all work. Two real users have generated plans successfully.

However, the current product is essentially **"a form that calls ChatGPT and dumps the result into a Google Sheet."** This provides zero defensibility. A user could replicate the output with a single ChatGPT conversation.

**V2 Strategy:** Transform the product from a one-shot AI content generator into an **AI marketing planning system** with:
1. **Brand memory** (stop re-entering the same data)
2. **Content intelligence** (show users *why* the plan is structured the way it is)
3. **Granular control** (regenerate individual posts, not the entire plan)
4. **In-app content viewing** (stop forcing users to leave the app for Google Sheets)
5. **Professional polish** (calendar view, content briefs, share links)

**Estimated V2 scope:** 6 high-impact features, implementable by a solo developer in 3–4 weeks.

**Additional AI cost per plan:** +$0.005–0.03 (only for single-post regeneration; all other features are deterministic).

---

## 2. Current System Audit

### 2.1 What Is Implemented and Working

| Component | Status | Notes |
|---|---|---|
| Google OAuth (Auth.js v5) | ✅ Working | JWT sessions, `profiles` upsert on login |
| Product input form (9 fields) | ✅ Working | Client + server validation via `lib/validations/plan.js` |
| AI pipeline (3-step chained) | ✅ Working | Strategy → Pillars → Calendar via n8n + OpenAI |
| Google Sheets export | ✅ Working | 2-tab formatted sheet shared with user email |
| Generation progress UI | ✅ Working | 4-step timeline with polling every 3s |
| Plan history dashboard | ✅ Working | Stats cards, plan cards, status badges, delete |
| Plan detail/progress page | ✅ Working | Real-time status, retry, cancel, Sheet link |
| Landing page | ✅ Working | Professional Arabic design with value props |
| Login page | ✅ Working | Google sign-in button |
| Error/404/loading pages | ✅ Working | Proper error boundaries |
| Concurrency control | ✅ Working | One active job per user, stale job auto-recovery |
| Plan deletion (CASCADE) | ✅ Working | Deletes content_items, jobs, sheets, plan |
| Plan cancel | ✅ Working | Marks job failed, releases concurrency lock |
| Plan retry | ✅ Working | Resets job, re-fires n8n webhook |

### 2.2 What Is Missing (Planned but Not Built)

| Component | Status | Impact |
|---|---|---|
| Route protection middleware | ❌ Missing | Protected routes rely on server-side `auth()` checks; no Next.js middleware.js |
| `lib/auth-guard.js` helper | ❌ Missing | Each API route manually checks session (works but not DRY) |
| `updated_at` trigger | ❓ Unverified | PROJECT_PLAN specifies a Postgres trigger; may not be created in Supabase |
| RLS policies | ❓ Unverified | PROJECT_PLAN says "defense-in-depth"; may not be configured |
| n8n → Next.js callback webhook | ❌ Not implemented | n8n writes directly to Supabase (simpler, works correctly) |

### 2.3 Deviations from PROJECT_PLAN.md

| Area | PROJECT_PLAN Says | Current Code Does | Assessment |
|---|---|---|---|
| **n8n callback** | n8n calls POST `/api/webhooks/n8n` | n8n writes directly to Supabase via PostgREST | ✅ Simpler; correct decision |
| **Auth ID mapping** | `session.user.id` used directly as `user_id` | `getCanonicalUserId()` resolves via email lookup | ✅ Fix for FK mismatch bug |
| **Plan deletion** | "Not in MVP; defer" | Implemented with CASCADE in `DELETE /api/plans/[id]` | ✅ Good addition |
| **Plan cancel** | Not mentioned | Implemented in `POST /api/plans/[id]/cancel` | ✅ Good addition |
| **SessionProvider** | Not mentioned | Was missing; just added | ✅ Required for signOut |
| **Middleware** | `middleware.js` with route matcher | Not implemented | ⚠️ Low risk; server checks exist |
| **Stale job auto-recovery** | Not mentioned | Implemented (5-min threshold) | ✅ Good resilience addition |

### 2.4 Architectural Issues

| Issue | Severity | Description |
|---|---|---|
| **No middleware.js** | Low | Routes are protected via server-side `auth()` calls, which is sufficient. Middleware would add redirect UX (flash prevention). |
| **Duplicate auth logic** | Low | Every API route repeats the `await auth()` + `getCanonicalUserId()` pattern. Could be extracted to a helper. |
| **No rate limiting** | Medium | Beyond concurrency check, there's no protection against API abuse (e.g., rapid plan creation/deletion). |
| **Service Role key in all routes** | Low | Standard Supabase pattern; acceptable for MVP scale. |
| **Polling-only status updates** | Low | 3s polling works fine for <100 users. Server-Sent Events or Realtime would be premature. |

---

## 3. Current Product Weaknesses

### The Core Question: "Why not just use ChatGPT?"

A user can open ChatGPT and say: *"Create a 30-day Instagram marketing plan for my coffee brand targeting young professionals."* They'll get a decent result in 60 seconds for free.

**What the current product offers over ChatGPT:**
1. Structured pipeline (strategy → pillars → calendar) — better coherence
2. Google Sheets export — professional deliverable
3. Formatted content items with design copy — designer-ready output
4. History and persistence — plans are saved

**What the current product does NOT offer that would create a moat:**
1. ❌ **No brand memory** — user re-enters identical data for every plan
2. ❌ **No content intelligence** — no explanation of WHY the calendar looks the way it does
3. ❌ **No granular editing** — can't regenerate a single post; must redo all 30
4. ❌ **No in-app content viewing** — the product's output lives outside the product (Google Sheets)
5. ❌ **No strategic visualization** — the strategy exists as raw JSON in the database; never shown to the user
6. ❌ **No content distribution insights** — user can't see objective/pillar/format breakdowns
7. ❌ **No shareability** — freelancers can't share plans with clients
8. ❌ **No content brief per post** — designers get a sheet; could get structured briefs

### User Value Gap Matrix

| Need | ChatGPT | Current Product | V2 Target |
|---|---|---|---|
| Generate 30 posts | ✅ | ✅ | ✅ |
| Strategic coherence | ❌ | ✅ | ✅✅ |
| Professional deliverable | ❌ | ✅ | ✅✅ |
| Reuse brand info | ❌ | ❌ | ✅ |
| Understand the strategy | ❌ | ❌ | ✅ |
| Edit individual posts | ✅ | ❌ | ✅ |
| Visualize content mix | ❌ | ❌ | ✅ |
| Share with team/client | ❌ | ❌ | ✅ |
| Track history | ❌ | ✅ | ✅ |

---

## 4. Product Differentiation Strategy

**Position:** "The marketing planning system that thinks before it writes."

**Differentiators:**
1. **Strategic Foundation** — Every post is rooted in audience analysis, pain points, and positioning (not random)
2. **Content Intelligence Dashboard** — Users see content mix distribution, objective balance, format diversity
3. **Brand Profiles** — Create once, generate many plans (ChatGPT has no memory)
4. **Granular AI Control** — Regenerate individual posts with specific instructions
5. **Professional Deliverables** — In-app viewing, Google Sheets, shareable links

---

## 5. Feature Candidates

### Feature 1: Brand Profiles (Reusable Brand Data)

**Problem Solved:** Users re-enter the same product/brand information for every plan. This creates friction, reduces repeat usage, and loses brand context.

**User Value:** Dramatically reduces time-to-plan from 5+ minutes to 30 seconds. Enables "Create another plan for this brand" workflow. Increases retention.

**How It Works:**
1. User creates a Brand Profile with: name, description, category, audience, problems solved, tone, website, additional context
2. When creating a new plan, user selects an existing Brand Profile
3. Form auto-fills from the profile; user only selects the marketing objective
4. Future plans inherit brand context, enabling better AI output continuity

**User Flow:**
Dashboard → Brand Profiles → Create Profile → Fill form → Save
Dashboard → Create Plan → Select Brand Profile → Choose Objective → Submit

**Technical Implementation:**
- New `brand_profiles` table with all form fields except `marketing_objective` (which varies per plan)
- New page: `/brands` (list) and `/brands/new` (create/edit form)
- Modified `/plans/new` page: optional Brand Profile selector auto-fills form
- API routes: `GET/POST /api/brands`, `PUT/DELETE /api/brands/[id]`

**Where It Lives:** Next.js (CRUD) + Supabase (storage). No AI, no n8n.

**Database Changes:** New `brand_profiles` table (see Section 9).

**AI Calls Required:** Zero.

**Can AI Output Be Reused?** N/A.

**Estimated Implementation Complexity:** Medium

**Expected Product Impact:** Very High

**Cost Impact:** None

**MVP/V2 Priority:** P0

---

### Feature 2: In-App Strategy & Content Viewer

**Problem Solved:** The entire output of the product lives outside the product (Google Sheets). Users have no reason to return to the app after generation. The strategy (audience analysis, pain points, positioning, content pillars) is generated but never shown to the user.

**User Value:** Users see the strategic thinking behind their plan. They understand WHY the calendar looks the way it does. The product feels intelligent, not mechanical. Retention increases because users have a reason to come back.

**How It Works:**
1. After plan completes, the plan detail page shows 3 sections:
   - **Strategy Summary**: Audience analysis, pain points, desired outcomes, positioning, messaging angles, CTA strategy (parsed from `marketing_plans.strategy` JSONB)
   - **Content Pillars & Objectives**: Visual pillar cards with percentages + objective distribution chart (parsed from `marketing_plans.content_pillars` and `objective_distribution`)
   - **30-Day Content Calendar**: Scrollable list/grid of content items fetched from `content_items` table
2. Each content item shows: day, post type, objective, pillar, caption preview, design copy, CTA

**User Flow:**
Dashboard → Click Plan → See Strategy + Pillars + Calendar (all in-app)

**Technical Implementation:**
- Modified `/plans/[id]` page: after completion, render strategy/pillars/calendar from existing DB data
- New API route: `GET /api/plans/[id]/content` — fetches content items for a plan
- No new tables; uses existing `marketing_plans.strategy`, `marketing_plans.content_pillars`, `marketing_plans.objective_distribution`, and `content_items` table
- Client-side rendering of strategy JSONB fields

**Where It Lives:** Next.js (frontend rendering). Data already exists in Supabase.

**Database Changes:** None.

**AI Calls Required:** Zero. All data already generated and stored.

**Can AI Output Be Reused?** Yes — this feature is ENTIRELY about surfacing existing AI output.

**Estimated Implementation Complexity:** Medium

**Expected Product Impact:** Very High

**Cost Impact:** None

**MVP/V2 Priority:** P0

---

### Feature 3: Content Mix Intelligence (Deterministic Analytics)

**Problem Solved:** Users can't see the distribution of their content mix. They don't know if their plan is 70% awareness (too top-heavy) or lacks conversion posts. The plan feels like 30 random posts rather than a strategic system.

**User Value:** Users understand their content strategy at a glance. They see objective balance, format diversity, pillar coverage. The product feels analytical, not just generative. Differentiates from ChatGPT.

**How It Works:**
1. After generation, calculate from `content_items`:
   - **Objective Distribution:** % of awareness/education/engagement/trust/social_proof/objection_handling/conversion
   - **Format Distribution:** % of reels/carousels/static_posts/stories
   - **Pillar Coverage:** % of posts per pillar
   - **Weekly Theme Progression:** Which objectives dominate each week
2. Display as:
   - Simple bar charts (CSS-only, no charting library needed)
   - Insight cards: "Your plan has 40% educational content" / "Only 2 conversion posts — consider adding more"
3. Generate 3–5 textual insights based on deterministic rules:
   - If conversion < 10%: "Your plan has few direct sales posts. Consider adding conversion-focused content in Week 4."
   - If one pillar > 40%: "Content pillar 'X' dominates. Consider diversifying."
   - If Reels < 20%: "Reels typically have higher reach. Consider adding more."

**User Flow:**
Plan Detail Page → "Content Intelligence" section below calendar

**Technical Implementation:**
- Client-side computation from fetched `content_items` array
- CSS-only bar charts (no external dependency)
- Deterministic insight generation function: `generateInsights(contentItems, objectiveDistribution)` — pure JavaScript
- Rendered below the calendar on the plan detail page

**Where It Lives:** 100% Next.js client-side. No AI, no n8n, no new API routes.

**Database Changes:** None.

**AI Calls Required:** Zero. 100% deterministic.

**Can AI Output Be Reused?** Yes — computed from existing `content_items` data.

**Estimated Implementation Complexity:** Low–Medium

**Expected Product Impact:** High

**Cost Impact:** None

**MVP/V2 Priority:** P0

---

### Feature 4: Single-Post AI Regeneration

**Problem Solved:** If a user dislikes one post (e.g., Day 14), they must regenerate the entire 30-day plan ($0.06) or manually edit in Google Sheets. This is wasteful and breaks the AI's strategic coherence.

**User Value:** Users can fine-tune individual posts without losing the rest of their plan. Enables iterative refinement. Significantly reduces AI cost per edit ($0.005 vs $0.06). Makes the product feel responsive and controllable.

**How It Works:**
1. In the in-app content viewer (Feature 2), each content item has a "Regenerate" button
2. User clicks Regenerate → modal appears with options:
   - Free-text instruction: "Make the hook stronger" / "Make it more Gen Z" / "Change to Carousel"
   - Optional: change post type, objective, or tone
3. System sends ONE AI call with:
   - The original strategy context (from `marketing_plans.strategy` — already stored)
   - The specific day's current content
   - The user's modification instruction
4. AI returns a new version of ONLY that content item
5. System updates the single row in `content_items`

**User Flow:**
Plan Detail → Content Calendar → Click "Regenerate" on Day 14 → Enter instruction → Submit → Updated content appears

**Technical Implementation:**
- New API route: `POST /api/plans/[id]/content/[dayNumber]/regenerate`
  - Input: `{ instruction: "Make hook stronger", postType?: "carousel" }`
  - Loads strategy from `marketing_plans.strategy`
  - Makes ONE OpenAI call with focused prompt
  - Updates the single `content_items` row
  - Returns updated content item
- Frontend: Regenerate button + modal + inline update
- n8n is NOT used for this — it's a simple single API call, not a long-running workflow

**Where It Lives:** Next.js API route → OpenAI → Supabase. NOT n8n.

**Database Changes:** None (updates existing `content_items` row).

**AI Calls Required:** 1 per regeneration (~$0.005 each). Users typically regenerate 2–5 posts = $0.01–0.025 additional.

**Can AI Output Be Reused?** Yes — strategy context is reused from existing `marketing_plans.strategy`.

**Estimated Implementation Complexity:** Medium

**Expected Product Impact:** Very High

**Cost Impact:** Very Low (~$0.005 per regeneration)

**MVP/V2 Priority:** P1

---

### Feature 5: Shareable Plan Link

**Problem Solved:** Freelancers and agencies can't share marketing plans with clients. Users can't show their plan to a business partner or designer without giving them the Google Sheet link (which requires Google account access).

**User Value:** One-click sharing. Professional read-only view. Works without Google account. Useful for freelancer → client handoff.

**How It Works:**
1. On a completed plan, user clicks "Share Plan"
2. System generates a unique, unguessable share token (UUID)
3. Creates a public URL: `/share/[token]`
4. The share page displays: strategy summary, content pillars, and 30-day calendar (read-only, no auth required)
5. User can copy the link and send it to anyone

**User Flow:**
Plan Detail → Click "Share Plan" → Copy link → Send to client

**Technical Implementation:**
- New column on `marketing_plans`: `share_token` (text, nullable, unique, indexed)
- New API route: `POST /api/plans/[id]/share` — generates token, saves to DB, returns URL
- New API route: `DELETE /api/plans/[id]/share` — removes token (revoke sharing)
- New public page: `/share/[token]/page.jsx` — fetches plan + content items by token, renders read-only view
- New public API: `GET /api/share/[token]` — returns plan data without auth

**Where It Lives:** Next.js (page + API). No AI, no n8n.

**Database Changes:** 1 new column on `marketing_plans`.

**AI Calls Required:** Zero.

**Estimated Implementation Complexity:** Medium

**Expected Product Impact:** High

**Cost Impact:** None

**MVP/V2 Priority:** P1

---

### Feature 6: Google Sheets Improvements

**Problem Solved:** The current Sheet is functional but could be more professional. RTL support, color-coded objectives, frozen headers, and weekly section dividers would make the deliverable significantly more polished.

**User Value:** More professional deliverable. Better designer/team experience. Stronger perceived product quality.

**How It Works:**
Improve the existing n8n Google Sheets export with:
1. Color-coded `content_objective` column (e.g., Awareness = blue, Conversion = green)
2. Color-coded `post_type` column (Reel = purple, Carousel = blue, etc.)
3. Weekly section dividers (bold row: "Week 1: Aug 26 – Sep 1")
4. Frozen header row (if not already)
5. RTL sheet direction for Arabic content
6. Auto-filter on header row
7. Strategy tab improvements: better formatting of nested data

**User Flow:** No change — improvements are automatic.

**Technical Implementation:**
- Modify existing n8n workflow: update `batchUpdate` formatting requests
- No Next.js changes required
- No database changes

**Where It Lives:** n8n workflow only.

**Database Changes:** None.

**AI Calls Required:** Zero.

**Estimated Implementation Complexity:** Low

**Expected Product Impact:** Medium

**Cost Impact:** None

**MVP/V2 Priority:** P1

---

### Feature 7: Marketing Calendar Visualization

**Problem Solved:** The 30-day plan is displayed as a list. A calendar grid view is more natural for planning and shows temporal distribution at a glance.

**User Value:** Users see their month visually. They can spot gaps, clusters, and weekly patterns. Feels like a real marketing tool.

**How It Works:**
1. Toggle between List view and Calendar view on the plan detail page
2. Calendar shows a 5-week grid (Mon–Sun) with each day showing:
   - Post type icon
   - Objective color indicator
   - Content pillar tag
   - Truncated caption
3. Click a day → expand to full content item detail

**User Flow:**
Plan Detail → Toggle "Calendar View" → Visual month grid

**Technical Implementation:**
- New client component: `CalendarView.jsx`
- Data source: same `content_items` array fetched for the list view
- Pure CSS grid layout (no external calendar library)
- Client-side date calculation from `created_at + day_number`

**Where It Lives:** 100% Next.js frontend. No API changes.

**Database Changes:** None.

**AI Calls Required:** Zero.

**Estimated Implementation Complexity:** Medium

**Expected Product Impact:** Medium

**Cost Impact:** None

**MVP/V2 Priority:** P2

---

### Feature 8: Plan Templates (Deterministic Prompt Presets)

**Problem Solved:** Users don't always know which marketing objective to choose. Pre-built templates give them a starting point and help them understand what the product can do.

**User Value:** Reduces decision paralysis. Educates users about marketing strategies. Faster plan creation.

**How It Works:**
1. On the "Create Plan" page, show template cards ABOVE the form:
   - "🚀 Product Launch" — Objective: product_launch, recommended tone: bold + direct
   - "📢 Brand Awareness" — Objective: brand_awareness, recommended tone: friendly + youthful
   - "💰 Lead Generation" — Objective: lead_generation, recommended tone: professional + educational
   - "🛒 E-commerce Sales" — Objective: direct_sales, recommended tone: direct + bold
   - "👤 Personal Brand" — Objective: brand_building, recommended tone: casual + friendly
2. Clicking a template pre-fills the marketing objective and recommends tones
3. User still fills in product-specific fields (or selects a Brand Profile)

**User Flow:**
Create Plan → Click "Product Launch" template → Objective + tones auto-fill → Fill product details → Submit

**Technical Implementation:**
- Static array of template configs in a constants file (no database, no AI)
- Modified `/plans/new` page: template selector at the top
- onClick → `setFormData` with template values

**Where It Lives:** 100% Next.js frontend. Static data.

**Database Changes:** None.

**AI Calls Required:** Zero.

**Estimated Implementation Complexity:** Low

**Expected Product Impact:** Medium

**Cost Impact:** None

**MVP/V2 Priority:** P2

---

### Evaluated but NOT Recommended for V2

| Feature | Verdict | Reason |
|---|---|---|
| **Content Quality Score** | P3 — Future | Deterministic scoring is possible but requires careful calibration. Risk of misleading scores without real-world validation. Defer until we have user data on what "good" looks like. |
| **Calendar Intelligence (problem detection)** | P3 — Future | "Too many promotional posts" detection requires establishing baselines. Content Mix Intelligence (Feature 3) covers the core need with less complexity. |
| **Content Variations (generate alternatives)** | P3 — Future | Single-post regeneration (Feature 4) covers this need. Generating 3 variants per post would 3x the AI cost with unclear user value. |
| **Brand Voice Memory (AI-specific rules)** | P3 — Future | Brand Profiles (Feature 1) captures tone and context. Advanced "words to avoid" / "vocabulary preferences" is overkill for V2. Can be added as columns to `brand_profiles` later. |
| **Plan Versioning** | P3 — Reject | Adds significant DB complexity (version tracking, diffing) without clear user demand. Users can create a new plan instead. |
| **Export: CSV** | P3 — Reject | Google Sheets already supports CSV download. Building our own adds no value. |
| **Export: PDF** | P3 — Future | Would require server-side PDF generation (headless browser or library). Significant complexity for marginal value when Sheets exists. |
| **Designer Handoff Mode** | P2 — Deferred | The in-app content viewer (Feature 2) already shows designer-relevant fields. A dedicated designer view can come later. |
| **Freelancer/Agency Mode** | P3 — Future | Multi-brand is handled by Brand Profiles. Multi-user workspaces and client management are premature. |
| **Plan Editing (in-app)** | P3 — Reject for now | Single-post regeneration (Feature 4) + Google Sheets editing covers this. Building a full in-app editor is extremely high complexity for marginal value. |
| **Duplicate/Clone Plan** | P2 — Deferred | Brand Profiles (Feature 1) makes this less important. Creating a new plan from the same profile is functionally equivalent. |
| **Smart CTA Strategy** | Absorbed | Already part of the AI pipeline's strategy generation. No separate feature needed. |
| **Weekly Marketing Themes** | Absorbed | Already generated by the AI pipeline. Feature 3 (Content Mix Intelligence) surfaces this data. |

---

## 6. Cost Optimization Strategy

### Current AI Cost Per Plan: ~$0.06

| Step | Model | Input Tokens | Output Tokens | Cost |
|---|---|---|---|---|
| Strategy Generation | GPT-4o | ~800 | ~600 | ~$0.01 |
| Content Pillars | GPT-4o | ~1,400 | ~400 | ~$0.01 |
| 30-Day Calendar | GPT-4o | ~2,000 | ~6,000 | ~$0.04 |
| **Total** | | **~4,200** | **~7,000** | **~$0.06** |

### V2 Additional AI Costs

| Feature | AI Needed? | Existing Output Reusable? | Extra Calls per Use | Cost per Use | Expected Frequency |
|---|---|---|---|---|---|
| Brand Profiles | No | N/A | 0 | $0.00 | N/A |
| In-App Content Viewer | No | Yes (100% reuse) | 0 | $0.00 | N/A |
| Content Mix Intelligence | No | Yes (deterministic) | 0 | $0.00 | N/A |
| Single-Post Regeneration | **Yes** | Yes (strategy context reused) | **1** | **~$0.005** | 2–5 per plan |
| Shareable Plan Link | No | N/A | 0 | $0.00 | N/A |
| Google Sheets Improvements | No | N/A | 0 | $0.00 | N/A |
| Calendar Visualization | No | N/A | 0 | $0.00 | N/A |
| Plan Templates | No | N/A | 0 | $0.00 | N/A |

### Total Estimated V2 AI Cost Per Plan

Base: $0.06 + Optional regenerations: $0.01–0.025 = **$0.07–0.085 per plan** (worst case)

### Cost Optimization Rules Applied

1. ✅ **5 of 6 recommended features require ZERO AI calls**
2. ✅ Single-post regeneration reuses existing strategy context (no re-generation)
3. ✅ Content Mix Intelligence is 100% deterministic (client-side JS)
4. ✅ No new n8n AI nodes for V2 features
5. ✅ No vector databases, embeddings, or fine-tuning
6. ✅ No external APIs beyond existing OpenAI + Google Sheets

---

## 7. Recommended V2 Scope

| # | Feature | Priority | AI Cost | Complexity | Impact | Why Selected |
|---|---|---|---|---|---|---|
| 1 | **Brand Profiles** | P0 | None | Medium | Very High | Eliminates repeat data entry; drives retention; prerequisite for repeat usage |
| 2 | **In-App Strategy & Content Viewer** | P0 | None | Medium | Very High | Surfaces existing AI output; gives users a reason to stay in the app |
| 3 | **Content Mix Intelligence** | P0 | None | Low–Medium | High | Differentiates from ChatGPT; 100% deterministic; makes product feel analytical |
| 4 | **Single-Post Regeneration** | P1 | ~$0.005/use | Medium | Very High | Granular control; cost-efficient; avoids full re-generation |
| 5 | **Shareable Plan Link** | P1 | None | Medium | High | Enables freelancer/agency use cases; viral growth potential |
| 6 | **Google Sheets Improvements** | P1 | None | Low | Medium | Polishes the core deliverable with minimal effort |

**Total: 6 features. 5 have zero AI cost. 1 has ~$0.005/use cost.**

---

## 8. Feature Prioritization Matrix

| Feature | User Value | Retention | Differentiation | Impl. Cost | AI Cost | Risk | Priority |
|---|---|---|---|---|---|---|---|
| Brand Profiles | ⬛⬛⬛⬛⬛ | ⬛⬛⬛⬛⬛ | ⬛⬛⬛⬛ | ⬛⬛⬛ | ⬜ | Low | **P0** |
| In-App Content Viewer | ⬛⬛⬛⬛⬛ | ⬛⬛⬛⬛⬛ | ⬛⬛⬛⬛⬛ | ⬛⬛⬛ | ⬜ | Low | **P0** |
| Content Mix Intelligence | ⬛⬛⬛⬛ | ⬛⬛⬛ | ⬛⬛⬛⬛⬛ | ⬛⬛ | ⬜ | Low | **P0** |
| Single-Post Regeneration | ⬛⬛⬛⬛⬛ | ⬛⬛⬛⬛ | ⬛⬛⬛⬛ | ⬛⬛⬛ | ⬛ | Med | **P1** |
| Shareable Plan Link | ⬛⬛⬛⬛ | ⬛⬛⬛ | ⬛⬛⬛⬛ | ⬛⬛⬛ | ⬜ | Low | **P1** |
| Sheets Improvements | ⬛⬛⬛ | ⬛⬛ | ⬛⬛ | ⬛ | ⬜ | Low | **P1** |
| Calendar Visualization | ⬛⬛⬛ | ⬛⬛ | ⬛⬛⬛ | ⬛⬛⬛ | ⬜ | Low | **P2** |
| Plan Templates | ⬛⬛⬛ | ⬛⬛ | ⬛⬛ | ⬛ | ⬜ | Low | **P2** |

---

## 9. Database Changes

### Principle: Minimum viable schema changes

The existing tables (`profiles`, `marketing_plans`, `content_items`, `generation_jobs`, `google_sheet_exports`) are well-designed and should NOT be restructured.

### New Table: `brand_profiles`

**Purpose:** Stores reusable brand/product information to pre-fill the plan creation form.

**Why It Is Necessary:** Without this table, users must re-enter all product fields for every plan. This is the #1 friction point for repeat usage.

| Field | Type | Nullable | Default | Constraints |
|---|---|---|---|---|
| `id` | `uuid` | NOT NULL | `gen_random_uuid()` | PRIMARY KEY |
| `user_id` | `text` | NOT NULL | — | FK → `profiles.auth_user_id` |
| `name` | `text` | NOT NULL | — | Display name for the profile |
| `product_name` | `text` | NOT NULL | — | — |
| `product_description` | `text` | NOT NULL | — | — |
| `product_category` | `text` | NOT NULL | — | — |
| `target_audience` | `text` | NOT NULL | — | — |
| `problem_solved` | `text` | NOT NULL | — | — |
| `brand_tone` | `text[]` | NOT NULL | — | — |
| `website_url` | `text` | NULL | — | — |
| `additional_context` | `text` | NULL | — | — |
| `is_default` | `boolean` | NOT NULL | `false` | Only one default per user |
| `created_at` | `timestamptz` | NOT NULL | `now()` | — |
| `updated_at` | `timestamptz` | NOT NULL | `now()` | — |

**Relationships:**
- `profiles` ||--o{ `brand_profiles` : "owns" (One-to-Many)
- `brand_profiles` ||--o{ `marketing_plans` : "source for" (optional reference; NOT a FK — plan data is copied at creation time)

**Foreign Keys:**
- `user_id` → `profiles.auth_user_id` ON DELETE CASCADE

**Indexes:**
- `idx_brand_profiles_user_id` on `user_id`

**RLS / Security:** Defense-in-depth policy: `user_id = current_setting('app.current_user_id')`. Primary auth in API layer.

**On Delete Behavior:** CASCADE from profiles. Deleting a brand profile does NOT delete associated plans (data was copied, not referenced).

### Modified Table: `marketing_plans`

**New column:**

| Field | Type | Nullable | Default | Constraints |
|---|---|---|---|---|
| `share_token` | `text` | NULL | — | UNIQUE |
| `brand_profile_id` | `uuid` | NULL | — | No FK (soft reference) |

**Why `brand_profile_id` has no FK:** The plan stores a *copy* of the brand data at creation time. If the brand profile is later deleted or edited, the plan should retain its original values. The `brand_profile_id` is a soft reference for UI convenience (e.g., "Created from: Brand X").

**New index:** `idx_marketing_plans_share_token` on `share_token` (unique, partial — WHERE share_token IS NOT NULL)

### Tables NOT Added (and why)

| Rejected Table | Reason |
|---|---|
| `plan_versions` | Over-engineering. Users can create a new plan instead. |
| `content_revisions` | Single-post regeneration overwrites in place. Version history of individual posts adds DB complexity with minimal UX value. If needed later, can add a `revision_count` column. |
| `share_links` | A separate table for share links is unnecessary. A single `share_token` column on `marketing_plans` is sufficient. |

---

## 10. V2 ERD

```mermaid
erDiagram
    profiles {
        uuid id PK
        text auth_user_id UK
        text email UK
        text name
        text avatar_url
        timestamptz created_at
        timestamptz updated_at
    }

    brand_profiles {
        uuid id PK
        text user_id FK
        text name
        text product_name
        text product_description
        text product_category
        text target_audience
        text problem_solved
        text_arr brand_tone
        text website_url
        text additional_context
        boolean is_default
        timestamptz created_at
        timestamptz updated_at
    }

    marketing_plans {
        uuid id PK
        text user_id FK
        uuid brand_profile_id
        text share_token UK
        text product_name
        text product_description
        text product_category
        text target_audience
        text problem_solved
        text marketing_objective
        text_arr brand_tone
        text website_url
        text additional_context
        jsonb strategy
        jsonb content_pillars
        jsonb objective_distribution
        text status
        timestamptz created_at
        timestamptz updated_at
    }

    content_items {
        uuid id PK
        uuid marketing_plan_id FK
        text user_id FK
        integer day_number
        text caption
        jsonb design_copy
        text post_type
        text content_objective
        text content_pillar
        text design_reference
        text cta
        timestamptz created_at
        timestamptz updated_at
    }

    generation_jobs {
        uuid id PK
        text user_id FK
        uuid marketing_plan_id FK_UK
        text status
        text current_step
        text error_message
        timestamptz started_at
        timestamptz completed_at
        timestamptz created_at
        timestamptz updated_at
    }

    google_sheet_exports {
        uuid id PK
        uuid marketing_plan_id FK_UK
        text user_id FK
        text spreadsheet_id
        text spreadsheet_url
        text status
        text error_message
        timestamptz created_at
        timestamptz updated_at
    }

    profiles ||--o{ brand_profiles : "owns"
    profiles ||--o{ marketing_plans : "owns"
    profiles ||--o{ generation_jobs : "owns"
    profiles ||--o{ google_sheet_exports : "owns"
    profiles ||--o{ content_items : "owns"
    marketing_plans ||--o{ content_items : "contains"
    marketing_plans ||--o| generation_jobs : "has"
    marketing_plans ||--o| google_sheet_exports : "produces"
```

---

## 11. Database Relationships

| Parent | Child | FK Column | Relationship | On Delete |
|---|---|---|---|---|
| `profiles` | `brand_profiles` | `brand_profiles.user_id` → `profiles.auth_user_id` | One-to-Many | CASCADE |
| `profiles` | `marketing_plans` | `marketing_plans.user_id` → `profiles.auth_user_id` | One-to-Many | CASCADE |
| `marketing_plans` | `content_items` | `content_items.marketing_plan_id` → `marketing_plans.id` | One-to-Many | CASCADE |
| `marketing_plans` | `generation_jobs` | `generation_jobs.marketing_plan_id` → `marketing_plans.id` | One-to-One | CASCADE |
| `marketing_plans` | `google_sheet_exports` | `google_sheet_exports.marketing_plan_id` → `marketing_plans.id` | One-to-One | CASCADE |

**No FK:** `marketing_plans.brand_profile_id` → `brand_profiles.id` (soft reference; intentional — see Section 9).

---

## 12. Next.js Changes

### New Pages

| Route | Type | Purpose |
|---|---|---|
| `/brands` | Server Component | List user's brand profiles |
| `/brands/new` | Client Component | Create/edit brand profile form |
| `/brands/[id]/edit` | Client Component | Edit existing brand profile |
| `/share/[token]` | Server Component | Public read-only plan view (no auth) |

### Modified Pages

| Route | Changes |
|---|---|
| `/plans/new` | Add Brand Profile selector + Plan Templates section above form |
| `/plans/[id]` | After completion: render strategy, pillars, calendar, content mix intelligence, share button, regenerate buttons |
| `/dashboard` | Add "Brand Profiles" link/section; improved stats |

### New API Routes

| Endpoint | Method | Auth | Purpose |
|---|---|---|---|
| `GET /api/brands` | GET | Session | List user's brand profiles |
| `POST /api/brands` | POST | Session | Create brand profile |
| `PUT /api/brands/[id]` | PUT | Session + Ownership | Update brand profile |
| `DELETE /api/brands/[id]` | DELETE | Session + Ownership | Delete brand profile |
| `GET /api/plans/[id]/content` | GET | Session + Ownership | Fetch content items for plan |
| `POST /api/plans/[id]/content/[dayNumber]/regenerate` | POST | Session + Ownership | Regenerate single content item |
| `POST /api/plans/[id]/share` | POST | Session + Ownership | Generate share token |
| `DELETE /api/plans/[id]/share` | DELETE | Session + Ownership | Revoke share token |
| `GET /api/share/[token]` | GET | **Public** | Fetch plan data by share token |

### Modified API Routes

| Endpoint | Changes |
|---|---|
| `POST /api/plans` | Accept optional `brand_profile_id`; if present, load brand data from DB |

### New Components

| Component | Purpose |
|---|---|
| `BrandProfileCard.jsx` | Display brand profile in list |
| `BrandProfileForm.jsx` | Create/edit form (reuses validation) |
| `StrategyViewer.jsx` | Render parsed strategy JSONB |
| `PillarCards.jsx` | Render content pillars with percentages |
| `ObjectiveChart.jsx` | CSS bar chart for objective distribution |
| `ContentItemCard.jsx` | Single content item display with regenerate button |
| `ContentMixInsights.jsx` | Deterministic insights + distribution charts |
| `RegenerateModal.jsx` | Modal for single-post regeneration input |
| `ShareButton.jsx` | Generate/copy share link |
| `CalendarView.jsx` | Calendar grid view (P2) |
| `PlanTemplateSelector.jsx` | Template cards for plan creation (P2) |

---

## 13. n8n V2 Changes

### Existing Workflow — NO Changes

The core 3-step AI pipeline remains identical:
1. Webhook Trigger → Strategy Generation → Save to Supabase
2. Content Pillars → Save to Supabase
3. 30-Day Calendar → Save content items to Supabase
4. Google Sheets Export → Save export record

**Do NOT modify the existing workflow for V2 features.**

### Modified Workflow — Google Sheets Formatting

Update the existing `batchUpdate` formatting request to add:
- Color-coded objective column cells
- Color-coded post type column cells
- Weekly section divider rows (bold, merged)
- RTL sheet direction
- Auto-filter on header row

**Estimated effort:** Modify 1–2 existing n8n nodes (HTTP Request for batchUpdate).

### Nodes That Should NOT Be Added

| Rejected Node | Reason |
|---|---|
| Single-post regeneration | This is a simple, fast OpenAI call. It belongs in Next.js API, not n8n. n8n is for long-running orchestrated workflows. |
| Brand profile CRUD | Pure CRUD. Belongs in Next.js API. |
| Share link generation | UUID generation. Belongs in Next.js API. |
| Content analytics | Deterministic calculation. Belongs in client-side JS. |

---

## 14. AI Prompt Changes

### Existing Prompts — No Changes

The 3 existing prompts (Strategy, Pillars, Calendar) should NOT be modified for V2.

### New Prompt: Single-Post Regeneration

**Purpose:** Regenerate one content item while maintaining strategic coherence.

**Input:**
- Original strategy summary (from `marketing_plans.strategy` — truncated to key fields)
- Content pillars (from `marketing_plans.content_pillars`)
- The current content item being regenerated
- User's modification instruction
- Optional: desired post type, objective changes

**Output:** Single content item JSON matching `content_items` schema.

**Implementation:** Next.js API route calls OpenAI directly (NOT via n8n).

**Estimated tokens:** ~500 input + ~200 output = ~$0.005 per call.

**Why AI is necessary:** The user wants creative variation guided by specific instructions. Deterministic transformation cannot produce meaningful caption/design copy variations.

**Why existing output is reused:** The strategy context is loaded from the database, not re-generated. This saves ~$0.02 per regeneration.

---

## 15. API Changes

See Section 12 for the complete list. Summary:

- **9 new API routes** (brands CRUD, content fetch, regenerate, share)
- **1 modified API route** (POST /api/plans — optional brand_profile_id)
- **1 public API route** (GET /api/share/[token] — no auth)
- **0 deleted routes**

---

## 16. UX/UI Changes

### Plan Detail Page (Major Overhaul)

Current: Shows progress timeline + Google Sheet link. After completion, only the Sheet link is useful.

V2: After completion, shows:
1. **Strategy Summary** — Audience analysis, pain points, positioning, messaging angles
2. **Content Pillars** — Visual cards with description and percentage
3. **Objective Distribution** — CSS bar chart
4. **Content Mix Insights** — Deterministic analytics cards
5. **30-Day Content Calendar** — Scrollable list with expand/collapse
6. **Google Sheet Link** — Preserved
7. **Share Button** — Generate public link
8. **Regenerate Buttons** — Per content item

### Dashboard (Minor Changes)

- Add "Brand Profiles" section or link
- Show brand profile name on plan cards (if created from a profile)

### Create Plan Page (Moderate Changes)

- Add Brand Profile selector dropdown at the top
- Add Plan Template cards above the form (P2)
- Auto-fill form fields when profile/template selected

---

## 17. Security Review

| Area | Current Status | V2 Risk | Mitigation |
|---|---|---|---|
| **Auth (all routes)** | ✅ `auth()` + `getCanonicalUserId()` | Low | Continue pattern for new routes |
| **Ownership checks** | ✅ All queries filter by `user_id` | Low | Apply same pattern to brand profiles |
| **Share links** | N/A (new) | Medium | Use UUIDv4 tokens (unguessable); rate-limit token generation; allow revocation |
| **Public share endpoint** | N/A (new) | Medium | Only expose safe fields (no user email, no internal IDs); no edit capability |
| **Single-post regeneration** | N/A (new) | Low | Verify plan ownership; validate instruction input (max length, sanitize); rate-limit regeneration calls |
| **Supabase RLS** | ⚠️ May not be configured | Low | Add basic RLS policies as defense-in-depth (low priority; service role bypasses anyway) |
| **n8n webhook security** | ✅ Shared secret | Low | No changes needed |
| **Rate limiting** | ⚠️ Missing | Medium | Add basic rate limiting: max 3 plans/hour, max 10 regenerations/hour per user. Implement with in-memory counter or Supabase query. |
| **Input validation** | ✅ Server-side validation | Low | Add validation for new endpoints (brand profiles, regeneration instructions) |

### Concrete Risks for V2

1. **Share link enumeration:** Mitigated by UUIDv4 (2^122 possibilities). Brute force is infeasible.
2. **Regeneration abuse:** A user could trigger thousands of regenerations (costing $5+ in AI). Mitigated by per-user rate limit (10/hour).
3. **Public endpoint data leakage:** The share endpoint must NOT expose `user_id`, `user_email`, or internal metadata. Only content data.

---

## 18. Performance Optimization

| Area | Current State | Issue | Optimization |
|---|---|---|---|
| **Dashboard loading** | Server component fetches all plans | Acceptable for <50 plans | Add pagination if plans > 50 (P3) |
| **Plan detail page** | Polls every 3s during generation | Fine for MVP | Stop polling after completion (already implemented) |
| **Content items fetch** | Not currently fetched in-app | New for V2 | Single query with `ORDER BY day_number`; 30 rows max; no perf concern |
| **Strategy rendering** | JSONB parsed client-side | New for V2 | Parse once on load; memo if needed |
| **Content Mix calculation** | Client-side array iteration | New for V2 | 30 items × 7 fields = trivial; no optimization needed |
| **Share page** | New public page | New for V2 | Cache-Control headers (1 hour); ISR or on-demand revalidation if using Next.js caching |
| **Google Sheets export** | ~10–20s in n8n | Acceptable | No change needed |
| **Single-post regeneration** | ~3–5s OpenAI call | New for V2 | Show loading state; no optimization needed |

**No performance problems requiring immediate attention.** The app serves <100 users and 30-item data sets.

---

## 19. Implementation Phases

### Phase 0: Cleanup & Foundation (2–3 days)

**Features:** Technical debt, auth hardening, route protection

**Tasks:**
- [ ] Add `middleware.js` for route protection (redirect unauthenticated users)
- [ ] Extract shared auth helper: `lib/auth-guard.js`
- [ ] Add basic rate limiting utility
- [ ] Run Supabase migration: add `share_token` + `brand_profile_id` columns to `marketing_plans`
- [ ] Run Supabase migration: create `brand_profiles` table
- [ ] Verify `updated_at` triggers exist in Supabase
- [ ] Add basic RLS policies (defense-in-depth)

**Files affected:** `middleware.js` (new), `lib/auth-guard.js` (new), `lib/rate-limit.js` (new), Supabase SQL migrations
**n8n changes:** None
**Testing:** Auth flow, protected routes, DB schema

### Phase 1: Brand Profiles (3–4 days)

**Features:** Feature 1

**Tasks:**
- [ ] Build `brand_profiles` API routes (CRUD)
- [ ] Build `/brands` list page
- [ ] Build `/brands/new` create/edit page
- [ ] Add Brand Profile selector to `/plans/new`
- [ ] Modify `POST /api/plans` to accept `brand_profile_id`
- [ ] Add Brand Profiles link to dashboard

**Files affected:** `app/brands/` (new), `app/api/brands/` (new), `app/plans/new/page.jsx`, `app/api/plans/route.js`, `app/dashboard/DashboardClient.jsx`
**Database changes:** `brand_profiles` table creation
**n8n changes:** None
**Testing:** CRUD operations, form auto-fill, plan creation from profile

### Phase 2: In-App Content Viewer + Content Mix Intelligence (4–5 days)

**Features:** Features 2 + 3

**Tasks:**
- [ ] Build `GET /api/plans/[id]/content` API route
- [ ] Build `StrategyViewer.jsx` component (parse strategy JSONB)
- [ ] Build `PillarCards.jsx` component
- [ ] Build `ObjectiveChart.jsx` component (CSS bar charts)
- [ ] Build `ContentItemCard.jsx` component
- [ ] Build `ContentMixInsights.jsx` component (deterministic analytics)
- [ ] Write `lib/content-insights.js` — deterministic insight generation rules
- [ ] Overhaul `/plans/[id]` page: show strategy + pillars + calendar + insights after completion
- [ ] Mobile-responsive layout for all new components

**Files affected:** `app/plans/[id]/page.jsx` (major overhaul), `app/api/plans/[id]/content/route.js` (new), multiple new components in `app/plans/[id]/components/`
**Database changes:** None
**n8n changes:** None
**AI prompt changes:** None
**Testing:** Data rendering accuracy, JSONB parsing edge cases, mobile layout, empty states

### Phase 3: Single-Post Regeneration (3–4 days)

**Features:** Feature 4

**Tasks:**
- [ ] Build `POST /api/plans/[id]/content/[dayNumber]/regenerate` API route
- [ ] Design regeneration prompt (single-item, strategy-aware)
- [ ] Build `RegenerateModal.jsx` component
- [ ] Add regenerate button to `ContentItemCard.jsx`
- [ ] Implement rate limiting for regeneration endpoint
- [ ] Handle optimistic UI update + error rollback

**Files affected:** `app/api/plans/[id]/content/[dayNumber]/regenerate/route.js` (new), new components
**Database changes:** None (updates existing `content_items` row)
**n8n changes:** None
**AI prompt changes:** New single-item regeneration prompt
**Dependencies:** Phase 2 (in-app content viewer)
**Testing:** Regeneration quality, rate limiting, concurrent regeneration handling

### Phase 4: Shareable Plan Link (2–3 days)

**Features:** Feature 5

**Tasks:**
- [ ] Build `POST /api/plans/[id]/share` API route (generate token)
- [ ] Build `DELETE /api/plans/[id]/share` API route (revoke)
- [ ] Build `GET /api/share/[token]` public API route
- [ ] Build `/share/[token]` public page (read-only plan view)
- [ ] Build `ShareButton.jsx` component
- [ ] Add share button to plan detail page
- [ ] Security review: ensure no sensitive data in public endpoint

**Files affected:** New API routes, new page, new component
**Database changes:** Uses `marketing_plans.share_token` (added in Phase 0)
**n8n changes:** None
**Testing:** Token generation, public access, revocation, data exposure review

### Phase 5: Google Sheets Improvements (1–2 days)

**Features:** Feature 6

**Tasks:**
- [ ] Update n8n `batchUpdate` formatting for color-coded objectives
- [ ] Add color-coded post types
- [ ] Add weekly section dividers
- [ ] Add RTL sheet direction
- [ ] Add auto-filter on header row
- [ ] Test with Arabic content

**Files affected:** n8n workflow nodes only
**Database changes:** None
**n8n changes:** Modify 1–2 existing HTTP Request nodes
**Testing:** Sheet formatting with various plan sizes and languages

### Phase 6: Polish & Launch Hardening (2–3 days)

**Tasks:**
- [ ] End-to-end testing of all V2 features
- [ ] Mobile responsiveness review
- [ ] Error state coverage for all new features
- [ ] Loading state animations
- [ ] SEO meta tags for new pages
- [ ] Public share page: Open Graph meta tags for social previews
- [ ] Performance spot-check
- [ ] Security review of public endpoints
- [ ] Vercel environment variables for production

---

## 20. Testing Strategy

### Unit Testing (Optional for solo developer)

- `lib/content-insights.js` — deterministic insight rules: easy to unit test
- `lib/validations/plan.js` — already exists; extend for brand profiles

### Integration Testing (Manual)

| Test | Steps |
|---|---|
| Brand profile CRUD | Create → Edit → List → Delete → Verify cascade |
| Plan from brand profile | Create profile → Create plan from profile → Verify form auto-fill |
| In-app content viewer | Generate plan → View strategy/pillars/calendar in-app |
| Content mix intelligence | Generate plan → Verify analytics match content items |
| Single-post regeneration | Generate plan → Regenerate Day 5 → Verify only Day 5 changes |
| Share link | Generate plan → Create share link → Open in incognito → Verify read-only view |
| Share revocation | Revoke share → Verify link returns 404 |
| Rate limiting | Attempt 15 regenerations in 1 minute → Verify throttled after 10 |

### End-to-End Happy Path

1. Sign in → Create brand profile → Create plan from profile → Wait for generation → View strategy + calendar in-app → Regenerate Day 7 → Share plan → Open share link in incognito → Verify content → Revoke share link

---

## 21. Launch Checklist

### Product
- [ ] All 6 V2 features implemented and tested
- [ ] Brand profiles CRUD works end-to-end
- [ ] In-app content viewer renders strategy + pillars + calendar
- [ ] Content mix intelligence shows correct analytics
- [ ] Single-post regeneration produces quality output
- [ ] Share links work for unauthenticated users
- [ ] Google Sheets formatting improved

### UX
- [ ] Mobile responsiveness on all new pages
- [ ] Loading states for all async operations
- [ ] Error states for all failure scenarios
- [ ] Empty states for brand profiles and plans
- [ ] Arabic text renders correctly everywhere

### AI Quality
- [ ] Regeneration prompt produces coherent output
- [ ] Regenerated posts maintain strategic consistency with plan
- [ ] Strategy viewer accurately parses all JSONB fields

### Database
- [ ] `brand_profiles` table created with correct schema
- [ ] `marketing_plans.share_token` column added
- [ ] `marketing_plans.brand_profile_id` column added
- [ ] Indexes created for new columns
- [ ] `updated_at` triggers verified

### Security
- [ ] All new API routes check authentication
- [ ] All new API routes check ownership
- [ ] Public share endpoint exposes only safe fields
- [ ] Rate limiting active on regeneration endpoint
- [ ] Share tokens are UUIDv4 (unguessable)
- [ ] No sensitive data leaked in public endpoints

### Performance
- [ ] Content items query is indexed and fast
- [ ] Share page has appropriate cache headers
- [ ] No N+1 queries in new endpoints

### n8n
- [ ] Existing workflow unchanged and still works
- [ ] Google Sheets formatting updates tested
- [ ] RTL support verified for Arabic content

### Google Sheets
- [ ] Color-coded objectives render correctly
- [ ] Weekly dividers appear correctly
- [ ] Auto-filter works
- [ ] RTL direction set

### Error Handling
- [ ] Regeneration failure shows user-friendly message
- [ ] Share token generation failure handled
- [ ] Brand profile validation errors displayed

### Production Environment
- [ ] All environment variables set in Vercel
- [ ] Supabase migrations applied to production
- [ ] n8n workflow updated in production
- [ ] SSL/HTTPS verified
- [ ] Domain configured

---

## 22. Post-Launch Roadmap

### V2.1 (1–2 months post-launch)
- Calendar visualization (P2)
- Plan templates (P2)
- Designer handoff view

### V2.2 (3–4 months post-launch)
- Content quality scoring (deterministic)
- Calendar intelligence (problem detection)
- Content variations (generate alternatives)
- PDF export

### V3 (6+ months post-launch)
- Multi-platform (LinkedIn, TikTok, X)
- Brand voice memory (advanced rules)
- Freelancer/agency workspaces
- Subscription/payments
- Usage analytics dashboard

---

## 23. Rejected Features

| Feature | Reason for Rejection |
|---|---|
| **Plan Versioning** | Adds significant DB complexity (version tracking, migration, diffing) without clear user demand. Users can create new plans. |
| **Content Variations (3x alternatives)** | Triples AI cost per regeneration. Single-post regeneration with instructions covers this need more efficiently. |
| **In-App Content Editing** | Extremely high UI complexity (rich text editor for 30 items × 8 fields). Google Sheets + regeneration covers this need. |
| **CSV Export** | Google Sheets supports CSV download natively. Zero added value. |
| **PDF Export** | Requires headless browser or PDF library. High complexity, low marginal value when Sheets exists. Deferred to V2.2. |
| **Multi-Platform Strategies** | Massive scope expansion. MVP validates Instagram-only. |
| **Subscription/Payments** | Premature. Validate product-market fit first. |
| **Analytics Infrastructure** | No publishing = no analytics. Focus on planning value. |
| **Plan Duplication** | Brand Profiles makes this largely unnecessary. Creating a new plan from the same profile is functionally equivalent. |

---

## 24. Final Architecture Recommendation

### Architecture Principle: Keep It Simple

The V2 architecture follows the same pattern as V1:
- **Next.js** handles all user-facing logic, CRUD, auth, and lightweight AI calls
- **n8n** handles the long-running 3-step AI pipeline + Google Sheets export (unchanged)
- **Supabase** stores all persistent data with 1 new table and 2 new columns
- **OpenAI** receives 1 new prompt type (single-post regeneration) called directly from Next.js

### What Does NOT Change
- Core AI pipeline (3-step generation via n8n)
- Authentication architecture (Auth.js v5 + JWT + service role)
- Google Sheets export workflow (only formatting improves)
- Database design philosophy (JSONB for AI outputs, text[] for arrays)

### What DOES Change
- Product has in-app content visibility (not just a Sheet link)
- Product has reusable brand identity (not re-enter every time)
- Product has analytical intelligence (not just raw output)
- Product has granular AI control (not all-or-nothing regeneration)
- Product has shareability (not locked to authenticated users)

### Estimated Total Implementation: 3–4 weeks for a solo developer

---

> **This document is the V2 upgrade plan for the AI Marketing Planner. PROJECT_PLAN.md remains the baseline MVP architecture and has NOT been modified. All V2 implementation decisions should reference both documents.**
