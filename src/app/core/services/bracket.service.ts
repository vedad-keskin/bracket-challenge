import { Injectable, signal, computed } from '@angular/core';
import {
  Team,
  Match,
  Round,
  createTeams,
  ROUND_ORDER,
} from '../models/bracket.model';
import {
  createEmptyBracketMap,
  selectWinnerInMap,
  getMatchesByRound,
} from '../utils/bracket-engine';
import { CHALLENGE_DATA } from '../../data/challenge.data';

@Injectable({ providedIn: 'root' })
export class BracketService {
  private readonly teams = createTeams();
  private readonly teamById = new Map(this.teams.map(t => [t.id, t]));
  private readonly lockedMatchIds = new Set(Object.keys(CHALLENGE_DATA.officialResults));

  private readonly matchesMap = signal<Map<string, Match>>(createEmptyBracketMap(this.teams));

  readonly matches = computed(() => Array.from(this.matchesMap().values()));

  readonly leftR32 = computed(() => getMatchesByRound(this.matches(), Round.R32, 'left'));
  readonly rightR32 = computed(() => getMatchesByRound(this.matches(), Round.R32, 'right'));
  readonly leftR16 = computed(() => getMatchesByRound(this.matches(), Round.R16, 'left'));
  readonly rightR16 = computed(() => getMatchesByRound(this.matches(), Round.R16, 'right'));
  readonly leftQF = computed(() => getMatchesByRound(this.matches(), Round.QF, 'left'));
  readonly rightQF = computed(() => getMatchesByRound(this.matches(), Round.QF, 'right'));
  readonly leftSF = computed(() => getMatchesByRound(this.matches(), Round.SF, 'left'));
  readonly rightSF = computed(() => getMatchesByRound(this.matches(), Round.SF, 'right'));
  readonly final = computed(() => getMatchesByRound(this.matches(), Round.FINAL, 'left'));
  readonly thirdPlace = computed(() => getMatchesByRound(this.matches(), Round.THIRD_PLACE, 'left'));

  readonly isComplete = computed(() => {
    const finalMatch = this.matches().find(m => m.round === Round.FINAL);
    return finalMatch?.winner != null;
  });

  readonly champion = computed(() => {
    const finalMatch = this.matches().find(m => m.round === Round.FINAL);
    return finalMatch?.winner ?? null;
  });

  readonly thirdPlaceWinner = computed(() => {
    const match = this.matches().find(m => m.round === Round.THIRD_PLACE);
    return match?.winner ?? null;
  });

  constructor() {
    this.applyOfficialResults();
  }

  isLocked(matchId: string): boolean {
    return this.lockedMatchIds.has(matchId);
  }

  selectWinner(matchId: string, team: Team): void {
    if (this.isLocked(matchId)) return;

    const map = new Map(this.matchesMap());
    selectWinnerInMap(map, matchId, team);
    this.matchesMap.set(map);
  }

  resetBracket(): void {
    this.matchesMap.set(createEmptyBracketMap(this.teams));
    this.applyOfficialResults();
  }

  private applyOfficialResults(): void {
    const results = CHALLENGE_DATA.officialResults;
    if (Object.keys(results).length === 0) return;

    const map = new Map(this.matchesMap());

    for (const round of ROUND_ORDER) {
      if (round === Round.THIRD_PLACE) continue;
      for (const side of ['left', 'right'] as const) {
        const roundMatches = getMatchesByRound(Array.from(map.values()), round, side);
        for (const match of roundMatches) {
          const winnerId = results[match.id];
          if (winnerId == null) continue;
          const team = this.teamById.get(winnerId);
          if (team) selectWinnerInMap(map, match.id, team);
        }
      }
    }

    const thirdId = `${Round.THIRD_PLACE}-left-0`;
    const thirdWinnerId = results[thirdId];
    if (thirdWinnerId != null) {
      const team = this.teamById.get(thirdWinnerId);
      if (team) selectWinnerInMap(map, thirdId, team);
    }

    this.matchesMap.set(map);
  }
}
