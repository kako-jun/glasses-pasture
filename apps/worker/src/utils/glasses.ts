import { NAME_WORDS, type FrameColor } from '@glasses-pasture/shared';

const FRAME_COLORS: FrameColor[] = [
  'black',
  'brown',
  'silver',
  'gold',
  'blue',
  'red',
  'green',
  'purple',
  'transparent',
];

/**
 * Generate a random glasses name
 * Format: Prefix + Suffix + Number (e.g., "GlassSight-4821")
 */
export function generateGlassesName(): string {
  const prefix = NAME_WORDS.prefixes[Math.floor(Math.random() * NAME_WORDS.prefixes.length)];
  const suffix = NAME_WORDS.suffixes[Math.floor(Math.random() * NAME_WORDS.suffixes.length)];
  const number = Math.floor(Math.random() * 10000);

  return `${prefix}${suffix}-${number}`;
}

/**
 * Generate a random degree (nearsightedness)
 * Range: -1.0 to -8.0 (typical nearsighted range)
 */
export function generateRandomDegree(): number {
  // Generate a random degree between -1.0 and -8.0, rounded to 0.25 increments
  const base = -1 - Math.random() * 7;
  return Math.round(base * 4) / 4;
}

/**
 * Generate a random frame color
 */
export function generateRandomFrameColor(): FrameColor {
  return FRAME_COLORS[Math.floor(Math.random() * FRAME_COLORS.length)];
}
