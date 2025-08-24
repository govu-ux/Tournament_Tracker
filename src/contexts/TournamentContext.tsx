"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { Team, Match, Standing } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";

interface TournamentContextType {
  teams: Team[];
  matches: Match[];
  addTeam: (name: string) => void;
  scheduleMatch: (team1Id: number, team2Id: number, date: Date, time: string) => void;
  updateMatchResult: (matchId: number, winnerId: number | null, isDraw: boolean) => void;
  standings: Standing[];
  playoffTeams: Team[];
  semiFinalMatches: Match[];
  finalMatch: Match | undefined;
  champion: Team | undefined;
  generatePlayoffs: () => void;
  resetTournament: () => void;
  loading: boolean;
}

const TournamentContext = createContext<TournamentContextType | undefined>(undefined);

export const TournamentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedTeams = localStorage.getItem('tournament_teams');
      const storedMatches = localStorage.getItem('tournament_matches');
      if (storedTeams) {
        setTeams(JSON.parse(storedTeams));
      }
      if (storedMatches) {
        setMatches(JSON.parse(storedMatches).map((m: any) => ({...m, date: new Date(m.date)})));
      }
    } catch (error) {
      console.error("Failed to parse from localStorage", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!loading) {
      try {
        localStorage.setItem('tournament_teams', JSON.stringify(teams));
      } catch (error) {
        console.error("Failed to save teams to localStorage", error);
      }
    }
  }, [teams, loading]);

  useEffect(() => {
    if (!loading) {
      try {
        localStorage.setItem('tournament_matches', JSON.stringify(matches));
      } catch (error) {
        console.error("Failed to save matches to localStorage", error);
      }
    }
  }, [matches, loading]);

  const resetTournament = () => {
    setTeams([]);
    setMatches([]);
    // Explicitly remove from localStorage as well
    localStorage.removeItem('tournament_teams');
    localStorage.removeItem('tournament_matches');
    toast({
      title: "Tournament Reset",
      description: "All teams, matches, and standings have been cleared.",
    });
  };
  
  const addTeam = (name: string) => {
    if (teams.some(team => team.name.toLowerCase() === name.toLowerCase())) {
        toast({
            title: "Error",
            description: "A team with this name already exists.",
            variant: "destructive",
        });
        return;
    }
    setTeams(prev => [...prev, { id: Date.now(), name }]);
    toast({
        title: "Success",
        description: `Team "${name}" has been added.`,
    });
  };

  const scheduleMatch = (team1Id: number, team2Id: number, date: Date, time: string) => {
    if (team1Id === team2Id) {
        toast({ title: "Error", description: "A team cannot play against itself.", variant: "destructive" });
        return;
    }
    const newMatch: Match = { id: Date.now(), team1Id, team2Id, date, time, winnerId: null, isDraw: false, stage: 'group' };
    setMatches(prev => [...prev, newMatch]);
    toast({ title: "Success", description: "Match scheduled successfully." });
  };

  const updateMatchResult = (matchId: number, winnerId: number | null, isDraw: boolean) => {
    setMatches(prev =>
      prev.map(match =>
        match.id === matchId ? { ...match, winnerId, isDraw } : match
      )
    );
    toast({ title: "Success", description: "Match result updated." });
  };
  
  const standings = useMemo<Standing[]>(() => {
    if (loading) return [];
    const stats: { [key: number]: Omit<Standing, 'rank' | 'teamName' | 'teamId'> } = teams.reduce((acc, team) => {
      acc[team.id] = { played: 0, wins: 0, losses: 0, draws: 0, points: 0 };
      return acc;
    }, {} as { [key: number]: Omit<Standing, 'rank' | 'teamName' | 'teamId'> });

    matches.filter(m => m.stage === 'group' && (m.winnerId !== null || m.isDraw)).forEach(match => {
      if (stats[match.team1Id]) {
        stats[match.team1Id].played++;
        if (match.isDraw) {
          stats[match.team1Id].draws++;
          stats[match.team1Id].points++;
        } else if (match.winnerId === match.team1Id) {
          stats[match.team1Id].wins++;
          stats[match.team1Id].points += 3;
        } else {
          stats[match.team1Id].losses++;
        }
      }
      if (stats[match.team2Id]) {
        stats[match.team2Id].played++;
        if (match.isDraw) {
          stats[match.team2Id].draws++;
          stats[match.team2Id].points++;
        } else if (match.winnerId === match.team2Id) {
          stats[match.team2Id].wins++;
          stats[match.team2Id].points += 3;
        } else {
          stats[match.team2Id].losses++;
        }
      }
    });

    const sortedStandings = teams.map(team => ({
        teamId: team.id,
        teamName: team.name,
        ...stats[team.id]
    })).sort((a, b) => b.points - a.points || (b.wins - a.wins));

    return sortedStandings.map((s, index) => ({ ...s, rank: index + 1 }));
  }, [teams, matches, loading]);

  const playoffTeams = useMemo(() => {
      if (loading) return [];
      const groupMatchesFinished = matches.filter(m => m.stage === 'group' && m.winnerId === null && !m.isDraw).length === 0;
      if (standings.length < 4 || !groupMatchesFinished) return [];
      return standings.slice(0, 4).map(s => teams.find(t => t.id === s.teamId)!);
  }, [standings, teams, matches, loading]);

  const generatePlayoffs = () => {
    if (playoffTeams.length < 4) {
      toast({ title: "Error", description: "Not enough teams or group stage is not finished.", variant: "destructive" });
      return;
    }
    if (matches.some(m => m.stage === 'semi-final')) {
        toast({ title: "Info", description: "Playoffs have already been generated." });
        return;
    }

    const [team1, team2, team3, team4] = playoffTeams;
    const semiFinal1: Match = { id: Date.now() + 1, team1Id: team1.id, team2Id: team4.id, date: new Date(), time: "TBD", winnerId: null, isDraw: false, stage: 'semi-final' };
    const semiFinal2: Match = { id: Date.now() + 2, team1Id: team2.id, team2Id: team3.id, date: new Date(), time: "TBD", winnerId: null, isDraw: false, stage: 'semi-final' };
    
    setMatches(prev => [...prev, semiFinal1, semiFinal2]);
    toast({ title: "Success", description: "Playoff matches have been generated." });
  };
  
  const semiFinalMatches = useMemo(() => loading ? [] : matches.filter(m => m.stage === 'semi-final'), [matches, loading]);

  const finalMatch = useMemo(() => {
    if (loading) return undefined;
    const semiFinalWinners = semiFinalMatches.filter(m => m.winnerId !== null).map(m => m.winnerId);
    if (semiFinalWinners.length === 2) {
      const existingFinal = matches.find(m => m.stage === 'final');
      if (existingFinal) return existingFinal;
      
      const newFinal: Match = { id: Date.now(), team1Id: semiFinalWinners[0]!, team2Id: semiFinalWinners[1]!, date: new Date(), time: "TBD", winnerId: null, isDraw: false, stage: 'final' };
      
      setTimeout(() => {
        if (!matches.some(m => m.id === newFinal.id)) {
            setMatches(prev => [...prev, newFinal]);
        }
      }, 0);
      return newFinal;
    }
    return matches.find(m => m.stage === 'final');
  }, [semiFinalMatches, matches, loading]);

  const champion = useMemo(() => {
    if (loading) return undefined;
    const final = finalMatch;
    if (final && final.winnerId) {
      return teams.find(t => t.id === final.winnerId);
    }
    return undefined;
  }, [finalMatch, teams, loading]);

  const value = { teams, matches, addTeam, scheduleMatch, updateMatchResult, standings, playoffTeams, generatePlayoffs, semiFinalMatches, finalMatch, champion, loading, resetTournament };

  return (
    <TournamentContext.Provider value={value}>
      {children}
    </TournamentContext.Provider>
  );
};

export const useTournament = () => {
  const context = useContext(TournamentContext);
  if (context === undefined) {
    throw new Error('useTournament must be used within a TournamentProvider');
  }
  return context;
};
