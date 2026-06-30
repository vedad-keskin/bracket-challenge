import { Injectable, computed } from '@angular/core';
import {
  Match,
  Round,
  createTeams,
  ROUND_POINTS,
  ROUND_LABELS,
} from '../models/bracket.model';
import {
  ChallengeData,
  FriendRanking,
  FriendBracketReview,
  MatchBreakdown,
  MatchVerdict,
  DEFAULT_FRIENDS,
} from '../models/challenge.model';
import { CHALLENGE_DATA } from '../../data/challenge.data';
import { buildMatchesFromWinners, getMatchesByRound } from '../utils/bracket-engine';

@Injectable({ providedIn: 'root' })
export class ChallengeService {
  private readonly teams = createTeams();
  private readonly teamById = new Map(this.teams.map(t => [t.id, t]));
  private readonly data: ChallengeData = this.normalize(CHALLENGE_DATA);

  readonly friends = this.data.friends;
  readonly officialResults = this.data.officialResults;
  readonly predictions = this.data.predictions;
  readonly updatedAt = this.data.updatedAt;

  readonly officialMatches = computed(() =>
    buildMatchesFromWinners(this.data.officialResults, this.teams)
  );

  readonly rankings = computed((): FriendRanking[] => {
    const official = this.data.officialResults;
    const officialMatchList = this.officialMatches();

    return this.data.friends
      .map(name => {
        const friendPicks = this.data.predictions[name] ?? {};
        const breakdown = this.buildBreakdown(friendPicks, official, officialMatchList);
        const points = breakdown.reduce((sum, row) => sum + row.pointsEarned, 0);
        const correctCount = breakdown.filter(row => row.verdict === 'correct').length;
        const totalDecided = breakdown.filter(row => row.isLocked).length;
        return { name, points, correctCount, totalDecided, breakdown };
      })
      .sort((a, b) => b.points - a.points || b.correctCount - a.correctCount);
  });

  getFriendBracketReview(friendName: string): FriendBracketReview {
    const friendPicks = this.data.predictions[friendName] ?? {};
    const matches = buildMatchesFromWinners(friendPicks, this.teams);
    const breakdown = this.buildBreakdown(
      friendPicks,
      this.data.officialResults,
      this.officialMatches()
    );
    const verdicts: Record<string, MatchVerdict> = {};
    for (const row of breakdown) {
      verdicts[row.matchId] = row.verdict;
    }

    return {
      name: friendName,
      matches,
      verdicts,
      leftR32: getMatchesByRound(matches, Round.R32, 'left'),
      rightR32: getMatchesByRound(matches, Round.R32, 'right'),
      leftR16: getMatchesByRound(matches, Round.R16, 'left'),
      rightR16: getMatchesByRound(matches, Round.R16, 'right'),
      leftQF: getMatchesByRound(matches, Round.QF, 'left'),
      rightQF: getMatchesByRound(matches, Round.QF, 'right'),
      leftSF: getMatchesByRound(matches, Round.SF, 'left'),
      rightSF: getMatchesByRound(matches, Round.SF, 'right'),
      final: getMatchesByRound(matches, Round.FINAL, 'left'),
      thirdPlace: getMatchesByRound(matches, Round.THIRD_PLACE, 'left'),
      champion: matches.find(m => m.round === Round.FINAL)?.winner ?? null,
      thirdPlaceWinner: matches.find(m => m.round === Round.THIRD_PLACE)?.winner ?? null,
    };
  }

  private buildBreakdown(
    friendPicks: Record<string, number>,
    official: Record<string, number>,
    officialMatches: Match[]
  ): MatchBreakdown[] {
    return officialMatches.map(match => {
      const officialWinnerId = official[match.id];
      const isLocked = officialWinnerId != null;
      const friendPickId = friendPicks[match.id];
      const friendPickTeam = friendPickId != null ? this.teamById.get(friendPickId) : null;
      const officialWinnerTeam =
        officialWinnerId != null ? this.teamById.get(officialWinnerId) : null;

      const pointsEarned =
        isLocked && friendPickId === officialWinnerId ? ROUND_POINTS[match.round] : 0;

      let verdict: MatchVerdict = 'pending';
      if (isLocked) {
        verdict = friendPickId === officialWinnerId ? 'correct' : 'wrong';
      }

      return {
        matchId: match.id,
        round: ROUND_LABELS[match.round],
        team1Name: match.team1?.name ?? null,
        team2Name: match.team2?.name ?? null,
        friendPickName: friendPickTeam?.name ?? null,
        officialWinnerName: officialWinnerTeam?.name ?? null,
        pointsEarned,
        isLocked,
        verdict,
      };
    });
  }

  private normalize(raw: ChallengeData): ChallengeData {
    const predictions: Record<string, Record<string, number>> = {};
    const friends = raw.friends?.length ? raw.friends : [...DEFAULT_FRIENDS];
    for (const friend of friends) {
      predictions[friend] = { ...(raw.predictions?.[friend] ?? {}) };
    }
    return {
      version: 1,
      friends,
      officialResults: { ...(raw.officialResults ?? {}) },
      predictions,
      updatedAt: raw.updatedAt ?? new Date().toISOString(),
    };
  }
}
