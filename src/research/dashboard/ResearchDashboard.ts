import type { ResearchDashboardState } from '../types';

/** Research dashboard — DOM visualization for lab mode. */

export class ResearchDashboard {
  private root: HTMLElement | null = null;

  mount(parent: HTMLElement): void {
    this.root = document.createElement('div');
    this.root.id = 'research-dashboard';
    this.root.innerHTML = `
      <style>
        #research-dashboard {
          position: fixed; top: 0; right: 0; width: 380px; max-height: 100vh;
          overflow-y: auto; background: rgba(10,12,20,0.92); color: #e8ecf4;
          font: 12px/1.4 system-ui, sans-serif; padding: 12px; z-index: 1000;
          border-left: 1px solid #334;
        }
        #research-dashboard h2 { margin: 0 0 8px; font-size: 14px; color: #7dd3fc; }
        #research-dashboard h3 { margin: 12px 0 4px; font-size: 12px; color: #a5b4fc; }
        .rd-metric { display: flex; justify-content: space-between; padding: 2px 0; }
        .rd-bar { height: 6px; background: #1e293b; border-radius: 3px; margin: 4px 0; }
        .rd-bar-fill { height: 100%; background: #38bdf8; border-radius: 3px; }
        .rd-canvas { width: 100%; height: 80px; background: #0f172a; border-radius: 4px; }
        .rd-btn { margin: 4px 2px; padding: 4px 8px; background: #1e40af; color: #fff;
          border: none; border-radius: 4px; cursor: pointer; font-size: 11px; }
        .rd-btn:hover { background: #2563eb; }
        .rd-pass { color: #4ade80; } .rd-fail { color: #f87171; }
      </style>
      <h2>Gameplay Research Lab</h2>
      <div id="rd-readiness"></div>
      <h3>Hypotheses</h3>
      <div id="rd-hypotheses"></div>
      <h3>Falsification</h3>
      <div id="rd-fals"></div>
      <h3>Telemetry</h3>
      <canvas id="rd-chart" class="rd-canvas" width="356" height="80"></canvas>
      <h3>Controls</h3>
      <div id="rd-controls"></div>
      <h3>Latest Recommendation</h3>
      <div id="rd-rec"></div>
    `;
    parent.appendChild(this.root);
  }

  render(state: ResearchDashboardState): void {
    if (!this.root) return;
    const r = state.readiness;
    const rd = (id: string) => this.root!.querySelector(`#${id}`);

    rd('rd-readiness')!.innerHTML = `
      <div class="rd-metric"><span>Research</span><span>${r.researchReadiness}%</span></div>
      <div class="rd-bar"><div class="rd-bar-fill" style="width:${r.researchReadiness}%"></div></div>
      <div class="rd-metric"><span>Implementation</span><span>${r.implementationReadiness}%</span></div>
      <div class="rd-bar"><div class="rd-bar-fill" style="width:${r.implementationReadiness}%"></div></div>
      <div class="rd-metric"><span>Gameplay</span><span>${r.gameplayReadiness}%</span></div>
      <div class="rd-bar"><div class="rd-bar-fill" style="width:${r.gameplayReadiness}%"></div></div>
      <div class="rd-metric"><span>Vertical Slice</span><span>${r.verticalSliceReadiness}%</span></div>
      <div class="rd-bar"><div class="rd-bar-fill" style="width:${r.verticalSliceReadiness}%"></div></div>
      <div class="rd-metric"><span>Uncertainty</span><span>${state.uncertainty.toFixed(2)}</span></div>
      <div class="rd-metric"><span>Info Gain (est)</span><span>${state.informationGain.toFixed(3)}</span></div>
    `;

    rd('rd-hypotheses')!.innerHTML = state.hypotheses
      .map(
        (h) => `
      <div style="margin-bottom:8px;padding:6px;background:#1e293b;border-radius:4px">
        <strong>${h.id}</strong> <span class="${h.status === 'supported' ? 'rd-pass' : ''}">${h.status}</span><br/>
        <small>${h.statement.slice(0, 80)}...</small><br/>
        posterior=${h.posterior.toFixed(2)} CI=[${h.ciLow.toFixed(2)},${h.ciHigh.toFixed(2)}]
      </div>`,
      )
      .join('');

    rd('rd-fals')!.innerHTML =
      state.falsificationStatus.length === 0
        ? '<em>No falsification runs yet</em>'
        : state.falsificationStatus
            .map(
              (f) =>
                `<div class="${f.passed ? 'rd-pass' : 'rd-fail'}">${f.scenario}: ${f.passed ? 'survived' : 'FAILED'}</div>`,
            )
            .join('');

    rd('rd-rec')!.innerHTML = state.latestComparison?.recommendation ?? 'Run parameter sweep';

    this.drawChart(state);
  }

  bindControls(handlers: {
    onSweep: () => void;
    onFalsify: () => void;
    onTune: (jump: number, gravity: number) => void;
    onDeterminism: () => void;
  }): void {
    const el = this.root?.querySelector('#rd-controls');
    if (!el) return;
    el.innerHTML = `
      <button class="rd-btn" id="rd-sweep">Parameter Sweep</button>
      <button class="rd-btn" id="rd-fals">Run Falsification</button>
      <button class="rd-btn" id="rd-det">Verify Determinism</button>
      <br/>
      <label>jumpForce <input type="range" id="rd-jump" min="8" max="16" step="0.5" value="12"/></label>
      <label>gravity <input type="range" id="rd-grav" min="18" max="30" step="1" value="24"/></label>
      <button class="rd-btn" id="rd-tune">Apply & Re-run</button>
    `;
    el.querySelector('#rd-sweep')?.addEventListener('click', handlers.onSweep);
    el.querySelector('#rd-fals')?.addEventListener('click', handlers.onFalsify);
    el.querySelector('#rd-det')?.addEventListener('click', handlers.onDeterminism);
    el.querySelector('#rd-tune')?.addEventListener('click', () => {
      const jump = Number((el.querySelector('#rd-jump') as HTMLInputElement).value);
      const grav = Number((el.querySelector('#rd-grav') as HTMLInputElement).value);
      handlers.onTune(jump, grav);
    });
  }

  private drawChart(state: ResearchDashboardState): void {
    const canvas = this.root?.querySelector('#rd-chart') as HTMLCanvasElement | null;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const series = state.telemetrySeries;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (series.length < 2) return;
    const vals = series.map((p) => p.value);
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const range = max - min || 1;
    ctx.strokeStyle = '#38bdf8';
    ctx.beginPath();
    series.forEach((p, i) => {
      const x = (i / (series.length - 1)) * canvas.width;
      const y = canvas.height - ((p.value - min) / range) * canvas.height;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }

  unmount(): void {
    this.root?.remove();
    this.root = null;
  }
}
