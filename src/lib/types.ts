export interface Team {
  id: number;
  name: string;
}

export interface Match {
  id: number;
  team1Id: number;
  team2Id: number;
  date: Date;
  time: string;
  winnerId: number | null;
  isDraw: boolean;
  stage: 'group' | 'semi-final' | 'final';
}

export interface Standing {
  rank: number;
  teamId: number;
  teamName: string;
  played: number;
  wins: number;
  losses: number;
  draws: number;
  points: number;
}
