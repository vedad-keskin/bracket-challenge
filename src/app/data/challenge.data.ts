import { ChallengeData } from '../core/models/challenge.model';

/**
 * EDIT THIS FILE — then commit and deploy.
 *
 * Format: 'matchId': teamId
 * Value is the winning team's ID (see team list below).
 *
 * ─── R32 MATCH KEYS (left bracket) ───────────────────────────
 * 'R32-left-0'  →  0=Germany      1=Paraguay
 * 'R32-left-1'  →  2=France      3=Sweden
 * 'R32-left-2'  →  4=South Africa  5=Canada
 * 'R32-left-3'  →  6=Netherlands  7=Morocco
 * 'R32-left-4'  →  8=Portugal    9=Croatia
 * 'R32-left-5'  → 10=Spain      11=Austria
 * 'R32-left-6'  → 12=USA        13=Bosnia
 * 'R32-left-7'  → 14=Belgium     15=Senegal
 *
 * ─── R32 MATCH KEYS (right bracket) ──────────────────────────
 * 'R32-right-0' → 16=Brazil     17=Japan
 * 'R32-right-1' → 18=Cote d'Ivoire  19=Norway
 * 'R32-right-2' → 20=Mexico     21=Ecuador
 * 'R32-right-3' → 22=England    23=DR Congo
 * 'R32-right-4' → 24=Argentina  25=Cape Verde
 * 'R32-right-5' → 26=Australia  27=Egypt
 * 'R32-right-6' → 28=Switzerland  29=Algeria
 * 'R32-right-7' → 30=Colombia   31=Ghana
 *
 * Later rounds use the same pattern:
 * 'R16-left-0', 'R16-right-0', 'QF-left-0', 'SF-left-0', 'FINAL-left-0', 'THIRD_PLACE-left-0'
 *
 * Points: R32=1, R16=2, QF=3, SF=4, 3rd=5, Final=6 (auto-calculated on Ranking page)
 */
export const CHALLENGE_DATA: ChallengeData = {
  version: 1,
  friends: ['Vedo', 'Rešo', 'Nido',  'Amar', 'Šubo'],
  officialResults: {
    'R32-left-0': 1,    // Paraguay beat Germany
    'R32-left-2': 5,    // Canada beat South Africa
    'R32-right-0': 16,  // Brazil beat Japan
    'R32-left-3': 7,  // Morocco beat Netherlands
    'R32-left-1': 2, // France beat Sweden
    'R32-right-1': 19, // Norway beat Cote d'Ivoire
    'R32-right-2':20, // Mexico beat Ecuador
    'R32-right-3': 22, // England beat DR Congo
  },
  predictions: {
    Vedo: {
      // R32 — left
      'R32-left-0': 0,   // Germany
      'R32-left-1': 2,   // France
      'R32-left-2': 5,   // Canada
      'R32-left-3': 7,   // Morocco
      'R32-left-4': 8,   // Portugal
      'R32-left-5': 10,  // Spain
      'R32-left-6': 13,  // Bosnia
      'R32-left-7': 14,  // Belgium
      // R32 — right
      'R32-right-0': 16, // Brazil
      'R32-right-1': 18, // Cote d'Ivoire
      'R32-right-2': 20, // Mexico
      'R32-right-3': 22, // England
      'R32-right-4': 24, // Argentina
      'R32-right-5': 27, // Egypt
      'R32-right-6': 28, // Switzerland
      'R32-right-7': 30, // Colombia
      // R16
      'R16-left-0': 2,   // France
      'R16-left-1': 7,   // Morocco
      'R16-left-2': 10,  // Spain
      'R16-left-3': 14,  // Belgium
      'R16-right-0': 16, // Brazil
      'R16-right-1': 22, // England
      'R16-right-2': 24, // Argentina
      'R16-right-3': 30, // Colombia
      // QF
      'QF-left-0': 2,    // France
      'QF-left-1': 10,   // Spain
      'QF-right-0': 22,  // England
      'QF-right-1': 24,  // Argentina
      // SF
      'SF-left-0': 2,    // France
      'SF-right-0': 22,  // England
      // Finals
      'FINAL-left-0': 2,       // France — champion
      'THIRD_PLACE-left-0': 10, // Spain — 3rd place
    },
    Rešo: {
      // R32 — left
      'R32-left-0': 0,   // Germany
      'R32-left-1': 2,   // France
      'R32-left-2': 5,   // Canada
      'R32-left-3': 7,   // Morocco
      'R32-left-4': 8,   // Portugal
      'R32-left-5': 10,  // Spain
      'R32-left-6': 13,  // Bosnia
      'R32-left-7': 14,  // Belgium
      // R32 — right
      'R32-right-0': 16, // Brazil
      'R32-right-1': 19, // Norway
      'R32-right-2': 20, // Mexico
      'R32-right-3': 22, // England
      'R32-right-4': 24, // Argentina
      'R32-right-5': 27, // Egypt
      'R32-right-6': 28, // Switzerland
      'R32-right-7': 30, // Colombia
      // R16
      'R16-left-0': 2,   // France
      'R16-left-1': 7,   // Morocco
      'R16-left-2': 8,   // Portugal
      'R16-left-3': 14,  // Belgium
      'R16-right-0': 19, // Norway
      'R16-right-1': 20, // Mexico
      'R16-right-2': 24, // Argentina
      'R16-right-3': 30, // Colombia
      // QF
      'QF-left-0': 2,    // France
      'QF-left-1': 8,    // Portugal
      'QF-right-0': 19,  // Norway
      'QF-right-1': 30,  // Colombia
      // SF
      'SF-left-0': 2,    // France
      'SF-right-0': 30,  // Colombia
      // Finals
      'FINAL-left-0': 2,       // France — champion
      'THIRD_PLACE-left-0': 8,  // Portugal — 3rd place
    },
    Nido: {
      // R32 — left
      'R32-left-0': 0,   // Germany
      'R32-left-1': 2,   // France
      'R32-left-2': 5,   // Canada
      'R32-left-3': 7,   // Morocco
      'R32-left-4': 8,   // Portugal
      'R32-left-5': 10,  // Spain
      'R32-left-6': 12,  // USA
      'R32-left-7': 15,  // Senegal
      // R32 — right
      'R32-right-0': 16, // Brazil
      'R32-right-1': 19, // Norway
      'R32-right-2': 20, // Mexico
      'R32-right-3': 22, // England
      'R32-right-4': 24, // Argentina
      'R32-right-5': 27, // Egypt
      'R32-right-6': 28, // Switzerland
      'R32-right-7': 30, // Colombia
      // R16
      'R16-left-0': 2,   // France
      'R16-left-1': 7,   // Morocco
      'R16-left-2': 10,  // Spain
      'R16-left-3': 15,  // Senegal
      'R16-right-0': 19, // Norway
      'R16-right-1': 22, // England
      'R16-right-2': 24, // Argentina
      'R16-right-3': 30, // Colombia
      // QF
      'QF-left-0': 2,    // France
      'QF-left-1': 10,   // Spain
      'QF-right-0': 19,  // Norway
      'QF-right-1': 24,  // Argentina
      // SF
      'SF-left-0': 2,    // France
      'SF-right-0': 24,  // Argentina
      // Finals
      'FINAL-left-0': 24,       // Argentina — champion
      'THIRD_PLACE-left-0': 10, // Spain — 3rd place
    },
    Amar: {
      // R32 — left
      'R32-left-0': 0,   // Germany
      'R32-left-1': 2,   // France
      'R32-left-2': 5,   // Canada
      'R32-left-3': 6,   // Netherlands
      'R32-left-4': 8,   // Portugal
      'R32-left-5': 10,  // Spain
      'R32-left-6': 13,  // Bosnia
      'R32-left-7': 14,  // Belgium
      // R32 — right
      'R32-right-0': 16, // Brazil
      'R32-right-1': 19, // Norway
      'R32-right-2': 20, // Mexico
      'R32-right-3': 22, // England
      'R32-right-4': 24, // Argentina
      'R32-right-5': 26, // Australia
      'R32-right-6': 28, // Switzerland
      'R32-right-7': 30, // Colombia
      // R16
      'R16-left-0': 2,   // France
      'R16-left-1': 6,   // Netherlands
      'R16-left-2': 10,  // Spain
      'R16-left-3': 13,  // Bosnia
      'R16-right-0': 16, // Brazil
      'R16-right-1': 22, // England
      'R16-right-2': 24, // Argentina
      'R16-right-3': 28, // Switzerland
      // QF
      'QF-left-0': 2,    // France
      'QF-left-1': 10,   // Spain
      'QF-right-0': 22,  // England
      'QF-right-1': 24,  // Argentina
      // SF
      'SF-left-0': 2,    // France
      'SF-right-0': 24,  // Argentina
      // Finals
      'FINAL-left-0': 2,       // France — champion
      'THIRD_PLACE-left-0': 10, // Spain — 3rd place
    },
    Šubo: {
      // R32 — left
      'R32-left-0': 0,   // Germany
      'R32-left-1': 2,   // France
      'R32-left-2': 5,   // Canada
      'R32-left-3': 6,   // Netherlands
      'R32-left-4': 8,   // Portugal
      'R32-left-5': 10,  // Spain
      'R32-left-6': 13,  // Bosnia
      'R32-left-7': 15,  // Senegal
      // R32 — right
      'R32-right-0': 16, // Brazil
      'R32-right-1': 19, // Norway
      'R32-right-2': 20, // Mexico
      'R32-right-3': 22, // England
      'R32-right-4': 24, // Argentina
      'R32-right-5': 26, // Australia
      'R32-right-6': 28, // Switzerland
      'R32-right-7': 30, // Colombia
      // R16
      'R16-left-0': 2,   // France
      'R16-left-1': 6,   // Netherlands
      'R16-left-2': 8,   // Portugal
      'R16-left-3': 13,  // Bosnia
      'R16-right-0': 16, // Brazil
      'R16-right-1': 22, // England
      'R16-right-2': 24, // Argentina
      'R16-right-3': 30, // Colombia
      // QF
      'QF-left-0': 2,    // France
      'QF-left-1': 8,    // Portugal
      'QF-right-0': 22,  // England
      'QF-right-1': 24,  // Argentina
      // SF
      'SF-left-0': 8,    // Portugal
      'SF-right-0': 22,  // England
      // Finals
      'FINAL-left-0': 8,        // Portugal — champion
      'THIRD_PLACE-left-0': 24, // Argentina — 3rd place
    },
  },
  updatedAt: '2026-06-30T00:00:00.000Z',
};
