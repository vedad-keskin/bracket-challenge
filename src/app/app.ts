import { Component } from '@angular/core';
import { BracketPageComponent } from './features/bracket/bracket-page';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [BracketPageComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
