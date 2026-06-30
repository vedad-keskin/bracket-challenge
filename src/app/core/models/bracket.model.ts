export interface Team {
  id: number;
  name: string;
  badgePath: string;
  flagPath: string;
}

export enum Round {
  R32 = 'R32',
  R16 = 'R16',
  QF = 'QF',
  SF = 'SF',
  FINAL = 'FINAL',
  THIRD_PLACE = 'THIRD_PLACE',
}

export interface Match {
  id: string;
  round: Round;
  position: number;
  team1: Team | null;
  team2: Team | null;
  winner: Team | null;
  side: 'left' | 'right';
}

export const ROUND_LABELS: Record<Round, string> = {
  [Round.R32]: 'Round of 32',
  [Round.R16]: 'Round of 16',
  [Round.QF]: 'Quarter-Finals',
  [Round.SF]: 'Semi-Finals',
  [Round.FINAL]: 'Final',
  [Round.THIRD_PLACE]: '3rd Place',
};

export const ROUND_POINTS: Record<string, number> = {
  [Round.R32]: 1,
  [Round.R16]: 2,
  [Round.QF]: 3,
  [Round.SF]: 4,
  [Round.THIRD_PLACE]: 5,
  [Round.FINAL]: 6,
};

export const ROUND_ORDER: Round[] = [
  Round.R32,
  Round.R16,
  Round.QF,
  Round.SF,
  Round.FINAL,
  Round.THIRD_PLACE,
];

export const PREVIOUS_ROUND: Partial<Record<Round, Round>> = {
  [Round.R16]: Round.R32,
  [Round.QF]: Round.R16,
  [Round.SF]: Round.QF,
  [Round.FINAL]: Round.SF,
  [Round.THIRD_PLACE]: Round.SF,
};

export function getAdvancementPoints(round: Round): number | null {
  const prev = PREVIOUS_ROUND[round];
  return prev != null ? ROUND_POINTS[prev] : null;
}

export function getAdvancementRound(round: Round): Round | null {
  return PREVIOUS_ROUND[round] ?? null;
}

/** Border/text colors for advancement point pills (matches scoring legend) */
export const ROUND_PILL_COLORS: Partial<Record<Round, string>> = {
  [Round.R32]: '#63b3ed',
  [Round.R16]: '#81e6d9',
  [Round.QF]: '#f6ad55',
  [Round.SF]: '#fc819b',
};

/**
 * All 32 teams in the knockout bracket.
 *
 * 🏷️  TO ASSIGN BADGES:
 *    Change the `badgePath` number to match the correct file in public/badges/.
 *    Available badge files: 1.png through 50.png
 *    Example: France → 'badges/12.png' if 12.png is the France badge.
 *
 * The array index matters — it's used by R32_PAIRINGS_LEFT/RIGHT below.
 */
export const TEAMS: Team[] = [
  // ============================================================
  // LEFT BRACKET (indices 0–15)
  // ============================================================

  // Match 0: Denmark vs Switzerland
  { id: 0, name: 'Germany', badgePath: 'badges/8.png', flagPath: 'flags/0.png' },
  { id: 1, name: 'Paraguay', badgePath: 'badges/33.png', flagPath: 'flags/1.png' },

  // Match 1: France vs Sweden
  { id: 2, name: 'France', badgePath: 'badges/16.png', flagPath: 'flags/2.png' },
  { id: 3, name: 'Sweden', badgePath: 'badges/38.png', flagPath: 'flags/3.png' },

  // Match 2: South Africa vs Canada
  { id: 4, name: 'South Africa', badgePath: 'badges/27.png', flagPath: 'flags/4.png' },
  { id: 5, name: 'Canada', badgePath: 'badges/30.png', flagPath: 'flags/5.png' },

  // Match 3: Netherlands vs Morocco
  { id: 6, name: 'Netherlands', badgePath: 'badges/9.png', flagPath: 'flags/6.png' },
  { id: 7, name: 'Morocco', badgePath: 'badges/4.png', flagPath: 'flags/7.png' },

  // Match 4: Portugal vs Croatia
  { id: 8, name: 'Portugal', badgePath: 'badges/21.png', flagPath: 'flags/8.png' },
  { id: 9, name: 'Croatia', badgePath: 'badges/23.png', flagPath: 'flags/9.png' },

  // Match 5: Spain vs Austria
  { id: 10, name: 'Spain', badgePath: 'badges/14.png', flagPath: 'flags/10.png' },
  { id: 11, name: 'Austria', badgePath: 'badges/20.png', flagPath: 'flags/11.png' },

  // Match 6: USA vs Bosnia
  { id: 12, name: 'USA', badgePath: 'badges/6.png', flagPath: 'flags/12.png' },
  { id: 13, name: 'Bosnia', badgePath: 'badges/25.png', flagPath: 'flags/13.png' },

  // Match 7: Senegal vs Ecuador
  { id: 14, name: 'Belgium', badgePath: 'badges/12.png', flagPath: 'flags/14.png' },
  { id: 15, name: 'Senegal', badgePath: 'badges/13.png', flagPath: 'flags/15.png' },

  // ============================================================
  // RIGHT BRACKET (indices 16–31)
  // ============================================================

  // Match 0: Brazil vs Japan
  { id: 16, name: 'Brazil', badgePath: 'badges/3.png', flagPath: 'flags/16.png' },
  { id: 17, name: 'Japan', badgePath: 'badges/10.png', flagPath: 'flags/17.png' },

  // Match 1: Nigeria vs Norway
  { id: 18, name: 'Cote d\'Ivoire', badgePath: 'badges/36.png', flagPath: 'flags/18.png' },
  { id: 19, name: 'Norway', badgePath: 'badges/17.png', flagPath: 'flags/19.png' },

  // Match 2: Mexico vs Peru
  { id: 20, name: 'Mexico', badgePath: 'badges/1.png', flagPath: 'flags/20.png' },
  { id: 21, name: 'Ecuador', badgePath: 'badges/37.png', flagPath: 'flags/21.png' },

  // Match 3: England vs DR Congo
  { id: 22, name: 'England', badgePath: 'badges/24.png', flagPath: 'flags/22.png' },
  { id: 23, name: 'DR Congo', badgePath: 'badges/46.png', flagPath: 'flags/23.png' },

  // Match 4: Argentina vs Australia
  { id: 24, name: 'Argentina', badgePath: 'badges/18.png', flagPath: 'flags/24.png' },
  { id: 25, name: 'Cape Verde', badgePath: 'badges/42.png', flagPath: 'flags/25.png' },

  // Match 5: South Korea vs Egypt
  { id: 26, name: 'Australia', badgePath: 'badges/7.png', flagPath: 'flags/26.png' },
  { id: 27, name: 'Egypt', badgePath: 'badges/39.png', flagPath: 'flags/27.png' },

  // Match 6: Algeria vs Tunisia
  { id: 28, name: 'Switzerland', badgePath: 'badges/2.png', flagPath: 'flags/28.png' },
  { id: 29, name: 'Algeria', badgePath: 'badges/19.png', flagPath: 'flags/29.png' },

  // Match 7: Colombia vs Cameroon
  { id: 30, name: 'Colombia', badgePath: 'badges/48.png', flagPath: 'flags/30.png' },
  { id: 31, name: 'Ghana', badgePath: 'badges/49.png', flagPath: 'flags/31.png' },
];

/** Helper to get a copy of TEAMS (used by BracketService) */
export function createTeams(): Team[] {
  return TEAMS.map(t => ({ ...t }));
}

/**
 * Bracket matchup pairings for R32.
 * Values are indices into the TEAMS array (0-based).
 *
 * LEFT BRACKET:
 *   Match 0: Denmark vs Switzerland
 *   Match 1: France vs Sweden
 *   Match 2: South Africa vs Canada
 *   Match 3: Netherlands vs Morocco
 *   Match 4: Portugal vs Croatia
 *   Match 5: Spain vs Austria
 *   Match 6: USA vs Bosnia
 *   Match 7: Senegal vs Ecuador
 *
 * RIGHT BRACKET:
 *   Match 0: Brazil vs Japan
 *   Match 1: Nigeria vs Norway
 *   Match 2: Mexico vs Peru
 *   Match 3: England vs DR Congo
 *   Match 4: Argentina vs Australia
 *   Match 5: South Korea vs Egypt
 *   Match 6: Algeria vs Tunisia
 *   Match 7: Colombia vs Cameroon
 */
export const R32_PAIRINGS_LEFT: [number, number][] = [
  [0, 1],
  [2, 3],
  [4, 5],
  [6, 7],
  [8, 9],
  [10, 11],
  [12, 13],
  [14, 15],
];

export const R32_PAIRINGS_RIGHT: [number, number][] = [
  [16, 17],
  [18, 19],
  [20, 21],
  [22, 23],
  [24, 25],
  [26, 27],
  [28, 29],
  [30, 31],
];
