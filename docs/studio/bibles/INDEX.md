# Design Operating System — Bible Registry

Each bible is a **living document** owned by a discipline lead. Bibles are versioned, searchable, and referenced by every decision record and review.

| Bible | Owner Role | File | Status | Version |
|-------|------------|------|--------|---------|
| Game Design | Gameplay Director | `GAME-DESIGN-BIBLE.md` | Draft | 0.1 |
| Art | Art Director | `ART-BIBLE.md` | Planned | — |
| Audio | Audio Director | `AUDIO-BIBLE.md` | Planned | — |
| Narrative | Creative Director | `NARRATIVE-BIBLE.md` | Planned | — |
| Level Design | Gameplay Director | `LEVEL-DESIGN-BIBLE.md` | Draft | 0.1 |
| Enemy Design | Gameplay Director | `ENEMY-DESIGN-BIBLE.md` | Planned | — |
| Boss Design | Gameplay Director | `BOSS-DESIGN-BIBLE.md` | Planned | — |
| Economy | Creative Director | `ECONOMY-BIBLE.md` | Planned | — |
| Accessibility | UX Lead | `ACCESSIBILITY-BIBLE.md` | Draft | 0.1 |

## Bible Structure (Required Sections)

Every bible must contain:

1. **Vision** — How this discipline serves the five gameplay pillars
2. **Principles** — Non-negotiable rules (max 10)
3. **Standards** — Measurable targets and budgets
4. **Patterns** — Approved reusable patterns
5. **Anti-patterns** — Explicit forbidden approaches
6. **References** — Inspiration with attribution
7. **Changelog** — Version history with rationale

## Governance

- Bible changes require a **Decision Record** (DECOS) when they alter principles or standards
- AI Studio Director runs **vision drift detection** against bibles weekly
- Bibles are indexed in the Knowledge Operating System (`KOS/bibles/`)

## Seed Content

`GAME-DESIGN-BIBLE.md`, `LEVEL-DESIGN-BIBLE.md`, and `ACCESSIBILITY-BIBLE.md` inherit from POS v3.0 Part I (Design Constitution) until expanded by review cycles.
