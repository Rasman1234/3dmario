# Level Design Bible v0.1

**Owner:** Gameplay Director  
**Status:** Draft — seeded from POS v3.0 Part V  
**Pillars served:** P2 (Readable Space), P3 (Joyful Discovery), P4 (Fair Challenge)

---

## 1. Vision

Levels are **curricula** — each space teaches, tests, rewards, and recovers. Layout serves readability and flow, not filler geometry.

## 2. Principles

1. **Grammar is law** — Every segment tagged: Teach, Practice, Twist, Master, Exam, Reward, Recover.
2. **No soft-locks** — Bot T1 must complete all main paths.
3. **Readable routing** — Player sees next goal within 5s of entering segment.
4. **Secret payoff** — Every secret returns more than it costs in time.
5. **Shortcut closure** — Discovery path longer than return path after unlock.
6. **Death budget** — EXAM segments: ≤2 avg deaths; TEACH: 0 expected.
7. **Camera-aware layout** — Jump lines visible in default camera profile.

## 3. Standards

| Node | Duration | Death budget | Jump success |
|------|----------|--------------|--------------|
| TEACH | 30–90s | 0 | ≥95% |
| PRACTICE | 1–3 min | ≤1 | ≥85% |
| TWIST | 1–2 min | ≤2 | ≥75% |
| MASTER | 30–60s | optional | ≥60% |
| EXAM | 30–90s | ≤2 avg | ≥70% |
| REWARD | 15–30s | 0 | N/A |
| RECOVER | 30–60s | 0 | N/A |

**Mechanic curriculum (ship order):** M1 jump → M2 sprint → M3 double jump → M4 moving platforms → M5 wall jump → M6 ground pound → M7 enemies → M8 boss.

## 4. Patterns

- **Vista hook** — Distant goal visible before path exists
- **Layered secret** — Obvious path + attentive off-angle + expert sequence break
- **Breathing room** — RECOVER after every EXAM or boss
- **Grammar sandwich** — TEACH → PRACTICE → TWIST → EXAM → REWARD → RECOVER

## 5. Anti-patterns

- Pixel-perfect jumps without TEACH
- Dead ends with no payoff
- Backtracking without shortcut unlock
- Visual noise obscuring hazard read
- Exam before practice for new mechanic

## 6. References

- Mario Odyssey kingdom routing
- Celeste chapter structure
- Level Design Grammar (POS Part V)

## 7. Changelog

| Version | Date | Change |
|---------|------|--------|
| 0.1 | 2026-07-07 | Seeded from POS Level Design Grammar |
