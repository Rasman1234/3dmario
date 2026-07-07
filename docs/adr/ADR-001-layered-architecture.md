# ADR-001: Layered Clean Architecture

## Status

Accepted — Phase 1

## Context

A AAA 3D platformer requires 16+ independent systems (movement, camera, AI, combat, etc.) that must scale to 100+ levels without becoming a monolithic codebase.

## Decision

Adopt layered clean architecture with bounded contexts, event-driven communication, and strict import rules:

1. **Domain layer** has zero dependencies
2. **Simulation** is headless and rendering-agnostic
3. **Systems communicate via EventBus**, not direct calls
4. **Composition root** (`GameApplication`) is the only wiring point
5. **JSON configs** drive balance data, not hardcoded constants

## Consequences

- Every system is independently testable
- New features (bosses, power-ups) add folders, not modify god objects
- Architecture validation CI prevents layer violations
- Slight overhead from event indirection, offset by modularity gains

## Alternatives Considered

| Approach | Rejected Because |
|----------|-----------------|
| Monolithic `main.ts` | Unmaintainable at AAA scale |
| Full ECS (entt-style) | Over-engineering for Phase 1; revisit Phase 15 |
| Unreal/Unity native | Not available in workspace; TypeScript enables modding |
