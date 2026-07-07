import { GameApplication } from './app/GameApplication';
import { ResearchLabApplication } from './app/ResearchLabApplication';

const params = new URLSearchParams(window.location.search);
const isLab = params.get('lab') === '1' || params.get('lab') === 'true';

if (isLab) {
  const appRoot = document.getElementById('app') ?? document.body;
  const lab = new ResearchLabApplication();
  lab.start(appRoot).catch(console.error);
  window.addEventListener('beforeunload', () => lab.shutdown());
} else {
  const app = new GameApplication();
  window.addEventListener('beforeunload', () => app.shutdown());
}
