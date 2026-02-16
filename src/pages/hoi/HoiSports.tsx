import { useState, useEffect } from 'react';
import {
  hoiSportsStorage,
  hoiSportsTeamsStorage,
  hoiSportsEventsStorage,
  hoiStudentsStorage,
  HoiSport,
  HoiSportsTeam,
  HoiSportsEvent,
  HoiStudent,
} from '@/lib/hoiStorage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Trophy,
  Plus,
  Pencil,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  Users,
  CalendarDays,
  UserMinus,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PAGE_SIZE = 10;

export default function HoiSports() {
  const { toast } = useToast();

  const [sports, setSports] = useState<HoiSport[]>([]);
  const [teams, setTeams] = useState<HoiSportsTeam[]>([]);
  const [events, setEvents] = useState<HoiSportsEvent[]>([]);
  const [students, setStudents] = useState<HoiStudent[]>([]);

  const [sportDialogOpen, setSportDialogOpen] = useState(false);
  const [editingSport, setEditingSport] = useState<HoiSport | null>(null);
  const [sportForm, setSportForm] = useState({ name: '', category: 'team' as 'team' | 'individual', coach_name: '' });
  const [sportsPage, setSportsPage] = useState(1);
  const [sportsSearch, setSportsSearch] = useState('');

  const [selectedTeamSport, setSelectedTeamSport] = useState('');
  const [teamDialogOpen, setTeamDialogOpen] = useState(false);
  const [teamForm, setTeamForm] = useState({ student_id: '', position: '' });
  const [teamsPage, setTeamsPage] = useState(1);

  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<HoiSportsEvent | null>(null);
  const [eventForm, setEventForm] = useState({
    name: '', sport_id: '', date: '', venue: '', teams_involved: '', status: 'upcoming' as HoiSportsEvent['status'],
  });
  const [eventsPage, setEventsPage] = useState(1);
  const [eventsSearch, setEventsSearch] = useState('');
  const [eventSportFilter, setEventSportFilter] = useState('all');
  const [eventStatusFilter, setEventStatusFilter] = useState('all');
  const [resultDialogOpen, setResultDialogOpen] = useState(false);
  const [resultEvent, setResultEvent] = useState<HoiSportsEvent | null>(null);
  const [resultText, setResultText] = useState('');

  const reload = () => {
    setSports(hoiSportsStorage.getAll());
    setTeams(hoiSportsTeamsStorage.getAll());
    setEvents(hoiSportsEventsStorage.getAll());
    setStudents(hoiStudentsStorage.getAll());
  };

  useEffect(() => { reload(); }, []);

  const filteredSports = sports.filter(s =>
    s.name.toLowerCase().includes(sportsSearch.toLowerCase()) ||
    (s.coach_name || '').toLowerCase().includes(sportsSearch.toLowerCase())
  );
  const sportsTotal = Math.ceil(filteredSports.length / PAGE_SIZE);
  const pagedSports = filteredSports.slice((sportsPage - 1) * PAGE_SIZE, sportsPage * PAGE_SIZE);

  const teamMembers = teams.filter(t => t.sport_id === selectedTeamSport);
  const teamsTotal = Math.ceil(teamMembers.length / PAGE_SIZE);
  const pagedTeams = teamMembers.slice((teamsPage - 1) * PAGE_SIZE, teamsPage * PAGE_SIZE);

  const filteredEvents = events.filter(e => {
    const matchSearch = e.name.toLowerCase().includes(eventsSearch.toLowerCase()) ||
      e.venue.toLowerCase().includes(eventsSearch.toLowerCase());
    const matchSport = eventSportFilter === 'all' || e.sport_id === eventSportFilter;
    const matchStatus = eventStatusFilter === 'all' || e.status === eventStatusFilter;
    return matchSearch && matchSport && matchStatus;
  });
  const eventsTotal = Math.ceil(filteredEvents.length / PAGE_SIZE);
  const pagedEvents = filteredEvents.slice((eventsPage - 1) * PAGE_SIZE, eventsPage * PAGE_SIZE);

  const openAddSport = () => {
    setEditingSport(null);
    setSportForm({ name: '', category: 'team', coach_name: '' });
    setSportDialogOpen(true);
  };

  const openEditSport = (s: HoiSport) => {
    setEditingSport(s);
    setSportForm({ name: s.name, category: s.category, coach_name: s.coach_name || '' });
    setSportDialogOpen(true);
  };

  const saveSport = () => {
    if (!sportForm.name.trim()) {
      toast({ title: 'Validation Error', description: 'Sport name is required', variant: 'destructive' });
      return;
    }
    if (editingSport) {
      hoiSportsStorage.update(editingSport.id, { name: sportForm.name, category: sportForm.category, coach_name: sportForm.coach_name || undefined });
      toast({ title: 'Sport Updated' });
    } else {
      hoiSportsStorage.add({ name: sportForm.name, category: sportForm.category, coach_name: sportForm.coach_name || undefined });
      toast({ title: 'Sport Added' });
    }
    setSportDialogOpen(false);
    reload();
  };

  const deleteSport = (id: string) => {
    hoiSportsStorage.remove(id);
    toast({ title: 'Sport Deleted' });
    reload();
  };

  const addTeamMember = () => {
    if (!teamForm.student_id) {
      toast({ title: 'Validation Error', description: 'Select a student', variant: 'destructive' });
      return;
    }
    const student = students.find(s => s.id === teamForm.student_id);
    const sport = sports.find(s => s.id === selectedTeamSport);
    if (!student || !sport) return;
    const exists = teams.find(t => t.sport_id === selectedTeamSport && t.student_id === teamForm.student_id);
    if (exists) {
      toast({ title: 'Already Registered', description: 'Student is already in this team', variant: 'destructive' });
      return;
    }
    hoiSportsTeamsStorage.add({
      sport_id: selectedTeamSport,
      sport_name: sport.name,
      student_id: student.id,
      student_name: student.full_name,
      position: teamForm.position || undefined,
    });
    toast({ title: 'Student Added to Team' });
    setTeamDialogOpen(false);
    setTeamForm({ student_id: '', position: '' });
    reload();
  };

  const removeTeamMember = (id: string) => {
    hoiSportsTeamsStorage.remove(id);
    toast({ title: 'Student Removed from Team' });
    reload();
  };

  const openAddEvent = () => {
    setEditingEvent(null);
    setEventForm({ name: '', sport_id: '', date: '', venue: '', teams_involved: '', status: 'upcoming' });
    setEventDialogOpen(true);
  };

  const openEditEvent = (e: HoiSportsEvent) => {
    setEditingEvent(e);
    setEventForm({ name: e.name, sport_id: e.sport_id, date: e.date, venue: e.venue, teams_involved: e.teams_involved, status: e.status });
    setEventDialogOpen(true);
  };

  const saveEvent = () => {
    if (!eventForm.name.trim() || !eventForm.sport_id || !eventForm.date || !eventForm.venue) {
      toast({ title: 'Validation Error', description: 'Name, sport, date and venue are required', variant: 'destructive' });
      return;
    }
    const sport = sports.find(s => s.id === eventForm.sport_id);
    if (editingEvent) {
      hoiSportsEventsStorage.update(editingEvent.id, { ...eventForm, sport_name: sport?.name || '' });
      toast({ title: 'Event Updated' });
    } else {
      hoiSportsEventsStorage.add({ ...eventForm, sport_name: sport?.name || '', results: undefined });
      toast({ title: 'Event Added' });
    }
    setEventDialogOpen(false);
    reload();
  };

  const deleteEvent = (id: string) => {
    hoiSportsEventsStorage.remove(id);
    toast({ title: 'Event Deleted' });
    reload();
  };

  const openRecordResult = (e: HoiSportsEvent) => {
    setResultEvent(e);
    setResultText(e.results || '');
    setResultDialogOpen(true);
  };

  const saveResult = () => {
    if (!resultEvent) return;
    hoiSportsEventsStorage.update(resultEvent.id, { results: resultText, status: 'completed' });
    toast({ title: 'Results Recorded' });
    setResultDialogOpen(false);
    reload();
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      upcoming: 'bg-blue-100 text-blue-700 border-blue-200',
      completed: 'bg-green-100 text-green-700 border-green-200',
      cancelled: 'bg-red-100 text-red-700 border-red-200',
    };
    return <Badge variant="outline" className={`capitalize ${colors[status] || ''}`}>{status}</Badge>;
  };

  const Pagination = ({ page, total, setPage }: { page: number; total: number; setPage: (p: number) => void }) => (
    total > 1 ? (
      <div className="flex items-center justify-between mt-4">
        <span className="text-sm text-muted-foreground">Page {page} of {total}</span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}><ChevronLeft className="w-4 h-4" /></Button>
          <Button variant="outline" size="sm" disabled={page >= total} onClick={() => setPage(page + 1)}><ChevronRight className="w-4 h-4" /></Button>
        </div>
      </div>
    ) : null
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-1">Sports Management</h1>
        <p className="text-muted-foreground">Manage sports, teams and events</p>
      </div>

      <Tabs defaultValue="sports">
        <TabsList className="mb-4">
          <TabsTrigger value="sports" className="gap-2"><Trophy className="w-4 h-4" />Sports</TabsTrigger>
          <TabsTrigger value="teams" className="gap-2"><Users className="w-4 h-4" />Teams</TabsTrigger>
          <TabsTrigger value="events" className="gap-2"><CalendarDays className="w-4 h-4" />Events</TabsTrigger>
        </TabsList>

        <TabsContent value="sports">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <CardTitle>All Sports</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Search sports..." className="pl-9 w-[200px]" value={sportsSearch} onChange={e => { setSportsSearch(e.target.value); setSportsPage(1); }} />
                  </div>
                  <Button onClick={openAddSport}><Plus className="w-4 h-4 mr-1" />Add Sport</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Coach</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagedSports.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No sports found</TableCell></TableRow>
                  ) : pagedSports.map(s => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell><Badge variant="outline" className="capitalize">{s.category}</Badge></TableCell>
                      <TableCell>{s.coach_name || '—'}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => openEditSport(s)}><Pencil className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteSport(s.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Pagination page={sportsPage} total={sportsTotal} setPage={setSportsPage} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teams">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <CardTitle>Team Members</CardTitle>
                <div className="flex gap-2">
                  <Select value={selectedTeamSport} onValueChange={v => { setSelectedTeamSport(v); setTeamsPage(1); }}>
                    <SelectTrigger className="w-[200px]"><SelectValue placeholder="Select sport" /></SelectTrigger>
                    <SelectContent>
                      {sports.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {selectedTeamSport && (
                    <Button onClick={() => { setTeamForm({ student_id: '', position: '' }); setTeamDialogOpen(true); }}>
                      <Plus className="w-4 h-4 mr-1" />Add Member
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {!selectedTeamSport ? (
                <p className="text-center text-muted-foreground py-8">Select a sport to view team members</p>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student Name</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pagedTeams.length === 0 ? (
                        <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-8">No team members</TableCell></TableRow>
                      ) : pagedTeams.map(t => (
                        <TableRow key={t.id}>
                          <TableCell className="font-medium">{t.student_name}</TableCell>
                          <TableCell>{t.position || '—'}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" onClick={() => removeTeamMember(t.id)}><UserMinus className="w-4 h-4 text-red-500" /></Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <Pagination page={teamsPage} total={teamsTotal} setPage={setTeamsPage} />
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <CardTitle>Sports Events</CardTitle>
                <div className="flex flex-wrap gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Search events..." className="pl-9 w-[180px]" value={eventsSearch} onChange={e => { setEventsSearch(e.target.value); setEventsPage(1); }} />
                  </div>
                  <Select value={eventSportFilter} onValueChange={v => { setEventSportFilter(v); setEventsPage(1); }}>
                    <SelectTrigger className="w-[150px]"><SelectValue placeholder="Sport" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sports</SelectItem>
                      {sports.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={eventStatusFilter} onValueChange={v => { setEventStatusFilter(v); setEventsPage(1); }}>
                    <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={openAddEvent}><Plus className="w-4 h-4 mr-1" />Add Event</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Sport</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Venue</TableHead>
                    <TableHead>Teams</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Results</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagedEvents.length === 0 ? (
                    <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No events found</TableCell></TableRow>
                  ) : pagedEvents.map(e => (
                    <TableRow key={e.id}>
                      <TableCell className="font-medium">{e.name}</TableCell>
                      <TableCell>{e.sport_name}</TableCell>
                      <TableCell>{new Date(e.date).toLocaleDateString()}</TableCell>
                      <TableCell>{e.venue}</TableCell>
                      <TableCell className="max-w-[150px] truncate">{e.teams_involved}</TableCell>
                      <TableCell>{statusBadge(e.status)}</TableCell>
                      <TableCell>{e.results || '—'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openEditEvent(e)}><Pencil className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => openRecordResult(e)} title="Record Results"><Trophy className="w-4 h-4 text-amber-500" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => deleteEvent(e.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Pagination page={eventsPage} total={eventsTotal} setPage={setEventsPage} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={sportDialogOpen} onOpenChange={setSportDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingSport ? 'Edit Sport' : 'Add Sport'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Sport Name *</Label>
              <Input value={sportForm.name} onChange={e => setSportForm({ ...sportForm, name: e.target.value })} />
            </div>
            <div>
              <Label>Category *</Label>
              <Select value={sportForm.category} onValueChange={v => setSportForm({ ...sportForm, category: v as 'team' | 'individual' })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="team">Team</SelectItem>
                  <SelectItem value="individual">Individual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Coach Name</Label>
              <Input value={sportForm.coach_name} onChange={e => setSportForm({ ...sportForm, coach_name: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSportDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveSport}>{editingSport ? 'Update' : 'Add'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={teamDialogOpen} onOpenChange={setTeamDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Team Member</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Student *</Label>
              <Select value={teamForm.student_id} onValueChange={v => setTeamForm({ ...teamForm, student_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                <SelectContent>
                  {students.filter(s => s.status === 'active').map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.full_name} ({s.class_name})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Position</Label>
              <Input value={teamForm.position} onChange={e => setTeamForm({ ...teamForm, position: e.target.value })} placeholder="e.g. Striker, Goalkeeper" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTeamDialogOpen(false)}>Cancel</Button>
            <Button onClick={addTeamMember}>Add to Team</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={eventDialogOpen} onOpenChange={setEventDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingEvent ? 'Edit Event' : 'Add Event'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Event Name *</Label>
              <Input value={eventForm.name} onChange={e => setEventForm({ ...eventForm, name: e.target.value })} />
            </div>
            <div>
              <Label>Sport *</Label>
              <Select value={eventForm.sport_id} onValueChange={v => setEventForm({ ...eventForm, sport_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select sport" /></SelectTrigger>
                <SelectContent>
                  {sports.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Date *</Label>
              <Input type="date" value={eventForm.date} onChange={e => setEventForm({ ...eventForm, date: e.target.value })} />
            </div>
            <div>
              <Label>Venue *</Label>
              <Input value={eventForm.venue} onChange={e => setEventForm({ ...eventForm, venue: e.target.value })} />
            </div>
            <div>
              <Label>Teams Involved</Label>
              <Input value={eventForm.teams_involved} onChange={e => setEventForm({ ...eventForm, teams_involved: e.target.value })} placeholder="e.g. Team A vs Team B" />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={eventForm.status} onValueChange={v => setEventForm({ ...eventForm, status: v as HoiSportsEvent['status'] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEventDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveEvent}>{editingEvent ? 'Update' : 'Add'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={resultDialogOpen} onOpenChange={setResultDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Record Results — {resultEvent?.name}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Results</Label>
              <Input value={resultText} onChange={e => setResultText(e.target.value)} placeholder="e.g. Won 3-1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResultDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveResult}>Save Results</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
