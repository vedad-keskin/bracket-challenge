import { Routes } from '@angular/router';
import { LeaderboardPageComponent } from './features/leaderboard/leaderboard-page';
import { BracketPageComponent } from './features/bracket/bracket-page';

export const routes: Routes = [
  { path: '', component: BracketPageComponent },
  { path: 'ranking', component: LeaderboardPageComponent },
  { path: 'bracket', redirectTo: '', pathMatch: 'full' },
  { path: '**', redirectTo: '' },
];
