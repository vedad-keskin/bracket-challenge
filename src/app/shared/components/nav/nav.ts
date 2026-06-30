import { Component, inject, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
import { BracketService } from '../../../core/services/bracket.service';
import { BracketExportBridgeService } from '../../../core/services/bracket-export-bridge.service';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgClass],
  templateUrl: './nav.html',
  styleUrl: './nav.css',
})
export class NavComponent {
  private readonly router = inject(Router);
  readonly bracketService = inject(BracketService);
  readonly bridge = inject(BracketExportBridgeService);

  readonly isBracketPage = signal(isBracketRoute(this.router.url));

  constructor() {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => this.isBracketPage.set(isBracketRoute(this.router.url)));
  }

  onReset(): void {
    this.bridge.reset();
  }

  onExport(): void {
    void this.bridge.export();
  }
}

function isBracketRoute(url: string): boolean {
  const path = url.split('?')[0].split('#')[0];
  return path === '/' || path === '';
}
