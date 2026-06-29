import { Injectable, signal, computed } from '@angular/core';
import {
  Team,
  Match,
  Round,
  createTeams,
  R32_PAIRINGS_LEFT,
  R32_PAIRINGS_RIGHT,
  ROUND_ORDER,
} from '../models/bracket.model';

@Injectable({ providedIn: 'root' })
export class BracketService {
  private readonly teams = createTeams();

  /** All matches in the bracket, keyed by match ID */
  private readonly matchesMap = signal<Map<string, Match>>(new Map());

  /** Reactive list of all matches */
  readonly matches = computed(() => Array.from(this.matchesMap().values()));

  /** Matches filtered by round and side */
  readonly leftR32 = computed(() => this.getMatches(Round.R32, 'left'));
  readonly rightR32 = computed(() => this.getMatches(Round.R32, 'right'));
  readonly leftR16 = computed(() => this.getMatches(Round.R16, 'left'));
  readonly rightR16 = computed(() => this.getMatches(Round.R16, 'right'));
  readonly leftQF = computed(() => this.getMatches(Round.QF, 'left'));
  readonly rightQF = computed(() => this.getMatches(Round.QF, 'right'));
  readonly leftSF = computed(() => this.getMatches(Round.SF, 'left'));
  readonly rightSF = computed(() => this.getMatches(Round.SF, 'right'));
  readonly final = computed(() => this.getMatches(Round.FINAL, 'left'));
  readonly thirdPlace = computed(() => this.getMatches(Round.THIRD_PLACE, 'left'));

  /** Whether the entire bracket has been filled out */
  readonly isComplete = computed(() => {
    const allMatches = this.matches();
    const finalMatch = allMatches.find(m => m.round === Round.FINAL);
    return finalMatch?.winner !== null && finalMatch?.winner !== undefined;
  });

  /** Champion team */
  readonly champion = computed(() => {
    const finalMatch = this.matches().find(m => m.round === Round.FINAL);
    return finalMatch?.winner ?? null;
  });

  /** 3rd place winner */
  readonly thirdPlaceWinner = computed(() => {
    const match = this.matches().find(m => m.round === Round.THIRD_PLACE);
    return match?.winner ?? null;
  });

  constructor() {
    this.initializeBracket();
  }

  private initializeBracket(): void {
    const map = new Map<string, Match>();

    // Create R32 matches — Left side
    R32_PAIRINGS_LEFT.forEach(([t1Idx, t2Idx], position) => {
      const id = this.makeId(Round.R32, 'left', position);
      map.set(id, {
        id,
        round: Round.R32,
        position,
        team1: this.teams[t1Idx],
        team2: this.teams[t2Idx],
        winner: null,
        side: 'left',
      });
    });

    // Create R32 matches — Right side
    R32_PAIRINGS_RIGHT.forEach(([t1Idx, t2Idx], position) => {
      const id = this.makeId(Round.R32, 'right', position);
      map.set(id, {
        id,
        round: Round.R32,
        position,
        team1: this.teams[t1Idx],
        team2: this.teams[t2Idx],
        winner: null,
        side: 'right',
      });
    });

    // Create empty placeholder matches for R16, QF, SF, Final, 3rd Place
    // R16: 4 per side
    for (let i = 0; i < 4; i++) {
      const leftId = this.makeId(Round.R16, 'left', i);
      map.set(leftId, this.emptyMatch(leftId, Round.R16, i, 'left'));
      const rightId = this.makeId(Round.R16, 'right', i);
      map.set(rightId, this.emptyMatch(rightId, Round.R16, i, 'right'));
    }

    // QF: 2 per side
    for (let i = 0; i < 2; i++) {
      const leftId = this.makeId(Round.QF, 'left', i);
      map.set(leftId, this.emptyMatch(leftId, Round.QF, i, 'left'));
      const rightId = this.makeId(Round.QF, 'right', i);
      map.set(rightId, this.emptyMatch(rightId, Round.QF, i, 'right'));
    }

    // SF: 1 per side
    const leftSfId = this.makeId(Round.SF, 'left', 0);
    map.set(leftSfId, this.emptyMatch(leftSfId, Round.SF, 0, 'left'));
    const rightSfId = this.makeId(Round.SF, 'right', 0);
    map.set(rightSfId, this.emptyMatch(rightSfId, Round.SF, 0, 'right'));

    // Final: 1 match
    const finalId = this.makeId(Round.FINAL, 'left', 0);
    map.set(finalId, this.emptyMatch(finalId, Round.FINAL, 0, 'left'));

    // 3rd Place: 1 match
    const thirdId = this.makeId(Round.THIRD_PLACE, 'left', 0);
    map.set(thirdId, this.emptyMatch(thirdId, Round.THIRD_PLACE, 0, 'left'));

    this.matchesMap.set(map);
  }

  selectWinner(matchId: string, team: Team): void {
    const map = new Map(this.matchesMap());
    const match = map.get(matchId);
    if (!match) return;
    if (!match.team1 || !match.team2) return;

    // If same winner already selected, do nothing
    if (match.winner?.id === team.id) return;

    const oldWinner = match.winner;

    // Set the winner
    map.set(matchId, { ...match, winner: team });

    // If there was a previous winner, we need to cascade-clear downstream
    if (oldWinner) {
      this.cascadeClear(map, match.round, match.position, match.side, oldWinner);
    }

    // Propagate winner to the next round's match
    this.propagateWinner(map, match.round, match.position, match.side, team);

    this.matchesMap.set(map);
  }

  private propagateWinner(
    map: Map<string, Match>,
    round: Round,
    position: number,
    side: 'left' | 'right',
    team: Team
  ): void {
    const nextRound = this.getNextRound(round);
    if (!nextRound) return;

    let nextSide = side;
    let nextPosition: number;
    let slot: 'team1' | 'team2';

    if (round === Round.SF) {
      // SF winners go to Final
      if (nextRound === Round.FINAL) {
        nextPosition = 0;
        nextSide = 'left';
        slot = side === 'left' ? 'team1' : 'team2';
      } else {
        return;
      }
    } else {
      // Normal progression: position / 2, odd positions go to team2 slot
      nextPosition = Math.floor(position / 2);
      slot = position % 2 === 0 ? 'team1' : 'team2';
    }

    const nextId = this.makeId(nextRound, nextSide, nextPosition);
    const nextMatch = map.get(nextId);
    if (!nextMatch) return;

    map.set(nextId, { ...nextMatch, [slot]: team });

    // Also handle SF losers → 3rd place match
    if (round === Round.SF) {
      const loser = this.getLoser(map, round, position, side);
      if (loser) {
        const thirdId = this.makeId(Round.THIRD_PLACE, 'left', 0);
        const thirdMatch = map.get(thirdId);
        if (thirdMatch) {
          const thirdSlot = side === 'left' ? 'team1' : 'team2';
          map.set(thirdId, { ...thirdMatch, [thirdSlot]: loser });
        }
      }
    }
  }

  private getLoser(
    map: Map<string, Match>,
    round: Round,
    position: number,
    side: 'left' | 'right'
  ): Team | null {
    const id = this.makeId(round, side, position);
    const match = map.get(id);
    if (!match || !match.winner) return null;
    return match.team1?.id === match.winner.id ? match.team2 : match.team1;
  }

  private cascadeClear(
    map: Map<string, Match>,
    round: Round,
    position: number,
    side: 'left' | 'right',
    removedTeam: Team
  ): void {
    const nextRound = this.getNextRound(round);
    if (!nextRound) return;

    let nextSide = side;
    let nextPosition: number;
    let slot: 'team1' | 'team2';

    if (round === Round.SF) {
      nextPosition = 0;
      nextSide = 'left';
      slot = side === 'left' ? 'team1' : 'team2';

      // Also clear 3rd place match
      const thirdId = this.makeId(Round.THIRD_PLACE, 'left', 0);
      const thirdMatch = map.get(thirdId);
      if (thirdMatch) {
        const thirdSlot = side === 'left' ? 'team1' : 'team2';
        const clearedThird: Match = { ...thirdMatch, [thirdSlot]: null, winner: null };
        map.set(thirdId, clearedThird);
      }
    } else {
      nextPosition = Math.floor(position / 2);
      slot = position % 2 === 0 ? 'team1' : 'team2';
    }

    const nextId = this.makeId(nextRound, nextSide, nextPosition);
    const nextMatch = map.get(nextId);
    if (!nextMatch) return;

    // Clear the team from the slot
    const updated: Match = { ...nextMatch, [slot]: null };

    // If this team was the winner of the next match, clear that too and cascade
    if (updated.winner?.id === removedTeam.id) {
      updated.winner = null;
      map.set(nextId, updated);
      this.cascadeClear(map, nextRound, nextPosition, nextSide, removedTeam);
    } else {
      map.set(nextId, updated);
    }
  }

  private getNextRound(round: Round): Round | null {
    const idx = ROUND_ORDER.indexOf(round);
    if (idx === -1 || idx >= ROUND_ORDER.length - 2) return null; // THIRD_PLACE has no next
    if (round === Round.SF) return Round.FINAL;
    return ROUND_ORDER[idx + 1];
  }

  resetBracket(): void {
    this.initializeBracket();
  }

  private getMatches(round: Round, side: 'left' | 'right'): Match[] {
    return this.matches()
      .filter(m => m.round === round && m.side === side)
      .sort((a, b) => a.position - b.position);
  }

  private makeId(round: Round, side: string, position: number): string {
    return `${round}-${side}-${position}`;
  }

  private emptyMatch(id: string, round: Round, position: number, side: 'left' | 'right'): Match {
    return { id, round, position, team1: null, team2: null, winner: null, side };
  }
}
