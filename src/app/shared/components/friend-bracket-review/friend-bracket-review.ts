import { Component, input } from '@angular/core';
import { MatchCardComponent } from '../match-card/match-card';
import { FriendBracketReview, MatchVerdict } from '../../../core/models/challenge.model';
import { Match } from '../../../core/models/bracket.model';

@Component({
  selector: 'app-friend-bracket-review',
  standalone: true,
  imports: [MatchCardComponent],
  templateUrl: './friend-bracket-review.html',
  styleUrl: './friend-bracket-review.css',
})
export class FriendBracketReviewComponent {
  readonly review = input.required<FriendBracketReview>();

  verdict(match: Match): MatchVerdict {
    return this.review().verdicts[match.id] ?? 'pending';
  }

  championVerdict(): MatchVerdict {
    const finalMatch = this.review().final[0];
    return finalMatch ? this.verdict(finalMatch) : 'pending';
  }

  thirdPlaceVerdict(): MatchVerdict {
    const thirdMatch = this.review().thirdPlace[0];
    return thirdMatch ? this.verdict(thirdMatch) : 'pending';
  }
}
