/**
 * HighScore — thin localStorage wrapper for persisting the player's best score.
 * Key: 'spaceShooterHiScore'
 */
const HI_SCORE_KEY = 'spaceShooterHiScore';

export default {
  get()       { return parseInt(localStorage.getItem(HI_SCORE_KEY) || '0', 10); },
  save(score) { if (score > this.get()) { localStorage.setItem(HI_SCORE_KEY, score); return true; } return false; },
};
