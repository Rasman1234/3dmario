import { Engine } from '../core/Engine';
import { GameLoop } from '../core/GameLoop';
import { InputManager } from '../core/InputManager';
import { Time } from '../core/Time';
import { EventBus } from '../infrastructure/EventBus';
import { ServiceLocator, Services } from '../infrastructure/ServiceLocator';
import { ConfigManager } from '../infrastructure/ConfigManager';
import { SaveManager } from '../infrastructure/SaveManager';
import { GameStateMachine } from '../state/GameStateMachine';
import { GameStateId, InputAction, DEFAULT_CHARACTER_STATS } from '../domain/types';
import { MovementState } from '../gameplay/MovementState';
import { PhysicsWorld } from '../physics/PhysicsWorld';
import { SpringArmCamera } from '../camera/SpringArmCamera';
import { PlayerCharacter } from '../characters/PlayerCharacter';
import { GameplayPipeline } from '../gameplay/GameplayPipeline';
import { GameplayOrchestrator } from '../systems/GameplayOrchestrator';
import { EnemyAI } from '../ai/EnemyAI';
import { EnemyRenderer } from '../ai/EnemyRenderer';
import { CombatSystem } from '../combat/CombatSystem';
import { AttackType } from '../combat/AttackType';
import { PowerUpManager } from '../powerups/PowerUpManager';
import { CollectibleManager } from '../items/CollectibleManager';
import { CollectibleRenderer } from '../items/CollectibleRenderer';
import { LevelManager } from '../world/LevelManager';
import { LevelScene } from '../world/LevelScene';
import { BossController } from '../bosses/BossController';
import { BossRenderer } from '../bosses/BossRenderer';
import { ParticleSystem } from '../effects/ParticleSystem';
import * as THREE from 'three';
import { AudioManager } from '../audio/AudioManager';
import { SoundId } from '../audio/SoundId';
import { UIManager } from '../ui/UIManager';
import { GameFeelController } from '../systems/GameFeelController';
import { PerformanceMonitor } from '../systems/PerformanceOptimizer';
import { FeelDashboard } from '../gameplay/feel/FeelDashboard';
import levelData from '../data/levels/grassland_01.json';

/** Composition root — wires all 16 phases via event bus. */

export class GameApplication {
  private readonly events = new EventBus();
  private readonly config: ConfigManager;
  private readonly save: SaveManager;
  private readonly stateMachine: GameStateMachine;
  private readonly pipeline: GameplayPipeline;
  private readonly orchestrator: GameplayOrchestrator;
  private readonly enemyAI = new EnemyAI();
  private readonly combat: CombatSystem;
  private readonly powerUps: PowerUpManager;
  private readonly collectibles: CollectibleManager;
  private readonly levelManager: LevelManager;
  private readonly boss: BossController;
  private readonly feel: GameFeelController;
  private readonly perf = new PerformanceMonitor();
  private readonly feelDashboard = new FeelDashboard();
  private showFeelDashboard = false;
  private feelDashboardTick = 0;

  private engine!: Engine;
  private loop!: GameLoop;
  private input!: InputManager;
  private physics!: PhysicsWorld;
  private camera!: SpringArmCamera;
  private player!: PlayerCharacter;
  private enemyRenderer!: EnemyRenderer;
  private collectibleRenderer!: CollectibleRenderer;
  private levelScene!: LevelScene;
  private bossRenderer!: BossRenderer;
  private particles!: ParticleSystem;
  private audio!: AudioManager;
  private ui!: UIManager;

  private playerHealth = DEFAULT_CHARACTER_STATS.health;
  private bossActive = false;
  private levelLoaded = false;
  private renderFrameCount = 0;
  private loadingScreen!: HTMLElement;
  private flashOverlay!: HTMLElement;

  constructor() {
    this.config = new ConfigManager();
    this.save = new SaveManager();
    const saveData = this.save.load();
    this.config.updateSettings(saveData.settings);
    this.playerHealth = saveData.progress.stats.health;

    ServiceLocator.register(Services.EVENT_BUS, this.events);
    ServiceLocator.register(Services.CONFIG, this.config);
    ServiceLocator.register(Services.SAVE, this.save);

    this.stateMachine = new GameStateMachine((from, to) => {
      this.events.emit('state:changed', { from, to });
      this.onStateChanged(to);
    });
    ServiceLocator.register(Services.STATE_MACHINE, this.stateMachine);

    this.pipeline = new GameplayPipeline();
    this.orchestrator = new GameplayOrchestrator(this.events);
    this.combat = new CombatSystem(this.events, saveData.progress.stats.attackDamage);
    this.powerUps = new PowerUpManager(this.events);
    this.collectibles = new CollectibleManager(this.events);
    this.levelManager = new LevelManager(this.events);
    this.boss = new BossController(this.events);
    this.feel = new GameFeelController(this.events);

    this.events.emit('app:boot', undefined);
    this.bootstrap().catch((err) => {
      console.error('Game bootstrap failed:', err);
      this.showBootstrapError(err);
    });
  }

  private showBootstrapError(err: unknown): void {
    const uiRoot = document.getElementById('ui-root');
    if (!uiRoot) return;
    const el = document.createElement('div');
    el.id = 'bootstrap-error';
    el.style.cssText =
      'position:fixed;inset:0;background:#1a0000;color:#ff8888;padding:2rem;font-family:monospace;z-index:9999';
    el.innerHTML = `<h2>Startup Failed</h2><pre>${String(err)}</pre>`;
    uiRoot.appendChild(el);
  }

  private async bootstrap(): Promise<void> {
    const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
    const uiRoot = document.getElementById('ui-root')!;
    this.setupDom(uiRoot);

    this.engine = new Engine(canvas);
    this.engine.applySettings(this.config.getSettings());

    const engineConfig = this.config.getEngineConfig();
    this.physics = await PhysicsWorld.create(engineConfig.gravity);
    this.camera = new SpringArmCamera(this.engine.scene, canvas.clientWidth / canvas.clientHeight, this.config.getSettings().cameraDistance);
    this.engine.camera = this.camera.camera;

    this.player = new PlayerCharacter();
    this.enemyRenderer = new EnemyRenderer();
    this.collectibleRenderer = new CollectibleRenderer();
    this.levelScene = new LevelScene();
    this.bossRenderer = new BossRenderer();
    this.particles = new ParticleSystem();

    this.engine.scene.add(
      this.levelScene.root,
      this.player.root,
      this.enemyRenderer.group,
      this.collectibleRenderer.group,
      this.bossRenderer.group,
      this.particles.group,
    );

    this.audio = new AudioManager();
    await this.audio.init();
    this.audio.applySettings(this.config.getSettings());

    this.ui = new UIManager(uiRoot, this.events, this.stateMachine);
    this.ui.showMainMenu(true);
    this.feel.setCamera(this.camera);
    this.feel.setFlashElement(this.flashOverlay);

    const loop = new GameLoop(
      engineConfig.fixedTimestep,
      engineConfig.maxFrameTime,
      engineConfig.renderHz,
    );
    this.loop = loop;
    ServiceLocator.register(Services.GAME_LOOP, loop);

    this.input = new InputManager();
    this.pipeline.initPersonality(this.events);
    this.showFeelDashboard =
      new URLSearchParams(window.location.search).get('feel') === '1' ||
      new URLSearchParams(window.location.search).get('feel') === 'true';
    if (this.showFeelDashboard) {
      this.feelDashboard.mount(uiRoot);
      this.feelDashboard.bindPresetButtons({
        onPreset: (id) => this.pipeline.feel.applyPreset(id),
        onRegression: () => this.pipeline.feel.runRegressionCheck(),
        onFeedback: () => this.submitPlaytestFeedback(),
        onPersonality: (id) => this.pipeline.personality?.applyPersonality(id),
        onFeelRegression: () => this.pipeline.personality?.runRegression(),
      });
    }
    this.wireLoop();
    this.wireEvents();

    await this.prepareWorld();

    this.stateMachine.transition(GameStateId.Loading);
    await this.simulateLoad();
    this.stateMachine.transition(GameStateId.MainMenu);
    this.syncPlayerToSpawn();
    this.audio.playMusic(SoundId.MusicMenu);
    loop.start();
    this.events.emit('app:ready', undefined);
    this.exposeStartupAudit();
  }

  /** E2E / integration audit hook — read-only startup state. */
  private exposeStartupAudit(): void {
    const app = this;
    (window as unknown as { __GAME_STARTUP__?: object }).__GAME_STARTUP__ = {
      getAudit: () => app.getStartupAudit(),
      startPlaying: () => app.stateMachine.transition(GameStateId.LevelLoading),
      advanceFrames: (count: number) => app.advanceFrames(count),
    };
  }

  /** Deterministic frame pump for E2E — runs real update + render without RAF throttling. */
  advanceFrames(count: number): void {
    for (let i = 0; i < count; i++) {
      this.loop.stepOnce();
    }
  }

  getStartupAudit(): Record<string, unknown> {
    const scene = this.engine?.scene;
    let lights = 0;
    let meshes = 0;
    scene?.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) meshes++;
      if ((obj as THREE.Light).isLight) lights++;
    });
    const player = scene?.getObjectByName('player');
    const canvas = document.getElementById('game-canvas') as HTMLCanvasElement | null;
    return {
      canvasCreated: !!canvas,
      rendererInitialized: !!this.engine?.renderer,
      sceneAttached: !!scene && scene.children.length > 0,
      cameraAttached: !!this.engine?.camera,
      lightCount: lights,
      meshCount: meshes,
      playerExists: !!player,
      groundExists: meshes >= 2,
      levelLoaded: this.levelLoaded,
      physicsReady: this.physics?.isReady ?? false,
      loopRunning: this.loop?.isRunning ?? false,
      gameState: this.stateMachine.current,
      playerPosition: { ...this.pipeline.movement.position },
      mainMenuVisible: !document.getElementById('main-menu')?.classList.contains('hidden'),
      hudVisible: !!document.getElementById('game-hud'),
      canvasWidth: canvas?.width ?? 0,
      canvasHeight: canvas?.height ?? 0,
      renderFrameCount: this.renderFrameCount,
      cameraHasTarget: this.camera?.hasTarget ?? false,
      worldVisible: meshes >= 3,
    };
  }

  /** Load level geometry, physics, and entities at boot — world visible on main menu. */
  private async prepareWorld(): Promise<void> {
    const config = await this.levelManager.load('grassland_01', this.physics, this.enemyAI, this.collectibles);
    this.levelScene.build(config);
    const spawn = this.levelManager.getSpawn();
    this.orchestrator.initPhysics(this.physics, this.pipeline, spawn);
    this.syncPlayerToSpawn();

    if (config.hasBoss && levelData.boss) {
      this.boss.init(levelData.boss);
      this.bossActive = true;
    }

    this.levelLoaded = true;
    this.events.emit('level:load', { levelId: 'grassland_01', worldId: 'grassland' });
  }

  private syncPlayerToSpawn(): void {
    const spawn = this.levelManager.getSpawn();
    this.player.setPosition(spawn);
    this.player.setRotation(0);
    this.camera.setTarget(spawn);
    this.camera.update(0, 0);
  }

  private setupDom(uiRoot: HTMLElement): void {
    this.loadingScreen = document.createElement('div');
    this.loadingScreen.id = 'loading-screen';
    this.loadingScreen.innerHTML = `
      <div class="loading-content">
        <h1>3D Platform Adventure</h1>
        <p class="loading-status">Initializing...</p>
        <div class="loading-bar"><div class="loading-fill"></div></div>
      </div>`;
    uiRoot.appendChild(this.loadingScreen);

    this.flashOverlay = document.createElement('div');
    this.flashOverlay.id = 'flash-overlay';
    uiRoot.appendChild(this.flashOverlay);
  }

  private wireLoop(): void {
    this.loop.onUpdate((dt) => {
      const scaled = Time.scaledDelta(dt);
      this.perf.tick();

      if (this.stateMachine.is(GameStateId.MainMenu)) {
        this.syncPlayerToSpawn();
        this.camera.update(scaled, 0);
        this.player.update(scaled);
        if (this.input.isActionJustPressed(InputAction.Confirm)) {
          this.ui.showMainMenu(false);
          this.stateMachine.transition(GameStateId.LevelLoading);
        }
      }

      if (this.stateMachine.is(GameStateId.Playing, GameStateId.BossFight, GameStateId.BossIntro)) {
        if (this.input.isActionJustPressed(InputAction.Pause) && !this.stateMachine.is(GameStateId.BossIntro)) {
          this.stateMachine.transition(GameStateId.Paused);
        }

        if (!this.stateMachine.is(GameStateId.BossIntro)) {
          this.orchestrator.update(scaled, this.input, this.pipeline, this.physics, this.player, this.camera);
          if (this.pipeline.personality) {
            const visual = this.pipeline.personality.update(scaled, this.input);
            this.player.applyPersonalityVisual(visual);
          }
        }

        if (this.showFeelDashboard && ++this.feelDashboardTick % 30 === 0) {
          const ec = this.config.getEngineConfig();
          const personality = this.pipeline.personality;
          this.feelDashboard.render({
            movement: this.pipeline.feel.snapshot(),
            presetComparison: this.pipeline.feel.comparePresets(),
            jumps: this.pipeline.feel.telemetry.getLog().slice(-10),
            regression: this.pipeline.feel.regression.getHistory(),
            feedback: this.pipeline.feel.feedback.list(),
            simHz: ec.simulationHz ?? Math.round(1 / ec.fixedTimestep),
            renderHz: ec.renderHz ?? 60,
            personality: personality?.snapshot(),
          });
        }

        if (!this.stateMachine.is(GameStateId.BossIntro)) {
          if (this.input.isActionJustPressed(InputAction.Attack)) {
            const snap = this.pipeline.movement.snapshot();
            const type = snap.state === MovementState.GroundPound ? AttackType.GroundPound
              : snap.state === MovementState.Jump || snap.state === MovementState.DoubleJump ? AttackType.Jump
              : AttackType.Basic;
            const hits = this.combat.attack(type, snap.position, snap.facingAngle, this.enemyAI, this.pipeline.movement);
            if (this.bossActive && !this.boss.isDefeated && hits === 0) {
              const dist = Math.hypot(
                snap.position.x - this.boss.position.x,
                snap.position.z - this.boss.position.z,
              );
              if (dist < 4) {
                const dmg = Math.round(DEFAULT_CHARACTER_STATS.attackDamage * this.powerUps.damageMult);
                this.boss.takeDamage(dmg);
                this.ui.updateBossBar(this.boss.hp);
              }
            }
          }
        }

        const playerPos = this.pipeline.movement.position;

        const cpIndex = this.levelManager.probeCheckpoint(playerPos);
        if (cpIndex !== null) {
          this.levelManager.activateCheckpoint(cpIndex);
        }

        const enemyResult = this.enemyAI.update(scaled, playerPos);
        this.collectibles.update(playerPos, this.powerUps.magnetRange, scaled);
        this.powerUps.update(scaled);
        this.combat.update(scaled);
        this.levelManager.update(scaled);
        this.feel.update(scaled);

        if (!this.powerUps.isInvincible) {
          this.playerHealth = this.combat.processEnemyAttacks(
            enemyResult.attacks,
            this.pipeline.movement,
            { health: this.playerHealth, defense: DEFAULT_CHARACTER_STATS.defense },
          );
        }

        if (this.bossActive && !this.boss.isDefeated) {
          const bossResult = this.boss.update(scaled, playerPos);
          if (bossResult.damage > 0 && !this.powerUps.isInvincible) {
            this.playerHealth -= bossResult.damage;
            this.events.emit('player:damaged', { amount: bossResult.damage, remaining: this.playerHealth });
          }
          this.ui.updateBossBar(this.boss.hp);
        }

        if (this.playerHealth <= 0) {
          const respawn = this.levelManager.respawnAtCheckpoint();
          this.orchestrator.initPhysics(this.physics, this.pipeline, respawn);
          this.playerHealth = DEFAULT_CHARACTER_STATS.health;
          this.events.emit('player:respawn', { checkpointIndex: this.levelManager.getCheckpointIndex() });
        }

        if (this.bossActive && this.boss.isDefeated) {
          this.stateMachine.transition(GameStateId.LevelComplete);
        }

        this.enemyRenderer.sync(this.enemyAI.enemies);
        this.collectibleRenderer.sync(this.collectibles.items);
        this.collectibleRenderer.update(scaled);
        if (this.bossActive) this.bossRenderer.sync(this.boss);
        this.bossRenderer.update(scaled);
        this.particles.update(scaled);
        this.checkBossTrigger();
      }

      if (this.stateMachine.is(GameStateId.Paused)) {
        if (this.input.isActionJustPressed(InputAction.Pause) || this.input.isActionJustPressed(InputAction.Confirm)) {
          this.stateMachine.transition(GameStateId.Playing);
        }
      }

      this.events.emit('perf:frame', {
        fps: this.perf.averageFps,
        drawCalls: 0,
        triangles: 0,
      });

      this.input.endFrame();
    });

    this.loop.onRender(() => {
      this.renderFrameCount++;
      this.engine.render();
    });
  }

  private wireEvents(): void {
    this.events.on('settings:changed', ({ partial }) => {
      const settings = this.config.updateSettings(partial);
      this.engine.applySettings(settings);
      this.audio.applySettings(settings);
    });

    this.events.on('save:requested', () => {
      const data = this.save.load();
      data.progress.stats.health = this.playerHealth;
      data.progress.totalCoins = this.collectibles.totalCoins;
      this.save.save(data);
      this.events.emit('save:completed', { slot: 0 });
    });

    this.events.on('enemy:defeated', () => {
      this.audio.playSfx(SoundId.EnemyDefeat);
      const pos = this.pipeline.movement.position;
      this.particles.burst({ x: pos.x, y: pos.y + 1, z: pos.z }, 'explosion');
    });

    this.events.on('coin:collected', () => this.audio.playSfx(SoundId.Coin));
    this.events.on('powerup:collected', () => this.audio.playSfx(SoundId.PowerUp));
    this.events.on('player:damaged', () => {
      this.audio.playSfx(SoundId.PlayerHurt);
      this.pipeline.personality?.onDamaged();
    });
    this.events.on('feel:dust', ({ position }) => {
      this.particles.burst(position, 'dust');
    });
    this.events.on('audio:play_sfx', ({ id }) => {
      const map: Record<string, SoundId> = {
        land: SoundId.Land,
        jump: SoundId.Jump,
        coin: SoundId.Coin,
        checkpoint: SoundId.Checkpoint,
        powerup: SoundId.PowerUp,
      };
      if (map[id]) this.audio.playSfx(map[id]);
    });
    this.events.on('boss:defeated', () => {
      this.audio.playSfx(SoundId.Explosion);
      this.ui.hideBossBar();
    });
  }

  private async simulateLoad(): Promise<void> {
    const fill = this.loadingScreen.querySelector('.loading-fill') as HTMLElement;
    const status = this.loadingScreen.querySelector('.loading-status') as HTMLElement;
    const steps = ['Loading physics...', 'Building world...', 'Spawning entities...', 'Ready!'];
    for (let i = 0; i < steps.length; i++) {
      status.textContent = steps[i]!;
      fill.style.width = `${((i + 1) / steps.length) * 100}%`;
      await new Promise((r) => setTimeout(r, 250));
    }
    this.loadingScreen.classList.add('hidden');
  }

  private onStateChanged(state: GameStateId): void {
    if (state === GameStateId.LevelLoading) void this.startLevel();

    if (state === GameStateId.Playing) {
      Time.resume();
      this.input.setEnabled(true);
      this.audio.playMusic(SoundId.MusicLevel);
    }

    if (state === GameStateId.Paused) {
      Time.pause();
      this.input.setEnabled(false);
    }

    if (state === GameStateId.MainMenu) {
      this.audio.playMusic(SoundId.MusicMenu);
      this.ui.showMainMenu(true);
      this.input.setEnabled(true);
    }

    if (state === GameStateId.BossFight) {
      this.audio.playMusic(SoundId.MusicBoss);
    }

    if (state === GameStateId.LevelComplete) {
      this.pipeline.personality?.onVictory();
      this.events.emit('level:complete', {
        levelId: 'grassland_01',
        stars: this.collectibles.totalStars,
        coins: this.collectibles.totalCoins,
        time: this.levelManager.time,
      });
      this.events.emit('save:requested', { manual: false });
    }
  }

  private async startLevel(): Promise<void> {
    if (!this.levelLoaded) {
      await this.prepareWorld();
    } else {
      const spawn = this.levelManager.getSpawn();
      this.orchestrator.initPhysics(this.physics, this.pipeline, spawn);
      this.syncPlayerToSpawn();
    }

    this.ui.showMainMenu(false);
    await new Promise((r) => setTimeout(r, 100));
    this.stateMachine.transition(GameStateId.Playing);
  }

  private submitPlaytestFeedback(): void {
    const preset = this.pipeline.feel.preset;
    this.pipeline.feel.feedback.submit(
      preset.id,
      { responsiveness: 4, readability: 4, expressiveness: 4, enjoyment: 4 },
      'In-session playtest',
    );
    this.pipeline.feel.runRegressionCheck();
  }

  private checkBossTrigger(): void {
    if (!this.bossActive || this.boss.isDefeated) return;
    if (this.stateMachine.is(GameStateId.BossFight, GameStateId.BossIntro)) return;
    const pos = this.pipeline.movement.position;
    const bp = this.boss.position;
    const dist = Math.hypot(pos.x - bp.x, pos.z - bp.z);
    if (dist < 15) {
      this.stateMachine.transition(GameStateId.BossIntro);
      setTimeout(() => {
        if (!this.boss.isDefeated) this.stateMachine.transition(GameStateId.BossFight);
      }, 1500);
    }
  }

  shutdown(): void {
    this.loop?.stop();
    this.feelDashboard.unmount();
    this.physics?.dispose();
    this.engine?.dispose();
    this.player?.dispose();
    this.enemyRenderer?.dispose();
    this.collectibleRenderer?.dispose();
    this.levelScene?.dispose();
    this.bossRenderer?.dispose();
    this.particles?.dispose();
    this.audio?.dispose();
    this.input?.dispose();
    this.events.emit('app:shutdown', undefined);
    ServiceLocator.clear();
  }
}
