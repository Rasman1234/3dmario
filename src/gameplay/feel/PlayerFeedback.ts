export type FeedbackRating = 1 | 2 | 3 | 4 | 5;

export interface PlayerFeedbackEntry {
  id: string;
  timestamp: string;
  presetId: string;
  responsiveness: FeedbackRating;
  readability: FeedbackRating;
  expressiveness: FeedbackRating;
  enjoyment: FeedbackRating;
  comment: string;
  evidenceSummary: string;
}

/** Human playtest feedback → structured evidence. */

export class PlayerFeedbackCollector {
  private readonly entries: PlayerFeedbackEntry[] = [];

  submit(
    presetId: string,
    ratings: {
      responsiveness: FeedbackRating;
      readability: FeedbackRating;
      expressiveness: FeedbackRating;
      enjoyment: FeedbackRating;
    },
    comment = '',
  ): PlayerFeedbackEntry {
    const avg = (ratings.responsiveness + ratings.readability + ratings.expressiveness + ratings.enjoyment) / 4;
    const entry: PlayerFeedbackEntry = {
      id: `FB-${Date.now()}`,
      timestamp: new Date().toISOString(),
      presetId,
      ...ratings,
      comment,
      evidenceSummary: `preset=${presetId} satisfaction=${avg.toFixed(1)}/5`,
    };
    this.entries.push(entry);
    return entry;
  }

  getSatisfactionScore(): number {
    if (this.entries.length === 0) return 0;
    const sum = this.entries.reduce(
      (s, e) => s + (e.responsiveness + e.readability + e.expressiveness + e.enjoyment) / 4,
      0,
    );
    return sum / this.entries.length;
  }

  list(): PlayerFeedbackEntry[] {
    return [...this.entries];
  }
}
