# Astroday — Project Intelligence File
# Read this fully at the start of every session before doing anything.
# This is a solo-built product. Every decision should reflect that
# constraint — simple, maintainable, no over-engineering.

---

## What This App Is

Astroday is a **web application** built with Next.js.
A mobile app is planned for a later phase — make zero mobile-specific
decisions now. All code must be web-first.

Astroday is a personalized business astrology web app. Users enter
their birth date, time, and location. The app calculates daily scores
across 5 business categories based on their natal chart vs current
planetary transits. Claude API generates personalized AI insight text
per category. Users subscribe to unlock full AI insights.

**The product is practical, not mystical.** Language and tone throughout
the app — in UI copy, AI insights, and prompts — should feel like a
smart business tool that happens to use astrology, not a fortune teller.
The voice is that of a trusted advisor who has known the user for years
and speaks plainly. Never vague, never cheerful, never clinical.

**The emotional contract:** Astroday stops feeling like a forecast tool
and starts feeling like a relationship. It remembers, it notices patterns,
it tells the truth on hard days, and it becomes more valuable the longer
someone uses it. Churning should feel like leaving something real behind.

**Built solo.** Every feature must be justifiable against the constraint
of one person maintaining it. No unnecessary complexity. No features
that create disproportionate support burden. Prefer simple and reliable
over clever and fragile.

---

## The 5 Categories

| Category | Symbol | Covers |
|---|---|---|
| Contacts | 📬 | Communication, calls, emails, documents |
| Money | 💰 | Finances, income, expenses, resources |
| Risk | ⚡ | Energy, action, willpower, equipment |
| New Projects | 🌱 | New ideas, travel, legal, opportunities |
| Decisions | 📋 | Long-term decisions, contracts, agreements |

Each category scores GREEN (favourable) / RED (tense) / GREY (neutral)
per day, based on the user's natal chart positions vs daily transits.

---

## Astrological Scoring Rules
# CRITICAL — This section must be completed by the founder before
# Phase 1 begins. Claude Code cannot invent these rules.
# The founder has direct domain expertise. These rules are the
# intellectual core of the product.

### Planets and Their Category Governance
```
[FOUNDER TO COMPLETE BEFORE PHASE 1]

For each category, document:
- Which planets govern it primarily
- Which planets are secondary influences
- Which aspects produce GREEN for this category
- Which aspects produce RED for this category
- Which aspects produce GREY / neutral
- How conflicting aspects are resolved on the same day
  (e.g. Saturn trine + Mars square simultaneously — what wins?)
- Orb tolerances used (default suggestion: 6° major, 3° minor)
- How you weight major vs minor aspects
- Any special conditions (retrograde planets, out-of-bounds, etc.)
```

### Conflict Resolution Rules
```
[FOUNDER TO COMPLETE BEFORE PHASE 1]

When multiple aspects affect the same category on the same day:
- How is the dominant score determined?
- Is there a weighting system?
- Are there any aspect combinations that always override others?
```

### Birth Data Accuracy Tiers
```
Full accuracy:   birth date + birth time + birth location
Good accuracy:   birth date + birth location (no rising sign)
Basic accuracy:  birth date only (sun-based chart)
```

Communicate accuracy tier clearly to the user during onboarding and
in every insight. Never let imprecise data feel like a broken product.
User expectation management is part of the product.

---

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database + Auth**: Supabase (Postgres + Supabase Auth)
- **Payments**: Stripe (subscriptions + Stripe Tax for EU VAT)
- **Astrology engine**: Swiss Ephemeris JS port
- **AI insights**: Anthropic Claude API (claude-sonnet-4-20250514)
- **Email**: Resend
- **Social automation**: n8n (self-hosted on Hetzner VPS)
- **Hosting**: Vercel
- **Error monitoring**: Sentry
- **Analytics**: Google Analytics + Hotjar (behaviour)
- **Status page**: Simple status page (BetterUptime free tier)
- **Repo**: GitHub (private)

---

## Pricing Model

```
7-day free trial — no credit card required
Pro Monthly  — €12/month
Pro Annual   — €89/year (saves ~38%, effectively €7.42/month)
Extra profiles — €4/month each (up to 3 additional)
```

- One plan. One decision. No comparison table on pricing page.
- Extra profiles are the only expansion option.
- EU VAT handled automatically via Stripe Tax.
- Existing subscribers grandfathered when price changes.
- Annual pricing is the primary goal — push it consistently.
  Annual subscribers churn 2–3x less than monthly.
- After 3–6 months with testimonials and traction, raise monthly
  to €14 for new subscribers. Announce it as a founding rate expiry.

**Founding member offer (pre-launch waitlist):**
Lock in €9/month forever in exchange for joining the waitlist.
This drives pre-launch signups and rewards early believers.

**Profile sharing policy:**
A natal chart belongs to one specific person. Sharing profiles
defeats the product's core value — the chart is only accurate
for its owner. Communicate this as product truth, not policy:
*"Your chart is yours alone — sharing it is like sharing a fingerprint."*

---

## Legal and Business Structure

**Before taking any revenue:**
- Register legal entity (Latvia: SIA — limited liability company)
- Open dedicated business bank account
- Brief a local accountant on VAT obligations and filing structure
- Stripe Tax configured before first live payment
- Privacy Policy and Terms of Service live before launch
- GDPR compliance built into product (see Phase 14)

**Support infrastructure before launch:**
- Support email: support@astroday.app
- FAQ page covering the 15 most obvious questions
- Canned response library (10–15 pre-written answers)
- Clear refund policy stated in Terms of Service
- Stripe dispute handling process documented

---

## Key Metrics — Measure These Weekly

```
Trial to paid conversion rate     target: 15%+
Day 7 retention (opens on day 7)  target: 50%+
Onboarding completion rate        target: 70%+
Monthly churn rate                target: below 6%
Annual plan take rate             target: 35%+
```

Change one thing at a time. Wait 2 weeks before changing another.
Never change multiple variables simultaneously — you will not know
what moved the number.

---

## Product Philosophy — The Relationship Model

The app compounds in value over time. A 2-year user gets a measurably
better experience than a 2-week user because:

- Memory deepens — patterns surface from journal history
- Voice sharpens — insights reference the user's own observations
- Trust builds — the app earns authority through honest accuracy
- History accumulates — the user's own decision record becomes proof

Every product decision should ask: does this make the relationship
deeper over time, or is it a one-time feature?

---

## Daily Experience — How It Should Feel

### The Opening Moment

When the app loads, the user should feel like opening something —
closer to a letter written for them than a dashboard. The today view
loads with the daily paragraph front and centre in large Cormorant
Garamond type. The 5 category scores sit below as supporting detail.

The background subtly shifts with the overall day quality:
- Green day: imperceptible warmth in the dark palette
- Red day: slight coolness
- Grey day: stays neutral
This is felt before it is read.

### Time of Day Awareness

The daily paragraph has three registers based on when the app is opened:

- **Morning (before 12pm)**: Forward-looking — here is what today
  holds, here is how to approach it
- **Afternoon (12pm–6pm)**: Present-tense — here is how the day is
  unfolding, here is what the evening window looks like
- **Evening (after 6pm)**: Reflective — here is what today was about,
  here is what tomorrow opens with

Pass current time as a parameter to the insight generation prompt.
Never generate a single static version of the day regardless of time.

### The Transition Moment

Around 10pm the paragraph quietly shifts focus to tomorrow. No
notification, no dramatic change — but a late evening open naturally
bridges to what is coming. Creates a second daily touchpoint.

### Grey Day Engagement

Grey (neutral) days are where habit dies in most apps. Astroday must
always find something worth opening on a grey day:
- Surface a pattern from the journal
- Remind of an upcoming strong window
- Ask a quiet reflective question
- Show the week ahead context
Never let the app feel like there is nothing to see today.

---

## Core Features

### Daily Overall Paragraph

A single synthesised paragraph at the top of the today view that reads
across all 5 categories and gives one human read of the day. This is
the headline. The 5 categories are the supporting detail.

The paragraph has continuity — pass the last 3 days of paragraphs as
context to the API call so the narrative flows day to day:
*"Yesterday's tension around decisions has eased — if you were holding
back on something, today is the natural follow-through."*

### The 5 Category Insights

Full personalised insight per category. Pro users only.
Free users see color scores only, with 1 rotating category unlocked
per day to demonstrate value.

### Quick Tools (Utility Layer)

Practical tools below the insight. Do NOT label these as AI.
Do NOT reference AI anywhere in the main product experience.
Label features as tools, not AI outputs:
- Email opener for the day's tone
- What to avoid today
- Action prompt specific to the category
- Pre-meeting brief (log a meeting, get a contextual read)

### Onboarding Personalisation Quiz

3–4 questions at signup. Conversational, one at a time, beautifully
designed as part of onboarding flow. Not a form.

Questions:
1. What best describes your work?
   (Sales / Creative / Leadership / Operations / Independent)
2. What do you most want guidance on?
   (Timing decisions / Communication / Financial moves / Energy)
3. How do you prefer your insights?
   (Direct and brief / Detailed and explanatory)
4. What are you working toward right now? (Open text — optional)

Same green contacts day reads completely differently for Sales vs
Creative vs Leadership. The calculation does not change — the language,
emphasis, and framing does.

Brief preference = 1-paragraph insights + single action.
Detailed preference = full multi-paragraph breakdown with context.

**The onboarding never truly ends.** Every few weeks one gentle
question surfaces naturally. The app checks in if circumstances
seem to have shifted based on journal content.

### Birth Data Onboarding — Critical UX

Many users will not know their birth time. Handle this gracefully:
- Explain what birth time adds and why it matters
- Provide guidance on finding it (birth certificate, family)
- Show immediately useful content even with date-only
- Never let imprecise data feel like a broken product
- Save partial onboarding — if user closes browser mid-flow,
  data is preserved when they return
- Communicate the accuracy tier being used in every insight

### Journal / Personal Observation Log

Users note what actually happened each day. Fast — a few words
or a sentence. Did the red risk day feel tense? Did the green
contacts day produce results?

The journal is a feedback engine:
- After 30 days: surface patterns against scores
- Reference user's own words in future insights
- Build a personal evidence base of decisions vs outcomes
- Forecast match rating: did today match? (3-option response)

*"Based on your own observations, today's configuration tends to
correlate with the scattered energy you've noted before."*

### 30-Day Calendar View

Color-coded month view. Each day shows dominant overall score.
Tap a day for 5-category breakdown and logged notes.

Free: 3-day lookahead only.
Pro: full 30-day view.

### Weekly Planning View

Strategic layer showing the week at a glance — one paragraph,
week-level strategy. Lives at top of calendar view.

Every Sunday evening: weekly briefing email or in-app card written
as a strategic brief, not a list of scores.

### Monthly Business PDF

On the first of each month, Pro users receive a beautifully designed
one-page PDF mapping the month ahead. Best windows per category,
dates worth protecting, significant planetary events and their
business implications. Designed to be saved or printed.

### Significant Day Marking

When a user has a genuinely rare and powerful astrological
configuration (once or twice a year):
- Elevated design treatment on that day
- Longer, more considered paragraph
- Special subject line in morning email
*"Today is one of the stronger days in your chart this year."*
These moments should feel like occasions.

### Difficult Period Reframing

When multiple challenging aspects stack for days or weeks, do not
present a demoralising series of red days. Contextualise:
*"The next three weeks have more friction than usual — this is a
period for consolidation and internal work rather than external
moves. Here is specifically how to use this time well."*
Difficulty should feel purposeful, not just negative.

### Mercury Retrograde and Major Event Alerts

On web (not push notifications — unreliable on web, broken on iOS Safari):
- In-app banner: gold strip at top of today view during significant
  planetary events. Dismissible but reappears next day while active.
- Email alerts: opt-in at profile level.
- During-event indicator: small persistent badge near the date.

Push notifications are the primary argument for the future mobile app.
Roadmap note: web handles alerts through banners and email;
mobile unlocks true push notifications.

### Pattern Recognition (30-day+)

After one month of data the app surfaces genuine surprises:
- *"Your green contacts days consistently fall mid-week."*
- *"Of the 6 contracts you've signed, 5 were on green or neutral days."*
- *"This time last year was a strong window for decisions — similar
  configuration this March, though with more emphasis on new projects."*

Year-over-year memory is a core long-term retention mechanism.

### Anomaly Alerts

When today significantly deviates from the user's recent baseline:
*"Today reads differently than your recent pattern — this is one of
the more unusual configurations in your chart this quarter."*
Anomalies are inherently interesting and signal the app is watching.

### Annual Review — Solar Return

On each user's solar return (astrologically significant birthday):
- Full year in review
- Pattern analysis from journal
- What the coming year holds based on major transits
- Chart expressions mapped against their own journal entries

Users who receive their first annual review almost never churn.
Design it to be shareable.

### Pre-Meeting Brief

Pro users can log important meetings in the app. Before the meeting:
*"You have a client call at 2pm. Contacts is green but decisions is
grey — good for relationship building, not the right moment to push
for commitment. Save that for Thursday."*

### Decision Logging

Users log actual decisions against astrological windows. Over time
the app builds a personal evidence base. Their own history becomes
the proof. This feature converts sceptics.

### Micro-Celebrations

Human acknowledgement that time has passed — not gamification:
- First month tied to chart context
- Journal milestones acknowledged naturally
- Green run periods noted with explanation
- Anniversary tied to what the chart shows

### Shared Planetary Moments

During events affecting everyone (retrograde, full moons, eclipses):
universal context + personal interpretation in one card.
Users feel part of something larger while receiving something unique.

---

## Trust Architecture

**Language rules — always probabilistic, never deterministic:**
- Not: *"today will be difficult"*
- Yes: *"today has a higher probability of friction — worth being aware of"*

**Honest bad days:**
When it is genuinely difficult, say so clearly. Users trust the
green days more when they know the app tells the truth on red ones.

**Graceful handling of misses:**
Journal rating system openly invites feedback on accuracy.
Being the app that acknowledges uncertainty is a trust signal.

**The honest caveat — built into the voice, not the footer:**
Every insight ends naturally with:
*"Astrology reveals tendency, not destiny — you always have
the final word."*

---

## AI Usage — Critical Rules

The word "AI" is never used in the core product experience.
Insights, the daily paragraph, category readings — these should feel
like they come from a wise advisor who knows the user's chart.

AI is only surfaced in the utility/quick tools layer, and even
there it is not labelled as AI. Label features as tools:
- "Quick tools" — never "AI tools"
- "Email opener" — never "AI-generated opener"
Never: "AI-generated", "AI insight", "powered by AI"

---

## Onboarding Drop-Off Prevention

Industry average drop-off between signup and first meaningful
product experience is 60–70%. For Astroday the risk is higher
because birth data requires effort to find.

**Required before launch:**
- Partial onboarding save — data preserved if browser closed
- Minimum viable experience with date-only (no birth time required
  to see something useful immediately)
- Onboarding completion email sequence:
  - 2 hours after signup if profile incomplete:
    *"You are one step away from your first forecast."*
  - 24 hours after signup if still incomplete:
    *"Your chart is waiting — it takes 2 minutes."*
- Clear explanation of what each data point adds
- Progress indicator so users know how close they are to done

---

## Email Sequences — Required Before Launch

### Trial Conversion Sequence
```
Day 1  (trial start):    Welcome + what to expect this week
Day 3  (mid-trial):      Here is what Pro unlocks — soft introduction
Day 5  (2 days before):  Your trial ends in 2 days — what you will lose
Day 7  (last day):       Today is your last day — specific upgrade CTA
Day 8  (day after):      Your insights are now limited — upgrade to restore
Day 14 (1 week later):   Final re-engagement — did something come up?
```

### Onboarding Completion Sequence
```
2 hours post-signup (incomplete):  Gentle nudge to complete profile
24 hours post-signup (incomplete): Second nudge with why it matters
```

### Ongoing Engagement Sequence
```
Sunday evening:          Weekly briefing for the week ahead
1st of month:            Monthly PDF + month overview
Before major events:     Mercury retrograde, eclipse, major conjunction alerts
Solar return:            Annual review delivery
30-day milestone:        First pattern insights surfaced
```

### Winback Sequence (post-churn)
```
Day 1 after cancellation:  Acknowledge + ask why (one-question survey)
Day 14:                    Notable planetary event as re-engagement hook
Day 30:                    Final re-engagement with a specific offer
```

---

## Insight Generation — Prompt Rules

**Standard insight (Pro):**
- 2–3 short paragraphs
- Written in second person ("your", "you")
- Specific to the category and the aspect causing the score
- Practical and business-focused — not vague or mystical
- Tone: trusted advisor, not fortune teller
- Green: explain why favourable and what to do with it
- Red: explain the tension and what to avoid or postpone
- Grey: find something purposeful — upcoming window, pattern,
  reflective prompt. Never feel like nothing to say.
- Always end with one concrete actionable suggestion
- Never make specific financial or legal predictions
- End with: *"Astrology reveals tendency, not destiny —
  you always have the final word."*

**Context to always pass to the API:**
- User's natal chart positions
- Today's planetary transits
- Active aspects and their nature
- Onboarding profile (work type, focus, preference)
- Accuracy tier being used (full / good / basic)
- Last 3 days of daily paragraphs (for continuity)
- Relevant journal entries from the past 30 days
- Current time of day (morning / afternoon / evening)
- Any active major planetary events

**Caching rule:**
Cache all generated insights in Supabase.
Never regenerate same profile + date + category + time-of-day twice.
This controls Claude API costs at scale.

---

## Design System

### Aesthetic Direction

Premium dark. The app feels like a high-end personal advisory tool —
confident, refined, celestial without being costume-y. Every screen
should feel like it belongs in a luxury fintech or professional
wellness product. Think Bloomberg Terminal meets fine jewellery.

This is not a generic SaaS app. Do not default to standard component
library styling. Every component must reflect this aesthetic.

### Color Palette

```
Background primary:   #0D0E14   (near-black, main surfaces)
Background secondary: #161820   (cards, panels)
Background tertiary:  #1E2030   (elevated elements, selected states)
Background raised:    #272A3D   (hover states, chips)

Gold accent:          #C9A84C   (primary brand color — use sparingly)
Gold light:           #E8C97A   (hover states on gold elements)
Gold dim:             #8A6E30   (muted gold, borders)

Score green:          #4CAF7A   (favourable / green days)
Score green bg:       rgba(76,175,122,0.12)
Score red:            #E05C5C   (tense / red days)
Score red bg:         rgba(224,92,92,0.12)
Score grey:           #7A7E99   (neutral / grey days)
Score grey bg:        rgba(122,126,153,0.12)

Text primary:         rgba(255,255,255,0.90)
Text secondary:       rgba(255,255,255,0.55)
Text muted:           rgba(255,255,255,0.35)

Border default:       rgba(255,255,255,0.07)
Border subtle:        rgba(201,168,76,0.20)
Border accent:        rgba(201,168,76,0.35)
```

### Typography

```
Display font:   Cormorant Garamond (Google Fonts)
                — app name, page headings, category titles,
                  daily paragraph headline
                — weights: 400, 500, 600

UI font:        DM Sans (Google Fonts)
                — all interface text, labels, body copy,
                  insight body text
                — weights: 300, 400, 500

Data font:      DM Mono (Google Fonts)
                — dates, numbers, coordinates
```

### Type Scale

```
App name / hero:      Cormorant Garamond 28px / 600
Daily paragraph:      Cormorant Garamond 18px / 400 / line-height 1.8
Page headings:        Cormorant Garamond 22px / 600
Section headings:     Cormorant Garamond 18px / 500
Category titles:      Cormorant Garamond 16px / 500
UI labels (caps):     DM Sans 10px / 500 / letter-spacing 0.12em / uppercase
Body text:            DM Sans 13px / 400 / line-height 1.7
Small/muted text:     DM Sans 11px / 400
```

### Spacing

```
Base unit: 4px
Component internal padding: 12px / 16px / 20px
Section gaps: 24px / 32px
Card border radius: 12px
Button border radius: 8px
Badge border radius: 6px
```

### Component Rules

**Cards**
- Background: #161820
- Border: 0.5px solid rgba(255,255,255,0.07)
- Border radius: 12px
- No drop shadows — depth through background color layering only
- Selected/active: border becomes rgba(201,168,76,0.35)

**Buttons**
- Primary: gold border + gold text, transparent bg
- Primary hover: rgba(201,168,76,0.12) fill
- Destructive: red border + red text
- Ghost: white/35 border + white/55 text
- No filled solid buttons in the app UI
- Exception: CTAs on marketing landing page only

**Score badges**
- Green: rgba(76,175,122,0.12) bg + #4CAF7A text +
  rgba(76,175,122,0.30) border
- Red: rgba(224,92,92,0.12) bg + #E05C5C text +
  rgba(224,92,92,0.30) border
- Grey: rgba(122,126,153,0.12) bg + #7A7E99 text +
  rgba(122,126,153,0.30) border
- Font: DM Sans 9px / 500 / uppercase / letter-spacing 0.08em

**Navigation**
- Left sidebar on desktop (240px wide)
- Bottom nav on mobile breakpoint
- Active item: gold color + gold dot indicator
- Inactive: white/35 opacity
- No background fill on nav — floats with subtle border

**Today view hierarchy**
1. Date and day context (small caps label)
2. Planetary event banner if active (gold strip)
3. Daily overall paragraph (large Cormorant Garamond)
4. Background warmth signal (subtle, felt not read)
5. 5 category cards with scores
6. Selected category expands to insight
7. Quick tools below insight
8. Week bar chart at bottom

**Significant day treatment**
- Gold border on today card instead of default
- Slightly larger daily paragraph type
- Subtle gold warmth on background
- Used maximum once or twice per year per user

**Planetary event banner**
- Gold background strip at very top of today view
- DM Sans 12px, dark text on gold
- Dismissible but reappears next day while event is active
- Example: *"Mercury retrograde · Communications need extra
  care through April 7"*

### Motion

- Page transitions: fade 200ms ease
- Card hover: background lightens one step, 150ms ease
- Score badge entry: scale 0.95 → 1.0, 200ms ease
- Daily paragraph: fade in 300ms, slight upward drift 8px
- Category insight: fade in after score, 150ms delay
- Skeleton loading: pulse using background color steps, 1.5s loop
- Background warmth shift on load: 400ms ease, very subtle
- No spring physics, no bounce, no decorative animations

### What to Never Do

- Never use white or light backgrounds on any app screen
  (marketing landing page is the only exception)
- Never use Inter, Roboto, or system fonts anywhere
- Never use blue as an accent — gold only
- Never use filled solid buttons inside the app UI
- Never use gradients or drop shadows
- Never use more than 3 levels of background depth on one screen
- Never use ALL CAPS except UI labels at 10px and below
- Never use purple — reads as generic AI product
- Never use the word "AI" anywhere in UI-facing copy

---

## Backup and Recovery

**Configured from day one — not optional:**
- Supabase automated daily backups: enable in dashboard settings
- Vercel deployment rollback: keep last 3 deployments available
- Environment variables: backed up securely outside the codebase
- Status page: BetterUptime free tier, configured before launch

**If Supabase goes down:** static error page with status link
**If Vercel goes down:** Supabase data safe, redeploy when restored
**If Anthropic API goes down:** fallback — show scores only,
  display: *"Insights temporarily unavailable — your scores
  are accurate. Full insights will return shortly."*
**If Stripe webhook fails:** log to Sentry, manual review queue

---

## Social Automation (n8n)

Daily workflow at 8am:
1. Calculate general daily planetary weather (non-personalised)
2. Generate social post via Claude API
3. Post to X, Facebook Page, Instagram simultaneously
4. Log to Supabase

Content calendar built around predictable planetary events:
Mercury retrograde, full moons, eclipses, major conjunctions.
These events are known months ahead — prepare content in advance.

Brand voice on social: advisor, not fortune teller.
Never mystical, never vague, always practical business angle.
No founder face — brand account only.

---

## Folder Structure

```
/app
  /app/api                  All backend API routes
  /app/(auth)               Login, register, onboarding quiz flow
  /app/(dashboard)          Today, calendar, profile, journal
  /app/(marketing)          Landing page, blog, legal, pricing

/components
  /components/calendar      Calendar and week view
  /components/categories    Category cards, insight panel, quick tools
  /components/journal       Journal entry and pattern display
  /components/layout        Shell, navigation, header, banners
  /components/onboarding    Quiz flow, birth data entry, accuracy tier
  /components/ui            Buttons, badges, modals, skeletons

/lib
  /lib/astro                Swiss Ephemeris + natal + transit calculation
  /lib/scoring              Green/red/grey logic per category
  /lib/ai                   Claude API calls and all prompt templates
  /lib/ai/context.js        Assembles full context for every API call
  /lib/db                   All Supabase queries — nowhere else
  /lib/stripe               Subscription and billing logic
  /lib/email                Resend templates and all sequences
  /lib/notifications        In-app banner and email alert logic
  /lib/patterns             Journal analysis and pattern detection

/styles
  /styles/tokens.css        Single source of truth — all design variables
  /styles/globals.css       Base resets and global rules

/docs
  /docs/scoring-rules.md    Astrological scoring rules (founder-written)
  /docs/email-sequences.md  All email copy
  /docs/support-faq.md      Support FAQ and canned responses

/n8n                        Social automation workflow definitions
/tests                      One test file per lib function
/public                     Static assets, OG images, favicon
```

---

## Key Files Reference

| File | Purpose |
|---|---|
| `/docs/scoring-rules.md` | Founder-written astrological rules — source of truth |
| `/styles/tokens.css` | All design tokens — single source of truth |
| `/lib/astro/calculateNatalChart.js` | Natal chart from birth data |
| `/lib/astro/calculateDailyTransits.js` | Today's planetary positions |
| `/lib/astro/detectAspects.js` | Aspect detection (trine, square, etc.) |
| `/lib/astro/planetaryEvents.js` | Retrograde, eclipse, event detection |
| `/lib/astro/accuracyTier.js` | Determine accuracy level from available data |
| `/lib/scoring/contacts.js` | Contacts scoring logic |
| `/lib/scoring/money.js` | Money scoring logic |
| `/lib/scoring/risk.js` | Risk scoring logic |
| `/lib/scoring/newProjects.js` | New Projects scoring logic |
| `/lib/scoring/decisions.js` | Decisions scoring logic |
| `/lib/scoring/resolveConflicts.js` | Multi-aspect conflict resolution |
| `/lib/ai/generateDailyParagraph.js` | Overall daily paragraph |
| `/lib/ai/generateInsight.js` | Per-category insight |
| `/lib/ai/generateQuickTool.js` | Email opener, avoid, action prompt |
| `/lib/ai/generateWeeklyBrief.js` | Sunday weekly briefing |
| `/lib/ai/generateAnnualReview.js` | Solar return annual review |
| `/lib/ai/context.js` | Assembles full context for every API call |
| `/lib/ai/prompts.js` | All prompt templates |
| `/lib/patterns/analyzeJournal.js` | Pattern detection from journal |
| `/lib/patterns/anomalyDetect.js` | Baseline deviation detection |
| `/lib/db/users.js` | User CRUD |
| `/lib/db/profiles.js` | Natal profile CRUD |
| `/lib/db/insights.js` | Insight cache CRUD |
| `/lib/db/scores.js` | Score cache CRUD |
| `/lib/db/journal.js` | Journal entry CRUD |
| `/lib/db/meetings.js` | Logged meetings CRUD |
| `/lib/stripe/subscriptions.js` | Subscription management |
| `/lib/email/sequences.js` | All email sequence triggers |
| `/app/api/scores/route.js` | GET daily scores |
| `/app/api/insights/route.js` | GET insight |
| `/app/api/paragraph/route.js` | GET daily paragraph |
| `/app/api/tools/route.js` | GET quick tool output |
| `/app/api/patterns/route.js` | GET pattern analysis |
| `/app/api/webhooks/stripe/route.js` | Stripe webhook handler |

---

## Database Schema

### users
```
id uuid primary key
email text unique
created_at timestamp
subscription_tier text (free | pro)
subscription_status text (active | trialing | cancelled | expired)
stripe_customer_id text
trial_ends_at timestamp
onboarding_complete boolean default false
```

### profiles
```
id uuid primary key
user_id uuid references users
label text
birth_date date
birth_time time (nullable)
birth_city text (nullable)
birth_lat float (nullable)
birth_lng float (nullable)
natal_chart jsonb (cached)
accuracy_tier text (full | good | basic)
is_primary boolean
onboarding_work_type text
onboarding_focus text
onboarding_preference text (brief | detailed)
onboarding_goal text
created_at timestamp
```

### daily_scores
```
id uuid primary key
profile_id uuid references profiles
date date
overall text (green | red | grey)
contacts text
money text
risk text
new_projects text
decisions text
calculated_at timestamp
```

### daily_insights
```
id uuid primary key
profile_id uuid references profiles
date date
time_of_day text (morning | afternoon | evening)
category text (overall | contacts | money | risk | new_projects | decisions)
insight_text text
generated_at timestamp
```

### journal_entries
```
id uuid primary key
profile_id uuid references profiles
date date
entry_text text
forecast_match text (matched | partial | did_not_match)
created_at timestamp
updated_at timestamp
```

### quick_tool_cache
```
id uuid primary key
profile_id uuid references profiles
date date
tool_type text (email_opener | what_to_avoid | action_prompt)
category text
output_text text
generated_at timestamp
```

### meetings
```
id uuid primary key
profile_id uuid references profiles
meeting_datetime timestamp
title text
brief_text text
generated_at timestamp
```

### pattern_insights
```
id uuid primary key
profile_id uuid references profiles
pattern_text text
generated_at timestamp
valid_until timestamp
```

---

## Feature Gating

```
Free (trial and post-trial):
- Color scores all 5 categories
- 1 rotating AI insight per day (no quick tools)
- Daily paragraph — first sentence only, rest blurred
- Calendar: 3 days ahead
- Journal: available (builds habit and data)
- 1 profile only

Pro (€12/month or €89/year):
- Full daily paragraph with continuity
- Full insights all 5 categories
- All quick tools
- 30-day calendar + week planning view
- Full journal with pattern recognition after 30 days
- Pre-meeting brief and decision logging
- Email alerts for planetary events
- In-app planetary event banners
- Monthly PDF digest
- Annual review on solar return
- 1 profile + extra profiles at €4/month each
```

---

## Build Phases

| Phase | Status | Description |
|---|---|---|
| 0 | [ ] | Pre-code: scoring rules doc, legal entity, accounts setup |
| 1 | [ ] | Calculation engine — Swiss Ephemeris, scoring, event detection |
| 2 | [ ] | AI engine — paragraph, insights, tools, context assembly |
| 3 | [ ] | Backend + database — full schema + all API routes |
| 4 | [ ] | Authentication — login, register, onboarding quiz + birth data |
| 5 | [ ] | Core UI — today view, category detail, week chart |
| 6 | [ ] | Calendar — monthly view, week planning, day detail |
| 7 | [ ] | Journal — entry, forecast rating, pattern display |
| 8 | [ ] | Payments — Stripe + Stripe Tax + feature gating |
| 9 | [ ] | Email sequences — all triggers via Resend |
| 10 | [ ] | Notifications — in-app banners, event alerts |
| 11 | [ ] | Advanced features — meetings, decision log, annual review |
| 12 | [ ] | Pattern engine — journal analysis, anomaly detection |
| 13 | [ ] | Social automation — n8n + X + Facebook + Instagram |
| 14 | [ ] | Legal + GDPR — privacy policy, terms, data export, delete |
| 15 | [ ] | SEO + growth — landing page, blog, OG images, analytics |
| 16 | [ ] | Launch prep — backup config, status page, support FAQ, QA |
| 17 | [ ] | Soft launch — 20 beta users, feedback, fixes |
| 18 | [ ] | Public launch |

**Phase 0 is not a code phase.** It is done before Claude Code opens.
It produces three documents:
1. `/docs/scoring-rules.md` — founder-written astrological rules
2. Legal entity registered, business bank account open
3. All external accounts created (Supabase, Stripe, Vercel,
   Anthropic, Resend, GitHub, Hetzner, Sentry, BetterUptime)

Update [ ] to [x] as phases are completed.

---

## Environment Variables

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Anthropic
ANTHROPIC_API_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_PRO_MONTHLY_PRICE_ID=
STRIPE_PRO_ANNUAL_PRICE_ID=
STRIPE_EXTRA_PROFILE_PRICE_ID=

# Resend
RESEND_API_KEY=

# Sentry
SENTRY_DSN=

# App
NEXT_PUBLIC_APP_URL=
```

---

## Session Rules — Read Every Time

1. Read this file completely before doing anything
2. State which phase we are currently in
3. State which files you will touch before touching them
4. Never touch files outside the stated scope for this session
5. Never refactor code that was not explicitly asked for
6. If a change requires touching more than 3 files, stop and
   ask for confirmation before proceeding
7. Files must stay under 150 lines — split if approaching limit
8. Write a test for every new function added to /lib
9. All colors, fonts, spacing must come from /styles/tokens.css —
   never hardcode design values in components
10. Never use the word "AI" anywhere in UI-facing copy or components
11. Astrological scoring logic must follow /docs/scoring-rules.md
    exactly — never invent or assume astrological rules
12. If unsure about astrological logic, stop and ask the founder
13. After completing a task update the Current Session section
    and mark any newly completed phases above
14. This is a solo-maintained product — prefer simple and reliable
    over clever and complex

---

## Code Style

- JavaScript (not TypeScript) for speed of iteration
- Async/await throughout — no raw promise chains
- All errors caught, logged to Sentry — no silent failures
- One-line comment at top of every file describing its purpose
- Descriptive variable names — no abbreviations
- Readable over concise — no clever one-liners
- CSS variables only — never hardcoded color or font values

---

## Do Not Touch

- `/lib/astro/ephemeris/` — Swiss Ephemeris core, never edit
- `/docs/scoring-rules.md` — only the founder edits this file
- `.env.local` — never log or expose environment variables
- `/styles/tokens.css` — only edit if explicitly asked to
- Stripe webhook signature verification — never remove this check
- Supabase row-level security policies — never disable

---

## Current Session

**Goal**: [fill in at start of each session]
**Phase**: [fill in at start of each session]
**Working on**: [fill in at start of each session]
**Off limits today**: [fill in at start of each session]
