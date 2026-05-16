/**
 * WaveConfig — wave difficulty lookup table.
 *
 * Each wave entry defines which enemy types can spawn, the spawn interval (ms),
 * and the enemy speed range [min, max] in px/s.
 *
 * Index 0 is unused so that wave numbers map directly to array indices.
 * Waves beyond the last entry reuse the last entry (capped via Math.min).
 */

/** @type {Array<null|{types: string[], delay: number, speed: [number,number]}>} */
export const WAVE_CONFIG = [
  null, // index 0 unused — waves start at 1
  { types: ['small'],                            delay: 1200, speed: [80,  150] }, // wave 1
  { types: ['small'],                            delay: 1100, speed: [90,  160] }, // wave 2
  { types: ['small', 'small', 'medium'],         delay: 1000, speed: [100, 180] }, // wave 3
  { types: ['small', 'medium'],                  delay: 950,  speed: [110, 190] }, // wave 4
  { types: ['small', 'medium', 'medium'],        delay: 900,  speed: [120, 200] }, // wave 5
  { types: ['small', 'medium', 'medium', 'big'], delay: 850,  speed: [130, 210] }, // wave 6+
];

/**
 * Return the config for the given wave number.
 * Waves beyond the table length reuse the last entry.
 *
 * @param {number} wave - Current wave number (1-based).
 * @returns {{ types: string[], delay: number, speed: [number,number] }}
 */
export function waveConfig(wave) {
  return WAVE_CONFIG[Math.min(wave, WAVE_CONFIG.length - 1)];
}
