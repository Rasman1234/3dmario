# Gameplay Research Laboratory (Phase 17)

Executable research environment at `src/research/`. Operationalizes HYP → EXP → EVD → XPL without extending frozen architecture layers.

## Launch

```bash
./scripts/start.sh
# Open http://localhost:3011/?lab=1
# Optional: &scene=gap_laboratory&seed=42
```

Headless CI validation:

```bash
npm run research:headless
```

## API (`src/research/index.ts`)

| Module | Role |
|--------|------|
| `ResearchLab` | Composition root — boot, step, experiments, dashboard state |
| `MovementSandbox` | Deterministic movement sim (fixed 1/60s, Rapier + orchestrator) |
| `ExperimentRunner` | Run single EXP from `ExperimentSpec` |
| `ExperimentBatch` | 100+ parameter grid, ranking, CI |
| `TelemetryCollector` | Frame-level player/camera/input metrics |
| `ReplayRecorder` / `ReplayPlayer` | Deterministic replay + ghost comparison |
| `EvidencePipeline` | Auto EVD generation |
| `ExplainableResults` | XPL bundles per experiment |
| `FalsificationRunner` | Predefined failure scenarios |
| `ParameterTuning` | Hot-reload movement params → re-run → Bayesian update |
| `ReadinessEstimator` | Research / Implementation / Gameplay / VS readiness |
| `ResearchDashboard` | DOM dashboard for lab mode |

## Performance & Memory Budgets

Defined in `RESEARCH_BUDGETS` (`types.ts`):

- Max frames in memory: 3600 (~60s @ 60Hz)
- Max batch size: 200 experiments
- Target step: 1.0ms
- Max memory: 12MB telemetry budget

## Scenes

- `physics_isolation` — flat ground, movement only
- `jump_laboratory` — vertical jump research
- `gap_laboratory` — forward gaps with recovery
- `platform_laboratory` — stepped platforms

## Default Hypothesis

`HYP-M1-feel` — default jump parameters achieve ≥70% jump success in gap laboratory.

## Example (programmatic)

```typescript
import { ResearchLab, createJumpExperiment } from './research';

const lab = new ResearchLab();
await lab.boot('gap_laboratory', 42);
await lab.runExperiment(createJumpExperiment('HYP-M1-feel', 'gap_laboratory', { jumpForce: 12 }));
console.log(lab.getEvidence());
console.log(lab.getDashboardState().readiness);
lab.dispose();
```

## Architecture

`research` layer imports `gameplay`, `physics`, `systems`, `infrastructure` only. `app` composes lab via `ResearchLabApplication`. No upward imports into `ui` or `rendering`.
