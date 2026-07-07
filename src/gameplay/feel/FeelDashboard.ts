import type { FeelSnapshot } from './CharacterFeelSystem';
import type { JumpRecord } from './JumpTelemetry';
import type { RegressionResult } from './MovementRegression';
import type { PlayerFeedbackEntry } from './PlayerFeedback';
import type { PersonalitySnapshot } from '../personality/CharacterPersonalitySystem';

export interface FeelDashboardState {
  movement: FeelSnapshot;
  presetComparison: { presetId: string; label: string; avgRating: number; labRank: number }[];
  jumps: JumpRecord[];
  regression: RegressionResult[];
  feedback: PlayerFeedbackEntry[];
  simHz: number;
  renderHz: number;
  personality?: PersonalitySnapshot;
}

/** Feel dashboard — movement, personality, timeline, regression, experiment, feedback. */

export class FeelDashboard {
  private root: HTMLElement | null = null;
  private tab:
    | 'movement'
    | 'feel'
    | 'personality'
    | 'timeline'
    | 'regression'
    | 'experiment'
    | 'feedback' = 'movement';

  mount(parent: HTMLElement): void {
    this.root = document.createElement('div');
    this.root.id = 'feel-dashboard';
    this.root.innerHTML = `
      <style>
        #feel-dashboard {
          position:fixed;left:0;top:0;width:360px;max-height:100vh;overflow-y:auto;
          background:rgba(8,10,18,0.94);color:#e2e8f0;font:11px/1.4 system-ui,sans-serif;
          padding:10px;z-index:900;border-right:1px solid #334;
        }
        #feel-dashboard h2{font-size:13px;color:#86efac;margin:0 0 6px}
        .fd-tabs{display:flex;flex-wrap:wrap;gap:2px;margin-bottom:8px}
        .fd-tab{padding:3px 6px;background:#1e293b;border:none;color:#94a3b8;cursor:pointer;border-radius:3px;font-size:10px}
        .fd-tab.active{background:#166534;color:#fff}
        .fd-metric{display:flex;justify-content:space-between;padding:1px 0}
        .fd-pass{color:#4ade80}.fd-fail{color:#f87171}
        .fd-btn{margin:3px 2px;padding:3px 7px;background:#15803d;color:#fff;border:none;border-radius:3px;cursor:pointer;font-size:10px}
      </style>
      <h2>Character Feel</h2>
      <div class="fd-tabs" id="fd-tabs"></div>
      <div id="fd-body"></div>
    `;
    parent.appendChild(this.root);
    this.bindTabs();
  }

  render(state: FeelDashboardState): void {
    if (!this.root) return;
    const body = this.root.querySelector('#fd-body');
    if (!body) return;
    const m = state.movement;

    switch (this.tab) {
      case 'movement':
        body.innerHTML = `
          <div class="fd-metric"><span>Preset</span><span>${m.preset.label}</span></div>
          <div class="fd-metric"><span>Jump Force</span><span>${m.preset.movement.jumpForce ?? '—'}</span></div>
          <div class="fd-metric"><span>Gravity</span><span>${m.preset.movement.gravity ?? '—'}</span></div>
          <div class="fd-metric"><span>Avg Jump Rating</span><span>${m.avgJumpRating.toFixed(2)}</span></div>
          <div class="fd-metric"><span>Corrections</span><span>${m.corrections}</span></div>
          <div class="fd-metric"><span>Sim / Render</span><span>${state.simHz}/${state.renderHz} Hz</span></div>
          ${m.latestJump ? `<div style="margin-top:6px;font-size:10px;color:#94a3b8">Last: apex=${m.latestJump.apexHeight.toFixed(2)} rating=${m.latestJump.rating}</div>` : ''}
        `;
        break;
      case 'feel':
        body.innerHTML = `
          <div class="fd-metric"><span>Air Control</span><span>${m.feel.airControl}</span></div>
          <div class="fd-metric"><span>Apex Hang</span><span>${m.apexHang ? 'active' : 'off'}</span></div>
          <div class="fd-metric"><span>Corner Corr.</span><span>${m.feel.cornerCorrection}</span></div>
          <div class="fd-metric"><span>Ground Snap</span><span>${m.feel.groundSnap}</span></div>
          <div class="fd-metric"><span>Ledge Snap</span><span>${m.feel.ledgeSnap}</span></div>
          <div class="fd-metric"><span>Fast Fall</span><span>${m.feel.fastFallMultiplier}x</span></div>
          <div class="fd-metric"><span>Recovery</span><span>${m.feel.landingRecoveryDuration}s</span></div>
        `;
        break;
      case 'personality': {
        const p = state.personality;
        body.innerHTML = p
          ? `
          <div class="fd-metric"><span>Personality</span><span>${p.profile.label}</span></div>
          <div class="fd-metric"><span>Phase</span><span>${p.visual.phase}</span></div>
          <div class="fd-metric"><span>Mood</span><span>${p.mood}</span></div>
          <div class="fd-metric"><span>Expression</span><span>${p.visual.expression ?? '—'}</span></div>
          <div class="fd-metric"><span>Squash</span><span>${p.visual.squashY.toFixed(2)}</span></div>
          <div class="fd-metric"><span>Input Predict</span><span>${p.inputVisual.predictedJump ? 'yes' : 'no'}</span></div>
          <div class="fd-metric"><span>Forgiveness</span><span>${p.inputVisual.forgivenessActive ? 'active' : 'off'}</span></div>
          ${p.expressions.map((e) => `<div class="fd-pass">${e.message}</div>`).join('')}
        `
          : '<em>Personality system not active</em>';
        break;
      }
      case 'timeline':
        body.innerHTML = state.personality
          ? `<pre style="font-size:9px;color:#94a3b8">${state.personality.timelineAscii}</pre>`
          : '<em>No timeline data</em>';
        break;
      case 'regression':
        body.innerHTML =
          [
            ...state.regression.slice(-3).map(
              (r) =>
                `<div class="${r.passed ? 'fd-pass' : 'fd-fail'}">move: ${r.passed ? 'PASS' : 'FAIL'}</div>`,
            ),
            state.personality?.regression
              ? `<div class="${state.personality.regression.passed ? 'fd-pass' : 'fd-fail'}">feel: ${state.personality.regression.passed ? 'PASS' : 'FAIL'} ${state.personality.regression.reasons.join(', ')}</div>`
              : '',
          ].join('') || '<em>No regression runs</em>';
        break;
      case 'experiment':
        body.innerHTML = state.presetComparison
          .map(
            (p) =>
              `<div class="fd-metric"><span>${p.label} (#${p.labRank})</span><span>${p.avgRating.toFixed(2)}</span></div>`,
          )
          .join('');
        break;
      case 'feedback':
        body.innerHTML =
          state.feedback.length === 0
            ? `<div class="fd-metric"><span>Satisfaction</span><span>${m.feedbackScore.toFixed(1)}/5</span></div><em>No feedback yet — press F</em>`
            : state.feedback
                .slice(-5)
                .map((f) => `<div>${f.evidenceSummary}</div>`)
                .join('');
        break;
    }
  }

  bindPresetButtons(handlers: {
    onPreset: (id: string) => void;
    onRegression: () => void;
    onFeedback: () => void;
    onPersonality?: (id: string) => void;
    onFeelRegression?: () => void;
  }): void {
    const body = this.root?.querySelector('#fd-body');
    if (!body) return;
    const controls = document.createElement('div');
    controls.innerHTML = `
      <button class="fd-btn" data-p="preset-a">A</button>
      <button class="fd-btn" data-p="preset-b">B</button>
      <button class="fd-btn" data-p="preset-c">C</button>
      <button class="fd-btn" id="fd-reg">Regression</button>
      <button class="fd-btn" id="fd-fb">Feedback</button>
      <button class="fd-btn" data-personality="classic">Classic</button>
      <button class="fd-btn" data-personality="agile">Agile</button>
      <button class="fd-btn" data-personality="heavy">Heavy</button>
      <button class="fd-btn" id="fd-feel-reg">Feel Reg</button>
    `;
    this.root?.appendChild(controls);
    controls.querySelectorAll('[data-p]').forEach((btn) => {
      btn.addEventListener('click', () => handlers.onPreset((btn as HTMLElement).dataset.p!));
    });
    controls.querySelector('#fd-reg')?.addEventListener('click', handlers.onRegression);
    controls.querySelector('#fd-fb')?.addEventListener('click', handlers.onFeedback);
    controls.querySelectorAll('[data-personality]').forEach((btn) => {
      btn.addEventListener('click', () => handlers.onPersonality?.((btn as HTMLElement).dataset.personality!));
    });
    controls.querySelector('#fd-feel-reg')?.addEventListener('click', () => handlers.onFeelRegression?.());
  }

  private bindTabs(): void {
    const tabs = ['movement', 'feel', 'personality', 'timeline', 'regression', 'experiment', 'feedback'] as const;
    const el = this.root?.querySelector('#fd-tabs');
    if (!el) return;
    tabs.forEach((t) => {
      const btn = document.createElement('button');
      btn.className = `fd-tab${t === this.tab ? ' active' : ''}`;
      btn.textContent = t;
      btn.addEventListener('click', () => {
        this.tab = t;
        el.querySelectorAll('.fd-tab').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
      });
      el.appendChild(btn);
    });
  }

  unmount(): void {
    this.root?.remove();
    this.root = null;
  }
}
