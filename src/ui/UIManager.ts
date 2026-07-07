import type { EventBus } from '../infrastructure/EventBus';
import type { GameStateMachine } from '../state/GameStateMachine';
import { GameStateId } from '../domain/types';

/** Coordinates HUD, menus, and overlays via events. */

export class UIManager {
  private readonly hud: HUD;
  private readonly pauseMenu: PauseMenu;
  private readonly gameOver: GameOverScreen;
  private readonly mainMenu: MainMenuScreen;

  constructor(
    root: HTMLElement,
    private readonly events: EventBus,
    stateMachine: GameStateMachine,
  ) {
    this.hud = new HUD(root);
    this.mainMenu = new MainMenuScreen(root, stateMachine);
    this.pauseMenu = new PauseMenu(root, events, stateMachine);
    this.gameOver = new GameOverScreen(root, events, stateMachine);
    this.wireEvents();
  }

  showMainMenu(visible: boolean): void {
    this.mainMenu.setVisible(visible);
  }

  private wireEvents(): void {
    this.events.on('coin:collected', ({ total }) => this.hud.setCoins(total));
    this.events.on('player:damaged', ({ remaining }) => this.hud.setHealth(remaining));
    this.events.on('state:changed', ({ to }) => {
      this.hud.setStatus(to);
      this.mainMenu.setVisible(to === GameStateId.MainMenu);
      this.pauseMenu.setVisible(to === GameStateId.Paused);
      this.gameOver.setVisible(to === GameStateId.GameOver);
    });
    this.events.on('boss:phase_changed', ({ phase }) => this.hud.setBossPhase(phase));
    this.events.on('perf:frame', ({ fps }) => this.hud.setFps(fps));
  }

  showBossBar(name: string, hp: number, maxHp: number): void {
    this.hud.showBossBar(name, hp, maxHp);
  }

  updateBossBar(hp: number): void {
    this.hud.updateBossBar(hp);
  }

  hideBossBar(): void {
    this.hud.hideBossBar();
  }
}

class HUD {
  private readonly el: HTMLElement;
  private readonly healthEl: HTMLElement;
  private readonly coinsEl: HTMLElement;
  private readonly starsEl: HTMLElement;
  private readonly statusEl: HTMLElement;
  private readonly fpsEl: HTMLElement;
  private readonly bossBar: HTMLElement;
  private readonly bossFill: HTMLElement;

  constructor(root: HTMLElement) {
    this.el = document.createElement('div');
    this.el.id = 'game-hud';
    this.el.innerHTML = `
      <div class="hud-row">
        <div id="hud-health" class="hud-hearts"></div>
        <div id="hud-coins" class="hud-stat">🪙 0</div>
        <div id="hud-stars" class="hud-stat">⭐ 0</div>
        <div id="hud-fps-game" class="hud-fps">60 FPS</div>
      </div>
      <div id="hud-status-game" class="hud-status-label">Playing</div>
      <div id="hud-boss" class="hud-boss hidden">
        <div class="boss-name">Boss</div>
        <div class="boss-bar"><div class="boss-fill"></div></div>
      </div>
    `;
    root.appendChild(this.el);
    this.healthEl = this.el.querySelector('#hud-health')!;
    this.coinsEl = this.el.querySelector('#hud-coins')!;
    this.starsEl = this.el.querySelector('#hud-stars')!;
    this.statusEl = this.el.querySelector('#hud-status-game')!;
    this.fpsEl = this.el.querySelector('#hud-fps-game')!;
    this.bossBar = this.el.querySelector('#hud-boss')!;
    this.bossFill = this.el.querySelector('.boss-fill')!;
    this.setHealth(3);
  }

  setHealth(hp: number): void {
    this.healthEl.innerHTML = Array.from({ length: Math.max(0, hp) }, () => '❤️').join('');
  }

  setCoins(n: number): void {
    this.coinsEl.textContent = `🪙 ${n}`;
  }

  setStars(n: number): void {
    this.starsEl.textContent = `⭐ ${n}`;
  }

  setStatus(s: string): void {
    this.statusEl.textContent = s.replace(/_/g, ' ');
  }

  setFps(fps: number): void {
    this.fpsEl.textContent = `${fps} FPS`;
  }

  setBossPhase(phase: number): void {
    const name = this.bossBar.querySelector('.boss-name');
    if (name) name.textContent = `Boss — Phase ${phase}`;
  }

  showBossBar(name: string, hp: number, maxHp: number): void {
    this.bossBar.classList.remove('hidden');
    this.bossBar.querySelector('.boss-name')!.textContent = name;
    this.bossFill.style.width = `${(hp / maxHp) * 100}%`;
  }

  updateBossBar(hp: number): void {
    const max = parseFloat(this.bossFill.dataset.max ?? '100');
    this.bossFill.style.width = `${(hp / max) * 100}%`;
  }

  hideBossBar(): void {
    this.bossBar.classList.add('hidden');
  }
}

class MainMenuScreen {
  private readonly el: HTMLElement;

  constructor(root: HTMLElement, stateMachine: GameStateMachine) {
    this.el = document.createElement('div');
    this.el.id = 'main-menu';
    this.el.className = 'overlay-menu';
    this.el.innerHTML = `
      <h1 class="main-menu-title">3D Platform Adventure</h1>
      <p class="main-menu-sub">Press <kbd>Enter</kbd> to Play</p>
      <button id="btn-start" type="button">Start Game</button>
    `;
    root.appendChild(this.el);

    const start = () => stateMachine.transition(GameStateId.LevelLoading);
    this.el.querySelector('#btn-start')!.addEventListener('click', start);
  }

  setVisible(v: boolean): void {
    this.el.classList.toggle('hidden', !v);
  }
}

class PauseMenu {
  private readonly el: HTMLElement;

  constructor(
    root: HTMLElement,
    events: EventBus,
    stateMachine: GameStateMachine,
  ) {
    this.el = document.createElement('div');
    this.el.id = 'pause-menu';
    this.el.className = 'overlay-menu hidden';
    this.el.innerHTML = `
      <h2>Paused</h2>
      <button id="btn-resume">Resume</button>
      <button id="btn-save">Save Game</button>
      <button id="btn-quit">Quit to Menu</button>
    `;
    root.appendChild(this.el);

    this.el.querySelector('#btn-resume')!.addEventListener('click', () => {
      stateMachine.transition(GameStateId.Playing);
    });
    this.el.querySelector('#btn-save')!.addEventListener('click', () => {
      events.emit('save:requested', { manual: true });
    });
    this.el.querySelector('#btn-quit')!.addEventListener('click', () => {
      stateMachine.force(GameStateId.MainMenu);
    });
  }

  setVisible(v: boolean): void {
    this.el.classList.toggle('hidden', !v);
  }
}

class GameOverScreen {
  private readonly el: HTMLElement;

  constructor(
    root: HTMLElement,
    _events: EventBus,
    stateMachine: GameStateMachine,
  ) {
    this.el = document.createElement('div');
    this.el.id = 'game-over';
    this.el.className = 'overlay-menu hidden';
    this.el.innerHTML = `
      <h2>Game Over</h2>
      <button id="btn-retry">Retry</button>
      <button id="btn-menu">Main Menu</button>
    `;
    root.appendChild(this.el);

    this.el.querySelector('#btn-retry')!.addEventListener('click', () => {
      stateMachine.force(GameStateId.LevelLoading);
    });
    this.el.querySelector('#btn-menu')!.addEventListener('click', () => {
      stateMachine.force(GameStateId.MainMenu);
    });
  }

  setVisible(v: boolean): void {
    this.el.classList.toggle('hidden', !v);
  }
}
