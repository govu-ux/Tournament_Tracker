"use client";

import { useTournament } from '@/contexts/TournamentContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Gamepad2, PlayCircle, Trophy, Bot } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';

export default function LeagueManager() {
  const { teams, matches, generateLeagueMatches, updateMatchResult, autoUpdateMatchResult } = useTournament();
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
                    {match.winnerId === null && !match.isDraw ? (
                      <span className="text-muted-foreground">Pending</span>
                    ) : (
                      match.isDraw ? "Draw" : `${getTeamName(match.winnerId!)} won`
                    )}
                  </TableCell>
                  <TableCell className="space-x-2">
                     {match.winnerId === null && !match.isDraw ? (
                       <>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" size="sm">Set Result</Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-4">
                            <RadioGroup onValueChange={(value) => {
                              if (value === 'draw') {
                                updateMatchResult(match.id, null, true);
                              } else {
                                updateMatchResult(match.id, Number(value), false);
                              }
                            }}>
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value={String(match.team1Id)} id={`r1-${match.id}`} />
                                  <Label htmlFor={`r1-${match.id}`}>{getTeamName(match.team1Id)} wins</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value={String(match.team2Id)} id={`r2-${match.id}`} />
                                  <Label htmlFor={`r2-${match.id}`}>{getTeamName(match.team2Id)} wins</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="draw" id={`r3-${match.id}`} />
                                  <Label htmlFor={`r3-${match.id}`}>Draw</Label>
                                </div>
                              </div>
                            </RadioGroup>
                          </PopoverContent>
                        </Popover>
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
