export enum EnemyType {
  Walker = 'walker',
  Runner = 'runner',
  Flyer = 'flyer',
  Jumper = 'jumper',
  Shooter = 'shooter',
  Heavy = 'heavy',
  Tank = 'tank',
  MiniBoss = 'mini_boss',
}

export enum BehaviorState {
  Idle = 'idle',
  Patrol = 'patrol',
  Search = 'search',
  Chase = 'chase',
  Attack = 'attack',
  Retreat = 'retreat',
  Sleep = 'sleep',
  Stunned = 'stunned',
  Dead = 'dead',
}
