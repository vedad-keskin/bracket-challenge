import {
  Team,
  Match,
  Round,
  createTeams,
  R32_PAIRINGS_LEFT,
  R32_PAIRINGS_RIGHT,
  ROUND_ORDER,
} from '../models/bracket.model';

export function makeMatchId(round: Round, side: string, position: number): string {
  return `${round}-${side}-${position}`;
}

export function createEmptyBracketMap(teams: Team[] = createTeams()): Map<string, Match> {
  const map = new Map<string, Match>();

  R32_PAIRINGS_LEFT.forEach(([t1Idx, t2Idx], position) => {
    const id = makeMatchId(Round.R32, 'left', position);
    map.set(id, {
      id,
      round: Round.R32,
      position,
      team1: teams[t1Idx],
      team2: teams[t2Idx],
      winner: null,
      side: 'left',
    });
  });

  R32_PAIRINGS_RIGHT.forEach(([t1Idx, t2Idx], position) => {
    const id = makeMatchId(Round.R32, 'right', position);
    map.set(id, {
      id,
      round: Round.R32,
      position,
      team1: teams[t1Idx],
      team2: teams[t2Idx],
      winner: null,
      side: 'right',
    });
  });

  for (let i = 0; i < 4; i++) {
    map.set(makeMatchId(Round.R16, 'left', i), emptyMatch(Round.R16, i, 'left'));
    map.set(makeMatchId(Round.R16, 'right', i), emptyMatch(Round.R16, i, 'right'));
  }

  for (let i = 0; i < 2; i++) {
    map.set(makeMatchId(Round.QF, 'left', i), emptyMatch(Round.QF, i, 'left'));
    map.set(makeMatchId(Round.QF, 'right', i), emptyMatch(Round.QF, i, 'right'));
  }

  map.set(makeMatchId(Round.SF, 'left', 0), emptyMatch(Round.SF, 0, 'left'));
  map.set(makeMatchId(Round.SF, 'right', 0), emptyMatch(Round.SF, 0, 'right'));
  map.set(makeMatchId(Round.FINAL, 'left', 0), emptyMatch(Round.FINAL, 0, 'left'));
  map.set(makeMatchId(Round.THIRD_PLACE, 'left', 0), emptyMatch(Round.THIRD_PLACE, 0, 'left'));

  return map;
}

export function buildMatchesFromWinners(
  winners: Record<string, number>,
  teams: Team[] = createTeams()
): Match[] {
  const map = createEmptyBracketMap(teams);
  const teamById = new Map(teams.map(t => [t.id, t]));

  for (const round of ROUND_ORDER) {
    if (round === Round.THIRD_PLACE) continue;
    for (const side of ['left', 'right'] as const) {
      const count = getRoundMatchCount(round, side);
      for (let position = 0; position < count; position++) {
        const id = makeMatchId(round, side, position);
        const winnerId = winners[id];
        if (winnerId == null) continue;
        const team = teamById.get(winnerId);
        if (!team) continue;
        selectWinnerInMap(map, id, team);
      }
    }
  }

  const thirdId = makeMatchId(Round.THIRD_PLACE, 'left', 0);
  const thirdWinnerId = winners[thirdId];
  if (thirdWinnerId != null) {
    const team = teamById.get(thirdWinnerId);
    if (team) selectWinnerInMap(map, thirdId, team);
  }

  return Array.from(map.values());
}

export function selectWinnerInMap(map: Map<string, Match>, matchId: string, team: Team): void {
  const match = map.get(matchId);
  if (!match || !match.team1 || !match.team2) return;
  if (match.winner?.id === team.id) return;

  const oldWinner = match.winner;
  map.set(matchId, { ...match, winner: team });

  if (oldWinner) {
    cascadeClear(map, match.round, match.position, match.side, oldWinner);
  }

  propagateWinner(map, match.round, match.position, match.side, team);
}

export function getMatchesByRound(
  matches: Match[],
  round: Round,
  side: 'left' | 'right'
): Match[] {
  return matches
    .filter(m => m.round === round && m.side === side)
    .sort((a, b) => a.position - b.position);
}

function emptyMatch(round: Round, position: number, side: 'left' | 'right'): Match {
  const id = makeMatchId(round, side, position);
  return { id, round, position, team1: null, team2: null, winner: null, side };
}

function getRoundMatchCount(round: Round, side: 'left' | 'right'): number {
  if (round === Round.R32) return 8;
  if (round === Round.R16) return 4;
  if (round === Round.QF) return 2;
  if (round === Round.SF) return 1;
  if (round === Round.FINAL) return side === 'left' ? 1 : 0;
  return 0;
}

function propagateWinner(
  map: Map<string, Match>,
  round: Round,
  position: number,
  side: 'left' | 'right',
  team: Team
): void {
  const nextRound = getNextRound(round);
  if (!nextRound) return;

  let nextSide = side;
  let nextPosition: number;
  let slot: 'team1' | 'team2';

  if (round === Round.SF) {
    if (nextRound === Round.FINAL) {
      nextPosition = 0;
      nextSide = 'left';
      slot = side === 'left' ? 'team1' : 'team2';
    } else {
      return;
    }
  } else {
    nextPosition = Math.floor(position / 2);
    slot = position % 2 === 0 ? 'team1' : 'team2';
  }

  const nextId = makeMatchId(nextRound, nextSide, nextPosition);
  const nextMatch = map.get(nextId);
  if (!nextMatch) return;

  map.set(nextId, { ...nextMatch, [slot]: team });

  if (round === Round.SF) {
    const loser = getLoser(map, round, position, side);
    if (loser) {
      const thirdId = makeMatchId(Round.THIRD_PLACE, 'left', 0);
      const thirdMatch = map.get(thirdId);
      if (thirdMatch) {
        const thirdSlot = side === 'left' ? 'team1' : 'team2';
        map.set(thirdId, { ...thirdMatch, [thirdSlot]: loser });
      }
    }
  }
}

function getLoser(
  map: Map<string, Match>,
  round: Round,
  position: number,
  side: 'left' | 'right'
): Team | null {
  const id = makeMatchId(round, side, position);
  const match = map.get(id);
  if (!match || !match.winner) return null;
  return match.team1?.id === match.winner.id ? match.team2 : match.team1;
}

function cascadeClear(
  map: Map<string, Match>,
  round: Round,
  position: number,
  side: 'left' | 'right',
  removedTeam: Team
): void {
  const nextRound = getNextRound(round);
  if (!nextRound) return;

  let nextSide = side;
  let nextPosition: number;
  let slot: 'team1' | 'team2';

  if (round === Round.SF) {
    nextPosition = 0;
    nextSide = 'left';
    slot = side === 'left' ? 'team1' : 'team2';

    const thirdId = makeMatchId(Round.THIRD_PLACE, 'left', 0);
    const thirdMatch = map.get(thirdId);
    if (thirdMatch) {
      const thirdSlot = side === 'left' ? 'team1' : 'team2';
      map.set(thirdId, { ...thirdMatch, [thirdSlot]: null, winner: null });
    }
  } else {
    nextPosition = Math.floor(position / 2);
    slot = position % 2 === 0 ? 'team1' : 'team2';
  }

  const nextId = makeMatchId(nextRound, nextSide, nextPosition);
  const nextMatch = map.get(nextId);
  if (!nextMatch) return;

  const updated: Match = { ...nextMatch, [slot]: null };

  if (updated.winner?.id === removedTeam.id) {
    updated.winner = null;
    map.set(nextId, updated);
    cascadeClear(map, nextRound, nextPosition, nextSide, removedTeam);
  } else {
    map.set(nextId, updated);
  }
}

function getNextRound(round: Round): Round | null {
  const idx = ROUND_ORDER.indexOf(round);
  if (idx === -1 || idx >= ROUND_ORDER.length - 2) return null;
  if (round === Round.SF) return Round.FINAL;
  return ROUND_ORDER[idx + 1];
}
