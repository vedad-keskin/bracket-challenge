import { Component, input, output } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [NgClass],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class HeaderComponent {
  readonly isComplete = input<boolean>(false);
  readonly exportBracket = output<void>();
  readonly resetBracket = output<void>();
  readonly isExporting = input<boolean>(false);

  onExport(): void {
    this.exportBracket.emit();
  }

  onReset(): void {
    this.resetBracket.emit();
  }
}
