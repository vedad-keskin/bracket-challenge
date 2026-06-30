import { Component, input, output } from '@angular/core';
import { NgClass } from '@angular/common';
import {
  Match,
  Team,
  getAdvancementPoints,
  getAdvancementRound,
} from '../../../core/models/bracket.model';
import { MatchVerdict } from '../../../core/models/challenge.model';

@Component({
  selector: 'app-match-card',
  standalone: true,
  imports: [NgClass],
  templateUrl: './match-card.html',
  styleUrl: './match-card.css',
})
export class MatchCardComponent {
  readonly match = input.required<Match>();
  readonly compact = input<boolean>(false);
  readonly locked = input<boolean>(false);
  readonly readonly = input<boolean>(false);
  readonly reviewStatus = input<MatchVerdict | null>(null);
  readonly badgeOnly = input<boolean>(false);
  readonly showNames = input<boolean>(false);
  readonly resultTeam = input<Team | null>(null);
  readonly resultLabel = input<string | null>(null);
  readonly resultLabelTone = input<'gold' | 'bronze'>('gold');
  readonly neutral = input<boolean>(false);
  readonly winnerSelected = output<{ matchId: string; team: Team }>();

  onSelectTeam(team: Team | null): void {
    if (this.readonly() || this.locked()) return;
    if (!team) return;
    const m = this.match();
    if (!m.team1 || !m.team2) return;
    this.winnerSelected.emit({ matchId: m.id, team });
  }

  isWinner(team: Team | null): boolean {
    if (!team) return false;
    return this.match().winner?.id === team.id;
  }

  isReady(): boolean {
    const m = this.match();
    return m.team1 !== null && m.team2 !== null;
  }

  advancementPoints(): number | null {
    return getAdvancementPoints(this.match().round);
  }

  pointsRound(): string | null {
    return getAdvancementRound(this.match().round);
  }

  showTeamPoints(team: Team | null): boolean {
    return team !== null && this.advancementPoints() !== null;
  }
}
