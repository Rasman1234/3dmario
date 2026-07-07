import { ResearchLab } from '../research/ResearchLab';
import { ResearchDashboard } from '../research/dashboard/ResearchDashboard';
import { FIXED_DT } from '../research/sandbox/MovementSandbox';

/** Phase 17 lab application — separate from GameApplication. */

export class ResearchLabApplication {
  private readonly lab = new ResearchLab();
  private readonly dashboard = new ResearchDashboard();
  private running = false;
  private rafId = 0;
  private tickInterval: ReturnType<typeof setInterval> | null = null;

  async start(parent: HTMLElement): Promise<void> {
    const params = new URLSearchParams(window.location.search);
    const scene = (params.get('scene') ?? 'jump_laboratory') as import('../research/types').LabSceneId;
    const seed = Number(params.get('seed') ?? '42');

    await this.lab.boot(scene, seed);
    this.dashboard.mount(parent);
    this.dashboard.bindControls({
      onSweep: () => void this.runSweep(),
      onFalsify: () => void this.runFalsify(),
      onTune: (jump, gravity) => void this.runTune(jump, gravity),
      onDeterminism: () => void this.runDeterminism(),
    });

    this.running = true;
    this.tickInterval = setInterval(() => this.tick(), FIXED_DT * 1000);
    this.refreshDashboard();
  }

  private tick(): void {
    if (!this.running) return;
    this.lab.step(FIXED_DT);
    if (this.lab.getDashboardState().telemetrySeries.length % 10 === 0) {
      this.refreshDashboard();
    }
  }

  private refreshDashboard(): void {
    this.dashboard.render(this.lab.getDashboardState());
  }

  private async runSweep(): Promise<void> {
    this.running = false;
    await this.lab.runParameterSweep('HYP-M1-feel', 'gap_laboratory');
    this.refreshDashboard();
    this.running = true;
  }

  private async runFalsify(): Promise<void> {
    this.running = false;
    await this.lab.runFalsification('HYP-M1-feel', 'gap_laboratory');
    this.refreshDashboard();
    this.running = true;
  }

  private async runTune(jump: number, gravity: number): Promise<void> {
    this.running = false;
    await this.lab.tuneParameters('HYP-M1-feel', 'gap_laboratory', {
      jumpForce: jump,
      gravity,
    });
    this.refreshDashboard();
    this.running = true;
  }

  private async runDeterminism(): Promise<void> {
    const ok = await this.lab.verifyDeterminism('jump_laboratory', 42, 120);
    alert(ok ? 'Determinism OK (hash match, delta < 0.01m)' : 'Determinism FAILED');
    this.refreshDashboard();
  }

  shutdown(): void {
    this.running = false;
    if (this.tickInterval) clearInterval(this.tickInterval);
    cancelAnimationFrame(this.rafId);
    this.dashboard.unmount();
    this.lab.dispose();
  }
}
