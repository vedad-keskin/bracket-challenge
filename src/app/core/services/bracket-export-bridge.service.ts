import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class BracketExportBridgeService {
  readonly isExporting = signal(false);

  private exportFn: (() => Promise<void>) | null = null;
  private resetFn: (() => void) | null = null;

  register(exportFn: () => Promise<void>, resetFn: () => void): void {
    this.exportFn = exportFn;
    this.resetFn = resetFn;
  }

  unregister(): void {
    this.exportFn = null;
    this.resetFn = null;
    this.isExporting.set(false);
  }

  async export(): Promise<void> {
    if (!this.exportFn || this.isExporting()) return;
    this.isExporting.set(true);
    try {
      await this.exportFn();
    } finally {
      this.isExporting.set(false);
    }
  }

  reset(): void {
    this.resetFn?.();
  }
}
