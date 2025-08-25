"use client";

import { useTournament } from '@/contexts/TournamentContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Trophy, Swords, ShieldCheck, Crown, Bot } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Popover, PopoverTrigger, PopoverContent } from './ui/popover';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

export default function PlayoffsManager() {
  const { teams, matches, playoffTeams, generatePlayoffs, semiFinalMatches, finalMatch, champion, updatePlayoffResult, autoUpdateMatchResult } = useTournament();
  const getTeamName = (id: number) => teams.find(t => t.id === id)?.name || 'Unknown Team';
  const groupMatches = matches.filter(m => m.stage === 'group');
  const groupStageFinished = groupMatches.length > 0 && groupMatches.every(m => m.winnerId !== null || m.isDraw);

  const renderMatchResultInput = (match: any) => {
    if (match.winnerId) {
      return <span className="font-semibold text-primary">{getTeamName(match.winnerId)} won</span>;
    }
    return (
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild><Button variant="outline" size="sm">Set Winner</Button></PopoverTrigger>
          <PopoverContent className="w-auto p-4">
            <RadioGroup onValueChange={(value) => updatePlayoffResult(match.id, Number(value), false)}>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={String(match.team1Id)} id={`w1-${match.id}`} />
                  <Label htmlFor={`w1-${match.id}`}>{getTeamName(match.team1Id)}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={String(match.team2Id)} id={`w2-${match.id}`} />
                  <Label htmlFor={`w2-${match.id}`}>{getTeamName(match.team2Id)}</Label>
                </div>
              </div>
            </RadioGroup>
          </PopoverContent>
        </Popover>
        <Button variant="secondary" size="sm" onClick={() => autoUpdateMatchResult(match.id)}>
          <Bot /> Auto
        </Button>
      </div>
    );
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5" />Playoffs</CardTitle>
        <CardDescription>Manage the knockout stages of the tournament, from semi-finals to the grand final.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Semi-Finals */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2"><Swords className="h-5 w-5 text-accent" />Semi-Finals</h3>
          {!groupStageFinished || playoffTeams.length < 4 ? (
            <Alert>
                <ShieldCheck className="h-4 w-4" />
                <AlertTitle>Playoffs Not Ready</AlertTitle>
                <AlertDescription>The top 4 teams will qualify for playoffs once the league stage is complete. At least 4 teams are required and all league matches must be played.</AlertDescription>
            </Alert>
          ) : (
            <>
              {semiFinalMatches.length === 0 && (
                <div className="text-center p-4 border-dashed border-2 rounded-lg">
                    <p className="text-muted-foreground mb-2">The league stage is complete and the top 4 teams have qualified!</p>
                    <div className="flex justify-center gap-4 font-semibold mb-4">
                        {playoffTeams.map(t => <span key={t.id} className="bg-primary/10 text-primary px-3 py-1 rounded-full">{t.name}</span>)}
                    </div>
                    <Button onClick={generatePlayoffs}>
                        Generate Semi-Final Matches
                    </Button>
                </div>
              )}
              {semiFinalMatches.length > 0 && (
                <div className="space-y-4">
                    {semiFinalMatches.map((match, index) => (
                        <div key={match.id} className="flex items-center justify-between p-3 bg-muted rounded-md">
                            <span className="font-medium">SF {index+1}: {getTeamName(match.team1Id)} vs {getTeamName(match.team2Id)}</span>
                            {renderMatchResultInput(match)}
                        </div>
                    ))}
                </div>
              )}
            </>
          )}
        </div>

        <Separator />

        {/* Final */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-accent" />The Final</h3>
          {!finalMatch ? (
             <Alert variant="default">
                <Crown className="h-4 w-4" />
                <AlertTitle>Awaiting Finalists</AlertTitle>
                <AlertDescription>The final match will be generated once both semi-final winners are decided.</AlertDescription>
            </Alert>
          ) : (
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <span className="text-xl font-bold">{getTeamName(finalMatch.team1Id)} vs {getTeamName(finalMatch.team2Id)}</span>
                {renderMatchResultInput(finalMatch)}
            </div>
          )}
        </div>
        
        {champion && (
            <>
            <Separator />
            <div className="text-center py-6 bg-primary/10 rounded-lg">
                <Crown className="h-12 w-12 text-amber-400 mx-auto animate-pulse" />
                <h3 className="text-2xl font-bold mt-4">Tournament Champion!</h3>
                <p className="text-4xl font-extrabold text-primary mt-2">{champion.name}</p>
            </div>
            </>
        )}
      </CardContent>
    </Card>
  );
}
