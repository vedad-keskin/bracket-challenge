import { Component, computed, inject, signal } from '@angular/core';
import { ChallengeService } from '../../core/services/challenge.service';
import { FriendRanking } from '../../core/models/challenge.model';
import { FriendBracketReviewComponent } from '../../shared/components/friend-bracket-review/friend-bracket-review';

@Component({
  selector: 'app-leaderboard-page',
  standalone: true,
  imports: [FriendBracketReviewComponent],
  templateUrl: './leaderboard-page.html',
  styleUrl: './leaderboard-page.css',
})
export class LeaderboardPageComponent {
  readonly challenge = inject(ChallengeService);

  readonly selectedFriend = signal<string | null>(null);
  readonly inspectorView = signal<'list' | 'bracket'>('list');

  readonly rankings = computed(() => this.challenge.rankings());

  readonly selectedBreakdown = computed(() => {
    const name = this.selectedFriend();
    if (!name) {
      const top = this.rankings()[0];
      return top ?? null;
    }
    return this.rankings().find(r => r.name === name) ?? null;
  });

  readonly selectedReview = computed(() => {
    const friend = this.selectedBreakdown();
    if (!friend) return null;
    return this.challenge.getFriendBracketReview(friend.name);
  });

  selectFriend(ranking: FriendRanking): void {
    this.selectedFriend.set(ranking.name);
  }

  setInspectorView(view: 'list' | 'bracket'): void {
    this.inspectorView.set(view);
  }

  rowClass(row: { isLocked: boolean; pointsEarned: number }): string {
    if (!row.isLocked) return 'pending';
    return row.pointsEarned > 0 ? 'correct' : 'wrong';
  }

  matchLabel(row: { team1Name: string | null; team2Name: string | null }): string {
    if (!row.team1Name && !row.team2Name) return 'TBD vs TBD';
    return `${row.team1Name ?? 'TBD'} vs ${row.team2Name ?? 'TBD'}`;
  }
}
