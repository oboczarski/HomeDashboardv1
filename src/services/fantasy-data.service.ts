
import { Injectable, signal } from '@angular/core';

export interface Player {
  id: string;
  name: string;
  position: 'QB' | 'RB' | 'WR' | 'TE';
  team: string;
  totalPoints: number;
  ppg: number;
  consistency: number; // 0-100
  ceiling: number;
  floor: number;
  targetShare: number; // Percentage
  avatarUrl: string;
  trend: 'up' | 'down' | 'stable';
}

@Injectable({
  providedIn: 'root'
})
export class FantasyDataService {
  private _players = signal<Player[]>([
    {
      id: '1',
      name: 'Justin Jefferson',
      position: 'WR',
      team: 'MIN',
      totalPoints: 342.5,
      ppg: 22.4,
      consistency: 92,
      ceiling: 45,
      floor: 12,
      targetShare: 29.5,
      avatarUrl: 'https://picsum.photos/seed/jefferson/100/100',
      trend: 'up'
    },
    {
      id: '2',
      name: 'Christian McCaffrey',
      position: 'RB',
      team: 'SF',
      totalPoints: 380.2,
      ppg: 24.8,
      consistency: 95,
      ceiling: 50,
      floor: 15,
      targetShare: 18.2,
      avatarUrl: 'https://picsum.photos/seed/cmc/100/100',
      trend: 'stable'
    },
    {
      id: '3',
      name: 'Tyreek Hill',
      position: 'WR',
      team: 'MIA',
      totalPoints: 310.8,
      ppg: 20.1,
      consistency: 85,
      ceiling: 55,
      floor: 8,
      targetShare: 31.0,
      avatarUrl: 'https://picsum.photos/seed/tyreek/100/100',
      trend: 'down'
    },
    {
      id: '4',
      name: 'Josh Allen',
      position: 'QB',
      team: 'BUF',
      totalPoints: 402.1,
      ppg: 25.3,
      consistency: 88,
      ceiling: 42,
      floor: 18,
      targetShare: 0,
      avatarUrl: 'https://picsum.photos/seed/allen/100/100',
      trend: 'up'
    },
    {
      id: '5',
      name: 'Travis Kelce',
      position: 'TE',
      team: 'KC',
      totalPoints: 210.4,
      ppg: 14.5,
      consistency: 90,
      ceiling: 30,
      floor: 8,
      targetShare: 22.1,
      avatarUrl: 'https://picsum.photos/seed/kelce/100/100',
      trend: 'stable'
    },
    {
      id: '6',
      name: 'CeeDee Lamb',
      position: 'WR',
      team: 'DAL',
      totalPoints: 335.9,
      ppg: 21.5,
      consistency: 89,
      ceiling: 40,
      floor: 10,
      targetShare: 28.4,
      avatarUrl: 'https://picsum.photos/seed/lamb/100/100',
      trend: 'up'
    },
    {
      id: '7',
      name: 'Lamar Jackson',
      position: 'QB',
      team: 'BAL',
      totalPoints: 360.5,
      ppg: 23.1,
      consistency: 82,
      ceiling: 48,
      floor: 14,
      targetShare: 0,
      avatarUrl: 'https://picsum.photos/seed/lamar/100/100',
      trend: 'up'
    },
    {
      id: '8',
      name: 'Bijan Robinson',
      position: 'RB',
      team: 'ATL',
      totalPoints: 245.3,
      ppg: 16.2,
      consistency: 78,
      ceiling: 35,
      floor: 6,
      targetShare: 14.5,
      avatarUrl: 'https://picsum.photos/seed/bijan/100/100',
      trend: 'down'
    }
  ]);

  get players() {
    return this._players.asReadonly();
  }

  getTopPerformer(metric: keyof Player) {
    const sorted = [...this._players()].sort((a, b) => (b[metric] as number) - (a[metric] as number));
    return sorted[0];
  }
}
