"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TeamManager from './TeamManager';
import LeagueManager from './LeagueManager';
import StandingsDisplay from './StandingsDisplay';
import PlayoffsManager from './PlayoffsManager';
import { useTournament } from "@/contexts/TournamentContext";
import { Skeleton } from "./ui/skeleton";

export default function TournamentDashboard() {
  const { loading } = useTournament();

  if (loading) {
    return (
        <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-96 w-full" />
        </div>
    )
  }

  return (
    <Tabs defaultValue="teams" className="w-full">
      <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
        <TabsTrigger value="teams">Teams</TabsTrigger>
        <TabsTrigger value="matches">League Matches</TabsTrigger>
        <TabsTrigger value="standings">Standings</TabsTrigger>
        <TabsTrigger value="playoffs">Playoffs</TabsTrigger>
      </TabsList>
      <TabsContent value="teams">
        <TeamManager />
      </TabsContent>
      <TabsContent value="matches">
        <LeagueManager />
      </TabsContent>
      <TabsContent value="standings">
        <StandingsDisplay />
      </TabsContent>
      <TabsContent value="playoffs">
        <PlayoffsManager />
      </TabsContent>
    </Tabs>
  );
}
