import { Match, Team } from './bracket.model';

export interface ChallengeData {
  version: 1;
  friends: string[];
  officialResults: Record<string, number>;
  predictions: Record<string, Record<string, number>>;
  updatedAt: string;
}

export type MatchVerdict = 'correct' | 'wrong' | 'pending';

export interface MatchBreakdown {
  matchId: string;
  round: string;
  team1Name: string | null;
  team2Name: string | null;
  friendPickName: string | null;
  officialWinnerName: string | null;
  pointsEarned: number;
  isLocked: boolean;
  verdict: MatchVerdict;
}

export interface FriendRanking {
  name: string;
  points: number;
  correctCount: number;
  totalDecided: number;
  breakdown: MatchBreakdown[];
}

export interface FriendBracketReview {
  name: string;
  matches: Match[];
  verdicts: Record<string, MatchVerdict>;
  leftR32: Match[];
  rightR32: Match[];
  leftR16: Match[];
  rightR16: Match[];
  leftQF: Match[];
  rightQF: Match[];
  leftSF: Match[];
  rightSF: Match[];
  final: Match[];
  thirdPlace: Match[];
  champion: Team | null;
  thirdPlaceWinner: Team | null;
}

export const DEFAULT_FRIENDS = ['Vedo', 'Šubo', 'Rešo', 'Nido', 'Amar'];
