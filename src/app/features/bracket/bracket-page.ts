import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { BracketService } from '../../core/services/bracket.service';
import { ExportService } from '../../core/services/export.service';
import { BracketExportBridgeService } from '../../core/services/bracket-export-bridge.service';
import { MatchCardComponent } from '../../shared/components/match-card/match-card';
import { ScoringLegendComponent } from '../../shared/components/scoring-legend/scoring-legend';
import { RadialBracketComponent } from '../../shared/components/radial-bracket/radial-bracket';
import { Team, Match, Round, ROUND_LABELS } from '../../core/models/bracket.model';

@Component({
  selector: 'app-bracket-page',
  standalone: true,
  imports: [MatchCardComponent, ScoringLegendComponent, RadialBracketComponent],
  templateUrl: './bracket-page.html',
  styleUrl: './bracket-page.css',
})
export class BracketPageComponent implements AfterViewInit, OnDestroy {
  readonly bracketService = inject(BracketService);
  readonly bridge = inject(BracketExportBridgeService);
  private readonly exportService = inject(ExportService);
  private readonly cdr = inject(ChangeDetectorRef);

  @ViewChild('exportContainer', { static: false }) exportContainer!: ElementRef<HTMLElement>;

  readonly Round = Round;
  readonly ROUND_LABELS = ROUND_LABELS;

  ngAfterViewInit(): void {
    this.bridge.register(
      () => this.runExport(),
      () => this.bracketService.resetBracket()
    );
  }

  ngOnDestroy(): void {
    this.bridge.unregister();
  }

  onWinnerSelected(event: { matchId: string; team: Team }): void {
    this.bracketService.selectWinner(event.matchId, event.team);
  }

  private async runExport(): Promise<void> {
    if (!this.exportContainer) return;
    this.cdr.detectChanges();
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
    );
    await this.exportService.exportBracketAsImage(this.exportContainer.nativeElement);
  }

  trackByMatchId(_index: number, match: Match): string {
    return match.id;
  }
}
