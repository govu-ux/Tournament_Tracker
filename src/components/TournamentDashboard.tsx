"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TeamManager from './TeamManager';
import MatchManager from './MatchManager';
import StandingsDisplay from './StandingsDisplay';
import PlayoffsManager from './PlayoffsManager';

export default function TournamentDashboard() {
  return (
    <Tabs defaultValue="teams" className="w-full">
      <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
        <TabsTrigger value="teams">Teams</TabsTrigger>
        <TabsTrigger value="matches">Schedule &amp; Results</TabsTrigger>
        <TabsTrigger value="standings">Standings</TabsTrigger>
        <TabsTrigger value="playoffs">Playoffs</TabsTrigger>
      </TabsList>
      <TabsContent value="teams">
        <TeamManager />
      </TabsContent>
      <TabsContent value="matches">
        <MatchManager />
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
