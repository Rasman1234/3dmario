import { test, expect, type Page } from '@playwright/test';

interface StartupAudit {
  canvasCreated: boolean;
  rendererInitialized: boolean;
  sceneAttached: boolean;
  cameraAttached: boolean;
  lightCount: number;
  meshCount: number;
  playerExists: boolean;
  groundExists: boolean;
  levelLoaded: boolean;
  physicsReady: boolean;
  loopRunning: boolean;
  gameState: string;
  playerPosition: { x: number; y: number; z: number };
  mainMenuVisible: boolean;
  hudVisible: boolean;
  canvasWidth: number;
  canvasHeight: number;
  renderFrameCount: number;
  cameraHasTarget: boolean;
  worldVisible: boolean;
}

async function waitForStartup(page: Page): Promise<void> {
  await page.waitForFunction(() => (window as unknown as { __GAME_STARTUP__?: unknown }).__GAME_STARTUP__, {
    timeout: 60_000,
  });
}

async function getAudit(page: Page): Promise<StartupAudit> {
  return page.evaluate(() => {
    const api = (window as unknown as { __GAME_STARTUP__?: { getAudit: () => StartupAudit } }).__GAME_STARTUP__;
    if (!api) throw new Error('__GAME_STARTUP__ not exposed');
    return api.getAudit();
  });
}

function isBenignConsoleError(message: string): boolean {
  if (message.includes('AudioContext') || message.includes('autoplay')) return true;
  if (message.includes('favicon')) return true;
  if (message.includes('Failed to load resource') && message.includes('404')) return true;
  return false;
}

test.describe('Game startup integration', () => {
  test('full startup pipeline is playable', async ({ page }) => {
    test.setTimeout(180_000);
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', (err) => consoleErrors.push(err.message));

    await page.goto('/');
    await waitForStartup(page);

    const audit = await getAudit(page);
    expect(audit.canvasCreated, 'Canvas created').toBe(true);
    expect(audit.rendererInitialized, 'Renderer initialized').toBe(true);
    expect(audit.sceneAttached, 'Scene attached').toBe(true);
    expect(audit.cameraAttached, 'Camera attached').toBe(true);
    expect(audit.lightCount, 'Lights exist').toBeGreaterThan(0);
    expect(audit.playerExists, 'Player exists').toBe(true);
    expect(audit.groundExists, 'Ground/platforms exist').toBe(true);
    expect(audit.levelLoaded, 'Level loaded').toBe(true);
    expect(audit.physicsReady, 'Physics running').toBe(true);
    expect(audit.loopRunning, 'Render loop running').toBe(true);
    expect(audit.hudVisible, 'HUD visible').toBe(true);
    expect(audit.canvasWidth, 'Canvas has width').toBeGreaterThan(0);
    expect(audit.canvasHeight, 'Canvas has height').toBeGreaterThan(0);
    expect(audit.cameraHasTarget, 'Camera has target').toBe(true);

    // Main menu OR playing — must show menu at boot
    expect(audit.mainMenuVisible, 'Main menu visible at boot').toBe(true);
    await expect(page.locator('#main-menu')).toBeVisible();
    await expect(page.locator('#game-hud')).toBeVisible();

    // Wait for rendered frames with world content (not clear-color only)
    await page.waitForFunction(
      () => {
        const api = (window as unknown as { __GAME_STARTUP__?: { getAudit: () => StartupAudit } }).__GAME_STARTUP__;
        const a = api?.getAudit();
        return a && a.renderFrameCount >= 10 && a.worldVisible && a.meshCount >= 3;
      },
      { timeout: 15_000 },
    );
    const afterRender = await getAudit(page);
    expect(afterRender.worldVisible, 'World meshes loaded (not sky-clear only)').toBe(true);
    expect(afterRender.meshCount, 'Scene has renderable meshes').toBeGreaterThanOrEqual(3);

    // Start game
    await page.keyboard.press('Enter');
    await page.waitForFunction(
      () => {
        const api = (window as unknown as { __GAME_STARTUP__?: { getAudit: () => StartupAudit } }).__GAME_STARTUP__;
        return api?.getAudit().gameState === 'playing';
      },
      { timeout: 15_000 },
    );

    const playing = await getAudit(page);
    expect(playing.gameState).toBe('playing');
    expect(playing.mainMenuVisible).toBe(false);

    const startPos = playing.playerPosition;

    // WASD movement
    await page.keyboard.down('KeyW');
    for (let i = 0; i < 30; i++) await page.waitForTimeout(16);
    await page.keyboard.up('KeyW');

    const afterMove = await getAudit(page);
    const moved = Math.hypot(
      afterMove.playerPosition.x - startPos.x,
      afterMove.playerPosition.z - startPos.z,
    );
    expect(moved, 'WASD moves player').toBeGreaterThan(0.1);

    // Jump
    await page.keyboard.press('Space');
    for (let i = 0; i < 30; i++) await page.waitForTimeout(16);
    const afterJump = await getAudit(page);
    expect(afterJump.playerPosition.y, 'Space jumps').toBeGreaterThanOrEqual(startPos.y - 0.5);

    // 300 rendered frames without exceptions (pump real update+render; headless RAF is throttled)
    const framesBefore = afterJump.renderFrameCount;
    await page.evaluate(() => {
      const api = (window as unknown as { __GAME_STARTUP__?: { advanceFrames: (n: number) => void } })
        .__GAME_STARTUP__;
      api?.advanceFrames(300);
    });

    const finalAudit = await getAudit(page);
    expect(finalAudit.loopRunning).toBe(true);
    expect(finalAudit.physicsReady).toBe(true);
    expect(finalAudit.renderFrameCount - framesBefore, '300 render frames').toBeGreaterThanOrEqual(300);

    const criticalErrors = consoleErrors.filter((e) => !isBenignConsoleError(e));
    expect(criticalErrors, `Console clean: ${criticalErrors.join('; ')}`).toEqual([]);
  });
});
