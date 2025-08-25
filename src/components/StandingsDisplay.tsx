"use client";

import { useTournament } from '@/contexts/TournamentContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ListOrdered } from 'lucide-react';

export default function StandingsDisplay() {
  const { standings } = useTournament();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ListOrdered className="h-5 w-5" />
          Tournament Standings
        </CardTitle>
        <CardDescription>
          Standings are based on points (Win: 3, Draw: 1, Loss: 0), then score difference.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rank</TableHead>
              <TableHead>Team</TableHead>
              <TableHead className="text-center">Played</TableHead>
              <TableHead className="text-center">Won</TableHead>
              <TableHead className="text-center">Lost</TableHead>
              <TableHead className="text-center">Drawn</TableHead>
              <TableHead className="text-center">Score Diff.</TableHead>
              <TableHead className="text-center">Points</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {standings.length > 0 ? (
              standings.map(s => (
                <TableRow key={s.teamId}>
                  <TableCell className="font-medium">{s.rank}</TableCell>
                  <TableCell>{s.teamName}</TableCell>
                  <TableCell className="text-center">{s.played}</TableCell>
                  <TableCell className="text-center">{s.wins}</TableCell>
                  <TableCell className="text-center">{s.losses}</TableCell>
                  <TableCell className="text-center">{s.draws}</TableCell>
                  <TableCell className="text-center">{s.scoreDifference > 0 ? `+${s.scoreDifference}` : s.scoreDifference}</TableCell>
                  <TableCell className="text-center font-bold">{s.points}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  No standings to display. Add teams and play matches.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
