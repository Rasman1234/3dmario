/**
 * Architecture validation for 3D Mario platformer.
 * Detects cyclic dependencies and enforces layer import rules.
 *
 * Usage: node scripts/validate-architecture.mjs
 * Set ARCH_STRICT=1 to fail on import violations.
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const SRC = join(ROOT, 'src');

const LAYERS = [
  'domain',
  'utils',
  'data',
  'infrastructure',
  'core',
  'state',
  'gameplay',
  'simulation',
  'physics',
  'characters',
  'camera',
  'ai',
  'combat',
  'items',
  'powerups',
  'world',
  'bosses',
  'systems',
  'effects',
  'rendering',
  'ui',
  'audio',
  'save',
  'research',
  'app',
  'main',
];

const BOUNDED_CONTEXT_MAP = {
  domain: 'Core',
  infrastructure: 'Core',
  core: 'Core',
  state: 'Gameplay',
  gameplay: 'Gameplay',
  simulation: 'Gameplay',
  physics: 'Physics',
  characters: 'Characters',
  camera: 'Camera',
  ai: 'AI',
  combat: 'Combat',
  items: 'Items',
  powerups: 'PowerUps',
  world: 'World',
  bosses: 'Bosses',
  systems: 'Systems',
  effects: 'Effects',
  rendering: 'Rendering',
  ui: 'UI',
  audio: 'Audio',
  save: 'Save',
  research: 'Research',
  app: 'Composition',
  main: 'Composition',
};

function isIntraDomainImport(fromFile, toFile) {
  const fromLayer = getLayer(fromFile);
  const toLayer = getLayer(toFile);
  return fromLayer === 'domain' && toLayer === 'domain';
}

const FORBIDDEN = [
  { from: 'domain/**', to: 'infrastructure/**', reason: 'Domain must not import infrastructure' },
  { from: 'domain/**', to: 'core/**', reason: 'Domain must not import core' },
  { from: 'domain/**', to: 'rendering/**', reason: 'Domain must not import rendering' },
  { from: 'domain/**', to: 'app/**', reason: 'Domain must not import app' },
  { from: 'simulation/**', to: 'rendering/**', reason: 'Simulation must not depend on rendering' },
  { from: 'simulation/**', to: 'effects/**', reason: 'Simulation must not depend on VFX' },
  { from: 'gameplay/**', to: 'rendering/**', reason: 'Gameplay must not depend on rendering' },
  { from: 'gameplay/**', to: 'ui/**', reason: 'Gameplay must not depend on UI' },
  { from: 'infrastructure/**', to: 'rendering/**', reason: 'Infrastructure must not depend on rendering' },
  { from: 'research/**', to: 'app/**', reason: 'Research must not import app' },
  { from: 'research/**', to: 'ui/**', reason: 'Research must not import UI' },
  { from: 'research/**', to: 'rendering/**', reason: 'Research must not import rendering' },
  { from: 'core/**', to: 'rendering/**', reason: 'Core engine must not depend on rendering adapters' },
];

const GAMEPLAY_LAYERS = ['simulation', 'gameplay', 'state', 'domain', 'physics', 'characters'];

function walkTsFiles(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (entry === 'node_modules') continue;
      walkTsFiles(full, files);
    } else if (entry.endsWith('.ts') && !entry.endsWith('.test.ts')) {
      files.push(full);
    }
  }
  return files;
}

function getLayer(filePath) {
  const rel = relative(SRC, filePath).replace(/\\/g, '/');
  if (rel === 'main.ts') return 'main';
  const top = rel.split('/')[0];
  return LAYERS.includes(top) ? top : 'unknown';
}

function resolveImport(fromFile, spec) {
  if (!spec.startsWith('.')) return null;
  const dir = dirname(fromFile);
  let target = resolve(dir, spec);
  if (!target.endsWith('.ts')) {
    const candidates = [`${target}.ts`, join(target, 'index.ts')];
    for (const c of candidates) {
      try {
        readFileSync(c);
        target = c;
        break;
      } catch {
        /* try next */
      }
    }
  }
  if (!target.startsWith(SRC)) return null;
  return target;
}

function parseImports(filePath) {
  const content = readFileSync(filePath, 'utf8');
  const imports = [];
  const re = /(?:import|export)\s+(?:type\s+)?(?:[\w*{}\s,]+\s+from\s+)?['"]([^'"]+)['"]/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    imports.push(m[1]);
  }
  return imports;
}

function globMatch(pattern, path) {
  const rel = relative(SRC, path).replace(/\\/g, '/');
  const p = pattern.replace(/\*\*/g, '§').replace(/\*/g, '[^/]*').replace(/§/g, '.*');
  return new RegExp(`^${p}$`).test(rel) || new RegExp(`^${p}$`).test(`${getLayer(path)}/**`);
}

function layerIndex(layer) {
  const i = LAYERS.indexOf(layer);
  return i === -1 ? 999 : i;
}

function detectCycles(graph) {
  const cycles = [];
  const visited = new Set();
  const stack = new Set();
  const path = [];

  function dfs(node) {
    if (stack.has(node)) {
      const idx = path.indexOf(node);
      cycles.push([...path.slice(idx), node]);
      return;
    }
    if (visited.has(node)) return;
    visited.add(node);
    stack.add(node);
    path.push(node);
    for (const next of graph.get(node) ?? []) {
      dfs(next);
    }
    path.pop();
    stack.delete(node);
  }

  for (const node of graph.keys()) dfs(node);
  return cycles;
}

const files = walkTsFiles(SRC);
const graph = new Map();
const violations = [];
const threeJsInGameplay = [];

for (const file of files) {
  const rel = relative(SRC, file).replace(/\\/g, '/');
  graph.set(rel, []);
  const fromLayer = getLayer(file);

  for (const spec of parseImports(file)) {
    const resolved = resolveImport(file, spec);
    if (!resolved) {
      if (spec === 'three' || spec.startsWith('three/')) {
        if (GAMEPLAY_LAYERS.includes(fromLayer)) {
          threeJsInGameplay.push({ file: rel, import: spec });
        }
      }
      continue;
    }
    const toRel = relative(SRC, resolved).replace(/\\/g, '/');
    const toLayer = getLayer(resolved);
    graph.get(rel).push(toRel);

    if (fromLayer !== 'unknown' && toLayer !== 'unknown' && layerIndex(fromLayer) < layerIndex(toLayer)) {
      violations.push({
        type: 'layer-upward',
        from: rel,
        to: toRel,
        fromLayer,
        toLayer,
        reason: `Layer "${fromLayer}" must not import upward into "${toLayer}"`,
      });
    }

    for (const rule of FORBIDDEN) {
      if (isIntraDomainImport(file, resolved)) continue;
      const fromMatch = globMatch(rule.from, file);
      const toMatch = globMatch(rule.to, resolved);
      if (fromMatch && toMatch) {
        violations.push({
          type: 'forbidden',
          from: rel,
          to: toRel,
          reason: rule.reason,
        });
      }
    }
  }
}

const cycles = detectCycles(graph);

const seen = new Set();
const uniqueViolations = violations.filter((v) => {
  const key = `${v.type}:${v.from}:${v.to}`;
  if (seen.has(key)) return false;
  seen.add(key);
  return true;
});

const stats = {
  modules: files.length,
  edges: [...graph.values()].reduce((a, b) => a + b.length, 0),
  cycles: cycles.length,
  violations: uniqueViolations.length,
  threeJsInGameplay: threeJsInGameplay.length,
  layers: Object.fromEntries(LAYERS.map((l) => [l, files.filter((f) => getLayer(f) === l).length])),
  boundedContexts: BOUNDED_CONTEXT_MAP,
};

console.log('=== 3D Mario Architecture Validation ===\n');
console.log(JSON.stringify(stats, null, 2));

if (cycles.length > 0) {
  console.log('\n--- Cyclic Dependencies ---');
  cycles.forEach((c, i) => console.log(`  Cycle ${i + 1}: ${c.join(' → ')}`));
}

if (uniqueViolations.length > 0) {
  console.log('\n--- Import Rule Violations ---');
  uniqueViolations.forEach((v) => {
    console.log(`  [${v.type}] ${v.from} → ${v.to}`);
    console.log(`    ${v.reason}`);
  });
}

const reportPath = join(ROOT, 'docs/architecture/validation-report.json');
try {
  const { writeFileSync, mkdirSync } = await import('fs');
  mkdirSync(dirname(reportPath), { recursive: true });
  writeFileSync(
    reportPath,
    JSON.stringify({ timestamp: new Date().toISOString(), stats, cycles, violations: uniqueViolations }, null, 2),
  );
  console.log(`\nReport written to ${relative(ROOT, reportPath)}`);
} catch (e) {
  console.warn('Could not write report:', e.message);
}

const failOnViolations = process.env.ARCH_STRICT === '1';
const hasFatal = cycles.length > 0 || (failOnViolations && uniqueViolations.length > 0);

if (hasFatal) {
  console.error('\n✗ Architecture validation FAILED');
  process.exit(1);
}

if (uniqueViolations.length > 0) {
  console.warn(`\n⚠ ${uniqueViolations.length} import violations recorded. Set ARCH_STRICT=1 to fail.`);
} else {
  console.log('\n✓ No import violations');
}

console.log('✓ No cyclic dependencies');
process.exit(0);
