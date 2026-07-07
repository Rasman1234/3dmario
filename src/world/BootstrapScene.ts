import * as THREE from 'three';

/** Default scene lighting — visible before level build. */

export function addDefaultLighting(scene: THREE.Scene): void {
  if (scene.getObjectByName('bootstrap-sun')) return;
  const sun = new THREE.DirectionalLight(0xfff5e6, 1.0);
  sun.name = 'bootstrap-sun';
  sun.position.set(15, 30, 10);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  scene.add(sun);
  const ambient = new THREE.AmbientLight(0xffffff, 0.5);
  ambient.name = 'bootstrap-ambient';
  scene.add(ambient);
}
