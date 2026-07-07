# Game Design Research Platform (GDIL Research)

**Evolution of:** [CREATIVE-GAME-DESIGN-PLATFORM.md](./CREATIVE-GAME-DESIGN-PLATFORM.md) v2.1  
**Shift:** Generate content → **Discover unexplored gameplay possibilities**  
**Mode:** Research, not management · Hypothesis → evidence → revision  
**Constraint:** No new layers · POS/SOL unchanged · No implementation code in this document

---

## Permanent Stack (Complete — Do Not Extend)

```
GDIL Research  ←  hypothesis discovery, evidence, revision (this document)
GDIL v2.1      ←  content synthesis when research matures
GDIL v2.0      ←  active optimization, prediction, replay
GDIL v1.0      ←  fun model, DNA, DAP (ship gate only)
SOL            ←  studio operations
POS            ←  engineering execution
```

v2.1 generators become **experiment apparatus** — they produce testable artifacts from research hypotheses, not production defaults.

```
┌─────────────────────────────────────────────────────────────────┐
│              GDIL RESEARCH — DISCOVERY LAYER                    │
│  Hypotheses · Genome · Ecology · Emergence · Journey · Moments  │
│  Delight/Wonder · Creative Search · Human Research Partnership  │
├─────────────────────────────────────────────────────────────────┤
│  GDIL v2.1 Creative Platform  (synthesis when hypothesis ready) │
│  GDIL v2.0 Active Intelligence                                  │
│  GDIL v1.0 Governance                                           │
│  SOL · POS · Game                                               │
└─────────────────────────────────────────────────────────────────┘
```

**Research outputs (not governance tokens):**

| Output | Meaning |
|--------|---------|
| `HYP-{id}` | Testable gameplay hypothesis |
| `EVD-{id}` | Evidence bundle (telemetry, replay, survey, sim) |
| `GENE-{id}` | Mechanic genome record |
| `PRIN-{id}` | Evolved design principle (versioned) |
| `EMRG-{id}` | Emergent interaction finding |
| `MOM-{id}` | Memorable moment spec |
| `RESLOG-{date}` | Living research log entry |
| `OPEN-{id}` | Unresolved research question |

Mature hypotheses graduate to v2.1 `PROP-*` → existing DAP → WAP. Research does not add gates.

**Scientific rigor:** [GAMEPLAY-RESEARCH-SYSTEM.md](./GAMEPLAY-RESEARCH-SYSTEM.md) — falsification, Bayesian updating, portfolio optimization, explainable research. Final research extension; architecture frozen.

---

# 1. GAMEPLAY DISCOVERY RESEARCH

## Purpose

Formulate hypotheses about **unexplored gameplay spaces** — regions of design neither shipped nor rejected — and run rapid evaluation cycles to collect evidence before synthesis.

## Architecture

```
research/discovery/
├── HypothesisRegistry.ts     # HYP-* open/confirmed/refuted
├── SpaceMapper.ts            # unexplored vs explored vs dead zones
├── RapidEvaluator.ts         # cheap sim + paper + sandbox criteria
└── registry/HYP-INDEX.md
```

## Conceptual Algorithms

**1. Gap detection**

```
unexplored_space = design_space
  - mechanic_genome_coverage
  - creative_memory_success_regions
  - dead_zones(CRE-FAIL anti-patterns)

FOR gap IN unexplored_space ranked by (archetype_gap × pillar_deficit):
  EMIT HYP: "What if {verb} + {context} produces {fun_driver lift}?"
```

**2. Rapid evaluation tier**

```
Tier R0: paper prototype (grammar sketch + prediction) — 2h
Tier R1: sandbox stub (POS Phase 17 when built) — 1 day
Tier R2: focused playtest n=3 — 2 days
Promote to v2.1 synthesis only if EVD supports hypothesis
```

**3. Evidence collection**

```
EVD bundles: { hypothesis, method, raw_signals, conclusion, confidence }
conclusion ∈ { supported, refuted, inconclusive, needs_more }
```

## Required Evidence

- Stated null hypothesis and success criteria before test  
- At least one quantitative signal (metric, sim score, or timed observation)  
- Human observation note for any `supported` promotion  

## Validation Strategy

- Track hypothesis confirmation rate vs random baseline  
- Blind review: are HYP statements falsifiable?  
- Retroactive: known good mechanics (jump) would have been discoverable from gap map  

## KPIs

| KPI | Target |
|-----|--------|
| Open HYP count | 5–15 active |
| Time HYP → first EVD | <5 days |
| Confirmation precision | ≥50% of `supported` succeed in R2 |
| Dead zone avoidance | 0 retests of CRE-FAIL without new HYP |
| Unexplored space coverage / quarter | +10% |

## Risks

| Risk | Mitigation |
|------|------------|
| Unfalsifiable hypotheses | Require null + metric before registration |
| Research without action | Cap open HYP; force refute or promote |
| Duplicate exploration | SpaceMapper deduplication |

## Integration (v2.1)

| Link | Role |
|------|------|
| Creative Search | Seeds HYP from broad concepts |
| Mechanic Genome | Maps coverage gaps |
| v2.1 generators | Produce R1 artifacts for HYP |
| Creative Memory | Dead zones + success regions |
| Human Research Partnership | Validates HYP priority |

---

# 2. MECHANIC GENOME

## Purpose

Model mechanics as **composable design genes** — inheritance, compatibility, evolutionary relationships — with visualizable mechanic families.

## Architecture

```
research/genome/
├── GeneSchema.ts             # verb, constraint, expression, coupling
├── GenomeComposer.ts         # combine genes → candidate mechanic
├── PhylogenyBuilder.ts       # family trees
└── viz/mechanic-families.graph.json
```

## Gene Schema (Conceptual)

```yaml
gene:
  id: GENE-air-control
  locus: movement
  alleles: [low, medium, high]
  expresses: { air_control: 0.8 }
  compatible_with: [GENE-jump-impulse, GENE-coyote]
  incompatible_with: [GENE-rigid-jump]
  inherits_from: GENE-basic-jump
  fun_driver_affinity: [expression, mastery]
```

## Conceptual Algorithms

**1. Composition**

```
mechanic = express(genotype)
  where genotype = { GENE-a: allele_x, GENE-b: allele_y, ... }
  VALIDATE compatibility matrix
  PREDICT fun_driver vector via allele weights
```

**2. Phylogeny**

```
Build tree from Mechanic Evolution lineage + gene overlap
Cluster: jump_family, momentum_family, enemy_interaction_family
Visualize: directed acyclic graph with branch labels (experiment ids)
```

**3. Novel genotype search**

```
MUTATE genotype (single allele flip or gene swap)
FILTER incompatible + DNA identity guard
SCORE novelty vs catalog + predicted fun
→ feed Creative Search
```

## Required Evidence

- Gene definitions cite MKB or HYP source  
- Compatibility edges validated by Interaction Matrix or EVD  
- Phylogeny updated when mechanic merges/retires  

## Validation Strategy

- M1–M8 map cleanly to gene families  
- Incompatible gene pairs fail in sandbox when built  
- Phylogeny matches Mechanic Evolution DAG  

## KPIs

| KPI | Target |
|-----|--------|
| Gene catalog coverage (shipped mechanics) | 100% |
| Compatibility prediction accuracy | ≥80% |
| Novel genotype → supported HYP rate | ≥25% |
| Family visualization freshness | Per mechanic change |

## Risks

| Risk | Mitigation |
|------|------------|
| Over-abstraction | Genes must map to playable verbs |
| False compatibility | Require EVD for new edges |
| Genome explosion | Cap active genes; retire unused |

## Integration (v2.1)

| Link | Role |
|------|------|
| Mechanic Ecology | Genes as ecosystem species |
| Emergent Simulation | Genotype combos as inputs |
| Encounter Generator | ENC genes from genome |
| Design DNA Evolution | Principles constrain allele bounds |

---

# 3. DESIGN DNA EVOLUTION

## Purpose

Treat Nintendo DNA and project principles as **evidence-based hypotheses** — versioned, revised, retired — while preserving core identity anchor.

## Architecture

```
research/dna-evolution/
├── PrincipleRegistry.ts      # PRIN-* versioned
├── IdentityAnchor.ts         # immutable core (3–5 rules)
├── EvidenceLinker.ts         # EVD → principle revision
└── principles/PRIN-INDEX.md
```

## Identity Anchor (Immutable)

Examples — project-specific, not genre-generic:

1. Movement is the primary verb  
2. Failure teaches quickly  
3. Discovery rewards curiosity  
4. Readable space before spectacle  

*Anchor rules cannot retire; only interpret.*

## Conceptual Algorithms

**1. Principle lifecycle**

```
PRIN v1.0 → accumulate EVD → { confirm | revise | retire }
revise: fork PRIN v1.1 with changelog + dissent
retire: mark superseded; link replacement PRIN
confirm: increase confidence score
```

**2. Revision trigger**

```
IF playtest contradicts principle prediction ≥3 times:
  PROPOSE revision HYP
  RUN targeted experiment
  Human Research Partner approves anchor-safe revision
```

**3. Confidence score**

```
confidence(P) = f(supporting_EVD, contradicting_EVD, recency)
display on all v2.1 synthesis — low confidence → wider CREVAL uncertainty
```

## Required Evidence

- Every PRIN revision links ≥2 EVD records  
- Human sign-off on any anchor interpretation change  
- Retired principles preserve historical context  

## Validation Strategy

- DNA-04 (joyful movement) revision dry-run with jump preset evidence  
- No principle retires without replacement or explicit "context-limited" tag  

## KPIs

| KPI | Target |
|-----|--------|
| Principle confidence (mean) | ≥0.7 at ship |
| Revisions with evidence | 100% |
| Anchor violations in shipped content | 0 |
| Stale principles (>6mo no EVD) | Flag for review |

## Risks

| Risk | Mitigation |
|------|------------|
| Identity drift | Anchor + confidence floors |
| Principle churn | Max 1 revision/quarter without HYP |
| Documentation theater | Only version on evidence |

## Integration (v2.1)

| Link | Role |
|------|------|
| Creativity Evaluation | DNA compliance uses PRIN version |
| Creative Search | Identity anchor as hard boundary |
| Gameplay Discovery | Gaps near low-confidence principles |

---

# 4. MECHANIC ECOLOGY

## Purpose

Model mechanics as an **ecosystem** — reinforcement, competition, invalidation — detect fragile combos and opportunities for richer systemic play.

## Architecture

```
research/ecology/
├── EcologicalGraph.ts        # symbiosis / competition edges
├── FragilityDetector.ts      # brittle combinations
├── NicheAnalyzer.ts          # underserved ecological niches
└── reports/ECO-{date}.md
```

## Relationship Types

| Edge | Meaning | Example |
|------|---------|---------|
| **Reinforces** | Together increase fun driver | double jump + vertical worlds |
| **Competes** | Same player attention | ground pound vs stomp timing |
| **Invalidates** | One removes need for other | infinite float vs precise jump |
| **Parasitic** | Fun from one hides weakness of other | speed boost masking bad camera |

## Conceptual Algorithms

**1. Ecological graph**

```
Extend Gameplay Dependency Graph with signed ecological edges
weight = telemetry_co_lift - redundancy_penalty
```

**2. Fragility detection**

```
fragile(S) if: small param perturbation → edge type flip
            OR single_mechanic_removal collapses segment fun
            OR high variance across archetypes
```

**3. Niche opportunity**

```
niche = mechanic_pair with high predicted reinforcement, zero current usage
→ HYP for Creative Search
```

## Required Evidence

- Edge claims backed by sim perturbation or A/B telemetry  
- Fragility reports include reproduction steps  
- Niche opportunities link to HYP registry  

## Validation Strategy

- Known reinforce pair (jump + moving platform) detected  
- Known invalidate pair flagged in design review  
- Remove M3 from build — predict M1-only ecology stress  

## KPIs

| KPI | Target |
|-----|--------|
| Ecological edge coverage | All shipped mechanic pairs |
| Fragile combo detection before ship | 100% P0 |
| Niche HYP → shipped feature | ≥1 per world |
| False fragile rate | <20% |

## Risks

| Risk | Mitigation |
|------|------------|
| Over-modeling | Start with shipped mechanics only |
| Ignoring context | World-specific ecology views |
| Analysis paralysis | Fragility → HYP not block |

## Integration (v2.1)

| Link | Role |
|------|------|
| Mechanic Genome | Genes as species traits |
| Emergent Simulation | Population dynamics |
| World Generator | Ecosystem composition |
| Encounter Generator | Valid ecological combos |

---

# 5. EMERGENT GAMEPLAY SIMULATION

## Purpose

Predict **unexpected interactions** across mechanics, physics, AI, rewards, environments — classify beneficial / neutral / problematic with explanations.

## Architecture

```
research/emergence/
├── EmergenceSimulator.ts     # combinatorial perturbation
├── OutcomeClassifier.ts      # beneficial | neutral | problematic
├── ExplanationGenerator.ts   # causal chain narrative
└── findings/EMRG-INDEX.md
```

## Conceptual Algorithms

**1. Combination sweep**

```
FOR combo IN sample(mechanic_genotypes × env_params × reward_states):
  RUN cheap physics/AI sim (S1/S2 tier)
  DETECT metrics outside predicted CI
  IF deviation significant: EMIT EMRG candidate
```

**2. Classification**

```
beneficial: fun_driver lift + DNA pass + no fairness violation
neutral: no significant metric change
problematic: frustration spike | exploit | soft-lock | identity break
```

**3. Explanation template**

```
"Because {A} and {B} co-occur, {physics_rule} causes {observable},
 leading to {metric_change}. Classification: {class}."
```

## Required Evidence

- Sim seed + parameter snapshot for reproduction  
- Classification reviewed by human for P0 problematic  
- Beneficial EMRG linked to MOM or HYP promotion  

## Validation Strategy

- Inject known exploit (sequence break) — must classify problematic  
- Inject designed delight combo — must classify beneficial  
- Compare to Replay Intelligence post-hoc labels  

## KPIs

| KPI | Target |
|-----|--------|
| Problematic EMRG pre-ship catch | ≥90% |
| Explanation human clarity | ≥7/10 |
| Beneficial EMRG exploited in design | ≥30% |
| Sim false positive rate | <25% |

## Risks

| Risk | Mitigation |
|------|------------|
| Sim misses human-feel emergence | Mandatory R2 for beneficial ship |
| Exploit overfitting | Bot + human replay |
| Compute cost | Tiered sampling |

## Integration (v2.1)

| Link | Role |
|------|------|
| Design Simulation v2 | Cheap eval tier |
| Interaction Matrix | Baseline expectations |
| Memorable Moment Designer | Beneficial EMRG → MOM seeds |
| Level Synthesis | Block problematic combos |

---

# 6. LONG-TERM PLAYER JOURNEY INTELLIGENCE

## Purpose

Model experience across **full playthrough** — learning, mastery, fatigue, curiosity, motivation — not isolated levels.

## Architecture

```
research/journey/
├── JourneyStateModel.ts      # latent player state over time
├── TrajectoryPredictor.ts    # session 1 → session N
├── FatigueDetector.ts
└── models/journey-state.yaml
```

## Journey State Vector (Conceptual)

```
J = { competence, mastery, fatigue, curiosity, motivation, attachment }
Updated each session segment from telemetry + survey proxies
```

## Conceptual Algorithms

**1. State transition**

```
J_{t+1} = f(J_t, segment_features, archetype_prior)
segment_features = { deaths, secrets, novelty, difficulty_delta, session_length }
```

**2. Trajectory prediction**

```
Predict J at hour 1, 3, 10, 20 for content ordering proposals
FLAG if motivation ↓ while competence ↑ (grind risk)
FLAG if fatigue ↑ without RECOVER grammar (pacing risk)
```

**3. Content ordering research**

```
HYP: "Teaching M5 before M4 improves mastery retention"
TEST via journey sim + longitudinal playtest (when available)
```

## Required Evidence

- Multi-session telemetry or staged playtest blocks  
- Survey motivation/competence at session boundaries  
- Archetype-stratified trajectories  

## Validation Strategy

- Journey model predicts quit points in historical playtests  
- Fatigue flags correlate with pause/quit events  

## KPIs

| KPI | Target |
|-----|--------|
| Quit prediction AUC | ≥0.65 |
| Motivation trough depth | <20% below peak |
| Mastery retention (session 3) | Competence slope positive |
| Fatigue without recover | 0 flagged segments shipped |

## Risks

| Risk | Mitigation |
|------|------------|
| Sparse longitudinal data | Staged 3-session mini-longitudinal |
| One-size journey | Archetype-specific trajectories |
| Overfitting content order | HYP before reorder |

## Integration (v2.1)

| Link | Role |
|------|------|
| Emotional Experience Engine | Session emotion overlays |
| Reward Economy Simulator | Motivation sinks/sources |
| World Generator | Arc ordering research |
| Delight/Wonder Modeling | Curiosity trajectory |

---

# 7. MEMORABLE MOMENT DESIGNER

## Purpose

Intentionally design **memorable gameplay moments** — model anticipation → surprise → payoff → resonance — predict memorability.

## Architecture

```
research/moments/
├── MomentComposer.ts           # beat structure templates
├── MemorabilityPredictor.ts
├── BeatLibrary.ts              # MOM-* catalog
└── templates/MOM-INDEX.md
```

## Moment Beat Structure

```
SETUP (anticipation) → TEASE → TRIGGER (surprise) → PAYOFF → ECHO (resonance)
Duration target: 5–30s core beat; echo may extend minutes
```

## Conceptual Algorithms

**1. Moment composition**

```
SELECT beat_template FROM {discovery_reveal, skill_triumph, near_miss, transformation, shortcut_unlock}
BIND to segment context (grammar, world identity, ecology)
ATTACH sensory plan (camera CAM, audio cue, reward)
```

**2. Memorability prediction**

```
memorability = w1·surprise_novelty + w2·payoff_magnitude + w3·player_agency
             + w4·emotional_arousal_peak + w5·photo_test (would player describe?)
CI from Experience Prediction ensemble
```

**3. Validation hook**

```
Post-playtest: "Describe one moment you remember" — tag match to MOM
memorability_accuracy = matched / predicted_top_3
```

## Required Evidence

- Beat timeline with predicted emotional arc  
- Post-playtest recall survey (n≥5 for ship moments)  
- Replay markers at TRIGGER and PAYOFF ticks  

## Validation Strategy

- Hand-crafted reference moment (first star reveal) — predictor ranks top  
- Random segment — predictor ranks low  
- Recall survey ≥60% mention designed MOM in top 3  

## KPIs

| KPI | Target |
|-----|--------|
| Predicted memorability vs recall | ρ ≥ 0.5 |
| Designed moments per 15 min | 2–4 |
| Agency in moment (survey) | ≥6/7 |
| False peak rate (predicted high, forgotten) | <30% |

## Risks

| Risk | Mitigation |
|------|------------|
| Scripted not systemic | Prefer EMRG-beneficial beats |
| Spectacle without readability | DNA-01 gate |
| Recall bias | Multiple playtesters |

## Integration (v2.1)

| Link | Role |
|------|------|
| Level Synthesis | Embed MOM beats |
| Boss Generator | Climax MOM mandatory |
| Camera + Audio specs | Sensory payoff |
| Emergent Simulation | Beneficial EMRG → MOM seeds |

---

# 8. DELIGHT AND WONDER MODELING

## Purpose

Differentiate **basic enjoyment (fun)** from **delight, surprise, wonder** — measurable proxies and validation for higher-order experience.

## Architecture

```
research/affect/
├── AffectTaxonomy.ts         # fun vs delight vs surprise vs wonder
├── ProxyInstrument.ts        # telemetry + survey mapping
└── thresholds/affect-bands.yaml
```

## Affect Definitions

| Affect | Definition | Distinct from Fun |
|--------|------------|-------------------|
| **Fun** | Sustained engagement, competence loop | Baseline |
| **Delight** | Short positive spike, warmth | Higher arousal, shorter |
| **Surprise** | Expectation violation, positive valence | Unpredicted |
| **Wonder** | Awe, scale, beauty, curiosity expansion | Low pressure, high openness |

## Proxies

| Affect | Telemetry | Survey |
|--------|-----------|--------|
| Delight | reward_burst + vocalization proxy (optional) + continue_play | "That made me smile" 1–7 |
| Surprise | unexpected_event + path_deviation spike | "I didn't see that coming" |
| Wonder | vista_dwell >5s + reduced death + exploration | "This place feels amazing" |
| Fun (control) | jump_success + session_continue | Fun Engine composite |

## Conceptual Algorithms

**1. Separation model**

```
fun_score = Fun Engine composite
delight_index = spike_detector(reward + camera + audio events)
surprise_index = expectation_violation(positive)
wonder_index = vista_dwell × exploration × low_frustration

ORTHOGOALIZE: delight ⊥ sustained_fun component via regression residual
```

**2. Research HYP examples**

```
HYP: "Vertical vista before descent increases wonder without fun lift"
MEASURE: wonder_index delta with fun_score controlled
```

## Required Evidence

- Multi-item survey separating fun vs delight vs wonder  
- Telemetry features time-aligned to events  
- At least one controlled comparison (A/B segment)  

## Validation Strategy

- Delight moment (coin shower) — delight spike, moderate fun change  
- Wonder vista — high wonder, neutral delight  
- Unfair death — fun drop, no delight  

## KPIs

| KPI | Target (M3 slice) |
|-----|-------------------|
| Wonder moments / world | ≥2 |
| Delight spikes / 15 min | 3–6 |
| Fun–delight correlation | <0.85 (distinct) |
| Wonder survey ≥6/7 | At vista MOMs |

## Risks

| Risk | Mitigation |
|------|------------|
| Conflated metrics | Orthogonal survey items |
| Wonder without gameplay | Always pair with verb |
| Delight spam | Density caps |

## Integration (v2.1)

| Link | Role |
|------|------|
| Fun Engine | Baseline fun layer |
| Memorable Moment Designer | Delight/wonder beat types |
| World Generator | Wonder identity dimension |
| Long-Term Journey | Curiosity/wonder trajectory |

---

# 9. CREATIVE SEARCH

## Purpose

Explore **broad conceptual spaces** — not parameter tuning — generate diverse candidates while preserving identity anchor coherence.

## Architecture

```
research/search/
├── ConceptSpace.ts           # axes: verb, fantasy, social, pacing, space
├── DiversityGenerator.ts     # maximin spread samples
├── IdentityProjection.ts     # filter vs anchor
└── candidates/SEARCH-INDEX.md
```

## Concept Axes (Examples)

| Axis | Poles |
|------|-------|
| Verb density | single-verb purity ↔ multi-verb chaos |
| Space | horizontal ↔ vertical ↔ non-euclidean |
| Pressure | meditative ↔ intense |
| Social fantasy | solo mastery ↔ companion echo (NPC, not MP) |
| Time | frozen ↔ rhythmic |

## Conceptual Algorithms

**1. Diversity-maximizing search**

```
GENERATE batch of N concepts maximizing pairwise distance in concept space
FILTER identity_projection(c) >= threshold
FOR each: quick CREVAL + HYP registration
PRESENT top diverse set to Human Research Partner
```

**2. Not parameter search**

```
Creative Search operates on categorical/conceptual mutations
Design Space Explorer (v2.0) handles continuous params — complementary, not duplicate
```

## Required Evidence

- Concept distance matrix for each batch  
- Identity projection score per candidate  
- Human selection log (which directions pursued)  

## Validation Strategy

- Batch of 10 concepts spans ≥5 axes  
- Zero anchor violations in filtered set  
- At least one search batch → supported HYP per quarter  

## KPIs

| KPI | Target |
|-----|--------|
| Conceptual diversity (mean pairwise distance) | ≥0.6 normalized |
| Identity projection pass rate | 100% post-filter |
| Search → HYP conversion | ≥30% |
| Parameter vs concept search ratio | Track; concept ≥40% research time |

## Risks

| Risk | Mitigation |
|------|------------|
| Random weirdness | Identity projection hard filter |
| Ignoring buildability | Technical feasibility note on HYP |
| Duplicate v2.0 Discovery | Search = concept level; Discovery = gameplay space gaps |

## Integration (v2.1)

| Link | Role |
|------|------|
| Gameplay Discovery Research | Search feeds HYP |
| Mechanic Genome | Concept → genotype mapping |
| World Generator | World-scale search results |
| Creativity Evaluation | Rank search candidates |

---

# 10. HUMAN–AI RESEARCH PARTnership

## Purpose

AI proposes **research directions**; humans validate, redirect, or reject — maintain a **living research log** of discoveries, failures, open questions.

## Architecture

```
research/partnership/
├── ResearchLog.ts            # RESLOG-* append-only
├── DirectionProposal.ts      # AI weekly research agenda
├── HumanVerdict.ts           # validate | redirect | reject
└── log/RESEARCH-LOG.md       # single living document
```

## Research Log Entry Schema

```markdown
## RESLOG-2026-07-07-001
**Type:** discovery | failure | open_question | redirect
**HYP/EMRG ref:** HYP-012
**Summary:** One paragraph
**Evidence:** EVD-045
**Human verdict:** validated
**Implication:** Promote to Mechanic Evolution branch
**Open follow-ups:** OPEN-003
```

## Workflow

```
1. AI publishes weekly research agenda (3–5 directions, ranked)
2. Human: validate / redirect / reject each (15 min review)
3. AI executes validated directions only
4. All conclusions append to RESEARCH-LOG.md
5. OPEN-* questions persist until resolved or explicitly abandoned
```

## Conceptual Algorithms

**1. Agenda generation**

```
Rank open HYP + niche opportunities + low-confidence PRIN
+ emergent unresolved EMRG
Present top 5 with estimated evidence cost
```

**2. Redirect handling**

```
Human redirect = constraint update on search space or HYP reframing
LOG redirect reason → Creative Memory anti-pattern or PRIN note
```

## Required Evidence

- Every RESLOG discovery links ≥1 EVD  
- Human verdict on all agenda items weekly  
- OPEN questions reviewed monthly  

## Validation Strategy

- Research log readable by new contributor in <30 min  
- Redirect rate 20–40% (healthy human steering)  
- Zero `supported` HYP without human validation note  

## KPIs

| KPI | Target |
|-----|--------|
| Weekly agenda review completion | 100% |
| RESLOG entries / month | 8–20 |
| OPEN question stale (>60d) | <5 |
| Human redirect respected | 100% |
| Research → PROP graduation | ≥2/quarter when building |

## Risks

| Risk | Mitigation |
|------|------------|
| Log neglect | Single file, weekly ritual |
| AI agenda spam | Max 5 directions |
| Human rubber-stamp | Require written redirect or validate note |

## Integration (v2.1)

| Link | Role |
|------|------|
| All research subsystems | Feed RESLOG |
| Human Co-Design v2.1 | Production path separate from research path |
| Creative Memory | Discoveries promote to PAT-* |
| AI Game Designer | Executes validated agenda |

---

# RESEARCH ORCHESTRATION

## Weekly Research Cycle

```
Mon: AI agenda → human validate
Tue–Thu: R0/R1 evaluation on top HYP
Fri: RESLOG append + genome/ecology/journey updates
```

## Graduation Criteria (Research → v2.1 Synthesis)

| Stage | Criteria |
|-------|----------|
| HYP → experiment | Human validated + R0 sketch |
| Experiment → PROP | EVD `supported` + CREVAL ≥65 + ecology pass |
| PROP → build | Existing DAP → WAP (unchanged) |

---

# INTEGRATION MAP (v2.1)

| Research Subsystem | v2.1 Consumer |
|--------------------|---------------|
| Gameplay Discovery | All generators (hypothesis-driven) |
| Mechanic Genome | Encounter, World, Grammar |
| Design DNA Evolution | Creativity Eval, Creative Search |
| Mechanic Ecology | Encounter, Level Synthesis |
| Emergent Simulation | Level Synthesis, Boss |
| Journey Intelligence | World order, Economy Sim |
| Memorable Moment Designer | Level, Boss, Camera |
| Delight/Wonder | Moment Designer, World |
| Creative Search | World Generator, Discovery |
| Human Research Partnership | All (agenda + log) |

---

# TRANSITION PLAN: DOCUMENTATION → VERTICAL SLICE IMPLEMENTATION

Documentation work is **complete** when the permanent architecture exists. Research platform specs are **operational** when the conditions below are met. **Implementation becomes primary** when all **Gate A** conditions pass — not when all research hypotheses are resolved.

## Gate A — Stop Documentation, Start Building

All must be true:

| # | Condition | Evidence |
|---|-----------|----------|
| A1 | Permanent architecture ratified | POS + SOL + GDIL v1/v2/v2.1 + Research doc (this file) |
| A2 | **One** vertical slice research packet complete | `HYP-M1-feel` supported: jump/movement HYP, EVD from playtest or honest baseline audit, MKB-M1 genome stub |
| A3 | Identity anchor documented | 4 anchor rules in Design DNA Evolution |
| A4 | First RESLOG entry with human verdict | `RESEARCH-LOG.md` initialized |
| A5 | POS Phase 17 WAP authorized via SOL | Existing governance only — Research Lab is first build target |

**Action when Gate A passes:** Freeze new architecture docs. Primary activity = **POS Phase 17 Gameplay Research Lab** implementation.

## Gate B — Research Lab Live (Implementation Milestone 1)

| # | Condition | Evidence |
|---|-----------|----------|
| B1 | Jump Lab scene runs deterministically | CI determinism test green |
| B2 | First EVD from lab telemetry | `EVD-*` with position/velocity hash |
| B3 | Mechanic Genome M1 gene record | `GENE-*` for jump family |
| B4 | R1 rapid eval possible on new HYP | <1 day hypothesis turnaround |

**Action:** Enable active GDIL v2 research cycles on real data.

## Gate C — Vertical Slice Playable (Implementation Milestone 2)

| # | Condition | Evidence |
|---|-----------|----------|
| C1 | Character feel presets tunable live | Phase 18 or equivalent minimal tuning |
| C2 | 15-minute grammar-valid segment playable | TEACH→EXAM→RECOVER for M1–M3 |
| C3 | Fun ≥40 internal (honest) | Playtest n≥3 |
| C4 | 0 P0 physics blockers | Phase 16.5 regressions none |

**Action:** v2.1 synthesis permitted for slice content only — not full World 1.

## Gate D — Vertical Slice Ship Candidate (Implementation Milestone 3)

| # | Condition | Evidence |
|---|-----------|----------|
| D1 | Fun ≥60 | Playtest n≥5 |
| D2 | Jump satisfaction ≥7/10 | Survey |
| D3 | Existing G1 gate evidence | GDIL v1 DAP + SOL WAP |
| D4 | ≥2 memorable moments with recall survey | MOM validation |

**Action:** Documentation **remains frozen**. Research log continues append-only. Full POS tier B–E proceeds per existing roadmap.

## What Stops vs Continues

| Activity | After Gate A |
|----------|--------------|
| New architecture / OS docs | **STOP** |
| RESEARCH-LOG append | **CONTINUE** (lightweight) |
| HYP / EVD / RESLOG entries | **CONTINUE** |
| GDIL v2.1 full world synthesis | **DEFER** until Gate C |
| POS implementation | **PRIMARY** |
| SOL WAP / GDIL DAP | **As needed per phase** |

## Honest Current State (2026-07-07)

| Gate | Status |
|------|--------|
| A1 Architecture | **PASS** |
| A2 Research packet | **FAIL** — M1 not playtest-validated |
| A3 Identity anchor | **PASS** (in this doc) |
| A4 RESLOG | **FAIL** — not initialized |
| A5 Phase 17 WAP | **NOT ISSUED** |

**Recommendation:** Initialize `research/log/RESEARCH-LOG.md`, complete minimal M1 HYP/EVD stub, issue Phase 17 WAP → **Gate A passes** → **begin implementation**.

---

# DOCUMENT CONTROL

| Field | Value |
|-------|-------|
| Version | GDIL Research v1.0 |
| Extends | GDIL v2.1 (synthesis apparatus) |
| Does not modify | POS, SOL, governance |
| Location | `docs/gdil/GAME-DESIGN-RESEARCH-PLATFORM.md` |
| Architecture status | **COMPLETE** — no further OS layers |

---

*Research discovers what to build. v2.1 synthesizes how it looks. v2.0 optimizes whether it works. v1.0 gates what ships. POS builds it.*
