import { ChangeDetectorRef, Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { BracketService } from '../../core/services/bracket.service';
import { ExportService } from '../../core/services/export.service';
import { MatchCardComponent } from '../../shared/components/match-card/match-card';
import { ScoringLegendComponent } from '../../shared/components/scoring-legend/scoring-legend';
import { HeaderComponent } from '../../shared/components/header/header';
import { Team, Match, Round, ROUND_LABELS } from '../../core/models/bracket.model';

@Component({
  selector: 'app-bracket-page',
  standalone: true,
  imports: [MatchCardComponent, ScoringLegendComponent, HeaderComponent],
  templateUrl: './bracket-page.html',
  styleUrl: './bracket-page.css',
})
export class BracketPageComponent {
  readonly bracketService = inject(BracketService);
  private readonly exportService = inject(ExportService);
  private readonly cdr = inject(ChangeDetectorRef);

  @ViewChild('exportContainer', { static: false }) exportContainer!: ElementRef<HTMLElement>;

  readonly isExporting = signal(false);
  readonly Round = Round;
  readonly ROUND_LABELS = ROUND_LABELS;

  onWinnerSelected(event: { matchId: string; team: Team }): void {
    this.bracketService.selectWinner(event.matchId, event.team);
  }

  async onExport(): Promise<void> {
    if (!this.exportContainer) return;
    this.isExporting.set(true);
    this.cdr.detectChanges();
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
    );
    try {
      await this.exportService.exportBracketAsImage(this.exportContainer.nativeElement);
    } finally {
      this.isExporting.set(false);
    }
  }

  onReset(): void {
    this.bracketService.resetBracket();
  }

  trackByMatchId(_index: number, match: Match): string {
    return match.id;
  }
}
