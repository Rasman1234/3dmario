/** Bayesian belief updating for hypothesis confidence. */

export interface PosteriorSnapshot {
  mean: number;
  ciLow: number;
  ciHigh: number;
  timestamp: number;
}

export class BayesianUpdater {
  private readonly history: PosteriorSnapshot[] = [];

  /** Beta-binomial style update: prior mean, observation 0|1, noise. */
  update(priorMean: number, observation: number, noise = 0.1): PosteriorSnapshot {
    const priorA = priorMean * 10;
    const priorB = (1 - priorMean) * 10;
    const likelihood = observation;
    const postA = priorA + likelihood;
    const postB = priorB + (1 - likelihood);
    const mean = postA / (postA + postB);
    const variance = (postA * postB) / ((postA + postB) ** 2 * (postA + postB + 1));
    const std = Math.sqrt(variance) + noise;
    const snap: PosteriorSnapshot = {
      mean,
      ciLow: Math.max(0, mean - 1.96 * std),
      ciHigh: Math.min(1, mean + 1.96 * std),
      timestamp: Date.now(),
    };
    this.history.push(snap);
    return snap;
  }

  getHistory(): PosteriorSnapshot[] {
    return [...this.history];
  }

  getLatest(): PosteriorSnapshot | undefined {
    return this.history[this.history.length - 1];
  }

  reset(): void {
    this.history.length = 0;
  }
}
