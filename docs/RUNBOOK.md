# Runbook

## Quick Start

```bash
./scripts/start.sh     # Install, validate, start dev server
./scripts/status.sh    # Check running services
./scripts/health.sh    # Full health audit
./scripts/stop.sh      # Graceful shutdown
```

## Development

```bash
npm install
npm run dev            # Vite dev server on :3011
npm test               # Vitest unit tests
npm run typecheck      # Strict TypeScript
npm run validate:arch  # Layer import governance
npm run build          # Production build → dist/
```

## Controls (Phase 1)

| Key | Action |
|-----|--------|
| Enter | Start game (Main Menu → Level) |
| Esc | Pause / Resume |
| WASD | Movement (wired, no character yet) |

## Troubleshooting

### Port 3011 in use

```bash
lsof -i :3011
./scripts/fix.sh
```

### TypeScript errors after pull

```bash
npm install
npm run typecheck
```

### Tests fail

```bash
npm test -- --reporter=verbose
```

### Architecture violations

```bash
ARCH_STRICT=1 npm run validate:arch
```

## Recovery

```bash
./scripts/fix.sh       # Auto-diagnose and fix common issues
./scripts/restart.sh   # Full restart
./scripts/health.sh    # Verify recovery
```

## Common Failures

| Symptom | Root Cause | Fix |
|---------|-----------|-----|
| Blank screen | WebGL unavailable | Check GPU drivers, try Chrome |
| 404 on load | Dev server not running | `./scripts/start.sh` |
| Save not persisting | Private browsing | Use normal browser window |
| Low FPS | Ultra graphics on weak GPU | Lower `graphicsQuality` in settings |
