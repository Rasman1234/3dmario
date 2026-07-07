/** Statistical validation — CI, effect size, sample requirements, repeatability. */

export class StatisticalValidator {
  mean(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  variance(values: number[]): number {
    if (values.length < 2) return 0;
    const m = this.mean(values);
    return values.reduce((s, v) => s + (v - m) ** 2, 0) / (values.length - 1);
  }

  confidenceInterval(values: number[], _alpha = 0.05): [number, number] {
    if (values.length === 0) return [0, 0];
    const m = this.mean(values);
    const std = Math.sqrt(this.variance(values));
    const z = 1.96;
    const margin = z * (std / Math.sqrt(values.length));
    return [m - margin, m + margin];
  }

  cohensD(groupA: number[], groupB: number[]): number {
    const mA = this.mean(groupA);
    const mB = this.mean(groupB);
    const vA = this.variance(groupA);
    const vB = this.variance(groupB);
    const pooled = Math.sqrt((vA + vB) / 2) || 1;
    return (mA - mB) / pooled;
  }

  requiredSampleSize(effectSize: number, _power = 0.8, _alpha = 0.05): number {
    const zAlpha = 1.96;
    const zBeta = 0.84;
    const d = Math.max(Math.abs(effectSize), 0.1);
    return Math.ceil(((zAlpha + zBeta) / d) ** 2);
  }

  repeatability(hashes: string[]): number {
    if (hashes.length < 2) return 1;
    const first = hashes[0];
    const matches = hashes.filter((h) => h === first).length;
    return matches / hashes.length;
  }
}
