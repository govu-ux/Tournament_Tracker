"use client";

import React, { useState } from 'react';
import { useTournament } from '@/contexts/TournamentContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Gamepad2, PlayCircle, Trophy, Bot } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';

function SetResultPopover({ matchId }: { matchId: number }) {
  const { updateMatchResult, matches } = useTournament();
  const match = matches.find(m => m.id === matchId);
  const getTeamName = (id: number) => teams.find(t => t.id === id)?.name || 'Unknown Team';
  const { teams } = useTournament();
  
  const [score1, setScore1] = useState('');
  const [score2, setScore2] = useState('');
  const [open, setOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const s1 = parseInt(score1, 10);
    const s2 = parseInt(score2, 10);
    if (!isNaN(s1) && !isNaN(s2)) {
      updateMatchResult(matchId, s1, s2);
      setOpen(false); // Close popover on submit
    }
  };

  if (!match) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">Set Result</Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-center font-semibold mb-4">{getTeamName(match.team1Id)} vs {getTeamName(match.team2Id)}</div>
          <div className="grid grid-cols-2 gap-4 items-center">
            <div>
              <Label htmlFor={`score1-${matchId}`} className="sr-only">{getTeamName(match.team1Id)}</Label>
              <Input
                id={`score1-${matchId}`}
                type="number"
                placeholder="Score"
                value={score1}
                onChange={(e) => setScore1(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor={`score2-${matchId}`} className="sr-only">{getTeamName(match.team2Id)}</Label>
              <Input
                id={`score2-${matchId}`}
                type="number"
                placeholder="Score"
                value={score2}
                onChange={(e) => setScore2(e.target.value)}
                required
              />
            </div>
          </div>
          <Button type="submit" className="w-full">Save Result</Button>
        </form>
      </PopoverContent>
    </Popover>
  );
}


export default function LeagueManager() {
  const { teams, matches, generateLeagueMatches, autoUpdateMatchResult } = useTournament();
  const getTeamName = (id: number) => teams.find(t => t.id === id)?.name || 'Unknown Team';

  const groupMatches = matches.filter(m => m.stage === 'group');

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Gamepad2 className="h-5 w-5" />
            League Matches
          </CardTitle>
          <CardDescription>Generate league matches and record results. Every team plays each other once.</CardDescription>
        </div>
        <Button onClick={generateLeagueMatches} disabled={teams.length < 2}>
          <PlayCircle className="mr-2 h-4 w-4" />
          {groupMatches.length > 0 ? 'Re-generate Matches' : 'Generate Matches'}
        </Button>
      </CardHeader>
      <CardContent>
        {groupMatches.length === 0 ? (
          <Alert>
            <Trophy className="h-4 w-4" />
            <AlertTitle>No Matches Generated</AlertTitle>
            <AlertDescription>
              Add at least two teams and click "Generate Matches" to create the league fixtures.
            </AlertDescription>
          </Alert>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Match</TableHead>
                <TableHead>Date &amp; Time</TableHead>
                <TableHead>Result</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groupMatches.map(match => (
                <TableRow key={match.id}>
                  <TableCell className="font-medium">{getTeamName(match.team1Id)} vs {getTeamName(match.team2Id)}</TableCell>
                  <TableCell>{format(match.date, "PPP")} at {match.time}</TableCell>
                  <TableCell>
                    {match.winnerId === null && !match.isDraw && match.team1Score === null ? (
                      <span className="text-muted-foreground">Pending</span>
                    ) : (
                        match.isDraw ? (
                            `Draw (${match.team1Score}-${match.team2Score})`
                        ) : (
                            `${getTeamName(match.winnerId!)} won (${match.team1Score}-${match.team2Score})`
                        )
                    )}
                  </TableCell>
                  <TableCell className="space-x-2">
                     {match.winnerId === null && !match.isDraw && match.team1Score === null ? (
                       <>
                        <SetResultPopover matchId={match.id} />
                        <Button variant="secondary" size="sm" onClick={() => autoUpdateMatchResult(match.id)}>
                          <Bot /> Auto
                        </Button>
                       </>
                     ) : (
                        <span className="text-muted-foreground">Finished</span>
                     )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
