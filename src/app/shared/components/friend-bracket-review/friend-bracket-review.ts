import { Component, input } from '@angular/core';
import { RadialBracketComponent } from '../radial-bracket/radial-bracket';
import { FriendBracketReview } from '../../../core/models/challenge.model';

@Component({
  selector: 'app-friend-bracket-review',
  standalone: true,
  imports: [RadialBracketComponent],
  templateUrl: './friend-bracket-review.html',
  styleUrl: './friend-bracket-review.css',
})
export class FriendBracketReviewComponent {
  readonly review = input.required<FriendBracketReview>();
}
