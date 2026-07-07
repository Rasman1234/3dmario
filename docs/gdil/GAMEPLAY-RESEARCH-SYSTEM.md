# Gameplay Research System — Scientific Rigor Extension

**Extends:** [GAME-DESIGN-RESEARCH-PLATFORM.md](./GAME-DESIGN-RESEARCH-PLATFORM.md)  
**Purpose:** Maximize evidence quality, reduce confirmation bias, improve research efficiency  
**Constraint:** No new layer · POS/SOL/GDIL unchanged · Ship path unchanged · No implementation code

---

## What This Adds

The Research Platform discovers gameplay possibilities. This extension makes discovery **scientifically rigorous**:

```
┌─────────────────────────────────────────────────────────────────┐
│         GAMEPLAY RESEARCH SYSTEM (Scientific Core)              │
│  Falsification · Competing HYP · Bayesian · Portfolio · InfoGain  │
│  Opportunity Cost · Uncertainty · Causal · Experiment Optimizer   │
│  Counterfactual · Failure Taxonomy · Theorems · Meta-Learning     │
│  Explainable Research · Quality Dashboard                         │
├─────────────────────────────────────────────────────────────────┤
│         RESEARCH PLATFORM (Discovery — 10 subsystems)           │
├─────────────────────────────────────────────────────────────────┤
│  GDIL v2.1 · v2.0 · v1.0 · SOL · POS                            │
└─────────────────────────────────────────────────────────────────┘
```

**New artifact types (research-only, not governance):**

| Artifact | Meaning |
|----------|---------|
| `FALS-{id}` | Falsification attempt record |
| `ALT-{id}` | Competing hypothesis |
| `POST-{hyp}` | Posterior confidence snapshot |
| `EXP-OPT-{id}` | Optimized experiment design |
| `CF-{id}` | Counterfactual analysis |
| `FAIL-{id}` | Classified failure |
| `THM-{id}` | Design theorem (promoted finding) |
| `META-{id}` | Meta-learning strategy record |
| `XPL-{id}` | Explainable recommendation bundle |

Graduation rule unchanged: HYP survives falsification + posterior threshold → existing PROP → DAP → WAP.

---

# 1. FALSIFICATION ENGINE

## Purpose

Every hypothesis must generate **failure conditions, competing explanations, and stress tests** before experimentation. No graduation without surviving falsification attempts.

## Architecture

```
research/rigor/falsification/
├── FalsificationGenerator.ts   # auto failure modes per HYP
├── StressTestPlanner.ts        # edge-case experiment designs
├── SurvivalTracker.ts          # FALS-* pass/fail log
└── falsification/FALS-INDEX.md
```

## Conceptual Algorithms

**1. Auto-generate falsifiers on HYP registration**

```
ON register(HYP):
  failure_conditions = [
    "Metric X does not improve vs null",
    "Archetype Y shows frustration spike",
    "DNA rule Z violated under stress",
    "Competing ALT explains observation better"
  ]
  stress_tests = [
    extreme_param_boundary,
    worst_case_archetype (child/casual),
    remove_prerequisite_mechanic,
    high_difficulty_grammar_EXAM
  ]
  EMIT FALS-{hyp}-001..N (mandatory before first EVD)
```

**2. Survival criterion**

```
graduate(HYP) ONLY IF:
  ∀ critical_falsifiers: attempted
  AND survived_count / attempted_count ≥ 0.8
  AND zero critical_falsifier FAILED without DEC waiver
```

**3. Popper discipline**

```
IF experiment designed only to confirm HYP:
  REJECT experiment design — require at least one falsifier test
```

## Required Evidence

- FALS record per critical falsifier before HYP promotion  
- Stress test uses different method than confirmatory test  
- Failed falsifier → HYP refuted or revised (not ignored)  

## Validation Strategy

- Inject obviously false HYP — falsification should refute quickly  
- Retroactive: jump feel HYP must list "floaty = fail" before test  

## KPIs

| KPI | Target |
|-----|--------|
| HYP with complete falsifier set before EVD | 100% |
| Confirmation-only experiments | 0% |
| False graduation rate | <10% |
| Mean falsifiers per HYP | ≥4 |

## Risks

| Risk | Mitigation |
|------|------------|
| Checkbox falsifiers | Stress tests must differ from confirmatory |
| Never refute (bias) | Track refutation rate; target 20–40% |
| Falsifier fatigue | Tier: critical vs optional |

## Integration

| Platform subsystem | Link |
|--------------------|------|
| Gameplay Discovery | FALS on every new HYP |
| Experiment Optimizer | Designs discriminating falsifiers |
| Competing Hypothesis | Falsifiers tied to ALT |
| Explainable Research | FALS outcomes in XPL bundle |

---

# 2. COMPETING HYPOTHESIS FRAMEWORK

## Purpose

Support **multiple alternative explanations** for the same observation. Rank by accumulated evidence, not creation order.

## Architecture

```
research/rigor/competing/
├── HypothesisSet.ts            # observation → {HYP, ALT...}
├── EvidenceAccumulator.ts      # per-hypothesis ledger
├── Ranker.ts                   # evidence-weighted order
└── sets/SET-{observation_id}.yaml
```

## Conceptual Algorithms

**1. Observation sets**

```
ON observation O (e.g. "deaths cluster at gap X"):
  CREATE SET-O with:
    HYP-primary (author's theory)
    ALT-1..k (auto-generated: camera, spacing, telegraph, skill, bug)
  ALL share same evidence pool — no orphan evidence
```

**2. Evidence-weighted ranking**

```
score(H) = Σ evidence_weight(EVD_i) × support_direction(EVD_i, H)
rank = sort_desc(score)
leader = rank[0] ONLY IF margin(leader, second) > uncertainty_threshold
```

**3. Graduation rule**

```
Promote leader to PROP only if:
  posterior(leader) > 0.7 AND margin > 0.15 over runner-up
```

## Required Evidence

- Every SET has ≥2 hypotheses  
- Each EVD tags which hypotheses it supports/contradicts  
- Leader change logged with reason  

## Validation Strategy

- Synthetic observation with known ALT — ranker picks correct  
- Blind evidence add — rank updates correctly  

## KPIs

| KPI | Target |
|-----|--------|
| SET with ≥2 hypotheses | 100% |
| Leader flip rate (healthy debate) | 10–30% |
| Graduation with contested runner-up | 0% |
| Evidence tagged to hypotheses | 100% |

## Risks

| Risk | Mitigation |
|------|------------|
| Strawman ALTs | Auto-generate from Failure Taxonomy + Matrix |
| Premature leader | Margin + posterior gates |
| Analysis paralysis | Cap ALTs at 5 per SET |

## Integration

| Platform subsystem | Link |
|--------------------|------|
| Bayesian Updating | Posterior per hypothesis in SET |
| Falsification | FALS per hypothesis in SET |
| Causal Discovery | Causal ALT for correlational obs |
| Portfolio Manager | Invest in discriminating SETs |

---

# 3. BAYESIAN EVIDENCE UPDATING

## Purpose

Represent confidence as **probability distribution**. Update after every experiment. Preserve historical evolution.

## Architecture

```
research/rigor/bayesian/
├── PriorRegistry.ts            # initial priors per HYP type
├── LikelihoodModel.ts          # P(EVD | HYP) estimates
├── PosteriorStore.ts           # POST-{hyp}-{timestamp}
└── history/POSTERIOR-CHAIN-{hyp}.json
```

## Conceptual Algorithms

**1. Update rule**

```
P(H | E) ∝ P(E | H) × P(H)

Prior P(H): default 0.5 uninformed; 0.3 for novel mechanics; 0.6 for analog-backed
Likelihood from: metric delta, sim result, survey, replay signal — with noise model
```

**2. Posterior chain (immutable history)**

```
POST-{hyp}-t0: { prior: 0.5, posterior: 0.62, EVD: EVD-012, likelihood_note: "..." }
POST-{hyp}-t1: { prior: 0.62, posterior: 0.71, EVD: EVD-019, ... }
NEVER overwrite — append only
```

**3. Graduation threshold**

```
posterior_mean ≥ 0.75 AND posterior_CI_width ≤ 0.25 → eligible for falsification final + PROP
posterior < 0.3 → auto-refute candidate
```

## Required Evidence

- Likelihood justification per EVD (why this strength)  
- Prior documented at HYP creation  
- Full posterior chain exportable  

## Validation Strategy

- Simulated EVD sequence — posterior moves correct direction  
- Calibration: 70% CI contains truth ≥65% of holdout cases  

## KPIs

| KPI | Target |
|-----|--------|
| HYP with posterior chain | 100% active |
| CI width before graduation | ≤0.25 |
| Calibration error | <15% |
| Posterior updates per HYP | ≥3 before graduation |

## Risks

| Risk | Mitigation |
|------|------------|
| Subjective likelihood | Document + sensitivity analysis |
| Overconfidence | Wide priors for novel domains |
| p-hacking | Pre-register success criteria |

## Integration

| Platform subsystem | Link |
|--------------------|------|
| Competing Hypothesis | Per-H posterior in SET |
| Information Gain | Expected posterior narrowing |
| Explainable Research | Confidence evolution in XPL |
| Design Theorem Library | THM requires posterior ≥0.85 |

---

# 4. RESEARCH PORTFOLIO MANAGER

## Purpose

Treat research as an **investment portfolio** — estimate expected value, uncertainty, cost, strategic importance; optimize limited experiment time.

## Architecture

```
research/rigor/portfolio/
├── PortfolioState.ts           # active HYP + SET positions
├── EVCalculator.ts             # expected value per item
├── Allocator.ts                # weekly experiment budget
└── reports/PORTFOLIO-WEEK-{date}.md
```

## Conceptual Algorithms

**1. Position scoring**

```
EV(H) = P(success) × impact(fun_driver, pillar, milestone_criticality)
      - cost(experiment_tiers) - risk(identity_violation)

uncertainty = posterior_CI_width
strategic_importance = f(critical_path, blocker_status, archetype_gap)

priority = (EV × strategic_importance) / (cost × uncertainty)
```

**2. Allocation**

```
Budget: B experiment-days per week
GREEDY or knapsack: select HYP/SET maximizing Σ information_gain
  subject to: ≥1 falsification slot, ≥1 low-EV high-importance blocker
```

**3. Rebalance trigger**

```
IF portfolio concentration > 60% one pillar: DIVERSIFY
IF blocker HYP stale >14d: ESCALATE
```

## Required Evidence

- EV inputs documented per position  
- Weekly allocation log with human override notes  

## Validation Strategy

- Retrospective: portfolio would have prioritized Phase 17 jump HYP  
- Simulated budget — high-IG items selected first  

## KPIs

| KPI | Target |
|-----|--------|
| Weekly allocation documented | 100% |
| Blocker stale >14d | 0 |
| Portfolio pillar concentration | <60% |
| EV realization rate | Track; target ≥50% |

## Risks

| Risk | Mitigation |
|------|------------|
| Spread too thin | Min 2 deep dives / month |
| EV gaming | Human review on top 3 |
| Ignore low-EV blockers | Reserved blocker slot |

## Integration

| Platform subsystem | Link |
|--------------------|------|
| Information Gain | Objective for allocator |
| Opportunity Cost | Trade-off input |
| Human Research Partnership | Weekly agenda = portfolio output |
| Meta-Learning | Strategy performance feedback |

---

# 5. INFORMATION GAIN ANALYSIS

## Purpose

Estimate **expected information gain** before each experiment. Prioritize experiments that reduce uncertainty most.

## Architecture

```
research/rigor/information-gain/
├── IGEstimator.ts              # E[KL divergence] or entropy reduction
├── ExperimentComparator.ts     # rank candidate designs
└── ig/IG-{exp_design}.yaml
```

## Conceptual Algorithms

**1. Expected entropy reduction**

```
IG(exp) = E[H(posterior)] - H(posterior | expected_outcomes under exp)

For competing SET:
  IG = probability_of_resolving_leader × margin_gain
```

**2. Pre-execution gate**

```
IF IG(exp) < IG_min_threshold:
  REJECT or merge with higher-IG design
LOG expected IG; post-hoc compute actual IG
```

**3. Learning calibration**

```
IG_accuracy = correlation(expected_IG, actual_posterior_narrowing)
feed META-learning
```

## Required Evidence

- Pre-registered expected IG before experiment  
- Post-hoc actual IG computed from posterior delta  

## Validation Strategy

- Discriminating A/B design has higher IG than confirm-only  
- IG ranking matches human expert rank ≥70%  

## KPIs

| KPI | Target |
|-----|--------|
| Experiments with pre-IG | 100% |
| IG prediction correlation | ρ ≥ 0.5 |
| Low-IG experiments | <20% of budget |
| Mean posterior narrowing per exp | ≥0.05 |

## Risks

| Risk | Mitigation |
|------|------------|
| IG model wrong | Calibrate via META |
| Overweight IG vs EV | Portfolio balances both |
| Analysis before action | IG compute <30 min cap |

## Integration

| Platform subsystem | Link |
|--------------------|------|
| Experiment Optimizer | IG as objective |
| Portfolio Manager | Rank by IG/EV |
| Bayesian Updating | Measures actual gain |
| Quality Dashboard | IG panel |

---

# 6. OPPORTUNITY COST MODELING

## Purpose

Quantify **which hypotheses are delayed** when another experiment is selected. Support portfolio trade-off analysis.

## Architecture

```
research/rigor/opportunity-cost/
├── DelayTracker.ts             # deferred HYP queue
├── CostCalculator.ts           # expected cost of delay
└── tradeoffs/TRADEOFF-{allocation}.md
```

## Conceptual Algorithms

**1. Delay cost**

```
delay_cost(H, Δt) = strategic_importance(H) × uncertainty_growth(H, Δt)
                  + blocker_penalty if H on critical path

ON allocate(exp for H_a):
  FOR H_b in deferred:
    RECORD opportunity_cost(H_b, estimated_delay)
```

**2. Trade-off report**

```
"Choosing EXP-012 (jump coyote) delays HYP-008 (camera comfort) by ~5 days
 estimated cost: 0.12 strategic units; acceptable because HYP-012 IG=0.31 > HYP-008 IG=0.18"
```

## Required Evidence

- Trade-off note when top-2 IG items compete for same slot  
- Deferred queue reviewed weekly  

## Validation Strategy

- Simulated allocation — delay costs monotonic with importance  

## KPIs

| KPI | Target |
|-----|--------|
| Trade-off documented when top-2 compete | 100% |
| Critical path HYP max delay | <7 days |
| Deferred queue reviewed weekly | 100% |

## Risks

| Risk | Mitigation |
|------|------------|
| Paralysis | Max 1 trade-off round |
| Ignored deferred | Weekly queue in agenda |

## Integration

| Platform subsystem | Link |
|--------------------|------|
| Portfolio Manager | Allocation decisions |
| Human Research Partnership | Human approves trade-offs |
| Quality Dashboard | Deferred queue widget |

---

# 7. UNCERTAINTY PROPAGATION

## Purpose

Carry **uncertainty through the reasoning chain**. Every downstream recommendation exposes inherited uncertainty.

## Architecture

```
research/rigor/uncertainty/
├── UncertaintyGraph.ts         # DAG of derived quantities
├── Propagator.ts               # interval / variance propagation
└── tags/uncertainty-schema.yaml
```

## Conceptual Algorithms

**1. Uncertainty tagging**

```
Each node: { value, uncertainty_type, CI or σ }
Types: measurement, model, sampling, causal_assumption

fun_prediction = f(sim, playtest, analog)
σ_fun = sqrt(Σ (∂f/∂x_i)² σ_x_i²)  # or Monte Carlo
```

**2. Recommendation envelope**

```
XPL recommendation MUST include:
  point_estimate ± propagated_CI
  dominant_uncertainty_source (top contributor)
```

**3. Propagation rules**

```
IF upstream CI widens >2×: downstream auto-downgrade confidence tier
IF causal_assumption_uncertainty high: label "correlational only"
```

## Required Evidence

- Uncertainty source tagged on every EVD input  
- Propagated CI on every XPL and PRED artifact  

## Validation Strategy

- Known variance inputs — propagated CI matches analytic  
- Widening upstream triggers downgrade in test harness  

## KPIs

| KPI | Target |
|-----|--------|
| XPL with propagated CI | 100% |
| Dominant source identified | 100% |
| Overconfident recs (actual outside CI) | <20% |

## Risks

| Risk | Mitigation |
|------|------------|
| False precision | Mandatory CI display |
| Propagation complexity | Monte Carlo fallback |
| User ignores CI | Dashboard alert on wide CI |

## Integration

| Platform subsystem | Link |
|--------------------|------|
| Experience Prediction | Ensemble variance |
| Explainable Research | CI in bundle |
| Causal Discovery | Separate causal vs observational σ |
| Bayesian Updating | Posterior CI as input |

---

# 8. CAUSAL DISCOVERY

## Purpose

Differentiate **correlation from causation**. Represent causal assumptions explicitly. Track causal confidence separately from observational confidence.

## Architecture

```
research/rigor/causal/
├── CausalGraph.ts              # directed causal claims
├── AssumptionRegistry.ts       # untested edges flagged
├── InterventionPlanner.ts      # experiments that test edges
└── causal/CAUSAL-{claim}.yaml
```

## Conceptual Algorithms

**1. Claim typing**

```
observational: "deaths correlate with camera interventions"
causal_candidate: "camera interventions CAUSE deaths"
requires: intervention or natural experiment

edge A → B has:
  observational_confidence (from correlation)
  causal_confidence (from intervention EVD only)
```

**2. Bradford Hill / gameplay analog checklist**

```
strength, consistency, specificity, temporality, dose-response, plausibility, experiment
causal_confidence = weighted checklist score
```

**3. Intervention design**

```
TO test A → B:
  design intervention on A, measure B holding confounders
  IF B unchanged: weaken/delete causal edge
```

## Required Evidence

- Causal claims list assumptions explicitly  
- Intervention EVD for causal_confidence > 0.6  
- Observational-only claims cannot drive PROP alone  

## Validation Strategy

- Known causal (jump height → gap success) — intervention confirms  
- Spurious correlate — intervention refutes  

## KPIs

| KPI | Target |
|-----|--------|
| Causal claims with explicit assumptions | 100% |
| PROP driven by observational only | 0% |
| Intervention success rate | Track |
| Causal vs obs confidence separation | 100% tagged |

## Risks

| Risk | Mitigation |
|------|------------|
| Causal overclaim | Default observational |
| Intervention cost | Tier R1 interventions first |
| Confounders ignored | List confounders per edge |

## Integration

| Platform subsystem | Link |
|--------------------|------|
| Competing Hypothesis | Causal ALT |
| Experiment Optimizer | Intervention designs |
| Counterfactual | Causal graph input |
| Design Theorem Library | THM requires causal_conf ≥0.7 |

---

# 9. EXPERIMENT OPTIMIZER

## Purpose

Propose the **smallest experiment** that discriminates between competing hypotheses. Estimate duration, cost, statistical power.

## Architecture

```
research/rigor/experiment-optimizer/
├── DesignSearch.ts             # minimal discriminating design
├── PowerEstimator.ts           # n, duration for effect size
├── CostModel.ts                # R0/R1/R2 costs
└── designs/EXP-OPT-{id}.yaml
```

## Conceptual Algorithms

**1. Discrimination objective**

```
FIND min_cost(exp) SUCH THAT:
  P(outcome distinguishes H1 from H2 | true_world) ≥ power_target (0.8)
  AND falsifies ≥1 critical FALS per hypothesis
```

**2. Tier selection**

```
IF IG high + simple metric: R0 paper + sim
IF needs human feel: R2 n=3 minimum for power 0.6 qualitative
IF discriminating numeric: compute n from effect_size, σ, α=0.05
```

**3. Output**

```
EXP-OPT: { method, duration, cost, power, discriminates: [H1,H2], metrics }
```

## Required Evidence

- Power calculation or qualitative power rationale  
- Pre-registered primary metric  
- Actual duration/cost logged post-hoc  

## Validation Strategy

- Optimizer picks cheaper design when IG equal  
- Powered study detects known effect in simulation  

## KPIs

| KPI | Target |
|-----|--------|
| EXP with power estimate | 100% R2 |
| Mean cost vs unoptimized baseline | -30% |
| Discrimination success rate | ≥70% |
| Duration estimate error | ±40% |

## Risks

| Risk | Mitigation |
|------|------------|
| Underpowered qual studies | Min n=3 + honesty flag |
| Over-optimization to sim | Mandatory R2 for feel |
| Wrong effect size prior | Sensitivity range |

## Integration

| Platform subsystem | Link |
|--------------------|------|
| Information Gain | Objective |
| Falsification | Stress tests in design |
| Portfolio Manager | Cost input |
| Rapid Evaluator (Platform §1) | Tier mapping |

---

# 10. COUNTERFACTUAL ANALYSIS

## Purpose

Reason about **what-if** scenarios: remove mechanic, change gravity, delay rewards — predict outcomes with uncertainty.

## Architecture

```
research/rigor/counterfactual/
├── CounterfactualEngine.ts
├── InterventionSpec.ts
└── analyses/CF-{id}.yaml
```

## Conceptual Algorithms

**1. Counterfactual query**

```
CF(query): "What if {intervention}?"
  intervention ∈ { remove(M), set_param(p,v), delay(reward, Δt), ... }

USE: causal_graph + sim_surrogate + analog_cases
PREDICT: Δfun_driver, Δfrustration with propagated_CI
```

**2. Examples**

```
CF-001: remove(double_jump) → predict completion_rate, mastery_routes
CF-002: gravity unchanged vs +10% → jump_success delta
CF-003: reward_delay +30s → motivation_trough depth
```

**3. Validation**

```
When intervention later run as real EXP:
  compare CF prediction to EVD — calibrate surrogate
```

## Required Evidence

- Intervention spec explicit  
- Causal assumptions listed  
- Propagated CI on all deltas  

## Validation Strategy

- Run CF before A/B — prediction within CI of outcome ≥60%  
- Remove-mechanic CF matches sandbox test when built  

## KPIs

| KPI | Target |
|-----|--------|
| CF with CI | 100% |
| Prediction-in-CI rate | ≥60% |
| CF before major PROP | 100% |
| Calibration improvement | +10%/quarter |

## Risks

| Risk | Mitigation |
|------|------------|
| Sim surrogate wrong | Label confidence tier |
| Unfalsifiable CF | Require testable intervention path |
| Over-reliance | CF supplements not replaces playtest |

## Integration

| Platform subsystem | Link |
|--------------------|------|
| Causal Discovery | Graph structure |
| Mechanic Ecology | Remove-mechanic queries |
| Uncertainty Propagation | CI on predictions |
| Emergent Simulation | Surrogate model |

---

# 11. FAILURE TAXONOMY

## Purpose

Classify failures into **readability, fairness, pacing, motivation, control, economy, accessibility, implementation** — track patterns and root causes.

## Architecture

```
research/rigor/failures/
├── Taxonomy.ts                 # 8 categories + subcodes
├── Classifier.ts               # EVD/replay → FAIL category
├── PatternMiner.ts             # recurring FAIL clusters
└── failures/FAIL-INDEX.md
```

## Categories

| Code | Definition | Example signal |
|------|------------|----------------|
| `READ` | Player couldn't read space | occlusion deaths, hesitation |
| `FAIR` | Unfair challenge | no telegraph, RNG death |
| `PACE` | Rhythm wrong | reward desert, fatigue |
| `MOTIV` | Engagement drop | quit after segment |
| `CTRL` | Control fight | input lag, camera fight |
| `ECON` | Reward/progression | grind, inflation |
| `A11Y` | Accessibility | motion, difficulty wall |
| `IMPL` | Technical | bug, perf, soft-lock |

## Conceptual Algorithms

**1. Classification**

```
FAIL = classify(EVD, replay_signals, survey)
  multi-label allowed
  root_cause = deepest actionable node in causal graph
```

**2. Pattern mining**

```
IF count(FAIL-READ-* in level L) ≥ 3: PATTERN alert
link to COMPETING HYP: "deaths due to READ not FAIR"
```

## Required Evidence

- FAIL tag on every refuted HYP and negative EVD  
- Root cause field mandatory  
- Link to FALS that failed  

## Validation Strategy

- Blind classify labeled playtest incidents — κ ≥ 0.7  
- RECURRING pattern triggers HYP  

## KPIs

| KPI | Target |
|-----|--------|
| Refuted HYP with FAIL class | 100% |
| Root cause documented | 100% |
| Repeat pattern without action | 0 |
| Classifier agreement | κ ≥ 0.7 |

## Risks

| Risk | Mitigation |
|------|------------|
| Blame category wrong | Multi-label + human review |
| IMPL masked as FAIR | Require replay for FAIR |
| Taxonomy drift | Versioned taxonomy |

## Integration

| Platform subsystem | Link |
|--------------------|------|
| Competing Hypothesis | FAIL explains observations |
| Creative Memory | FAIL → anti-patterns |
| Falsification | Failed FALS → FAIL code |
| Meta-Learning | Strategy per category |

---

# 12. DESIGN THEOREM LIBRARY

## Purpose

Promote repeatedly validated findings to **versioned design theorems** — cited evidence, retired when obsolete.

## Architecture

```
research/rigor/theorems/
├── TheoremPromoter.ts          # HYP → THM criteria
├── CitationGraph.ts            # THM ← EVD links
├── RetirementTracker.ts
└── theorems/THM-INDEX.md
```

## Promotion Criteria

```
promote_to_THM when:
  posterior ≥ 0.85
  causal_confidence ≥ 0.7 (if causal claim)
  replicated ≥2 independent EVD sources
  survived full falsification battery
  human Research Partner validates
```

## Theorem Record

```yaml
theorem:
  id: THM-001
  statement: "Coyote time ≤120ms preserves expert skill expression while lifting casual success"
  version: 1.2
  evidence: [EVD-012, EVD-034, EVD-041]
  falsifiers_survived: [FALS-012-a, FALS-012-b]
  scope: { mechanics: [MKB-M1], archetypes: [casual, expert] }
  retired: false
  supersedes: null
```

## Conceptual Algorithms

```
ON new EVD contradicting THM:
  IF posterior(THM) drops < 0.5: PROPOSE retirement or revision
  FORK version with changelog
Design DNA Evolution PRIN-* may sync from THM
```

## Required Evidence

- ≥2 independent replication EVDs  
- Full citation graph  
- Retirement reason if retired  

## Validation Strategy

- THM-001 style theorem from jump research when data exists  
- Contradiction EVD triggers revision workflow  

## KPIs

| KPI | Target |
|-----|--------|
| THM with ≥2 EVD | 100% |
| Obsolete THM retired <30d after contradiction | 100% |
| PROP citing uncited theorem | 0% |
| Active theorems at ship | 15–40 |

## Risks

| Risk | Mitigation |
|------|------------|
| Premature theorem | Strict promotion bar |
| Never retire | Contradiction monitor |
| Duplicate PRIN/THM | Sync rules with DNA Evolution |

## Integration

| Platform subsystem | Link |
|--------------------|------|
| Design DNA Evolution | PRIN ↔ THM sync |
| Bayesian Updating | Promotion posterior |
| Explainable Research | Cite THM in XPL |
| v2.1 generators | THM as constraints |

---

# 13. META-LEARNING

## Purpose

Track which **research strategies** produce highest-quality discoveries. Improve methodology itself.

## Architecture

```
research/rigor/meta/
├── StrategyRegistry.ts         # R0/R1/R2, IG-first, falsification-first, ...
├── OutcomeTracker.ts           # discovery quality per strategy
├── StrategySelector.ts         # adapt weekly methodology mix
└── meta/META-INDEX.md
```

## Strategy Examples

| Strategy | Description |
|----------|-------------|
| `S-falsify-first` | FALS before any confirmatory |
| `S-IG-max` | Portfolio by information gain |
| `S-causal-intervene` | Intervention-heavy |
| `S-broad-search` | Creative Search batches |
| `S-replicate` | Confirm THM with new EVD |

## Conceptual Algorithms

```
quality_score(discovery) = f(posterior, replication, playtest_fun_delta, time_cost)

FOR strategy S:
  rolling_mean_quality(S) over last N uses
SELECT strategy mix for next week: ε-greedy on quality + exploration
LOG META-{week}: { mix, outcomes, adjustment }
```

## Required Evidence

- Strategy tag on every EXP  
- Post-hoc quality score  
- Weekly META log entry  

## Validation Strategy

- Strategies with falsify-first show lower false graduation  
- META mix adapts after simulated strategy performance shift  

## KPIs

| KPI | Target |
|-----|--------|
| EXP tagged with strategy | 100% |
| False graduation rate decline | -20% over 6 months |
| Strategy diversity | ≥3 active |
| META review cadence | Weekly |

## Risks

| Risk | Mitigation |
|------|------------|
| Overfit to past | ε exploration |
| Strategy churn | Max 1 mix change/week |
| Gaming quality score | Human audit sample |

## Integration

| Platform subsystem | Link |
|--------------------|------|
| Portfolio Manager | Strategy selection |
| Quality Dashboard | Strategy performance panel |
| Human Research Partnership | Approve mix changes |

---

# 14. EXPLAINABLE RESEARCH

## Purpose

Every recommendation includes **evidence, rejected alternatives, uncertainty, confidence evolution, open questions** — mandatory XPL bundle.

## Architecture

```
research/rigor/explain/
├── XPLBundler.ts               # assembles mandatory sections
├── TemplateValidator.ts        # reject incomplete recs
└── bundles/XPL-{id}.yaml
```

## XPL Bundle Schema

```yaml
xpl:
  id: XPL-042
  recommendation: "Increase coyote to 100ms for slice segment 3"
  supporting_evidence: [EVD-034, THM-001-partial, FALS-survived]
  rejected_alternatives:
    - alt: "Widen platform instead"
      reason: "Lower IG; doesn't address CTRL failures"
  uncertainty:
    point: +0.08 jump_success
    CI: [0.03, 0.13]
    dominant_source: small_n_playtest
  confidence_evolution: [POST-t0: 0.5, POST-t1: 0.62, POST-t2: 0.71]
  open_questions: [OPEN-003]
  causal_status: intervention_supported
```

## Conceptual Algorithms

```
ON any recommendation (TUN, PROP, EXP schedule):
  GENERATE XPL bundle
  VALIDATE completeness
  IF missing section: BLOCK publication until complete
```

## Required Evidence

- All five sections populated  
- Rejected alternatives ≥1 when SET exists  
- Posterior chain attached  

## Validation Strategy

- Incomplete XPL rejected by validator  
- Human rates clarity ≥7/10 on sample  

## KPIs

| KPI | Target |
|-----|--------|
| Recommendations with complete XPL | 100% |
| Human clarity rating | ≥7/10 |
| Hidden alternatives (found post-hoc) | <10% |

## Risks

| Risk | Mitigation |
|------|------------|
| Boilerplate | Require specific EVD refs |
| Too long | Executive summary + full bundle |
| Ignored sections | Dashboard completeness score |

## Integration

| Platform subsystem | Link |
|--------------------|------|
| All rigor subsystems | Feed XPL sections |
| Human Research Partnership | Human reads XPL not raw data |
| v2.1 PROP | XPL attached to graduation packet |

---

# 15. RESEARCH QUALITY DASHBOARD

## Purpose

Single view of **evidence strength, hypothesis maturity, uncertainty, portfolio balance, throughput, information gain, confirmation bias indicators**.

## Architecture

```
research/rigor/dashboard/
├── DashboardSpec.md            # panel definitions
├── BiasIndicators.ts           # confirmation bias heuristics
└── exports/RQ-DASH-WEEK-{date}.json
```

## Panels

| Panel | Metrics |
|-------|---------|
| **Evidence strength** | Mean EVD quality, replication count, causal vs obs ratio |
| **Hypothesis maturity** | HYP by stage: open / testing / survived FALS / graduated / refuted |
| **Uncertainty** | Mean posterior CI width; propagation warnings |
| **Portfolio balance** | Pillar mix, blocker count, deferred queue |
| **Experiment throughput** | EXP/week, R0:R1:R2 mix, cost actual vs budget |
| **Information gain** | Expected vs actual IG; IG/cost efficiency |
| **Confirmation bias** | See below |

## Confirmation Bias Indicators

| Indicator | Alert when |
|-----------|------------|
| Confirmation-only rate | >10% experiments |
| Refutation rate | <10% over 30 days |
| Cherry-pick EVD | EVD excluding contradicting metrics |
| Posterior without falsifier | HYP graduation attempted |
| Leader margin ignored | PROP with runner-up posterior >0.5 |
| Hypothesis infidelity | Changed HYP after seeing EVD without new HYP id |

## Conceptual Algorithms

```
weekly_snapshot = aggregate(all panels)
bias_score = weighted_sum(indicator_triggers)
IF bias_score > threshold: FLAG human review + META strategy adjust
```

## Required Evidence

- Weekly JSON export  
- Bias flags reviewed in Research Partnership agenda  

## Validation Strategy

- Inject biased portfolio — dashboard flags  
- Blind review: bias period detectable in export  

## KPIs

| KPI | Target |
|-----|--------|
| Weekly dashboard export | 100% |
| Bias flags reviewed | 100% |
| Confirmation-only rate | <10% |
| Refutation rate | 15–35% |
| Graduation without FALS | 0% |

## Risks

| Risk | Mitigation |
|------|------------|
| Dashboard theater | Bias flags tie to actions |
| Metric gaming | Refutation rate band not zero |
| Overhead | Automated from existing artifacts |

## Integration

| Platform subsystem | Link |
|--------------------|------|
| All rigor subsystems | Data sources |
| Human Research Partnership | Weekly review ritual |
| Meta-Learning | Bias period triggers strategy change |

---

# SCIENTIFIC RESEARCH LOOP (Unified)

```
OBSERVE → SET (competing HYP) → FALS generate → EXP-OPT (IG, power, cost)
→ EXECUTE → EVD → Bayesian update → Causal check → FAIL classify if refuted
→ Uncertainty propagate → XPL bundle → Portfolio rebalance
→ THM promote if criteria met → META learn → Dashboard + bias check
→ Graduate to PROP when: posterior≥0.75, CI≤0.25, FALS survived, XPL complete
```

---

# INTEGRATION MAP (Research Platform)

| Platform § | Rigor enhancement |
|------------|-------------------|
| 1 Gameplay Discovery | FALS on HYP; SET for gaps |
| 2 Mechanic Genome | CF remove-mechanic; uncertainty on gene compat |
| 3 Design DNA Evolution | THM sync; Bayesian PRIN confidence |
| 4 Mechanic Ecology | Causal edges; CF queries |
| 5 Emergent Simulation | CF surrogate; FAIL IMPL |
| 6 Journey Intelligence | Counterfactual pacing |
| 7 Memorable Moment | IG for moment A/B |
| 8 Delight/Wonder | Separate posteriors per affect |
| 9 Creative Search | Portfolio allocation |
| 10 Human Partnership | XPL review; bias flag agenda item |

---

# RESEARCH READINESS ASSESSMENT

When is research infrastructure **mature enough** that remaining effort should shift primarily to **implementation, playtesting, and iteration**?

## Principle

Research rigor **enables** building; it does not replace it. Readiness means the **scientific apparatus is specified and minimally operational** — not that all hypotheses are resolved.

## Tier R0 — Documentation Complete (Current)

| Criterion | Metric | Status |
|-----------|--------|--------|
| Research Platform spec | Document exists | **PASS** |
| Scientific rigor spec | This document | **PASS** |
| Architecture frozen | No new layers | **PASS** |
| Ship path unchanged | PROP→DAP→WAP | **PASS** |

**R0 alone is insufficient to stop research docs — but sufficient to stop architecture expansion.**

## Tier R1 — Research Infrastructure Operational

All required before declaring "research infra mature":

| ID | Criterion | Measurable evidence |
|----|-----------|---------------------|
| R1.1 | HYP registry live | ≥1 HYP with FALS set + prior |
| R1.2 | Posterior chain works | ≥3 POST snapshots for one HYP |
| R1.3 | Competing SET used | ≥1 SET with ≥2 hypotheses |
| R1.4 | XPL bundle complete | ≥1 recommendation with all 5 sections |
| R1.5 | FAIL taxonomy used | ≥1 classified failure |
| R1.6 | RESEARCH-LOG active | ≥4 RESLOG entries with human verdict |
| R1.7 | Dashboard export | ≥1 RQ-DASH-WEEK file |
| R1.8 | Experiment optimizer used | ≥1 EXP-OPT with power/cost estimate |

**Gate:** ≥7/8 R1 criteria → research **process** operational (can be paper/spreadsheet initially).

## Tier R2 — Evidence Pipeline Connected to Game

| ID | Criterion | Measurable evidence |
|----|-----------|---------------------|
| R2.1 | POS Phase 17 lab live | Determinism CI green |
| R2.2 | EVD from real telemetry | ≥5 EVD linked to HYP |
| R2.3 | Bayesian update from real data | Posterior moves on real EVD |
| R2.4 | Replay → FAIL classify | ≥3 replay-derived FAIL tags |
| R2.5 | Falsification executed | ≥2 FALS attempts with outcomes |
| R2.6 | Refutation occurred | ≥1 HYP refuted with FAIL + POST |
| R2.7 | IG pre/post measured | ρ≥0.4 expected vs actual (n≥5 exp) |
| R2.8 | Bias dashboard reviewed | 4 consecutive weekly reviews |

**Gate:** ≥6/8 R2 criteria → research connected to **real game**.

## Tier R3 — Research Maturity for Build Focus Shift

**All** must pass to shift **primary effort** from research infrastructure to vertical slice implementation:

| ID | Criterion | Threshold |
|----|-----------|-----------|
| R3.1 | M1 jump HYP graduated | Posterior ≥0.75, FALS survived, XPL complete |
| R3.2 | ≥1 THM promoted | THM-001 with ≥2 independent EVD |
| R3.3 | CF validated | ≥1 counterfactual within CI of outcome |
| R3.4 | Causal claim tested | ≥1 edge with intervention EVD |
| R3.5 | Confirmation bias controlled | Confirmation-only <10% for 8 weeks |
| R3.6 | Portfolio ROI | ≥50% graduated PROP pass playtest Fun floor |
| R3.7 | Meta-learning active | ≥8 META weekly entries |
| R3.8 | Human co-design path | ≥1 PROP through HCD → DAP |

## Tier R4 — Implementation Primary (Build Mode)

When R3 passes, project mode switches:

| Activity | Allocation |
|----------|------------|
| POS implementation (feel labs, slice) | **≥70%** effort |
| Playtest + iteration | **≥20%** |
| Research infra + new HYP | **≤10%** (maintenance only) |

Research **continues** as lightweight append-only discipline:
- RESLOG, POST, XPL on each playtest  
- Dashboard weekly (15 min review)  
- No new research subsystem docs  
- THM/Theorem updates only on evidence  

## Current Readiness Scorecard (2026-07-07)

| Tier | Score | Verdict |
|------|-------|---------|
| R0 Documentation | 4/4 | **COMPLETE** |
| R1 Process operational | 0/8 | **NOT STARTED** |
| R2 Evidence pipeline | 0/8 | **BLOCKED** (no Phase 17) |
| R3 Build shift ready | 0/8 | **FAR** |
| R4 Build mode | — | **NOT ACTIVE** |

**Overall Research Readiness: 12/100** (documentation only)

## Recommended Next Actions (Strict Priority)

1. **Stop** architecture and research spec documents  
2. **Initialize** R1 with paper process: one M1 HYP, FALS set, SET, XPL template dry-run  
3. **Issue** Phase 17 WAP (existing SOL path) — unlocks R2  
4. **Implement** Research Lab — first real EVD  
5. **Reassess** at R2 ≥6/8 — then accelerate slice build  

## Exit Condition (Research Infra "Done")

Research infrastructure is **sufficiently mature** when:

```
R1 ≥ 7/8  AND  R2 ≥ 6/8  AND  R3 ≥ 6/8  AND  R3.1 (M1 graduated)
```

Then: **Build Mode (R4)** — documentation effort stops; game ships through existing POS tiers.

---

# DOCUMENT CONTROL

| Field | Value |
|-------|-------|
| Version | Research System v1.0 |
| Extends | GAME-DESIGN-RESEARCH-PLATFORM.md |
| Does not modify | POS, SOL, GDIL v1/v2/v2.1 |
| Location | `docs/gdil/GAMEPLAY-RESEARCH-SYSTEM.md` |
| Architecture | **FROZEN** — this is the final research extension |

---

*Scientific rigor serves the game. Falsify first, update honestly, propagate uncertainty, explain everything — then build.*
