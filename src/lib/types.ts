export interface Team {
  id: number;
  name: string;
}

export interface Match {
  id: number;
  team1Id: number;
  team2Id: number;
  team1Score: number | null;
  team2Score: number | null;
  date: string; // Use string to prevent serialization issues with Dates
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
  scoreDifference: number;
}
