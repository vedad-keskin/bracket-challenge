import { Component } from '@angular/core';
import { ROUND_POINTS, ROUND_LABELS, Round } from '../../../core/models/bracket.model';

@Component({
  selector: 'app-scoring-legend',
  standalone: true,
  templateUrl: './scoring-legend.html',
  styleUrl: './scoring-legend.css',
})
export class ScoringLegendComponent {
  readonly scoringRounds = [
    { round: Round.R32, label: 'R32', fullLabel: ROUND_LABELS[Round.R32], points: ROUND_POINTS[Round.R32] },
    { round: Round.R16, label: 'R16', fullLabel: ROUND_LABELS[Round.R16], points: ROUND_POINTS[Round.R16] },
    { round: Round.QF, label: 'QF', fullLabel: ROUND_LABELS[Round.QF], points: ROUND_POINTS[Round.QF] },
    { round: Round.SF, label: 'SF', fullLabel: ROUND_LABELS[Round.SF], points: ROUND_POINTS[Round.SF] },
    { round: Round.THIRD_PLACE, label: '3rd', fullLabel: ROUND_LABELS[Round.THIRD_PLACE], points: ROUND_POINTS[Round.THIRD_PLACE] },
    { round: Round.FINAL, label: 'Final', fullLabel: ROUND_LABELS[Round.FINAL], points: ROUND_POINTS[Round.FINAL] },
  ];
}
