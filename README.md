# 3D Mario — AAA 3D Platformer

A modern, modular 3D platformer inspired by Mario Odyssey, Galaxy, Astro Bot, and Rayman. Built with production-grade clean architecture for scalability to 100+ levels.

## Tech Stack

- **TypeScript** — Type-safe game logic
- **Three.js** — PBR rendering, shadows, post-processing
- **Rapier3d** — Physics (Phase 5)
- **Vite** — Dev server and build
- **Vitest** — Unit testing

## Quick Start

```bash
npm install
npm run dev        # http://localhost:3011
```

Or use lifecycle scripts:

```bash
./scripts/start.sh
./scripts/health.sh
```

## Project Structure

```
src/
├── domain/          Types, events, interfaces
├── infrastructure/  EventBus, DI, config, save, pools
├── core/            Engine, game loop, input, FSM
├── state/           Game state machine
├── rendering/       Scene adapters
├── app/             Composition root
└── data/            JSON configs
```

## Development Phases

This project follows a 16-phase roadmap. **Phase 1 (Core Framework) is complete.**

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for full details.

## Testing

```bash
npm test
npm run typecheck
npm run validate:arch
```

## License

Private — All rights reserved.
# 3dmario
