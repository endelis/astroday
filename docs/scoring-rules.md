# Astroday — Astrological Scoring Rules
# Source of truth for all calculation logic.
# Only the founder edits this file.
# Claude Code reads and implements — never invents or modifies.

---

## Foundational Principles

### How Scoring Works

Each day, the app compares the user's natal (birth) chart positions
against the current planetary transits in the sky. When a transiting
planet forms a significant geometric angle (aspect) to a natal planet,
it activates energy in the life area that planet governs.

The result is a score for each of the 5 categories:
- GREEN — harmonious aspect, energy flows easily, favourable to act
- RED — tense aspect, friction or excess energy, proceed with caution
- GREY — no significant aspect active, neutral, neither aided nor blocked

### Aspect Types and Their Nature

```
HARMONIOUS (produce GREEN):
  Trine        120°   Strong, effortless flow, natural ease
  Sextile       60°   Gentle support, opportunity with some effort
  Conjunction    0°   Fusion of energies — see planet notes below
                      (conjunction quality depends on planets involved)

TENSE (produce RED):
  Square        90°   Friction, pressure, challenge requiring action
  Opposition   180°   Tension, polarity, pulled in two directions

NEUTRAL (produce GREY):
  No aspect active, or only minor aspects (semi-sextile 30°,
  quincunx 150°) within orb
```

### Orb Tolerances

```
Major aspects (trine, sextile, square, opposition): 6° orb
Conjunction: 8° orb (stronger influence, wider tolerance)
Minor aspects (semi-sextile, quincunx): 3° orb — these
  produce GREY only, never GREEN or RED
```

### Retrograde Rule (Applies to All Categories)

When the category's governing planet is retrograde:
- GREEN aspects are downgraded to GREY
  (energy is present but internalized, harder to express outwardly)
- RED aspects remain RED (tension is still active)
- GREY remains GREY

Exception: Mercury retrograde has specific additional rules
— see Contacts category below.

---

## Category 1 — CONTACTS
*Communication, calls, emails, documents, meetings, negotiations*

### Governing Planet
**Mercury** — primary and sole governing planet for this category.
Mercury rules all forms of communication: speech, writing, email,
documents, contracts, short trips, negotiations, and information flow.

### Aspect Scoring

**GREEN — favourable for communication and outreach:**
```
Transit Mercury trine natal Mercury         Strong, clear thinking,
                                            words land well
Transit Mercury trine natal Sun             Confident communication,
                                            good day to pitch or present
Transit Mercury trine natal Moon            Emotional intelligence high,
                                            rapport comes easily
Transit Mercury trine natal Ascendant       Personality shines through,
                                            first impressions strong
Transit Mercury sextile natal Mercury       Gentle support for communication
Transit Mercury sextile natal Sun           Good day for outreach
Transit Mercury sextile natal Moon          Warm, receptive conversations
Transit Jupiter trine natal Mercury         Broad, optimistic communication,
                                            good for proposals and big ideas
Transit Jupiter sextile natal Mercury       Opportunities through talking,
                                            good for introductions
Transit Sun trine natal Mercury             Mental clarity high,
                                            good day for important emails
Transit Venus trine natal Mercury           Diplomatic, persuasive tone,
                                            good for sensitive conversations
```

**RED — tense, friction in communication:**
```
Transit Mercury square natal Mercury        Scattered thinking, miscommunication
                                            likely, double-check everything
Transit Mercury square natal Sun            Ego in communication, risk of
                                            being misunderstood or too blunt
Transit Mercury square natal Moon           Emotional miscommunication,
                                            words taken out of context
Transit Mercury opposition natal Mercury    Communication at cross purposes,
                                            opposing views clash
Transit Mercury opposition natal Sun        Push-pull in conversations,
                                            hard to find common ground
Transit Mars square natal Mercury           Sharp tongue, arguments likely,
                                            risk of sending reactive messages
Transit Mars opposition natal Mercury       Combative communication,
                                            temper affects clarity
Transit Saturn square natal Mercury         Heavy, slow communication,
                                            delays in responses, pessimism
Transit Saturn opposition natal Mercury     Blocked communication,
                                            negotiations stall
Transit Neptune square natal Mercury        Confusion, unclear information,
                                            misunderstandings almost certain
```

**GREY — neutral:**
```
No significant aspect active
Minor aspects only (semi-sextile, quincunx) within orb
Transit Mercury conjunct natal Saturn       Serious but slow — not red,
                                            not green, cautious grey
```

### Mercury Retrograde — Special Rules

Mercury retrograde occurs 3 times per year for approximately 3 weeks.
This is the single most significant modifier for the Contacts category.

```
During Mercury retrograde (all 3 weeks):
  - Contacts category is ALWAYS at minimum GREY
    regardless of aspects
  - GREEN aspects become GREY (energy turns inward,
    outward communication becomes unreliable)
  - RED aspects remain RED and are intensified
  - The app displays the planetary event banner:
    "Mercury retrograde — communications need extra
    care through [end date]"

What retrograde means practically for Contacts insights:
  - Avoid launching new communication campaigns
  - Double-check all emails before sending
  - Misunderstandings are significantly more likely
  - Good period to REVIEW past communications,
    reconnect with old contacts, refine messaging
  - Existing conversations can complete but new
    agreements should wait where possible

Shadow periods (2 weeks before and after retrograde):
  - Reduce GREEN strength slightly — treat strong
    GREEN as moderate GREEN during shadow periods
  - No full retrograde rules apply, just gentle caution
```

### Conflict Resolution — Contacts

When multiple aspects are active on the same day:

```
Priority order (highest wins):
1. Mercury retrograde active → minimum GREY, RED stays RED
2. RED aspect from Mars or Saturn → RED overrides GREEN
3. Multiple GREEN aspects → stays GREEN (reinforced)
4. Mixed GREEN and minor RED → GREY
5. GREEN alone → GREEN
6. No significant aspect → GREY

Tie-break: if one RED and one GREEN of equal weight,
the result is GREY with a note that energy is mixed.
```

---

## Category 2 — MONEY
*Finances, income, expenses, invoices, budgets, material resources,
aesthetics, valuations, negotiations over price*

### Governing Planets
**Venus** — primary planet. Rules money, values, material resources,
aesthetics, and all financial transactions.
**Jupiter** — secondary planet. Rules expansion, abundance, growth,
and large financial opportunities.

Both planets are assessed. The stronger signal wins.
If Venus is RED and Jupiter is GREEN, see conflict resolution below.

### Aspect Scoring

**GREEN — favourable for financial activity:**
```
Transit Venus trine natal Venus             Best financial aspect — natural
                                            ease with money, good for invoicing,
                                            negotiations, financial decisions
Transit Venus trine natal Jupiter           Excellent — abundance, lucky
                                            financial timing, strong for deals
Transit Venus trine natal Sun               Confidence in financial matters,
                                            good for pitches involving money
Transit Venus trine natal Moon              Emotionally settled, good for
                                            financial conversations
Transit Venus sextile natal Venus           Gentle financial support, good
                                            day for routine money tasks
Transit Venus sextile natal Jupiter         Mild financial opportunity,
                                            good for follow-ups on proposals
Transit Jupiter trine natal Venus           Expansive financial energy,
                                            good for financial agreements,
                                            abundance consciousness high
Transit Jupiter trine natal Jupiter         Excellent for financial growth,
                                            investments, long-term financial
                                            planning conversations
Transit Jupiter sextile natal Venus         Moderate financial opportunity,
                                            good for pricing conversations
Transit Sun trine natal Venus               Harmonious financial energy,
                                            pleasant financial interactions
Transit Venus conjunct natal Jupiter        Strong financial opportunity,
                                            treat as GREEN (benefic conjunction)
Transit Jupiter conjunct natal Venus        Strong abundance energy,
                                            treat as GREEN (benefic conjunction)
```

**RED — tense, financial friction or risk:**
```
Transit Venus square natal Venus            Financial stress, overspending
                                            risk, difficult money conversations
Transit Venus square natal Saturn           Financial restriction, austerity
                                            energy, bad day for spending
                                            or financial requests
Transit Venus opposition natal Saturn       Financial confrontation,
                                            difficult to get financial
                                            agreements through
Transit Saturn square natal Venus           Contraction in finances, delays
                                            in payment, financial caution needed
Transit Saturn opposition natal Venus       Blocked financial flow,
                                            hard to close financial deals
Transit Mars square natal Venus             Impulsive spending risk,
                                            financial arguments possible
Transit Venus square natal Mars             Rash financial decisions,
                                            cost overruns likely
Transit Venus retrograde (every 18 months, ~40 days):
                                            Re-evaluate finances, avoid
                                            major new financial commitments,
                                            score drops to GREY minimum
                                            (same rules as Mercury retrograde
                                            but for Money category)
```

**GREY — neutral:**
```
No significant aspect active to Venus or Jupiter
Minor aspects only within orb
Transit Venus conjunct natal Saturn         Serious financial energy —
                                            conservative but not blocked,
                                            grey not red
```

### Conflict Resolution — Money

```
Priority order:
1. Venus retrograde active → minimum GREY
2. Saturn square or opposition to Venus → RED overrides Jupiter GREEN
3. Jupiter GREEN without Saturn tension → GREEN
4. Venus RED without Jupiter support → RED
5. Mixed signals (Jupiter GREEN + Venus RED) → GREY
   with insight noting the tension between opportunity and caution
6. No significant aspect → GREY
```

---

## Category 3 — RISK
*Personal energy levels, willpower, action, initiative, courage,
physical activity, use of equipment and technology,
competitive situations, speed and drive*

### Governing Planet
**Mars** — primary and sole governing planet for this category.
Mars rules personal energy, drive, action, courage, and the
capacity to push through challenges or take bold initiative.

### Important Note on Mars

Mars energy is fundamentally active — even tense aspects produce
energy, just hard to direct. The key distinction:
- GREEN Mars: energy is available AND channelable — act boldly
- RED Mars: energy is high BUT reactive — risk of mistakes, accidents,
  arguments, and burnout if pushed too hard
- GREY Mars: energy is low or ordinary — neither empowered nor blocked

### Aspect Scoring

**GREEN — energy is high and flows constructively:**
```
Transit Mars trine natal Mars               Excellent physical and
                                            competitive energy, best day
                                            to take decisive action
Transit Mars trine natal Sun                Confidence and vitality peak,
                                            strong for leadership moves
                                            and bold decisions
Transit Mars trine natal Jupiter            "All systems go" aspect —
                                            best for launching initiatives,
                                            energy + expansion combined
Transit Mars sextile natal Mars             Good energy, easier to stay
                                            focused and motivated
Transit Mars sextile natal Sun              Moderate boost in drive and
                                            confidence, good for action
Transit Mars sextile natal Jupiter          Supported action, good for
                                            beginning new enterprises
Transit Jupiter trine natal Mars            Expansive energy for action,
                                            enthusiasm runs high,
                                            good for competitive situations
Transit Sun trine natal Mars                Vitality and drive well aligned,
                                            good day for physical or
                                            competitive tasks
```

**RED — energy is tense, reactive, or scattered:**
```
Transit Mars square natal Mars              Frustration, energy out of
                                            sync, risk of accidents or
                                            overexertion — slow down
Transit Mars square natal Sun               Ego conflicts, impatience,
                                            hot temper likely — avoid
                                            confrontational meetings
Transit Mars opposition natal Mars          Energy drain or explosive
                                            release — not the day to
                                            push hard
Transit Mars opposition natal Sun           Strong tension between will
                                            and circumstance — others
                                            may push back hard
Transit Mars square natal Saturn            Blocked energy, frustration
                                            at obstacles, risk of forcing
                                            things that need patience
Transit Mars opposition natal Saturn        Hard stop — energy meets
                                            resistance, plans stall
Transit Saturn square natal Mars            Similar to above — structural
                                            blocks to forward movement
Transit Mars conjunct natal Saturn          Energy meets restriction —
                                            treat as RED (malefic conjunction)
Transit Mars square natal Uranus            Erratic, impulsive energy —
                                            high accident and error risk,
                                            drive carefully
Transit Mars opposition natal Uranus        Sudden disruptions to plans,
                                            explosive reactions possible
```

**GREY — energy is ordinary, neither boosted nor blocked:**
```
No significant aspect active to Mars
Minor aspects only within orb
Moderate aspects to outer planets (Neptune, Pluto) without
strong personal planet involvement
```

### Mars Retrograde (Every ~2 years for ~2.5 months)
```
During Mars retrograde:
  - Energy turns inward — motivation may feel lower than usual
  - GREEN aspects become GREY (drive is present but harder to direct)
  - RED aspects remain RED
  - Insight should advise: plan and prepare rather than launch,
    review strategies, complete existing projects
  - Not a time to start major new initiatives requiring high energy
```

### Conflict Resolution — Risk

```
Priority order:
1. Mars retrograde → minimum GREY
2. Mars square or opposition Saturn → RED (blocked energy)
3. Mars square or opposition Uranus → RED (erratic energy)
4. Mars trine Jupiter or Sun → GREEN (best energy day)
5. Mixed (one GREEN, one RED) → RED with caution note
   (Mars tension is never simply cancelled — it must be acknowledged)
6. No aspect → GREY
```

---

## Category 4 — NEW PROJECTS
*New ventures, ideas, opportunities, campaigns, travel, foreign business,
legal matters, education, publishing, expansion into new territory*

### Governing Planet
**Jupiter** — primary and sole governing planet for this category.
Jupiter rules expansion, new opportunities, foreign connections,
higher learning, legal matters, travel, and the beginning of
anything that represents growth into new territory.

### Aspect Scoring

**GREEN — favourable for new beginnings and expansion:**
```
Transit Jupiter trine natal Jupiter         Best aspect for new beginnings —
                                            natural growth, opportunities
                                            appear without forcing
Transit Jupiter trine natal Sun             Excellent — confidence, luck,
                                            recognition all support new moves
Transit Jupiter trine natal Moon            Emotional enthusiasm supports
                                            new ventures, good reception
Transit Jupiter trine natal Ascendant       New beginnings flow naturally,
                                            others are receptive to your ideas
Transit Jupiter trine natal Midheaven       Career expansion supported,
                                            professional new projects favoured
Transit Jupiter sextile natal Jupiter       Gentle support for new ideas,
                                            opportunities available with effort
Transit Jupiter sextile natal Sun           Moderate growth energy, good
                                            for proposals and pitches
Transit Jupiter conjunct natal Jupiter      Jupiter return — major new
                                            beginning cycle, treat as
                                            strong GREEN (occurs every ~12 years)
Transit Jupiter conjunct natal Sun          Significant new beginning energy,
                                            strong GREEN (occurs ~once per year)
Transit Sun trine natal Jupiter             Good day for new ideas and
                                            optimistic outreach
Transit Venus trine natal Jupiter           New opportunities through
                                            relationships and financial channels
```

**RED — tense, expansion meets obstacles or overreach:**
```
Transit Jupiter square natal Jupiter        Overconfidence, plans too big,
                                            risk of overcommitting to new projects
Transit Jupiter opposition natal Jupiter    Temptation to expand but external
                                            resistance — not the right moment
Transit Jupiter square natal Saturn         New ideas meet structural limits,
                                            legal or bureaucratic friction
Transit Saturn square natal Jupiter         Contraction overrides expansion —
                                            not a favourable time for new starts
Transit Saturn opposition natal Jupiter     Obstacles to growth — if you
                                            must begin something, proceed with
                                            maximum preparation
Transit Neptune square natal Jupiter        New ideas clouded by unrealism,
                                            risk of starting something based
                                            on false premises
```

**GREY — neutral for new projects:**
```
No significant aspect active to Jupiter
Minor aspects only within orb
Jupiter in retrograde without other aspects — see below
```

### Jupiter Retrograde (Once per year, ~4 months)
```
During Jupiter retrograde:
  - Growth turns inward — good for reviewing and refining
    existing projects, not for launching new ones
  - GREEN aspects become GREY
  - RED aspects remain RED
  - Insight should advise: reflect on current projects,
    refine plans, prepare for launch after retrograde ends
  - Not a hard stop — more a "slow down and review" signal
```

### Conflict Resolution — New Projects

```
Priority order:
1. Jupiter retrograde → minimum GREY
2. Saturn square or opposition → RED (blocks expansion)
3. Jupiter trine Sun or Jupiter → GREEN
4. Jupiter sextile without Saturn tension → GREY-leaning GREEN
   (opportunity exists but requires effort — moderate green)
5. Mixed signals → GREY with note on the tension
6. No aspect → GREY
```

---

## Category 5 — DECISIONS
*Long-term commitments, contract signing, agreements,
major business decisions, dealings with authorities and institutions,
anything requiring binding commitment over time*

### Governing Planet
**Saturn** — primary and sole governing planet for this category.
Saturn rules structure, commitment, long-term consequences,
contracts, discipline, authority, institutions, and the weight
of decisions that will endure over time.

### Important Note on Saturn

Saturn is the "cosmic adult" — it tests and consolidates. Even
harmonious Saturn transits feel serious and weighty. The distinction:
- GREEN Saturn: conditions are stable and solid — what you commit to
  now will hold and endure. A serious but excellent time for contracts.
- RED Saturn: existing structures are under stress — commitments made
  now may be built on unstable ground or face significant resistance.
- GREY Saturn: no particular support or challenge — proceed normally
  with appropriate due diligence.

### Aspect Scoring

**GREEN — excellent for long-term commitments and contracts:**
```
Transit Saturn trine natal Saturn           Best aspect for major decisions —
                                            solid, stable, what you build
                                            now will last. Sign contracts.
Transit Saturn trine natal Sun              Identity and structure align —
                                            excellent for authoritative
                                            commitments and agreements
Transit Saturn trine natal Jupiter          Long-term financial decisions
                                            supported, good for major
                                            business agreements
Transit Saturn trine natal Moon             Emotional stability supports
                                            serious decisions, good for
                                            institutional dealings
Transit Saturn trine natal Mercury          Clear-headed, methodical thinking —
                                            good for negotiating and
                                            reviewing contracts
Transit Saturn sextile natal Saturn         Moderate support for decisions,
                                            good for routine agreements
Transit Saturn sextile natal Sun            Stable energy for commitments,
                                            good for professional decisions
Transit Jupiter trine natal Saturn          Expansion meets structure —
                                            excellent for legally binding
                                            agreements involving growth
Transit Sun trine natal Saturn              Good day for formal decisions,
                                            dealings with authorities
```

**RED — tense, decisions made now may be unstable:**
```
Transit Saturn square natal Saturn          Saturn challenging itself —
                                            structural stress, decisions
                                            made now may require revision,
                                            avoid major commitments
Transit Saturn opposition natal Saturn      Major life restructuring period —
                                            what no longer serves falls away,
                                            not the time for new long-term
                                            commitments
Transit Saturn square natal Sun             Will under pressure — avoid
                                            major commitments, existing
                                            structures are being tested
Transit Saturn opposition natal Sun         Identity challenge — wait for
                                            this to pass before signing
                                            anything long-term
Transit Saturn square natal Jupiter         Legal and expansionary decisions
                                            meet obstacles — not the time
                                            for growth-oriented agreements
Transit Saturn conjunct natal Saturn        Saturn return — major life
                                            restructuring, not ideal for
                                            new long-term commitments
                                            (occurs ~every 29 years)
Transit Pluto square natal Saturn           Deep structural transformation —
                                            existing commitments may be
                                            fundamentally challenged
```

**GREY — neutral for decisions:**
```
No significant aspect active to Saturn
Minor aspects only within orb
Saturn in retrograde without other aspects — see below
```

### Saturn Retrograde (Once per year, ~4.5 months)
```
During Saturn retrograde:
  - Accountability turns inward — good time to review
    existing commitments, not to make new ones
  - GREEN aspects become GREY (support is present but muted)
  - RED aspects remain RED
  - Insight should advise: review existing agreements,
    audit commitments, prepare for decisions after retrograde
  - Not a hard block — more a "review before committing" signal
  - If a decision MUST be made during retrograde, advise
    building in more review periods and revisit clauses
```

### Mercury Retrograde Effect on Decisions
```
Mercury retrograde affects the CONTACTS category primarily.
However, it has a secondary effect on Decisions:
  - Any contract signing during Mercury retrograde is
    considered less stable even if Saturn score is GREEN
  - When Mercury is retrograde AND Saturn score is GREEN,
    downgrade Decisions to GREY with note:
    "Saturn supports this decision but Mercury retrograde
    means communications around this agreement may be unclear.
    Review every word before signing."
  - When Mercury is retrograde AND Saturn score is RED,
    Decisions stay RED
```

### Conflict Resolution — Decisions

```
Priority order:
1. Saturn return (Saturn conjunct natal Saturn) → RED always
2. Saturn opposition natal Saturn → RED
3. Mercury retrograde active + Saturn GREEN → GREY with warning
4. Saturn square Sun or Saturn → RED
5. Saturn trine Saturn or Sun with no tension → GREEN
6. Jupiter trine Saturn without tension → GREEN
7. Saturn retrograde without RED aspect → GREY
8. No significant aspect → GREY
```

---

## Overall Day Score

The daily overall score (shown in the daily paragraph and background
warmth) is derived from the aggregate of all 5 categories:

```
Count of GREEN categories → overall tone

5 GREEN:           Exceptional day — rare, note it
4 GREEN, 0 RED:    Strong positive day — GREEN overall
3 GREEN, 0-1 RED:  Good day — GREEN overall
2 GREEN, 2 RED:    Mixed day — GREY overall
1 GREEN, 3 RED:    Challenging day — RED overall
0 GREEN, 4-5 RED:  Difficult day — RED overall, handle with care
All GREY:          Flat day — GREY overall

If split is exactly even (e.g. 2 GREEN, 2 RED, 1 GREY):
  → GREY overall, note the split in the daily paragraph
```

The overall background warmth shift follows the overall score:
- GREEN overall → slight warmth in dark palette (#0D0E14 → #0F100A)
- RED overall → slight coolness (#0D0E14 → #0D0F18)
- GREY overall → no change from base

---

## Planetary Events — Automatic Banners

The following events always trigger the in-app banner and email alert
regardless of individual category scores:

```
Mercury retrograde     3x/year, ~3 weeks each
                       "Mercury retrograde — communications need
                       extra care through [end date]"

Venus retrograde       Every ~18 months, ~40 days
                       "Venus retrograde — review finances and
                       existing agreements rather than initiating"

Mars retrograde        Every ~2 years, ~2.5 months
                       "Mars retrograde — energy turns inward.
                       Plan and prepare rather than push forward"

Jupiter retrograde     Once per year, ~4 months
                       "Jupiter retrograde — a period for refining
                       existing projects rather than new launches"

Saturn retrograde      Once per year, ~4.5 months
                       "Saturn retrograde — review commitments and
                       audit existing agreements"

Full moon              Monthly (display for 1 day)
                       "Full moon — emotions and situations reach
                       a peak. A natural time for completion and release"

New moon               Monthly (display for 1 day)
                       "New moon — a natural window for setting
                       intentions and beginning new cycles"

Solar/Lunar eclipse    As they occur (display for 3 days)
                       "Eclipse — significant turning point energy.
                       Avoid rushed decisions for the next few days"
```

---

## Birth Data Accuracy and Scoring Impact

```
Full accuracy (date + time + location):
  All 5 categories calculated with full precision.
  Rising sign, Midheaven, and house positions included.
  Highest confidence in scores.

Good accuracy (date + location, no time):
  All 5 categories calculated using noon birth time assumption.
  Rising sign and exact Midheaven unknown — aspects to
  Ascendant and Midheaven excluded from calculation.
  Note in every insight: "Based on your birth date and location.
  Adding your birth time would improve accuracy."

Basic accuracy (date only):
  All 5 categories calculated using noon birth time, 
  Greenwich location assumption.
  Only aspects to Sun, Moon (approximate), Mercury, Venus,
  Mars, Jupiter, Saturn calculated.
  Note in every insight: "Based on your birth date only.
  Adding your birth time and location would significantly
  improve the accuracy of these insights."
```

---

## Conjunction Rules Summary

Conjunctions require case-by-case assessment based on the
nature of the planets involved:

```
Benefic conjunctions (treat as GREEN):
  Venus conjunct Jupiter    Financial abundance, opportunity
  Jupiter conjunct Venus    Same as above
  Venus conjunct Sun        Warmth, harmony, good reception
  Jupiter conjunct Sun      Confidence, luck, expansion

Neutral conjunctions (treat as GREY, assess by context):
  Mercury conjunct Sun      Cazimi effect — mental clarity
                            but possible information overload
  Saturn conjunct Mercury   Serious, slow thinking — not bad,
                            just heavy and methodical

Malefic conjunctions (treat as RED):
  Mars conjunct Saturn      Energy meets hard block — frustration
  Saturn conjunct Mars      Same as above
  Mars conjunct natal Sun   High energy but reactive — caution
```

---

## Aspect Weight Table

When multiple aspects compete, use this weight table to determine
which signal is dominant:

```
Conjunction (major planets):    Weight 10
Trine:                          Weight 8
Opposition:                     Weight 7
Square:                         Weight 7
Sextile:                        Weight 5
Semi-sextile:                   Weight 2 (minor — GREY only)
Quincunx:                       Weight 2 (minor — GREY only)

Planet importance for natal targets:
  Sun:          Weight modifier ×1.5
  Moon:         Weight modifier ×1.3
  Ascendant:    Weight modifier ×1.2
  Midheaven:    Weight modifier ×1.2
  Other natal:  Weight modifier ×1.0

Final score = aspect weight × planet modifier
Highest score wins in conflict situations.
If scores are within 2 points of each other → GREY (mixed signal)
```

---

## Notes for Future Refinement

These rules represent the initial scoring logic based on established
Western astrology principles. They should be reviewed and refined
over time as user journal data accumulates and patterns emerge.

Specifically worth reviewing after 6 months of live data:
- Whether orb tolerances need tightening or widening
- Whether any category governing planets need secondary influences added
- Whether the conflict resolution priority orders match observed reality
- Whether users consistently note that certain aspect combinations
  produce results that differ from the scoring logic

The founder should update this document as understanding deepens.
Claude Code implements only what is written here — never invents.
