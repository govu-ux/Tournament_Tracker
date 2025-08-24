"use client";

import { useState } from 'react';
import { useTournament } from '@/contexts/TournamentContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarIcon, PlusCircle, Gamepad2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

const matchSchema = z.object({
  team1Id: z.string().min(1, "Please select Team A."),
  team2Id: z.string().min(1, "Please select Team B."),
  date: z.date({ required_error: "A date is required." }),
  time: z.string().min(1, "A time is required (e.g., 14:00)."),
});

export default function MatchManager() {
  const { teams, matches, scheduleMatch, updateMatchResult } = useTournament();
  const [open, setOpen] = useState(false);
  const getTeamName = (id: number) => teams.find(t => t.id === id)?.name || 'Unknown Team';

  const form = useForm<z.infer<typeof matchSchema>>({
    resolver: zodResolver(matchSchema),
  });

  function onScheduleSubmit(values: z.infer<typeof matchSchema>) {
    scheduleMatch(Number(values.team1Id), Number(values.team2Id), values.date, values.time);
    form.reset();
    setOpen(false);
  }

  const groupMatches = matches.filter(m => m.stage === 'group');

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Gamepad2 className="h-5 w-5" />
            Group Stage Matches
          </CardTitle>
          <CardDescription>Schedule new matches and record results for the group stage.</CardDescription>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button disabled={teams.length < 2}>
              <PlusCircle className="mr-2 h-4 w-4" /> Schedule Match
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule a New Match</DialogTitle>
              <DialogDescription>Select two teams and set the date and time for the match.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onScheduleSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="team1Id" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Team A</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select Team A" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>{teams.map(team => <SelectItem key={team.id} value={String(team.id)}>{team.name}</SelectItem>)}</SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                   <FormField control={form.control} name="team2Id" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Team B</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select Team B" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>{teams.map(team => <SelectItem key={team.id} value={String(team.id)}>{team.name}</SelectItem>)}</SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="date" render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="time" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="submit" className="w-full">Schedule</Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Match</TableHead>
              <TableHead>Date &amp; Time</TableHead>
              <TableHead>Result</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groupMatches.length > 0 ? (
              groupMatches.map(match => (
                <TableRow key={match.id}>
                  <TableCell className="font-medium">{getTeamName(match.team1Id)} vs {getTeamName(match.team2Id)}</TableCell>
                  <TableCell>{format(match.date, "PPP")} at {match.time}</TableCell>
                  <TableCell>
                    {match.winnerId === null && !match.isDraw ? (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline">Set Result</Button>
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
                    ) : (
                      match.isDraw ? "Draw" : `${getTeamName(match.winnerId!)} won`
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center">No matches scheduled yet.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
